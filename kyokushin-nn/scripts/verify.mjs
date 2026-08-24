import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [html, script, media, photoScript, trainerPhotoScript] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
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
  "photo.css",
  "clean.css",
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

if (html.includes(">極<") || html.includes("Shinkyokushin.png")) {
  throw new Error("Deprecated placeholder/wrong Shinkyokushin logo must not be used");
}

for (const slop of [
  "Проверяем источник",
  "Если источник не подтверждает",
  "без случайных картинок",
  "Мастерская карате"
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

const publicSource = `${html}\n${script}\n${media}\n${photoScript}\n${trainerPhotoScript}`;
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

if (media.includes("tild3633-3062-4863-a562-386138386236")) {
  throw new Error("Removed synthetic-looking hero child asset must not return");
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

if (registry.verifiedMedia.length < 5 || registry.verifiedMedia.length > 10) {
  throw new Error(`Expected 5-10 clean shared gallery photos, got ${registry.verifiedMedia.length}`);
}

const trainerPhotoNames = Object.keys(registry.trainerPhotos ?? {});
if (JSON.stringify(trainerPhotoNames) !== JSON.stringify(expectedPeople)) {
  throw new Error(`Every instructor must have a visual photo slot: ${trainerPhotoNames.join(", ")}`);
}

if (registry.photoCollections.length !== 4) {
  throw new Error(`Expected exactly 4 federation photo reports, got ${registry.photoCollections.length}`);
}

const allowedImageHosts = new Set([
  "static.tildacdn.com",
  "sun9-54.userapi.com"
]);
const allowedSourceHosts = new Set([
  "masterskayakarate.ru",
  "shin-nnov.orgs.biz",
  "disk.yandex.ru",
  "vk.com"
]);
const mediaIds = new Set();

for (const item of registry.verifiedMedia) {
  if (mediaIds.has(item.id)) {
    throw new Error(`Duplicate media id: ${item.id}`);
  }
  mediaIds.add(item.id);

  const imageHost = new URL(item.image).hostname;
  const sourceHost = new URL(item.sourceUrl).hostname;
  if (!allowedImageHosts.has(imageHost)) {
    throw new Error(`Unapproved image host: ${imageHost}`);
  }
  if (!allowedSourceHosts.has(sourceHost)) {
    throw new Error(`Unapproved source host: ${sourceHost}`);
  }
}

let personPhotoCount = 0;
for (const [name, item] of Object.entries(registry.trainerPhotos)) {
  if (!expectedPeople.includes(name)) {
    throw new Error(`Unknown trainer photo key: ${name}`);
  }
  if (!item.image || !allowedImageHosts.has(new URL(item.image).hostname)) {
    throw new Error(`Trainer visual must use an approved image host: ${name}`);
  }
  if (!item.sourceUrl || !allowedSourceHosts.has(new URL(item.sourceUrl).hostname)) {
    throw new Error(`Trainer visual must have a trusted source: ${name}`);
  }
  if (!["person", "club"].includes(item.kind)) {
    throw new Error(`Trainer visual kind must be person or club: ${name}`);
  }
  if (item.kind === "person") {
    personPhotoCount += 1;
    if (item.person !== name) {
      throw new Error(`Person photo identity must exactly match trainer key: ${name}`);
    }
  } else if (item.person) {
    throw new Error(`Club photo must never claim a person identity: ${name}`);
  }
}

if (personPhotoCount < 1) {
  throw new Error("At least one source-bound trainer portrait is expected");
}

if (!trainerPhotoScript.includes("Фото секции")) {
  throw new Error("Club imagery must be visibly labelled as section imagery");
}

for (const item of registry.photoCollections) {
  const sourceHost = new URL(item.url).hostname;
  if (!allowedSourceHosts.has(sourceHost)) {
    throw new Error(`Unapproved photo collection host: ${sourceHost}`);
  }
  if (sourceHost === "masterskayakarate.ru") {
    throw new Error("Club gallery photos must stay in the shared gallery, not in photo reports");
  }
}

console.log(
  `verify: 18 venues, 11 instructors, ${registry.verifiedMedia.length} clean gallery photos, ` +
  `${trainerPhotoNames.length} trainer visuals (${personPhotoCount} source-bound person photos), ` +
  `4 photo reports, identity-integrity guard PASS`
);
