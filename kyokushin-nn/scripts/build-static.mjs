import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const sourceUrl = new URL("index.html", root);
const outputDir = new URL("dist/", root);
const outputUrl = new URL("index.html", outputDir);
const healthUrl = new URL("health.json", outputDir);
const releaseId = (process.env.KYOKUSHIN_RELEASE_ID || "local-source").trim();

if (!releaseId || releaseId.length > 160) {
  throw new Error("KYOKUSHIN_RELEASE_ID must be a non-empty value up to 160 characters");
}

const htmlEscape = (value) => value
  .replace(/&/g, "&amp;")
  .replace(/\"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

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

let html = await readFile(sourceUrl, "utf8");

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
  'data-bundle="finder.js"',
  'data-bundle="experience-v3.css"',
  'data-bundle="art-direction-v3.css"',
  'data-bundle="experience-v3.js"',
  'data-bundle="motion-v3.js"',
  'data-art-direction="dojo-editorial-v3"'
]) {
  if (!html.includes(marker)) {
    throw new Error(`Production visual layer is missing from self-contained build: ${marker}`);
  }
}

const health = {
  project: "kyokushin-nn",
  status: "ok",
  build: "self-contained",
  release: releaseId,
  artDirection: "dojo-editorial-v3"
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputUrl, html, "utf8");
await writeFile(healthUrl, `${JSON.stringify(health)}\n`, "utf8");

console.log(`build: wrote source-converged pure-v3 dist/index.html (${Buffer.byteLength(html)} bytes), release=${releaseId}, artDirection=dojo-editorial-v3`);
