import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [html, styles, cards, script, media, photoScript, trainerPhotoScript] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../cards.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../media.js", import.meta.url), "utf8"),
  readFile(new URL("../photo.js", import.meta.url), "utf8"),
  readFile(new URL("../trainer-photos.js", import.meta.url), "utf8")
]);

const requiredHtml = [
  "id=\"groups\"",
  "id=\"searchInput\"",
  "id=\"cityFilters\"",
  "id=\"dayFilters\"",
  "id=\"photoMosaic\"",
  "id=\"photoCollections\"",
  "brand-logo",
  "wkosydney.com.au/assets/images/logo.jpg",
  "styles.css",
  "cards.css",
  "media.js",
  "script.js",
  "trainer-photos.js",
  "photo.js"
];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) {
    throw new Error(`Missing HTML marker: ${marker}`);
  }
}

for (const legacyCss of ["photo.css", "clean.css"]) {
  if (html.includes(legacyCss)) {
    throw new Error(`Legacy conflicting stylesheet must not be linked: ${legacyCss}`);
  }
}

for (const cssMarker of [
  ".photo-story-link",
  ".instructor-card",
  ".instructor-panel",
  ".instructor-photo-frame",
  "@media (max-width: 720px)"
]) {
  if (!cards.includes(cssMarker)) {
    throw new Error(`Missing component layout rule: ${cssMarker}`);
  }
}

if (styles.includes("margin: -28px") || styles.includes("margin: -22px") || cards.includes("margin: -28px")) {
  throw new Error("Trainer layout must not rely on negative-margin photo hacks");
}

if (html.includes(">極<") || html.includes("Shinkyokushin.png")) {
  throw new Error("Deprecated placeholder/wrong Shinkyokushin logo must not be used");
}

for (const slop of [
  "Проверяем источник",
  "Если источник не подтверждает",
  "без случайных картинок"
]) {
  if (html.includes(slop)) {
    throw new Error(`Public gallery copy must stay clean: ${slop}`);
  }
}

const cityNnCount = (script.match(/city: "Нижний Новгород"/g) || []).length;
const cityDzerzhinskCount = (script.match(/city: "Дзержинск"/g) || []).length;
const phoneCount = (script.match(/phone: "\+7/g) || []).length;

if (cityNnCount !== 16 || cityDzerzhinskCount !== 2) {
  throw new Error(`Expected 18 venues (16 + 2), got ${cityNnCount + cityDzerzhinskCount}`);
}

if (phoneCount !== 11) {
  throw new Error(`Expected 11 instructors, got ${phoneCount}`);
}

const expectedPeople = [
  "Сергей Жуков",
  "Андрей Троцко",
  "Владимир Жуков",
  "Дарья Осинина",
  "Юлия Фролова",
  "Иван Гаврилин",
  "Сергей Глухов",
  "Сергей Захаров",
  "Андрей Коннов",
  "Георгий Пигиданов",
  "Кирилл Антоневич"
];

const instructorNames = [...script.matchAll(/\n\s{4}name: "([^"]+)",\n\s{4}phone:/g)].map((match) => match[1]);
if (JSON.stringify(instructorNames) !== JSON.stringify(expectedPeople)) {
  throw new Error(`Instructor allowlist changed: ${instructorNames.join(", ")}`);
}

const publicSource = `${html}\n${styles}\n${cards}\n${script}\n${media}\n${photoScript}\n${trainerPhotoScript}`;
for (const forbidden of ["Горохов", "ИФК", "IFK"]) {
  if (publicSource.includes(forbidden)) {
    throw new Error(`Forbidden unrelated identity/federation marker found: ${forbidden}`);
  }
}

for (const source of [script, media, photoScript, trainerPhotoScript]) {
  if (source.includes("innerHTML")) {
    throw new Error("Unsafe innerHTML usage is not allowed");
  }
}

for (const removedPromoAsset of [
  "tild3731-3236-4264-a165-653239663730",
  "tild6633-6639-4866-b935-663238346266",
  "tild3939-3362-4535-b162-343938356166",
  "tild6638-3461-4431-b063-336138376236",
  "tild6361-3663-4064-a531-313031616532",
  "tild3633-3062-4863-a562-386138386236"
]) {
  if (media.includes(removedPromoAsset)) {
    throw new Error(`Promo/synthetic-looking asset must not return: ${removedPromoAsset}`);
  }
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(media, context);
const registry = context.window.KYOKUSHIN_MEDIA;

if (!registry) {
  throw new Error("Media registry was not initialized");
}

if (JSON.stringify([...registry.allowedPeople]) !== JSON.stringify(expectedPeople)) {
  throw new Error("Media allowlist must exactly match the 11 recruitment instructors");
}

if (registry.verifiedMedia.length !== 9) {
  throw new Error(`Expected 8 real photos + 1 shared story card, got ${registry.verifiedMedia.length}`);
}

const realPhotos = registry.verifiedMedia.filter((item) => item.kind !== "story");
const sharedStories = registry.verifiedMedia.filter((item) => item.kind === "story");

if (realPhotos.length !== 8 || sharedStories.length !== 1) {
  throw new Error(`Expected 8 real photos and 1 story card, got ${realPhotos.length} + ${sharedStories.length}`);
}

if (new URL(sharedStories[0].sourceUrl).hostname !== "masterskayakarate.ru") {
  throw new Error("Masterskaya material must stay inside the common feed");
}

const isApprovedImageHost = (hostname) => hostname.endsWith(".userapi.com");
const allowedSourceHosts = new Set([
  "masterskayakarate.ru",
  "shin-nnov.orgs.biz",
  "disk.yandex.ru",
  "vk.com"
]);
const mediaIds = new Set();

for (const item of realPhotos) {
  if (mediaIds.has(item.id)) {
    throw new Error(`Duplicate media id: ${item.id}`);
  }
  mediaIds.add(item.id);

  const imageHost = new URL(item.image).hostname;
  const sourceHost = new URL(item.sourceUrl).hostname;
  if (!isApprovedImageHost(imageHost)) {
    throw new Error(`Gallery image must be a federation/VK photo, got: ${imageHost}`);
  }
  if (sourceHost !== "shin-nnov.orgs.biz") {
    throw new Error(`Gallery photo must come from federation source, got: ${sourceHost}`);
  }
}

let personPhotoCount = 0;
for (const [name, item] of Object.entries(registry.trainerPhotos ?? {})) {
  if (!expectedPeople.includes(name)) {
    throw new Error(`Unknown trainer photo key: ${name}`);
  }
  if (item.kind !== "person" || item.person !== name) {
    throw new Error(`Trainer registry may only contain source-bound person photos: ${name}`);
  }
  if (!item.image || !isApprovedImageHost(new URL(item.image).hostname)) {
    throw new Error(`Trainer portrait must use an approved federation/VK image: ${name}`);
  }
  if (!item.sourceUrl || !allowedSourceHosts.has(new URL(item.sourceUrl).hostname)) {
    throw new Error(`Trainer portrait must have a trusted source: ${name}`);
  }
  personPhotoCount += 1;
}

if (personPhotoCount < 1) {
  throw new Error("At least one source-bound trainer portrait is expected");
}

if (!trainerPhotoScript.includes("is-placeholder") || trainerPhotoScript.includes("Фото секции")) {
  throw new Error("Unknown trainer portraits must render as neutral initials, never club-image impersonations");
}

if (registry.photoCollections.length !== 4) {
  throw new Error(`Expected exactly 4 federation photo reports, got ${registry.photoCollections.length}`);
}

for (const item of registry.photoCollections) {
  const sourceHost = new URL(item.url).hostname;
  if (!allowedSourceHosts.has(sourceHost)) {
    throw new Error(`Unapproved photo collection host: ${sourceHost}`);
  }
  if (sourceHost === "masterskayakarate.ru") {
    throw new Error("Masterskaya material belongs in the shared feed, not the report archive");
  }
}

console.log(
  `verify: screenshot cleanup PASS — 18 venues, 11 instructors, 8 real gallery photos, ` +
  `1 shared Masterskaya story, ${personPhotoCount} source-bound trainer portrait(s), 4 photo reports`
);
