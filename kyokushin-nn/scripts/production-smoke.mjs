const target = process.argv[2] || process.env.KYOKUSHIN_PRODUCTION_URL || "https://kyokushin-nn.vercel.app/";
const expectedRelease = process.env.KYOKUSHIN_EXPECTED_RELEASE?.trim() || "";
const canonicalUrl = "https://kyokushin-nn.vercel.app/";

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
  'id="federation-schema"',
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

const schemaMatch = html.match(/<script type="application\/ld\+json" id="federation-schema">\s*([\s\S]*?)\s*<\/script>/);
if (!schemaMatch) {
  throw new Error("Production is missing federation structured data");
}
const federationSchema = JSON.parse(schemaMatch[1]);
if (
  federationSchema["@type"] !== "SportsOrganization"
  || federationSchema["@id"] !== `${canonicalUrl}#federation`
  || federationSchema.url !== canonicalUrl
  || !Array.isArray(federationSchema.location)
  || federationSchema.location.length < 1
) {
  throw new Error("Production federation structured data is incomplete or on the wrong canonical identity");
}

const healthUrl = new URL("/health.json", response.url);
const robotsUrl = new URL("/robots.txt", response.url);
const sitemapUrl = new URL("/sitemap.xml", response.url);
const [healthResponse, robotsResponse, sitemapResponse] = await Promise.all([
  fetch(healthUrl, { redirect: "follow", headers: { accept: "application/json" } }),
  fetch(robotsUrl, { redirect: "follow", headers: { accept: "text/plain" } }),
  fetch(sitemapUrl, { redirect: "follow", headers: { accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" } })
]);

if (!healthResponse.ok) {
  throw new Error(`Production health endpoint returned HTTP ${healthResponse.status}: ${healthUrl}`);
}
if (!robotsResponse.ok) {
  throw new Error(`Production robots.txt returned HTTP ${robotsResponse.status}: ${robotsUrl}`);
}
if (!sitemapResponse.ok) {
  throw new Error(`Production sitemap.xml returned HTTP ${sitemapResponse.status}: ${sitemapUrl}`);
}

const healthCacheControl = healthResponse.headers.get("cache-control") ?? "";
if (!healthCacheControl.toLowerCase().includes("no-store")) {
  throw new Error(`Production health endpoint must be no-store, got: ${healthCacheControl || "missing"}`);
}

const [health, robots, sitemap] = await Promise.all([
  healthResponse.json(),
  robotsResponse.text(),
  sitemapResponse.text()
]);
if (
  health.project !== "kyokushin-nn"
  || health.status !== "ok"
  || health.build !== "self-contained"
  || health.release !== release
  || health.artDirection !== "dojo-editorial-v3"
  || health.staticDirectory !== true
  || health.discovery?.structuredLocations !== federationSchema.location.length
  || health.discovery?.robots !== true
  || health.discovery?.sitemap !== true
) {
  throw new Error(`Production health manifest does not match HTML release/runtime/discovery state: ${JSON.stringify(health)}`);
}

if (!robots.includes("User-agent: *") || !robots.includes("Allow: /") || !robots.includes(`Sitemap: ${canonicalUrl}sitemap.xml`)) {
  throw new Error("Production robots.txt does not expose the canonical discovery contract");
}
if (!sitemap.includes(`<loc>${canonicalUrl}</loc>`) || (sitemap.match(/<url>/g) || []).length !== 1) {
  throw new Error("Production sitemap.xml does not expose exactly the canonical single-page URL");
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
  discovery: {
    structuredLocations: federationSchema.location.length,
    robots: true,
    sitemap: true
  },
  staticDirectory: {
    instructors: staticInstructorCount,
    venues: staticVenueCount
  }
}));
