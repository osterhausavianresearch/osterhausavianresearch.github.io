// NEWS DATA
// These items appear on the homepage and News page.
//
// To add a news item:
// 1. Add a Word doc to News Items/ with Title, Date, Category, and Short summary.
// 2. Tell Codex to update the site from the News Items folder.
// 3. Optional: include a NOTES section with image or link instructions.

window.siteData = window.siteData || {};

window.siteData.news = [
  {
    date: "2026-09-12",
    category: "In the Media",
    title: "Interview with The New York Times",
    image: "Photos/news-images/nyt-black-throated-green-warbler.png",
    imageAlt: "Black-throated Green Warbler perched on a branch",
    summary: "Recently, I was interviewed by Ishani Desai of The New York Times and featured in an article discussing avian migration across the United States.",
    link: "https://www.nytimes.com/2026/09/12/us/bird-seasonal-migration-lights.html",
    linkLabel: "Read the article"
  },
  {
    date: "2026-09-03",
    category: "Award",
    title: "Manuscript Wins 2026 TWS Wildlife Publications Award",
    image: "Photos/site-images/past-project-alan.jpg",
    imageAlt: "Figure from a paper on artificial light at night and nocturnal migration behavior",
    summary: "My manuscript “<a href=\"https://doi.org/10.1016/j.biocon.2025.111441\" target=\"_blank\" rel=\"noopener\">Nocturnal flight call monitoring reveals in-flight behavioral alteration by avian migrants in response to artificial light at night</a>” has been selected to receive the 2026 Best Student Paper Award from The Wildlife Society.",
    link: "https://wildlife.org/tws-announces-2026-wildlife-publications-awards/",
    linkLabel: "Read the announcement here"
  },
  {
    date: "2026-08-05",
    category: "Conference Presentation",
    title: "Lights Out Alert work presented at the 2026 American Ornithological Society Conference in Amherst",
    summary: "Last week I attended the 2026 American Ornithological Society Conference at the University of Massachusetts Amherst, where I gave a presentation, attended a workshop, and ran in the Woodcock Waddle 5k! It was a great week at a great conference and I thoroughly enjoyed catching up with collaborators and friends, as well as making new connections.",
    image: "Photos/news-images/AOS 2026.jpeg",
    imageAlt: "American Ornithological Society Conference 2026"
  },
  {
    date: "2026-06-30",
    category: "Publication",
    title: "New manuscript published in <em>Frontiers in Ecology and Evolution</em>",
    summary: "Our new paper detailing the 2020 mass avian mortality event in New Mexico is now published in <em>Frontiers in Ecology and Evolution</em>. In this work, we describe the conditions across the American West leading up the event, discuss how these conditions likely contributed to the mortalities, and summarize the species that were impacted.",
    image: "Photos/news-images/Frontiers Paper.png",
    imageAlt: "Frontiers in Ecology and Evolution paper image",
    link: "https://doi.org/10.3389/fevo.2026.1763394",
    linkLabel: "Read the paper"
  },
  {
    date: "2026-06-26",
    category: "Conference Presentation",
    title: "Dual-frequency radar monitoring of avian migration work presented at the 2026 International Radar Aeroecology Conference in Amsterdam",
    summary: "Over the past week I attended the 2026 International Radar Aeroecology Conference in Amsterdam, culminating in the presentation of my research work using dual-frequency weather radars to monitor nocturnal avian migration. It was my first time attending the IRAC, and I look forward to attending many more in the future.",
    image: "Photos/news-images/IRAC 2026.jpeg",
    imageAlt: "International Radar Aeroecology Conference 2026"
  },
  {
    date: "2026-04-06",
    category: "Publication",
    title: "Undergraduate mentee’s paper is published in <em>The Wildlife Society Bulletin</em>",
    summary: "A paper from Thomas Huycke, one of my undergraduate mentees from the Avian Migration Program, has been published in <em>The Wildlife Society Bulletin</em>. Congratulations Tom! In this paper, Tom studies how quickly avian carcasses are scavenged in the desert Southwest, with important implications for future carcass surveys.",
    image: "Photos/news-images/Scavenging paper.png",
    imageAlt: "Wildlife Society Bulletin scavenging paper image",
    link: "https://wildlife.onlinelibrary.wiley.com/doi/full/10.1002/wsb.70026",
    linkLabel: "Read the paper"
  },
  {
    date: "2026-03-24",
    category: "Publication",
    title: "New paper published in <em>Ecography</em>",
    summary: "Our new paper on migration speed, timing, and age structure is now published in <em>Ecography</em>, and was featured on the cover. In this study, we used over 6 million bird banding records to assess how migration speed and timing varies across species and between age classes for the North American passerine migrant community, and explored how this variability leads to shifting demographic structure of the community both within a single migration season and over 53 years.",
    image: "Photos/journal-covers/Ecography_2026_cover.jpg",
    imageAlt: "Ecography 2026 journal cover featuring a Dylan Osterhaus photo",
    link: "https://nsojournals.onlinelibrary.wiley.com/doi/10.1002/ecog.08470",
    linkLabel: "Read the paper"
  },
  {
    date: "2026-03-06",
    category: "Publication",
    title: "Kelley’s carcass survey paper published in <em>Global Ecology and Conservation</em>",
    summary: "Kelley Boland’s manuscript, “Carcass Size and Ground Substrate Drive Detection Rates of Avian Carcasses by Human Surveyors and a Dog Team” has been published in <em>Global Ecology and Conservation</em>. In this paper, Kelley assesses the performance of human surveyors and a detection dog team in their abilities to detect avian carcasses, and determine what factors drive performance, with important implications for future survey efforts. It was a pleasure to work with Kelley on this project during her time at NMSU!",
    link: "https://www.sciencedirect.com/science/article/pii/S2351989426000971",
    linkLabel: "Read the paper"
  },
  {
    date: "2026-02-11",
    category: "In the Media",
    title: "Interview with the Lafayette Journal & Courier",
    summary: "This past week, I was interviewed by Quint Holguin of the Lafayette Journal & Courier where they discussed the large number of Bald Eagles currently present along the Wabash River in downtown Lafayette.",
    image: "Photos/news-images/lafayette-bald-eagle.jpg",
    imageAlt: "Bald Eagle perched on a metal beam",
    link: "https://www.jconline.com/story/news/local/2026/02/11/bald-eagles-return-to-the-wabash-why-theyre-here-and-how-to-see-them/88552294007/",
    linkLabel: "Read the article"
  },
  {
    date: "2026-01-15",
    category: "New Position",
    title: "Joined the AeroEco Lab at Purdue University",
    summary: "I am excited to announce that I have recently joined the AeroEco Lab in the Department of Forestry and Natural Resources at Purdue University as a Post-doctoral Research Assistant and Lab Manager. Our lab is led by Dr. Kyle Horton, a leader in the field of aeroecology. Kyle served on my PhD committee, and I am very excited to continue pursuing research combining our shared interests in radar aeroecology, methods to study migration, and the conservation of avian migrants.",
    link: "https://aeroecolab.com/",
    linkLabel: "Visit the lab website"
  },
  {
    date: "2025-12-25",
    category: "Milestone",
    title: "Graduation from New Mexico State University",
    summary: "Today I graduated with my PhD in Biology from New Mexico State University and was honored by the New Mexico State University Foundation as the Outstanding Doctoral Graduate for Fall 2025. I am very thankful for those who made my time at NMSU special, importantly my advisors Drs. Martha Desmond and Timothy Wright.",
    image: "Photos/news-images/graduation.jpeg",
    imageAlt: "Graduation from New Mexico State University",
    link: "https://nsojournals.onlinelibrary.wiley.com/doi/10.1002/ecog.08470",
    linkLabel: "See the announcement"
  }
];
