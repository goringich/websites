import { readFile } from "node:fs/promises";

const htmlTarget = new URL("../dist/index.html", import.meta.url);
const healthTarget = new URL("../dist/health.json", import.meta.url);
const robotsTarget = new URL("../dist/robots.txt", import.meta.url);
const sitemapTarget = new URL("../dist/sitemap.xml", import.meta.url);
const [html, healthRaw, robots, sitemap] = await Promise.all([
  readFile(htmlTarget, "utf8"),
  readFile(healthTarget, "utf8"),
  readFile(robotsTarget, "utf8"),
  readFile(sitemapTarget, "utf8")
]);
const health = JSON.parse(healthRaw);

const releaseMatch = html.match(/<meta name="x-kyokushin-release" content="([^"]+)">/);
const release = releaseMatch?.[1] ?? "";

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
  '<meta name="x-kyokushin-release" content="',
  '<meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">',
  'data-art-direction="dojo-editorial-v3"',
  'data-static-directory="true"',
  'id="federation-schema"',
  '<span class="brand-logo" role="img" aria-label="Shinkyokushinkai"></span>',
  'background-image: url("https://wkosydney.com.au/assets/images/logo.jpg"), radial-gradient(',
  'radial-gradient(circle at center, #ef2d1d 0 32%, #fff 33% 100%)',
  'background-size: contain, cover',
  'id="groups"',
  'id="trainerRoster"',
  'id="photoMosaic"',
  'id="searchInput"',
  'data-bundle="styles.css"',
  'data-bundle="script.js"',
  'data-bundle="finder.js"',
  'data-bundle="photo.js"',
  'data-bundle="experience-v3.css"',
  'data-bundle="art-direction-v3.css"',
  'data-bundle="experience-v3.js"',
  'data-bundle="motion-v3.js"',
  'KYOKUSHIN_EXPERIENCE_V3_READY',
  'KYOKUSHIN_ART_DIRECTION_V3_READY'
];

const forbidden = [
  "p0.bin",
  "p1.bin",
  "p2.bin",
  "p3.bin",
  "p4.bin",
  "DecompressionStream",
  "Не удалось загрузить сайт",
  "__KYOKUSHIN_ASSET_FALLBACK__",
  "Kyokushin JS fallback failed",
  '<img class="brand-logo"',
  'data-bundle="art-direction-v2.css"',
  'data-bundle="experience.css"',
  'data-bundle="experience.js"'
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`Release contract missing required marker: ${marker}`);
  }
}

for (const marker of forbidden) {
  if (html.includes(marker)) {
    throw new Error(`Release contract contains forbidden delivery/visual marker: ${marker}`);
  }
}

if (!release) {
  throw new Error("Release contract is missing a concrete release identity");
}

if (
  health.project !== "kyokushin-nn"
  || health.status !== "ok"
  || health.build !== "self-contained"
  || health.release !== release
  || health.artDirection !== "dojo-editorial-v3"
  || health.staticDirectory !== true
  || health.brandResilience !== true
  || !Number.isInteger(health.discovery?.structuredLocations)
  || health.discovery.structuredLocations < 1
  || health.discovery.robots !== true
  || health.discovery.sitemap !== true
) {
  throw new Error(`Health manifest does not match HTML release/runtime/discovery/brand identity: ${JSON.stringify(health)}`);
}

if (!robots.includes("User-agent: *") || !robots.includes("Allow: /") || !robots.includes("Sitemap: https://kyokushin-nn.vercel.app/sitemap.xml")) {
  throw new Error("robots.txt does not expose the canonical crawl/sitemap contract");
}
if (!sitemap.includes("<loc>https://kyokushin-nn.vercel.app/</loc>") || (sitemap.match(/<url>/g) || []).length !== 1) {
  throw new Error("sitemap.xml must expose exactly the canonical single-page URL");
}

const expectedRelease = process.env.KYOKUSHIN_RELEASE_ID?.trim();
if (expectedRelease && health.release !== expectedRelease) {
  throw new Error(`Built release ${health.release} does not match expected ${expectedRelease}`);
}

if (Buffer.byteLength(html) < 100_000) {
  throw new Error(`Self-contained release is unexpectedly small: ${Buffer.byteLength(html)} bytes`);
}

console.log(`release-contract: PASS — pure-v3 release=${release}, artDirection=${health.artDirection}, staticDirectory=${health.staticDirectory}, structuredLocations=${health.discovery.structuredLocations}, resilientBrand=${health.brandResilience}, direct self-contained HTML (${Buffer.byteLength(html)} bytes)`);
