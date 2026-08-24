const target = process.argv[2] || process.env.KYOKUSHIN_PRODUCTION_URL || "https://kyokushin-nn.vercel.app/";

const response = await fetch(target, {
  redirect: "follow",
  headers: {
    accept: "text/html"
  }
});

if (!response.ok) {
  throw new Error(`Production returned HTTP ${response.status}: ${target}`);
}

const contentType = response.headers.get("content-type") ?? "";
if (!contentType.includes("text/html")) {
  throw new Error(`Production returned unexpected content-type: ${contentType || "missing"}`);
}

const html = await response.text();

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
  'id="groups"',
  'id="trainerRoster"',
  'id="photoMosaic"',
  'id="searchInput"'
];

const forbidden = [
  "p0.bin",
  "p1.bin",
  "p2.bin",
  "p3.bin",
  "p4.bin",
  "DecompressionStream",
  "Не удалось загрузить сайт"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`Production is not the verified self-contained release; missing: ${marker}`);
  }
}

for (const marker of forbidden) {
  if (html.includes(marker)) {
    throw new Error(`Production uses forbidden fragile delivery path: ${marker}`);
  }
}

console.log(JSON.stringify({
  status: "pass",
  target: response.url,
  bytes: Buffer.byteLength(html),
  build: "self-contained"
}));
