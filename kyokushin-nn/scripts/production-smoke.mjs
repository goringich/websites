const target = process.argv[2] || process.env.KYOKUSHIN_PRODUCTION_URL || "https://kyokushin-nn.vercel.app/";
const expectedRelease = process.env.KYOKUSHIN_EXPECTED_RELEASE?.trim() || "";

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
const releaseMatch = html.match(/<meta name="x-kyokushin-release" content="([^"]+)">/);
const release = releaseMatch?.[1] ?? "";

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
  '<meta name="x-kyokushin-release" content="',
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

if (!release) {
  throw new Error("Production does not expose a release identity");
}

const healthUrl = new URL("/health.json", response.url);
const healthResponse = await fetch(healthUrl, {
  redirect: "follow",
  headers: {
    accept: "application/json"
  }
});

if (!healthResponse.ok) {
  throw new Error(`Production health endpoint returned HTTP ${healthResponse.status}: ${healthUrl}`);
}

const health = await healthResponse.json();
if (
  health.project !== "kyokushin-nn"
  || health.status !== "ok"
  || health.build !== "self-contained"
  || health.release !== release
) {
  throw new Error(`Production health manifest does not match HTML release: ${JSON.stringify(health)}`);
}

if (expectedRelease && release !== expectedRelease) {
  throw new Error(`Production release ${release} does not match expected ${expectedRelease}`);
}

console.log(JSON.stringify({
  status: "pass",
  target: response.url,
  bytes: Buffer.byteLength(html),
  build: "self-contained",
  release
}));
