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

const expectedHeaders = new Map([
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  ["permissions-policy", "camera=(), microphone=(), geolocation=()"]
]);

for (const [key, expected] of expectedHeaders) {
  const actual = response.headers.get(key) ?? "";
  if (actual !== expected) {
    throw new Error(`Production runtime header mismatch: ${key}=${actual || "missing"}`);
  }
}

const csp = response.headers.get("content-security-policy") ?? "";
for (const directive of ["base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "upgrade-insecure-requests"]) {
  if (!csp.includes(directive)) {
    throw new Error(`Production CSP is missing required baseline directive: ${directive}`);
  }
}

const html = await response.text();
const releaseMatch = html.match(/<meta name="x-kyokushin-release" content="([^"]+)">/);
const release = releaseMatch?.[1] ?? "";

const required = [
  '<meta name="x-kyokushin-build" content="self-contained">',
  '<meta name="x-kyokushin-release" content="',
  '<meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">',
  'data-art-direction="dojo-editorial-v3"',
  'data-static-directory="true"',
  'data-bundle="experience-v3.css"',
  'data-bundle="art-direction-v3.css"',
  'data-bundle="experience-v3.js"',
  'data-bundle="motion-v3.js"',
  'KYOKUSHIN_EXPERIENCE_V3_READY',
  'KYOKUSHIN_ART_DIRECTION_V3_READY',
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
  "Не удалось загрузить сайт",
  'data-bundle="art-direction-v2.css"',
  'data-bundle="experience.css"',
  'data-bundle="experience.js"'
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`Production is not the verified pure-V3 resilient release; missing: ${marker}`);
  }
}

for (const marker of forbidden) {
  if (html.includes(marker)) {
    throw new Error(`Production contains forbidden delivery/visual marker: ${marker}`);
  }
}

if (!release) {
  throw new Error("Production does not expose a release identity");
}

const staticInstructorCount = (html.match(/data-static-instructor=/g) || []).length;
const staticVenueCount = (html.match(/data-static-venue=/g) || []).length;
if (staticInstructorCount !== 11 || staticVenueCount !== 18) {
  throw new Error(`Production static directory is incomplete: ${staticInstructorCount} instructors / ${staticVenueCount} venues`);
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

const healthCacheControl = healthResponse.headers.get("cache-control") ?? "";
if (!healthCacheControl.toLowerCase().includes("no-store")) {
  throw new Error(`Production health endpoint must be no-store, got: ${healthCacheControl || "missing"}`);
}

const health = await healthResponse.json();
if (
  health.project !== "kyokushin-nn"
  || health.status !== "ok"
  || health.build !== "self-contained"
  || health.release !== release
  || health.artDirection !== "dojo-editorial-v3"
  || health.staticDirectory !== true
) {
  throw new Error(`Production health manifest does not match HTML release/art direction/static directory: ${JSON.stringify(health)}`);
}

if (expectedRelease && release !== expectedRelease) {
  throw new Error(`Production release ${release} does not match expected ${expectedRelease}`);
}

console.log(JSON.stringify({
  status: "pass",
  target: response.url,
  bytes: Buffer.byteLength(html),
  build: "self-contained",
  release,
  artDirection: health.artDirection,
  visualStack: "pure-v3",
  runtimeHeaders: "verified",
  healthCache: "no-store",
  staticDirectory: {
    instructors: staticInstructorCount,
    venues: staticVenueCount
  }
}));
