import { mkdir, readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const sourceUrl = new URL("index.html", root);
const dataSourceUrl = new URL("script.js", root);
const outputDir = new URL("dist/", root);
const outputUrl = new URL("index.html", outputDir);
const healthUrl = new URL("health.json", outputDir);
const robotsUrl = new URL("robots.txt", outputDir);
const sitemapUrl = new URL("sitemap.xml", outputDir);
const canonicalUrl = "https://kyokushin-nn.vercel.app/";
const releaseId = (process.env.KYOKUSHIN_RELEASE_ID || "local-source").trim();

if (!releaseId || releaseId.length > 160) {
  throw new Error("KYOKUSHIN_RELEASE_ID must be a non-empty value up to 160 characters");
}

const htmlEscape = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const jsonLdStringify = (value) => JSON.stringify(value, null, 2).replace(/</g, "\\u003c");

const cssFiles = [
  "styles.css",
  "cards.css",
  "media-viewer.css",
  "experience-v3.css",
  "art-direction-v3.css"
];

const jsFiles = [
  "media.js",
  "script.js",
  "trainer-photos.js",
  "team.js",
  "finder.js",
  "photo.js",
  "experience-v3.js",
  "motion-v3.js"
];

const rejectedVisualFiles = [
  "art-direction-v2.css",
  "experience.css",
  "experience.js"
];

const forbiddenLegacyRuntimeMarkers = [
  "__KYOKUSHIN_ASSET_FALLBACK__",
  "Kyokushin JS fallback failed"
];

const [sourceHtml, dataSource] = await Promise.all([
  readFile(sourceUrl, "utf8"),
  readFile(dataSourceUrl, "utf8")
]);

const instructorMatch = dataSource.match(/const instructors = (\[[\s\S]*?\n\]);\n\nconst state =/);
if (!instructorMatch) {
  throw new Error("Could not extract the canonical instructors array for static prerendering");
}

const instructors = vm.runInNewContext(`(${instructorMatch[1]})`, Object.create(null));
if (!Array.isArray(instructors)) {
  throw new Error("Canonical instructor data did not evaluate to an array");
}

const venueCount = instructors.reduce((count, instructor) => count + instructor.venues.length, 0);
if (instructors.length !== 11 || venueCount !== 18) {
  throw new Error(`Static directory source invariant failed: ${instructors.length} instructors / ${venueCount} venues`);
}

const phoneHref = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const mapHref = (venue) => {
  const query = `${venue.city}, ${venue.address}, ${venue.name}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
};

const locationRegistry = new Map();
for (const instructor of instructors) {
  for (const venue of instructor.venues) {
    const key = [venue.city, venue.name, venue.address].join("\u0000");
    const current = locationRegistry.get(key) ?? {
      city: venue.city,
      name: venue.name,
      address: venue.address,
      phones: new Set()
    };
    current.phones.add(instructor.phone);
    locationRegistry.set(key, current);
  }
}

const structuredLocations = [...locationRegistry.values()].map((location, index) => ({
  "@type": "Place",
  "@id": `${canonicalUrl}#training-place-${index + 1}`,
  name: location.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: location.address,
    addressLocality: location.city,
    addressCountry: "RU"
  },
  telephone: [...location.phones],
  hasMap: mapHref(location)
}));

if (structuredLocations.length < 1 || structuredLocations.length > venueCount) {
  throw new Error(`Structured location invariant failed: ${structuredLocations.length} unique places from ${venueCount} venue records`);
}

const federationSchema = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "@id": `${canonicalUrl}#federation`,
  name: "Нижегородская федерация СинКёкусинкай каратэ",
  sport: "Karate",
  url: canonicalUrl,
  areaServed: [
    { "@type": "City", name: "Нижний Новгород" },
    { "@type": "City", name: "Дзержинск" }
  ],
  location: structuredLocations
};

const renderStaticSchedule = (venue) => {
  if (!venue.schedule.length) {
    return '<div class="schedule"><p class="schedule-unknown">Расписание уточняйте у инструктора</p></div>';
  }

  const rows = venue.schedule.map((item) => [
    '<div class="schedule-row">',
    `<span class="schedule-days">${htmlEscape(item.days)}</span>`,
    `<span class="schedule-time">${htmlEscape(item.time)}</span>`,
    "</div>"
  ].join("")).join("");

  return `<div class="schedule">${rows}</div>`;
};

let staticVenueIndex = 0;
const staticDirectory = instructors.map((instructor, instructorIndex) => {
  const venues = instructor.venues.map((venue) => {
    staticVenueIndex += 1;
    return [
      `<article class="venue-card" data-static-venue="${staticVenueIndex}">`,
      '<div class="venue-main">',
      `<span class="venue-city">${htmlEscape(venue.city)}</span>`,
      `<h4>${htmlEscape(venue.name)}</h4>`,
      `<p class="venue-address">${htmlEscape(venue.address)}</p>`,
      '<div class="venue-actions">',
      `<a class="mini-button call" href="${htmlEscape(phoneHref(instructor.phone))}">Позвонить</a>`,
      `<a class="mini-button" href="${htmlEscape(mapHref(venue))}" target="_blank" rel="noopener noreferrer">На карте ↗</a>`,
      "</div>",
      "</div>",
      renderStaticSchedule(venue),
      "</article>"
    ].join("");
  }).join("");

  return [
    `<section class="instructor-card" data-static-instructor="${instructorIndex + 1}">`,
    '<div class="instructor-panel">',
    `<span class="instructor-index">${String(instructorIndex + 1).padStart(2, "0")}</span>`,
    `<h3>${htmlEscape(instructor.name)}</h3>`,
    `<a class="instructor-phone" href="${htmlEscape(phoneHref(instructor.phone))}">${htmlEscape(instructor.phone)}</a>`,
    "</div>",
    `<div class="venue-list">${venues}</div>`,
    "</section>"
  ].join("");
}).join("\n");

let html = sourceHtml;
const emptyDirectory = '<div class="instructor-list" id="instructorList"></div>';
if (!html.includes(emptyDirectory)) {
  throw new Error("Source HTML is missing the empty instructor directory mount point");
}
html = html.replace(
  emptyDirectory,
  `<div class="instructor-list" id="instructorList" data-static-directory="true">\n${staticDirectory}\n</div>`
);

const organizationSchemaPattern = /<script type="application\/ld\+json">\s*\{[\s\S]*?"@type": "SportsOrganization"[\s\S]*?<\/script>/;
if (!organizationSchemaPattern.test(html)) {
  throw new Error("Source HTML is missing the SportsOrganization structured-data block");
}
html = html.replace(
  organizationSchemaPattern,
  `<script type="application/ld+json" id="federation-schema">\n${jsonLdStringify(federationSchema)}\n  </script>`
);

const oldNoscript = '<noscript><p class="noscript-note">Для фильтров секций и просмотра фотографий нужен JavaScript. Телефоны и расписание доступны после его включения.</p></noscript>';
const newNoscript = '<noscript><p class="noscript-note">Фильтры и просмотр фотографий требуют JavaScript. Адреса, расписание, телефоны и ссылки на карты ниже доступны без JavaScript.</p></noscript>';
if (!html.includes(oldNoscript)) {
  throw new Error("Source HTML noscript contract changed unexpectedly");
}
html = html.replace(oldNoscript, newNoscript);

for (const file of rejectedVisualFiles) {
  const activeCss = `<link rel="stylesheet" href="${file}">`;
  const activeJs = `<script src="${file}"`;
  if (html.includes(activeCss) || html.includes(activeJs)) {
    throw new Error(`Rejected V2 visual dependency is active in source HTML: ${file}`);
  }
}

for (const marker of forbiddenLegacyRuntimeMarkers) {
  if (html.includes(marker)) {
    throw new Error(`Legacy runtime fallback is active in source HTML: ${marker}`);
  }
}

for (const file of cssFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const link = `<link rel="stylesheet" href="${file}">`;
  if (!html.includes(link)) throw new Error(`Missing stylesheet link in source HTML: ${file}`);
  html = html.replace(link, `<style data-bundle="${file}">\n${source}\n</style>`);
}

for (const file of jsFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const scriptTag = `<script src="${file}" defer></script>`;
  if (!html.includes(scriptTag)) throw new Error(`Missing script tag in source HTML: ${file}`);
  html = html.replace(scriptTag, `<script data-bundle="${file}">\n${source}\n</script>`);
}

if (!html.includes('data-art-direction="dojo-editorial-v3"')) {
  throw new Error("Source HTML must declare the current V3 art-direction identity");
}
if (!html.includes('<meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">')) {
  throw new Error("Source HTML must declare the V3 art-direction meta identity");
}

html = html.replace(
  "<meta name=\"color-scheme\" content=\"light\">",
  `<meta name="color-scheme" content="light">\n  <meta name="x-kyokushin-build" content="self-contained">\n  <meta name="x-kyokushin-release" content="${htmlEscape(releaseId)}">`
);

for (const file of [...cssFiles, ...jsFiles]) {
  if (html.includes(`href="${file}"`) || html.includes(`src="${file}"`)) {
    throw new Error(`Local runtime dependency leaked into self-contained build: ${file}`);
  }
}

for (const forbiddenBundle of [
  'data-bundle="art-direction-v2.css"',
  'data-bundle="experience.css"',
  'data-bundle="experience.js"'
]) {
  if (html.includes(forbiddenBundle)) {
    throw new Error(`Rejected v2 visual layer leaked into production: ${forbiddenBundle}`);
  }
}

for (const marker of forbiddenLegacyRuntimeMarkers) {
  if (html.includes(marker)) {
    throw new Error(`Runtime fallback marker leaked into self-contained build: ${marker}`);
  }
}

for (const marker of [
  'id="federation-schema"',
  'data-static-directory="true"',
  'data-bundle="finder.js"',
  'data-bundle="experience-v3.css"',
  'data-bundle="art-direction-v3.css"',
  'data-bundle="experience-v3.js"',
  'data-bundle="motion-v3.js"',
  'data-art-direction="dojo-editorial-v3"'
]) {
  if (!html.includes(marker)) {
    throw new Error(`Production visual/runtime/discovery layer is missing from self-contained build: ${marker}`);
  }
}

const robots = [
  "User-agent: *",
  "Allow: /",
  `Sitemap: ${canonicalUrl}sitemap.xml`,
  ""
].join("\n");

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  "  <url>",
  `    <loc>${canonicalUrl}</loc>`,
  "  </url>",
  "</urlset>",
  ""
].join("\n");

const health = {
  project: "kyokushin-nn",
  status: "ok",
  build: "self-contained",
  release: releaseId,
  artDirection: "dojo-editorial-v3",
  staticDirectory: true,
  discovery: {
    structuredLocations: structuredLocations.length,
    robots: true,
    sitemap: true
  }
};

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(outputUrl, html, "utf8"),
  writeFile(healthUrl, `${JSON.stringify(health)}\n`, "utf8"),
  writeFile(robotsUrl, robots, "utf8"),
  writeFile(sitemapUrl, sitemap, "utf8")
]);

console.log(`build: wrote source-converged pure-v3 dist/index.html (${Buffer.byteLength(html)} bytes), release=${releaseId}, artDirection=dojo-editorial-v3, staticDirectory=18/11, structuredLocations=${structuredLocations.length}`);
