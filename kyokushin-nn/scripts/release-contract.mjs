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
  'id="groups"',
  'id="trainerRoster"',
  'id="photoMosaic"',
  'id="searchInput"',
  'data-bundle="styles.css"',
  'data-bundle="script.js"',
  'data-bundle="finder.js"',
  'data-bundle="photo.js"'
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
) {
  throw new Error(`Health manifest does not match HTML release identity: ${JSON.stringify(health)}`);
}

const expectedRelease = process.env.KYOKUSHIN_RELEASE_ID?.trim();
if (expectedRelease && health.release !== expectedRelease) {
  throw new Error(`Built release ${health.release} does not match expected ${expectedRelease}`);
}

if (Buffer.byteLength(html) < 80_000) {
  throw new Error(`Self-contained release is unexpectedly small: ${Buffer.byteLength(html)} bytes`);
}

console.log(`release-contract: PASS — release=${release}, direct self-contained HTML (${Buffer.byteLength(html)} bytes)`);
