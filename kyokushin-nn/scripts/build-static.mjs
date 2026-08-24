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

const baseCssFiles = [
  "styles.css",
  "cards.css",
  "media-viewer.css"
];

const rejectedSourceCssFiles = [
  "art-direction-v2.css",
  "experience.css"
];

const v3CssFiles = [
  "experience-v3.css",
  "art-direction-v3.css"
];

const baseJsFiles = [
  "media.js",
  "script.js",
  "trainer-photos.js",
  "team.js",
  "finder.js",
  "photo.js"
];

const rejectedSourceJsFiles = [
  "experience.js"
];

const v3JsFiles = [
  "experience-v3.js",
  "motion-v3.js"
];

const removeScriptContaining = (html, marker) => {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) return html;

  const scriptStart = html.lastIndexOf("<script", markerIndex);
  const scriptEnd = html.indexOf("</script>", markerIndex);
  if (scriptStart === -1 || scriptEnd === -1) {
    throw new Error(`Could not isolate fallback script containing: ${marker}`);
  }

  return `${html.slice(0, scriptStart)}${html.slice(scriptEnd + "</script>".length)}`;
};

let html = await readFile(sourceUrl, "utf8");

for (const file of baseCssFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const link = `<link rel="stylesheet" href="${file}">`;
  if (!html.includes(link)) throw new Error(`Missing stylesheet link in source HTML: ${file}`);
  html = html.replace(link, `<style data-bundle="${file}">\n${source}\n</style>`);
}

for (const file of rejectedSourceCssFiles) {
  const link = `<link rel="stylesheet" href="${file}">`;
  if (!html.includes(link)) throw new Error(`Missing legacy stylesheet link in source HTML: ${file}`);
  html = html.replace(link, "");
}

for (const file of v3CssFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  html = html.replace(
    "</head>",
    `<style data-bundle="${file}">\n${source}\n</style>\n</head>`
  );
}

html = removeScriptContaining(html, "window.__KYOKUSHIN_ASSET_FALLBACK__");
html = removeScriptContaining(html, "Kyokushin JS fallback failed");

for (const file of baseJsFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const scriptTag = `<script src="${file}" defer></script>`;
  if (!html.includes(scriptTag)) throw new Error(`Missing script tag in source HTML: ${file}`);
  html = html.replace(scriptTag, `<script data-bundle="${file}">\n${source}\n</script>`);
}

for (const file of rejectedSourceJsFiles) {
  const scriptTag = `<script src="${file}" defer></script>`;
  if (!html.includes(scriptTag)) throw new Error(`Missing legacy script tag in source HTML: ${file}`);
  html = html.replace(scriptTag, "");
}

for (const file of v3JsFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  html = html.replace(
    "</body>",
    `<script data-bundle="${file}">\n${source}\n</script>\n</body>`
  );
}

html = html.replace(
  "<body>",
  '<body data-art-direction="dojo-editorial-v3">'
);

html = html.replace(
  "<meta name=\"color-scheme\" content=\"light\">",
  `<meta name="color-scheme" content="light">\n  <meta name="x-kyokushin-build" content="self-contained">\n  <meta name="x-kyokushin-release" content="${htmlEscape(releaseId)}">\n  <meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">`
);

for (const file of [
  ...baseCssFiles,
  ...rejectedSourceCssFiles,
  ...baseJsFiles,
  ...rejectedSourceJsFiles
]) {
  if (html.includes(`href="${file}"`) || html.includes(`src="${file}"`)) {
    throw new Error(`Local runtime dependency leaked into self-contained build: ${file}`);
  }
}

if (html.includes("__KYOKUSHIN_ASSET_FALLBACK__") || html.includes("Kyokushin JS fallback failed")) {
  throw new Error("Runtime fallback loader leaked into self-contained build");
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

console.log(`build: wrote pure-v3 self-contained dist/index.html (${Buffer.byteLength(html)} bytes), release=${releaseId}, artDirection=dojo-editorial-v3`);
