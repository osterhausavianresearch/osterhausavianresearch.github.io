// PROJECTS DATA
// These projects appear on the homepage and Research page.
// Keep summaries short. Search committees and collaborators should be able to
// understand the question, methods, and conservation relevance quickly.

window.siteData = window.siteData || {};

window.siteData.projects = [
  {
    title: "Lights Out alerts and conservation decision support",
    image: "Photos/site-images/project-lights-out.jpg",
    imageAlt: "Painted Bunting",
    summary: "Evaluating whether current Lights Out alert systems successfully overlap alert periods with migration passage, and assessing whether conservation goals are being met.",
    methods: ["Weather radar", "Migration forecasting", "Conservation application"],
    link: "research.html"
  },
  {
    title: "Dual-frequency observations of aerial migration in collaboration with Colorado State University",
    image: "Photos/site-images/project-dual-frequency.jpg",
    imageAlt: "Ferruginous Hawk",
    summary: "Using concurrent dual-frequency radar observations of nocturnal avian migration collected with the CSU-CHILL to understand biases that may exist when working across wavelengths.",
    methods: ["Radar aeroecology", "Remote sensing", "Quantitative ecology", "Methods development"],
    link: "methods.html"
  }
];

window.siteData.pastProjects = [
  {
    title: "Artificial light at night and nocturnal migration behavior",
    image: "Photos/site-images/past-project-alan.jpg",
    imageAlt: "Figure from a paper on artificial light at night and nocturnal migration behavior",
    summary: "Tested how migrating birds alter in-flight behavior in response to artificial light at night by combining nocturnal flight call monitoring, radar-derived migration activity, and spatial variation in light exposure.",
    methods: ["Artificial light at night", "Bioacoustics", "Weather radar", "Migration behavior"],
    ctaLabel: "Read the paper",
    ctaUrl: "https://doi.org/10.1016/j.biocon.2025.111441"
  },
  {
    title: "Comparing radar and acoustic methods for migration monitoring",
    image: "Photos/site-images/past-project-methods.jpg",
    imageAlt: "Figure from a paper comparing radar and acoustic methods for migration monitoring",
    summary: "Evaluated how weather radar and nocturnal flight call monitoring compare as tools for estimating nocturnal bird migration activity in the American West, with emphasis on strengths, limitations, and complementary use.",
    methods: ["NEXRAD", "Nocturnal flight calls", "Aeroecology", "Methods development"],
    ctaLabel: "Read the paper",
    ctaUrl: "https://doi.org/10.1093/ornithapp/duae062"
  },
  {
    title: "Nocturnal flight calls as a tool for migration ecology",
    image: "Photos/site-images/past-project-flight-calls.jpg",
    imageAlt: "Figure from a paper on nocturnal flight calls as a migration ecology tool",
    summary: "Synthesized how nocturnal flight calls can advance the study of avian migration, from behavioral inference and species-specific monitoring to conservation applications for migratory birds.",
    methods: ["Bioacoustics", "Nocturnal flight calls", "Migration ecology", "Conservation tools"],
    ctaLabel: "Read the paper",
    ctaUrl: "https://doi.org/10.1093/ornithology/ukaf002"
  },
  {
    title: "Migration speed, timing, and demographic change in passerines",
    image: "Photos/site-images/past-project-migration-timing.jpg",
    imageAlt: "Figure from a paper on migration speed and timing in passerines",
    summary: "Used long-term banding data to examine fall migration speed, timing, and shifts in age structure in North American passerines, connecting migration phenology with demographic patterns.",
    methods: ["Banding data", "Phenology", "Demography", "Migration timing"],
    ctaLabel: "Read the paper",
    ctaUrl: "https://doi.org/10.1002/ecog.08470"
  }
];
