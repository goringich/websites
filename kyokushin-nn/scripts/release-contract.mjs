import { readFile } from "node:fs/promises";

const htmlTarget = new URL("../dist/index.html", import.meta.url);
const healthTarget = new URL("../dist/health.json", import.meta.url);
const [html, healthRaw] = await Promise.all([
  readFile(htmlTarget, "utf8"),
  readFile(healthTarget, "utf8")
]);
const health = JSON.parse(healthRaw);

const releaseMatch = html.match(/<meta name="x-kyokushin-release" content="([^"]+)">/);
const release = releaseMatch?.[1] ?? "";

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
  '<meta name="x-kyokushin-release" content="',
  '<meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">',
  'data-art-direction="dojo-editorial-v3"',
  'id="groups"',
  'id="trainerRoster"',
  'id="photoMosaic"',
  'id="searchInput"',
  'data-bundle="styles.css"',
  'data-bundle="script.js"',
  'data-bundle="finder.js"',
  'data-bundle="photo.js"',
  'data-bundle="art-direction-v3.css"',
  'data-bundle="motion-v3.js"',
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
  "Kyokushin JS fallback failed"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`Release contract missing required marker: ${marker}`);
  }
}

for (const marker of forbidden) {
  if (html.includes(marker)) {
    throw new Error(`Release contract contains forbidden delivery marker: ${marker}`);
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
) {
  throw new Error(`Health manifest does not match HTML release identity/art direction: ${JSON.stringify(health)}`);
}

const expectedRelease = process.env.KYOKUSHIN_RELEASE_ID?.trim();
if (expectedRelease && health.release !== expectedRelease) {
  throw new Error(`Built release ${health.release} does not match expected ${expectedRelease}`);
}

if (Buffer.byteLength(html) < 100_000) {
  throw new Error(`Self-contained release is unexpectedly small: ${Buffer.byteLength(html)} bytes`);
}

console.log(`release-contract: PASS — release=${release}, artDirection=${health.artDirection}, direct self-contained HTML (${Buffer.byteLength(html)} bytes)`);
