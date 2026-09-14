// SHARED WEBSITE SCRIPT
// This file powers the repeated parts of the site: navigation, publication
// lists, project cards, news items, and optional photo galleries.
//
// Most site updates should happen in the files inside /data, not here.

(function () {
  const data = window.siteData || {};

  const navItems = [
    ["Home", "index.html"],
    ["Research", "research.html"],
    ["Methods", "methods.html"],
    ["Publications", "publications.html"],
    ["Teaching", "teaching.html"],
    ["Lab Vision", "lab-vision.html"],
    ["News", "news.html"],
    ["Lights Out<br>Coverage Viewer", "lights-out-alert-coverage-viewer.html", "nav-long"],
    ["CV", "cv.html"],
    ["Contact", "contact.html"]
  ];

  function currentPage() {
    const page = window.location.pathname.split("/").pop();
    return page || "index.html";
  }

  function renderNavigation() {
    const header = document.querySelector("[data-site-header]");
    if (!header) return;

    const active = currentPage();
    const links = navItems
      .map(([label, href, className]) => {
        const isActive = href === active || (active === "" && href === "index.html");
        return `<a href="${href}" ${className ? `class="${className}"` : ""} ${isActive ? 'aria-current="page"' : ""}>${label}</a>`;
      })
      .join("");

    header.innerHTML = `
      <a class="brand" href="index.html" aria-label="Dylan Osterhaus home">
        <span class="brand-mark">DO</span>
        <span>
          <strong>Dylan M. Osterhaus</strong>
          <small>Migration science and avian conservation</small>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="site-nav">${links}</nav>
    `;

    const button = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".site-nav");
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
    });
  }

  function linkTo(url, label) {
    if (!url) return "";
    return `<a class="text-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  function tagList(tags) {
    if (!tags || !tags.length) return "";
    return `<div class="tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
  }

  function boldMyName(authors) {
    if (!authors) return "";
    return authors
      .replaceAll("Osterhaus, D.", "<strong>Osterhaus, D.</strong>")
      .replaceAll("D. Osterhaus", "<strong>D. Osterhaus</strong>")
      .replaceAll("Dylan M. Osterhaus", "<strong>Dylan M. Osterhaus</strong>");
  }

  function italicizeJournalName(name) {
    if (!name) return "";
    return name.includes("<em>") ? name : `<em>${name}</em>`;
  }

  function renderPublications() {
    document.querySelectorAll("[data-publications]").forEach((container) => {
      const featuredOnly = container.dataset.publications === "featured";
      const limit = Number(container.dataset.limit || 100);
      const publications = (data.publications || [])
        .filter((pub) => pub.status !== "In preparation" && pub.year !== "In prep")
        .filter((pub) => !featuredOnly || pub.featured)
        .slice(0, limit);

      container.innerHTML = publications
        .map((pub) => {
          const titleUrl = pub.doi || pub.articleUrl || pub.manuscriptUrl;
          const title = titleUrl
            ? `<a href="${titleUrl.startsWith("http") ? titleUrl : encodeURI(titleUrl)}" target="_blank" rel="noopener noreferrer">${pub.title}</a>`
            : pub.title;
          const pdfLink = pub.manuscriptUrl
            ? linkTo(encodeURI(pub.manuscriptUrl), "PDF")
            : "";
          const cover = pub.coverImage
            ? `<aside class="publication-cover"><img src="${pub.coverImage}" alt="${pub.coverAlt || pub.venue + " cover"}"><p>${pub.coverNote || ""}</p></aside>`
            : "";

          return `
            <article class="publication-item ${pub.coverImage ? "has-cover" : ""}">
              <div class="publication-main">
                <div class="item-meta">${pub.date || pub.year || ""}</div>
                <h3>${title}</h3>
                <p class="authors">${boldMyName(pub.authors)}.</p>
                <p>${italicizeJournalName(pub.venue)}</p>
                ${pub.award ? `<p class="publication-award"><span aria-hidden="true">★</span> ${pub.awardUrl ? `<a href="${pub.awardUrl}" target="_blank" rel="noopener noreferrer">${pub.award}</a>` : pub.award}</p>` : ""}
                ${pub.undergraduateLeadAuthor ? '<p class="pub-note">Undergraduate lead author</p>' : ""}
                ${tagList(pub.keywords)}
                ${pdfLink}
              </div>
              ${cover}
            </article>
          `;
        })
        .join("");
    });
  }

  function renderProjects() {
    document.querySelectorAll("[data-projects]").forEach((container) => {
      const limit = Number(container.dataset.limit || 100);
      container.innerHTML = (data.projects || [])
        .slice(0, limit)
        .map((project) => {
          const visual = project.image && project.image.startsWith("Photos/")
            ? `<img class="project-image" src="${project.image}" alt="${project.imageAlt || project.title}" loading="lazy" decoding="async">`
            : `<div class="photo-placeholder" role="img" aria-label="${project.image}"><span>${project.image}</span></div>`;

          return `
            <article class="project-card">
              ${visual}
              <div class="project-card-body">
                <h3>${project.title}</h3>
                <p>${project.summary}</p>
                ${tagList(project.methods)}
                ${project.ctaLabel && project.ctaUrl ? `<a class="text-link" href="${project.ctaUrl}">${project.ctaLabel}</a>` : ""}
              </div>
            </article>
          `;
        })
        .join("");
    });
  }

  function renderPastProjects() {
    document.querySelectorAll("[data-past-projects]").forEach((container) => {
      container.innerHTML = (data.pastProjects || [])
        .map((project) => {
          const visual = project.image && project.image.startsWith("Photos/")
            ? `<img class="project-image" src="${project.image}" alt="${project.imageAlt || project.title}" loading="lazy" decoding="async">`
            : "";

          return `
            <article class="project-card past-project-card">
              ${visual}
              <div class="project-card-body">
                <h3>${project.title}</h3>
                <p>${project.summary}</p>
                ${tagList(project.methods)}
                ${project.ctaLabel && project.ctaUrl ? `<a class="text-link" href="${project.ctaUrl}" target="_blank" rel="noopener noreferrer">${project.ctaLabel}</a>` : ""}
              </div>
            </article>
          `;
        })
        .join("");
    });
  }

  function formatDate(isoDate) {
    const date = new Date(`${isoDate}T12:00:00`);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function renderNews() {
    document.querySelectorAll("[data-news]").forEach((container) => {
      const limit = Number(container.dataset.limit || 100);
      container.innerHTML = (data.news || [])
        .slice(0, limit)
        .map((item) => {
          const cover = item.image
            ? `<aside class="news-cover"><img src="${item.image}" alt="${item.imageAlt || item.title}" loading="lazy" decoding="async"></aside>`
            : "";

          return `
            <article class="news-item ${item.image ? "has-cover" : ""}">
              ${cover}
              <div class="news-main">
                <div class="item-meta">${formatDate(item.date)} · ${item.category}</div>
                <h3>${item.title}</h3>
                <p>${item.summary}</p>
                ${item.linkLabel && item.link ? linkTo(item.link, item.linkLabel) : ""}
              </div>
            </article>
          `;
        })
        .join("");
    });
  }

  function renderPhotos() {
    document.querySelectorAll("[data-photos]").forEach((container) => {
      container.innerHTML = (data.photos || [])
        .map((photo) => {
          const visual = photo.image
            ? `<a class="photo-link" href="${photo.image}" aria-label="Open full-size ${photo.species} photo"><img src="${photo.image}" alt="${photo.species}" loading="lazy" decoding="async"></a>`
            : `<div class="photo-placeholder tall" role="img" aria-label="${photo.caption}"><span>${photo.species}</span></div>`;

          return `
            <figure class="photo-card">
              ${visual}
              <figcaption>
                <strong>${photo.species}</strong>
                ${photo.location ? `<span>${photo.location}</span>` : ""}
                ${photo.caption ? `<p>${photo.caption}</p>` : ""}
              </figcaption>
            </figure>
          `;
        })
        .join("");
    });
  }

  function renderFooterYear() {
    document.querySelectorAll("[data-year]").forEach((item) => {
      item.textContent = new Date().getFullYear();
    });
  }

  renderNavigation();
  renderPublications();
  renderProjects();
  renderPastProjects();
  renderNews();
  renderPhotos();
  renderFooterYear();
})();
