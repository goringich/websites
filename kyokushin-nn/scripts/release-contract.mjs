import { readFile } from "node:fs/promises";

const target = new URL("../dist/index.html", import.meta.url);
const html = await readFile(target, "utf8");

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
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

if (Buffer.byteLength(html) < 80_000) {
  throw new Error(`Self-contained release is unexpectedly small: ${Buffer.byteLength(html)} bytes`);
}

console.log(`release-contract: PASS — direct self-contained HTML (${Buffer.byteLength(html)} bytes)`);
