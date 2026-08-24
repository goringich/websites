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
  "art-direction-v2.css",
  "experience.css"
];

const productionOnlyCssFiles = [
  "art-direction-v3.css"
];

const jsFiles = [
  "media.js",
  "script.js",
  "trainer-photos.js",
  "team.js",
  "finder.js",
  "experience.js",
  "photo.js"
];

const productionOnlyJsFiles = [
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

for (const file of cssFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const link = `<link rel="stylesheet" href="${file}">`;
  if (!html.includes(link)) throw new Error(`Missing stylesheet link in source HTML: ${file}`);
  html = html.replace(link, `<style data-bundle="${file}">\n${source}\n</style>`);
}

for (const file of productionOnlyCssFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  html = html.replace(
    "</head>",
    `<style data-bundle="${file}">\n${source}\n</style>\n</head>`
  );
}

html = removeScriptContaining(html, "window.__KYOKUSHIN_ASSET_FALLBACK__");
html = removeScriptContaining(html, "Kyokushin JS fallback failed");

for (const file of jsFiles) {
  const source = await readFile(new URL(file, root), "utf8");
  const scriptTag = `<script src="${file}" defer></script>`;
  if (!html.includes(scriptTag)) throw new Error(`Missing script tag in source HTML: ${file}`);
  html = html.replace(scriptTag, `<script data-bundle="${file}">\n${source}\n</script>`);
}

for (const file of productionOnlyJsFiles) {
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

for (const file of [...cssFiles, ...jsFiles]) {
  if (html.includes(`href="${file}"`) || html.includes(`src="${file}"`)) {
    throw new Error(`Local runtime dependency leaked into self-contained build: ${file}`);
  }
}

if (html.includes("__KYOKUSHIN_ASSET_FALLBACK__") || html.includes("Kyokushin JS fallback failed")) {
  throw new Error("Runtime fallback loader leaked into self-contained build");
}

for (const marker of [
  'data-bundle="experience.css"',
  'data-bundle="finder.js"',
  'data-bundle="art-direction-v3.css"',
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

console.log(`build: wrote self-contained dist/index.html (${Buffer.byteLength(html)} bytes), release=${releaseId}, artDirection=dojo-editorial-v3`);
