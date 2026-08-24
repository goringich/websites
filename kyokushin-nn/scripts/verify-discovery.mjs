import { readFile } from "node:fs/promises";
import vm from "node:vm";

const canonicalUrl = "https://kyokushin-nn.vercel.app/";
const [dataSource, html, robots, sitemap, healthRaw] = await Promise.all([
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
  readFile(new URL("../dist/robots.txt", import.meta.url), "utf8"),
  readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8"),
  readFile(new URL("../dist/health.json", import.meta.url), "utf8")
]);

const instructorMatch = dataSource.match(/const instructors = (\[[\s\S]*?\n\]);\n\nconst state =/);
if (!instructorMatch) {
  throw new Error("Could not extract canonical instructors for discovery verification");
}

const instructors = vm.runInNewContext(`(${instructorMatch[1]})`, Object.create(null));
if (!Array.isArray(instructors) || instructors.length !== 11) {
  throw new Error(`Discovery source must contain exactly 11 instructors, got ${instructors?.length ?? "invalid"}`);
}

const mapHref = (venue) => {
  const query = `${venue.city}, ${venue.address}, ${venue.name}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
};

const expectedLocations = new Map();
let venueRecords = 0;
for (const instructor of instructors) {
  for (const venue of instructor.venues) {
    venueRecords += 1;
    const key = [venue.city, venue.name, venue.address].join("\u0000");
    const current = expectedLocations.get(key) ?? {
      city: venue.city,
      name: venue.name,
      address: venue.address,
      hasMap: mapHref(venue),
      phones: new Set()
    };
    current.phones.add(instructor.phone);
    expectedLocations.set(key, current);
  }
}

if (venueRecords !== 18) {
  throw new Error(`Discovery source must preserve 18 venue records, got ${venueRecords}`);
}

const schemaMatch = html.match(/<script type="application\/ld\+json" id="federation-schema">\s*([\s\S]*?)\s*<\/script>/);
if (!schemaMatch) {
  throw new Error("Built HTML is missing federation-schema JSON-LD");
}

const schema = JSON.parse(schemaMatch[1]);
if (
  schema["@context"] !== "https://schema.org"
  || schema["@type"] !== "SportsOrganization"
  || schema["@id"] !== `${canonicalUrl}#federation`
  || schema.url !== canonicalUrl
  || schema.name !== "Нижегородская федерация СинКёкусинкай каратэ"
  || schema.sport !== "Karate"
) {
  throw new Error(`Federation structured data identity drifted: ${JSON.stringify(schema)}`);
}

if (!Array.isArray(schema.location) || schema.location.length !== expectedLocations.size) {
  throw new Error(`Expected ${expectedLocations.size} unique structured locations, got ${schema.location?.length ?? "invalid"}`);
}

const actualByKey = new Map();
for (const place of schema.location) {
  if (place["@type"] !== "Place" || place.address?.["@type"] !== "PostalAddress") {
    throw new Error(`Structured location must use Place + PostalAddress: ${JSON.stringify(place)}`);
  }
  if (place.address.addressCountry !== "RU") {
    throw new Error(`Structured location must identify Russia explicitly: ${place.name}`);
  }
  const key = [place.address.addressLocality, place.name, place.address.streetAddress].join("\u0000");
  if (actualByKey.has(key)) {
    throw new Error(`Duplicate structured location: ${key}`);
  }
  actualByKey.set(key, place);
}

for (const [key, expected] of expectedLocations) {
  const actual = actualByKey.get(key);
  if (!actual) {
    throw new Error(`Missing structured location for canonical venue: ${key}`);
  }
  if (actual.hasMap !== expected.hasMap) {
    throw new Error(`Structured map link drifted for ${expected.name}`);
  }
  const actualPhones = Array.isArray(actual.telephone) ? [...actual.telephone].sort() : [actual.telephone].filter(Boolean).sort();
  const expectedPhones = [...expected.phones].sort();
  if (JSON.stringify(actualPhones) !== JSON.stringify(expectedPhones)) {
    throw new Error(`Structured phone set drifted for ${expected.name}: ${actualPhones.join(", ")}`);
  }
}

const expectedRobots = [
  "User-agent: *",
  "Allow: /",
  `Sitemap: ${canonicalUrl}sitemap.xml`,
  ""
].join("\n");
if (robots !== expectedRobots) {
  throw new Error(`robots.txt discovery contract drifted: ${JSON.stringify(robots)}`);
}

for (const marker of [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `<loc>${canonicalUrl}</loc>`
]) {
  if (!sitemap.includes(marker)) {
    throw new Error(`sitemap.xml is missing: ${marker}`);
  }
}
if ((sitemap.match(/<url>/g) || []).length !== 1) {
  throw new Error("Single-page site sitemap must expose exactly one canonical URL");
}

const health = JSON.parse(healthRaw);
if (
  health.discovery?.structuredLocations !== expectedLocations.size
  || health.discovery?.robots !== true
  || health.discovery?.sitemap !== true
) {
  throw new Error(`Health discovery state does not match built artifacts: ${JSON.stringify(health.discovery)}`);
}

console.log(`verify-discovery: PASS — ${venueRecords} section records map to ${expectedLocations.size} unique Places; robots.txt + sitemap.xml are canonical and source-derived`);
