// Interactive figures for the Lights Out Alert Coverage Viewer.
(function () {
  const root = document.querySelector("[data-viewer-chart]");
  if (!root) return;

  const paths = {
    site: "Lights Out Alert Viewer/Data Files/SiteLevel.csv",
    species: "Lights Out Alert Viewer/Data Files/SpeciesbySiteLevel.csv"
  };

  const alertLevels = ["High", "Medium", "Low", "None"];
  const alertColors = {
    High: "#E92222",
    Medium: "#F67126",
    Low: "#FBD600",
    None: "#9da39f"
  };

  const state = {
    siteRows: [],
    speciesRows: [],
    speciesLoaded: false,
    selectedSite: null
  };

  const controls = {
    level: document.querySelector('[data-control="level"]'),
    figure: document.querySelector('[data-control="figure"]'),
    season: document.querySelector('[data-control="season"]'),
    category: document.querySelector('[data-control="category"]'),
    species: document.querySelector('[data-control="species"]'),
    alert: document.querySelector('[data-control="alert"]')
  };

  const title = document.querySelector("[data-viewer-title]");
  const kicker = document.querySelector("[data-viewer-kicker]");
  const legend = document.querySelector("[data-viewer-legend]");
  const summary = document.querySelector("[data-viewer-summary]");
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip is-hidden";
  document.body.appendChild(tooltip);
  let tooltipRequestId = 0;

  function parseCsv(text) {
    const rows = [];
    let field = "";
    let row = [];
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && quoted && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    row.push(field);
    if (row.some((value) => value !== "")) rows.push(row);

    const headers = rows.shift();
    return rows.map((values) => {
      const item = {};
      headers.forEach((header, index) => {
        const value = values[index] || "";
        item[header] = ["Lat", "Lon", "TotalAbundance", ...alertLevels].includes(header)
          ? Number(value)
          : value;
      });
      return item;
    });
  }

  async function loadCsv(kind) {
    if (window.lightsOutCoverageCsv && window.lightsOutCoverageCsv[kind]) {
      return parseCsv(window.lightsOutCoverageCsv[kind]);
    }

    try {
      const response = await fetch(encodeURI(paths[kind]));
      if (!response.ok) throw new Error(`Could not load ${paths[kind]}`);
      return parseCsv(await response.text());
    } catch (error) {
      throw new Error("Could not load the coverage data files. If you are previewing locally, open this page through a local web server rather than directly from Finder.");
    }
  }

  function unique(rows, key) {
    return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => {
      const order = ["Spring", "Fall", "Overall"];
      if (order.includes(a) || order.includes(b)) return order.indexOf(a) - order.indexOf(b);
      return a.localeCompare(b);
    });
  }

  function categoryLabel(value) {
    return {
      Overall: "All Species",
      "Super-collider": "Super-colliders",
      "Not Super-collider": "Not Super-colliders",
      "Conservation Concern": "Species of Conservation Concern",
      "Not of Conservation Concern": "Species Not of Conservation Concern"
    }[value] || value;
  }

  function seasonLabel(value) {
    return {
      Spring: "Spring Migration",
      Fall: "Fall Migration",
      Overall: "Overall"
    }[value] || value;
  }

  function fillSelect(select, values, preferred, labelForValue = (value) => value) {
    const current = select.value || preferred;
    select.innerHTML = values
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(labelForValue(value))}</option>`)
      .join("");
    select.value = values.includes(current) ? current : values[0] || "";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function quantile(values, probability) {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    const weight = position - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  function filteredRows() {
    const level = controls.level.value;
    const season = controls.season.value;
    if (level === "site") {
      return state.siteRows.filter((row) => row.Season === season && row.Category === controls.category.value);
    }

    const rows = state.speciesRows.filter((row) => row.Season === season && row.Species === controls.species.value);
    const threshold = quantile(rows.map((row) => row.TotalAbundance), 0.10);
    return rows.filter((row) => row.TotalAbundance >= threshold);
  }

  function project(row, width, height) {
    const projectedSite = window.lightsOutMap5070 && window.lightsOutMap5070.siteCoordinates[row.Site];
    if (projectedSite) return projectedSite;

    const lonMin = -126;
    const lonMax = -66;
    const latMin = 24;
    const latMax = 50;
    const x = ((row.Lon - lonMin) / (lonMax - lonMin)) * width;
    const y = height - ((row.Lat - latMin) / (latMax - latMin)) * height;
    return { x, y };
  }

  function piePath(cx, cy, radius, start, end) {
    const startX = cx + radius * Math.cos(start);
    const startY = cy + radius * Math.sin(start);
    const endX = cx + radius * Math.cos(end);
    const endY = cy + radius * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
  }

  function timeSeriesSelection() {
    if (controls.level.value === "species") {
      return { kind: "species", key: controls.species.value };
    }
    return { kind: "category", key: controls.category.value };
  }

  function loadTimeSeries(kind, key) {
    window.lightsOutTimeSeriesCache = window.lightsOutTimeSeriesCache || { species: {}, category: {} };
    if (window.lightsOutTimeSeriesCache[kind] && window.lightsOutTimeSeriesCache[kind][key]) {
      return Promise.resolve(window.lightsOutTimeSeriesCache[kind][key]);
    }

    const src = window.lightsOutTimeSeriesIndex && window.lightsOutTimeSeriesIndex[kind] && window.lightsOutTimeSeriesIndex[kind][key];
    if (!src) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-timeseries-src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.lightsOutTimeSeriesCache[kind][key] || null), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.dataset.timeseriesSrc = src;
      script.onload = () => resolve(window.lightsOutTimeSeriesCache[kind][key] || null);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function normalizeTimeSeries(series, site) {
    if (!series) return series;

    const schedule = window.lightsOutTimeSeriesSchedule
      && window.lightsOutTimeSeriesSchedule[controls.season.value]
      && window.lightsOutTimeSeriesSchedule[controls.season.value][site];
    if (!schedule || !schedule.length) return series.sparse ? [] : series;

    const sourcePoints = series.sparse ? series.points : series;
    const total = series.sparse ? sourcePoints.reduce((sum, item) => sum + item[1], 0) : 0;
    const passageByDate = new Map(sourcePoints.map((item) => {
      const value = series.sparse
        ? (total > 0 ? item[1] / total : null)
        : item[2];
      return [item[0], value];
    }));
    return schedule.map(([date, alert]) => {
      return [
        date,
        alert,
        passageByDate.has(date) ? passageByDate.get(date) : null
      ];
    });
  }

  function renderTimeSeriesSvg(rawSeries, site) {
    const series = normalizeTimeSeries(rawSeries, site);
    if (!series || !series.length) {
      return '<p class="time-series-empty">No time series available for this site and selection.</p>';
    }
    const width = 680;
    const height = 340;
    const margin = { top: 30, right: 26, bottom: 56, left: 88 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const dates = series.map((item) => new Date(`${item[0]}T12:00:00`));
    const times = dates.map((date) => date.getTime());
    const finiteValues = series.map((item) => item[2]).filter(Number.isFinite);
    const maxValue = Math.max(0.01, ...finiteValues) + 0.01;
    const x = (index) => margin.left + (index / Math.max(1, series.length - 1)) * plotWidth;
    const y = (value) => margin.top + (1 - value / maxValue) * plotHeight;
    const bandWidth = Math.max(2, plotWidth / Math.max(1, series.length));
    const alertFill = { 0: alertColors.High, 1: alertColors.Medium, 2: alertColors.Low, 3: alertColors.None };

    const bands = series.map((item, index) => {
      const cx = x(index);
      const isMissing = !Number.isFinite(item[2]);
      return `<rect x="${cx - bandWidth / 2}" y="${margin.top}" width="${bandWidth + 0.5}" height="${plotHeight}" fill="${isMissing ? "#ffffff" : (alertFill[item[1]] || alertColors.None)}" opacity="${isMissing ? "1" : "0.72"}"></rect>`;
    }).join("");
    const line = series.map((item, index) => {
      if (!Number.isFinite(item[2])) return "";
      const previous = series[index - 1];
      const previousTime = times[index - 1];
      const dayGap = previousTime ? (times[index] - previousTime) / 86400000 : 1;
      const command = !previous || !Number.isFinite(previous[2]) || dayGap > 1.5 ? "M" : "L";
      return `${command} ${x(index)} ${y(item[2])}`;
    }).filter(Boolean).join(" ");
    const breakMarkers = series.map((item, index) => {
      if (index === 0) return "";
      const dayGap = (times[index] - times[index - 1]) / 86400000;
      if (dayGap < 20) return "";
      const markerX = (x(index - 1) + x(index)) / 2;
      return `
        <line x1="${markerX}" x2="${markerX}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="#18211f" stroke-width="1.4" stroke-dasharray="5 5" opacity="0.72"></line>
        <text x="${markerX + 8}" y="${margin.top + 18}" fill="#18211f" font-size="13" font-weight="700">Season break</text>
      `;
    }).join("");
    const yTicks = [0, maxValue / 2, maxValue].map((value) => `
      <text x="${margin.left - 12}" y="${y(value) + 6}" text-anchor="end" font-size="18" fill="#5d6862">${Math.round(value * 100)}%</text>
    `).join("");
    const monthGroups = [];
    dates.forEach((date, index) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const last = monthGroups[monthGroups.length - 1];
      if (last && last.key === key) {
        last.end = index;
      } else {
        monthGroups.push({ key, date, start: index, end: index });
      }
    });
    const monthTicks = monthGroups.map((group) => `
      <text x="${(x(group.start) + x(group.end)) / 2}" y="${height - 16}" text-anchor="middle" font-size="18" fill="#5d6862">${group.date.toLocaleDateString("en-US", { month: "short" })}</text>
    `).join("");
    const hoverTargets = series.map((item, index) => {
      const date = dates[index].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const alertName = alertNameFromCode(item[1]);
      const proportion = Number.isFinite(item[2]) ? formatPercent(item[2]) : "No data";
      const cx = x(index);
      const markerAttrs = Number.isFinite(item[2])
        ? ` data-marker-x="${cx}" data-marker-y="${y(item[2])}"`
        : "";
      return `<rect class="time-series-hover-target" x="${cx - bandWidth / 2}" y="${margin.top}" width="${bandWidth + 0.5}" height="${plotHeight}" fill="transparent" data-date="${escapeHtml(date)}" data-proportion="${escapeHtml(proportion)}" data-alert="${escapeHtml(alertName)}"${markerAttrs}></rect>`;
    }).join("");
    const legendItems = [
      ...alertLevels.map((level) => `<span><i style="background:${alertColors[level]}"></i>${level === "None" ? "No Alert" : `${level} Alert`}</span>`),
      '<span><i class="missing"></i>No Data</span>'
    ].join("");

    return `
      <div class="time-series-legend">${legendItems}</div>
      <svg class="time-series-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Time series for ${escapeHtml(site)}">
        <rect width="${width}" height="${height}" fill="#ffffff"></rect>
        ${bands}
        ${yTicks}
        ${line ? `<path d="${line}" fill="none" stroke="#000000" stroke-width="3.8"></path>` : ""}
        <circle class="time-series-marker is-hidden" cx="0" cy="0" r="5.8"></circle>
        ${breakMarkers}
        <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="#18211f"></line>
        <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" stroke="#18211f"></line>
        <text x="20" y="${margin.top + plotHeight / 2}" transform="rotate(-90 20 ${margin.top + plotHeight / 2})" text-anchor="middle" font-size="18" fill="#18211f">Proportion of Seasonal Passage</text>
        ${monthTicks}
        ${hoverTargets}
      </svg>
    `;
  }

  function showTimeSeriesTip(event, point) {
    const svg = point.closest("svg");
    const marker = svg && svg.querySelector(".time-series-marker");
    if (marker) {
      if (point.dataset.markerX && point.dataset.markerY) {
        marker.setAttribute("cx", point.dataset.markerX);
        marker.setAttribute("cy", point.dataset.markerY);
        marker.classList.remove("is-hidden");
      } else {
        marker.classList.add("is-hidden");
      }
    }

    tooltip.innerHTML = `
      <strong>${point.dataset.date}</strong><br>
      Proportion of seasonal passage: ${point.dataset.proportion}<br>
      Alert level: ${point.dataset.alert}
    `;
    tooltip.classList.remove("is-hidden");
    positionTooltip(event);
  }

  function attachTimeSeriesTips() {
    root.querySelectorAll(".time-series-hover-target").forEach((point) => {
      point.addEventListener("mousemove", (event) => showTimeSeriesTip(event, point));
      point.addEventListener("mouseleave", () => {
        const marker = point.closest("svg") && point.closest("svg").querySelector(".time-series-marker");
        if (marker) marker.classList.add("is-hidden");
        hideTip();
      });
    });
  }

  function timeSeriesSummary(series) {
    const totals = { High: 0, Medium: 0, Low: 0, None: 0 };
    series.forEach((item) => {
      if (!Number.isFinite(item[2])) return;
      totals[alertNameFromCode(item[1])] += item[2];
    });
    return totals;
  }

  function siteYearSummary(summary, titleText) {
    return `
      <section class="migration-summary compact" aria-label="${escapeHtml(titleText)}">
        <h3>${escapeHtml(titleText)}</h3>
        <div class="migration-summary-grid">
          ${alertLevels.map((level) => `
            <div class="migration-summary-item" style="color:${alertColors[level]}">
              <strong>${formatPercent(summary[level] || 0)}</strong>
              <span>Migrate ${summaryAlertLabel(level)}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  function summaryPieSvg(summary) {
    const cx = 58;
    const cy = 58;
    const radius = 46;
    let start = -Math.PI / 2;
    const total = alertLevels.reduce((sum, level) => sum + Math.max(0, summary[level] || 0), 0);
    const slices = alertLevels.map((level) => {
      const value = total > 0 ? Math.max(0, summary[level] || 0) / total : 0;
      const end = start + value * Math.PI * 2;
      const path = value > 0
        ? `<path d="${piePath(cx, cy, radius, start, end)}" fill="${alertColors[level]}"></path>`
        : "";
      start = end;
      return path;
    }).join("");

    return `
      <svg class="summary-pie" viewBox="0 0 116 116" role="img" aria-label="Alert level proportions">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#ffffff" stroke="#d8ddd1"></circle>
        ${slices}
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#18211f" stroke-width="1"></circle>
      </svg>
    `;
  }

  function siteAllYearsSummary(row) {
    const summary = {};
    alertLevels.forEach((level) => {
      summary[level] = Number.isFinite(row[level]) ? row[level] : 0;
    });
    return summary;
  }

  async function renderSiteDetail(site, row, requestId) {
    const container = root.querySelector("[data-selected-time-series]");
    const summaryContainer = root.querySelector("[data-selected-site-summary]");
    if (!container) return;

    const { kind, key } = timeSeriesSelection();
    const season = controls.season.value;
    try {
      const data = await loadTimeSeries(kind, key);
      if (requestId !== tooltipRequestId) return;
      const series = data && data[season] && data[season][site];
      const normalized = normalizeTimeSeries(series, site) || [];
      if (summaryContainer) {
        summaryContainer.innerHTML = `
          ${siteYearSummary(timeSeriesSummary(normalized), `For ${site} in 2024`)}
          ${siteYearSummary(siteAllYearsSummary(row), `For ${site} Across All Years`)}
        `;
      }
      container.innerHTML = `
        <h3>${escapeHtml(site)} - Seasonal Passage and Alerts for 2024</h3>
        ${renderTimeSeriesSvg(series, site)}
      `;
      attachTimeSeriesTips();
    } catch (error) {
      if (requestId === tooltipRequestId) {
        container.innerHTML = '<p class="time-series-empty">Unable to load the time series for this site.</p>';
        if (summaryContainer) summaryContainer.innerHTML = siteYearSummary(siteAllYearsSummary(row), `For ${site} Across All Years`);
      }
    }
  }

  function positionTooltip(event) {
    const gap = 16;
    const width = tooltip.offsetWidth || 460;
    const height = tooltip.offsetHeight || 260;
    const roomRight = window.innerWidth - event.clientX;
    const placeLeft = roomRight < width + gap;
    const x = placeLeft
      ? Math.max(gap, event.clientX - width - gap)
      : Math.min(window.innerWidth - width - gap, event.clientX + gap);
    const y = Math.min(window.innerHeight - height - gap, Math.max(gap, event.clientY + gap));

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function showTip(event, row) {
    const alertLine = (level) => {
      const text = `${level}: ${formatPercent(row[level])}`;
      return controls.figure.value === "heat" && controls.alert.value === level
        ? `<strong>${text}</strong>`
        : text;
    };

    tooltip.innerHTML = `
      <strong>${escapeHtml(row.Site)} Coverage Across All Years${row.Species ? ` · ${escapeHtml(row.Species)}` : ""}</strong><br>
      ${alertLine("High")}<br>
      ${alertLine("Medium")}<br>
      ${alertLine("Low")}<br>
      ${alertLine("None")}
    `;
    tooltip.classList.remove("is-hidden");
    positionTooltip(event);
  }

  function hideTip() {
    tooltip.classList.add("is-hidden");
  }

  function formatPercent(value) {
    return `${Math.round(value * 1000) / 10}%`;
  }

  function alertLegendLabel(value) {
    return value === "None" ? "No Alerts" : `${value} Level Alerts`;
  }

  function summaryAlertLabel(value) {
    return value === "None" ? "With No Alerts" : `During ${value} Alerts`;
  }

  function alertNameFromCode(code) {
    return {
      0: "High",
      1: "Medium",
      2: "Low",
      3: "None"
    }[code] || "None";
  }

  function mapShell(width, height) {
    const statePaths = window.lightsOutMap5070 && window.lightsOutMap5070.statePaths;
    const states = statePaths && statePaths.length
      ? statePaths.map((path) => `<path d="${path}" fill="#ffffff" stroke="#000000" stroke-width="1.1" vector-effect="non-scaling-stroke"></path>`).join("")
      : "";

    return `
      <rect x="0" y="0" width="${width}" height="${height}" fill="#f7f7f2"></rect>
      <g aria-label="US states in EPSG 5070 Albers Equal Area projection">${states}</g>
    `;
  }

  function pieMapSvg(rows) {
    const width = (window.lightsOutMap5070 && window.lightsOutMap5070.width) || 960;
    const height = (window.lightsOutMap5070 && window.lightsOutMap5070.height) || 560;
    const radius = controls.level.value === "species" ? 7 : 8;
    const points = rows.map((row) => ({ row, ...project(row, width, height) }));
    const pies = points.map(({ row, x, y }) => {
      let start = -Math.PI / 2;
      const slices = alertLevels.map((level) => {
        const value = Math.max(0, row[level] || 0);
        const end = start + value * Math.PI * 2;
        const path = `<path d="${piePath(x, y, radius, start, end)}" fill="${alertColors[level]}"></path>`;
        start = end;
        return path;
      }).join("");
      return `<g class="map-point" data-site="${escapeHtml(row.Site)}">${slices}<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="#18211f" stroke-width="0.7"></circle></g>`;
    }).join("");

    return {
      points,
      svg: `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Pie map of alert coverage">${mapShell(width, height)}${pies}</svg>`
    };
  }

  function heatMapSvg(rows) {
    const width = (window.lightsOutMap5070 && window.lightsOutMap5070.width) || 960;
    const height = (window.lightsOutMap5070 && window.lightsOutMap5070.height) || 560;
    const variable = controls.alert.value;
    const points = rows.map((row) => ({ row, ...project(row, width, height) }));
    const circles = points.map(({ row, x, y }) => {
      return `<circle class="map-point" data-site="${escapeHtml(row.Site)}" cx="${x}" cy="${y}" r="6.5" fill="${heatColor(row[variable])}" stroke="#18211f" stroke-width="0.55"></circle>`;
    }).join("");

    return {
      points,
      svg: `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Heatmap of ${variable} alert coverage">${mapShell(width, height)}${circles}</svg>`
    };
  }

  function highlightSite(site) {
    root.querySelectorAll(".map-point, .box-point").forEach((point) => {
      const isMatch = point.dataset.site === site;
      point.classList.toggle("is-highlighted", isMatch);
      point.classList.toggle("is-dimmed", !isMatch);
    });
  }

  function clearHighlight() {
    root.querySelectorAll(".map-point, .box-point").forEach((point) => {
      point.classList.remove("is-highlighted", "is-dimmed");
    });
    hideTip();
  }

  function attachLinkedTips(rows) {
    const rowBySite = new Map(rows.map((row) => [row.Site, row]));
    root.querySelectorAll(".map-point, .box-point").forEach((point) => {
      point.addEventListener("mousemove", (event) => {
        const row = rowBySite.get(point.dataset.site);
        if (!row) return;
        highlightSite(row.Site);
        showTip(event, row);
      });
      point.addEventListener("click", () => {
        const row = rowBySite.get(point.dataset.site);
        if (!row) return;
        state.selectedSite = row.Site;
        renderPlot(rows);
      });
      point.addEventListener("mouseleave", clearHighlight);
    });
  }

  function heatColor(value) {
    const stops = [
      [68, 1, 84],
      [59, 82, 139],
      [33, 145, 140],
      [94, 201, 98],
      [253, 231, 37]
    ];
    const scaled = Math.max(0, Math.min(1, value || 0)) * (stops.length - 1);
    const index = Math.floor(scaled);
    const next = Math.min(stops.length - 1, index + 1);
    const mix = scaled - index;
    const rgb = stops[index].map((start, channel) => Math.round(start * (1 - mix) + stops[next][channel] * mix));
    return `rgb(${rgb.join(",")})`;
  }

  function boxplotSvg(rows) {
    const width = 1080;
    const height = 460;
    const margin = { top: 34, right: 26, bottom: 78, left: 310 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const band = plotWidth / alertLevels.length;
    const y = (value) => margin.top + (1 - value) * plotHeight;
    const grid = [0, 0.25, 0.5, 0.75, 1].map((value) => `
      <line x1="${margin.left}" x2="${width - margin.right}" y1="${y(value)}" y2="${y(value)}" stroke="#d8ddd1"></line>
      <text x="${margin.left - 12}" y="${y(value) + 5}" text-anchor="end" fill="#5d6862" font-size="17">${value}</text>
    `).join("");

    const boxes = alertLevels.map((level, index) => {
      const values = rows.map((row) => row[level]).filter(Number.isFinite);
      if (!values.length) return "";

      const q1 = quantile(values, 0.25);
      const med = quantile(values, 0.5);
      const q3 = quantile(values, 0.75);
      const low = Math.max(0, q1 - 1.5 * (q3 - q1));
      const high = Math.min(1, q3 + 1.5 * (q3 - q1));
      const lowerValues = values.filter((value) => value >= low);
      const upperValues = values.filter((value) => value <= high);
      const min = Math.min(...lowerValues);
      const max = Math.max(...upperValues);
      const cx = margin.left + band * index + band / 2;
      const boxWidth = Math.min(92, band * 0.44);
      const jitter = rows.filter((row) => Number.isFinite(row[level])).map((row, valueIndex) => {
        const offset = (((valueIndex * 37) % 100) / 100 - 0.5) * boxWidth * 0.88;
        return `<circle class="box-point" data-site="${escapeHtml(row.Site)}" cx="${cx + offset}" cy="${y(row[level])}" r="3" fill="#18211f" opacity="0.5"></circle>`;
      }).join("");

      return `
        <line x1="${cx}" x2="${cx}" y1="${y(min)}" y2="${y(max)}" stroke="#18211f" stroke-width="1.8"></line>
        <line x1="${cx - boxWidth / 3}" x2="${cx + boxWidth / 3}" y1="${y(min)}" y2="${y(min)}" stroke="#18211f" stroke-width="1.8"></line>
        <line x1="${cx - boxWidth / 3}" x2="${cx + boxWidth / 3}" y1="${y(max)}" y2="${y(max)}" stroke="#18211f" stroke-width="1.8"></line>
        <rect x="${cx - boxWidth / 2}" y="${y(q3)}" width="${boxWidth}" height="${Math.max(1, y(q1) - y(q3))}" fill="${alertColors[level]}" stroke="#18211f" stroke-width="1.8"></rect>
        <line x1="${cx - boxWidth / 2}" x2="${cx + boxWidth / 2}" y1="${y(med)}" y2="${y(med)}" stroke="#18211f" stroke-width="2.2"></line>
        <text x="${cx}" y="${height - 24}" text-anchor="middle" fill="#18211f" font-size="19" font-weight="700">${level}</text>
        ${jitter}
      `;
    }).join("");

    return `
      <svg class="boxplot-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Boxplot of alert-level migration passage">
        <rect width="${width}" height="${height}" fill="#ffffff"></rect>
        <text x="${margin.left / 2 - 44}" y="${margin.top + plotHeight / 2 - 26}" text-anchor="middle" fill="#18211f" font-size="18" font-weight="700">
          <tspan x="${margin.left / 2 - 44}" dy="0">Proportion of</tspan>
          <tspan x="${margin.left / 2 - 44}" dy="22">Migration</tspan>
          <tspan x="${margin.left / 2 - 44}" dy="22">Passage</tspan>
        </text>
        ${grid}
        <line x1="${margin.left}" x2="${margin.left}" y1="${margin.top}" y2="${height - margin.bottom}" stroke="#18211f"></line>
        <line x1="${margin.left}" x2="${width - margin.right}" y1="${height - margin.bottom}" y2="${height - margin.bottom}" stroke="#18211f"></line>
        <text x="${margin.left + plotWidth / 2}" y="${height - 6}" text-anchor="middle" fill="#18211f" font-size="19" font-weight="700">Alert Level</text>
        ${boxes}
      </svg>
    `;
  }

  function migrationSummary(rows) {
    const totalAbundance = rows.reduce((sum, row) => sum + (row.TotalAbundance || 0), 0);
    const summaryValues = {};
    const summaryItems = alertLevels.map((level) => {
      const weightedValue = totalAbundance > 0
        ? rows.reduce((sum, row) => sum + (row[level] || 0) * (row.TotalAbundance || 0), 0) / totalAbundance
        : rows.reduce((sum, row) => sum + (row[level] || 0), 0) / Math.max(1, rows.length);
      summaryValues[level] = weightedValue;

      return `
        <div class="migration-summary-item" style="color:${alertColors[level]}">
          <strong>${formatPercent(weightedValue)}</strong>
          <span>Migrate ${summaryAlertLabel(level)}</span>
        </div>
      `;
    }).join("");

    return `
      <section class="migration-summary" aria-label="Across all sites migration summary">
        <h3>Across All Sites</h3>
        <div class="migration-summary-grid">${summaryItems}</div>
        ${summaryPieSvg(summaryValues)}
      </section>
    `;
  }

  function renderPlot(rows) {
    if (state.selectedSite && !rows.some((row) => row.Site === state.selectedSite)) {
      state.selectedSite = null;
    }

    const map = controls.figure.value === "heat" ? heatMapSvg(rows) : pieMapSvg(rows);
    const selectedSite = state.selectedSite;
    const selectedRow = selectedSite ? rows.find((row) => row.Site === selectedSite) : null;
    root.innerHTML = `
      <div class="plot-stack">
        <div class="map-panel">${map.svg}</div>
        ${selectedRow ? `
          <div class="plot-detail-row site-detail-row">
            <div class="site-summary-panel" data-selected-site-summary>
              ${siteYearSummary(siteAllYearsSummary(selectedRow), `For ${selectedSite} Across All Years`)}
            </div>
            <div class="time-series-panel" data-selected-time-series>Loading ${escapeHtml(selectedSite)} time series...</div>
          </div>
        ` : ""}
        <div class="plot-detail-row all-sites-row">
          <div class="all-sites-summary-panel">${migrationSummary(rows)}</div>
          <div class="boxplot-panel"><h3>Across All Sites</h3>${boxplotSvg(rows)}</div>
        </div>
      </div>
    `;
    attachLinkedTips(rows);
    if (selectedRow) {
      tooltipRequestId += 1;
      renderSiteDetail(selectedSite, selectedRow, tooltipRequestId);
      highlightSite(selectedSite);
    }
  }

  function renderLegend() {
    if (controls.figure.value === "heat") {
      legend.innerHTML = `
        <div class="legend-block heat-legend">
          <div class="legend-title">Proportion of Migration Passage Occurring on Nights with ${alertLegendLabel(controls.alert.value)}</div>
          <div class="heat-legend-bar" aria-hidden="true"></div>
          <div class="heat-legend-scale"><span>0</span><span>0.5</span><span>1</span></div>
        </div>
      `;
      return;
    }

    legend.innerHTML = `
      <div class="legend-block">
        <div class="legend-title">Alert Level</div>
        <div class="pie-legend-items">
          ${alertLevels.map((level) => `
            <span class="legend-item"><span class="legend-swatch" style="background:${alertColors[level]}"></span>${level}</span>
          `).join("")}
        </div>
      </div>
    `;
  }

  async function syncControls() {
    const level = controls.level.value;
    const figure = controls.figure.value;

    if (level === "species" && !state.speciesLoaded) {
      root.innerHTML = '<p class="muted">Loading species-level coverage...</p>';
      state.speciesRows = await loadCsv("species");
      state.speciesLoaded = true;
    }

    state.selectedSite = null;

    document.querySelectorAll("[data-site-only]").forEach((item) => item.classList.toggle("is-hidden", level !== "site"));
    document.querySelectorAll("[data-species-only]").forEach((item) => item.classList.toggle("is-hidden", level !== "species"));
    document.querySelectorAll("[data-heat-only]").forEach((item) => item.classList.toggle("is-hidden", figure !== "heat"));

    const rows = level === "site" ? state.siteRows : state.speciesRows;
    fillSelect(controls.season, unique(rows, "Season"), "Spring", seasonLabel);
    if (level === "site") fillSelect(controls.category, unique(rows, "Category"), "Overall", categoryLabel);
    if (level === "species") fillSelect(controls.species, unique(rows, "Species"), "Wood Thrush");
  }

  async function render() {
    try {
      await syncControls();
      const rows = filteredRows();
      const subject = controls.level.value === "site" ? categoryLabel(controls.category.value) : controls.species.value;
      const selectedSeason = seasonLabel(controls.season.value);

      kicker.textContent = "";
      title.textContent = `${subject} · ${selectedSeason}`;
      renderLegend();
      summary.innerHTML = controls.level.value === "species"
        ? '<p class="species-disclaimer">Sites in the 0-10th percentile of migration passage for the species are not displayed</p>'
        : "";

      if (!rows.length) {
        root.innerHTML = '<p class="muted">No records match the current selection.</p>';
        return;
      }

      renderPlot(rows);
    } catch (error) {
      root.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  }

  async function init() {
    state.siteRows = await loadCsv("site");
    fillSelect(controls.season, unique(state.siteRows, "Season"), "Spring", seasonLabel);
    fillSelect(controls.category, unique(state.siteRows, "Category"), "Overall", categoryLabel);

    Object.values(controls).forEach((control) => control.addEventListener("change", render));
    render();
  }

  init().catch((error) => {
    root.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  });
})();
