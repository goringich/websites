import { readFile } from "node:fs/promises";

const [html, contentRaw, scriptSource] = await Promise.all([
  readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
  readFile(new URL("../content/site.json", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8")
]);
const content = JSON.parse(contentRaw);
const instructors = content.instructors;

const htmlEscape = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const expectedVenueCount = instructors.reduce((count, instructor) => count + instructor.venues.length, 0);
if (instructors.length !== 11 || expectedVenueCount !== 18) {
  throw new Error(`CMS recruitment data invariant failed: ${instructors.length} instructors / ${expectedVenueCount} venues`);
}

if (!html.includes('data-static-directory="true"') || !html.includes('id="kyokushin-content-seed"')) {
  throw new Error("Production HTML is missing CMS seed/static directory markers");
}

const staticInstructorIds = [...html.matchAll(/data-static-instructor="(\d+)"/g)].map((match) => Number(match[1]));
const staticVenueIds = [...html.matchAll(/data-static-venue="(\d+)"/g)].map((match) => Number(match[1]));
if (JSON.stringify(staticInstructorIds) !== JSON.stringify(Array.from({ length: 11 }, (_, index) => index + 1))) {
  throw new Error(`Static instructor sequence is incomplete or duplicated: ${staticInstructorIds.join(", ")}`);
}
if (JSON.stringify(staticVenueIds) !== JSON.stringify(Array.from({ length: 18 }, (_, index) => index + 1))) {
  throw new Error(`Static venue sequence is incomplete or duplicated: ${staticVenueIds.join(", ")}`);
}

const phoneHref = (phone) => `tel:${String(phone).replace(/[^+\d]/g, "")}`;
const mapHref = (venue) => `https://yandex.ru/maps/?text=${encodeURIComponent(`${venue.city}, ${venue.address}, ${venue.name}`)}`;

for (const instructor of instructors) {
  for (const marker of [
    `<h3>${htmlEscape(instructor.name)}</h3>`,
    `href="${htmlEscape(phoneHref(instructor.phone))}">${htmlEscape(instructor.phone)}</a>`
  ]) {
    if (!html.includes(marker)) throw new Error(`Static directory lost instructor evidence for ${instructor.name}: ${marker}`);
  }
  for (const venue of instructor.venues) {
    for (const marker of [
      `<span class="venue-city">${htmlEscape(venue.city)}</span>`,
      `<h4>${htmlEscape(venue.name)}</h4>`,
      `<p class="venue-address">${htmlEscape(venue.address)}</p>`,
      `href="${htmlEscape(mapHref(venue))}" target="_blank" rel="noopener noreferrer">На карте ↗</a>`
    ]) {
      if (!html.includes(marker)) throw new Error(`Static directory lost venue evidence for ${instructor.name} / ${venue.name}: ${marker}`);
    }
  }
}

if (!html.includes("Адреса, расписание, телефоны и ссылки на карты доступны без JavaScript.")) {
  throw new Error("Noscript copy must accurately describe the resilient static directory");
}
if (!scriptSource.includes("elements.list.replaceChildren()") || !scriptSource.includes("window.KYOKUSHIN_APP")) {
  throw new Error("Interactive directory must progressively replace the CMS-backed static fallback");
}

console.log(`verify-static-directory: PASS — CMS-backed production HTML carries ${instructors.length} instructors / ${expectedVenueCount} venues before JavaScript enhancement`);
