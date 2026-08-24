import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [html, script, media, photoScript] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../media.js", import.meta.url), "utf8"),
  readFile(new URL("../photo.js", import.meta.url), "utf8")
]);

const requiredHtml = [
  "id=\"groups\"",
  "id=\"searchInput\"",
  "id=\"cityFilters\"",
  "id=\"dayFilters\"",
  "id=\"photoMosaic\"",
  "id=\"photoCollections\"",
  "brand-logo",
  "Shinkyokushin.png",
  "photo.css",
  "media.js",
  "script.js",
  "photo.js"
];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) {
    throw new Error(`Missing HTML marker: ${marker}`);
  }
}

if (html.includes(">極<")) {
  throw new Error("Placeholder kanji logo must not be used");
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

const publicSource = `${html}\n${script}\n${media}\n${photoScript}`;
for (const forbidden of ["Горохов", "ИФК", "IFK"]) {
  if (publicSource.includes(forbidden)) {
    throw new Error(`Forbidden unrelated identity/federation marker found: ${forbidden}`);
  }
}

if (script.includes("innerHTML") || media.includes("innerHTML") || photoScript.includes("innerHTML")) {
  throw new Error("Unsafe innerHTML usage is not allowed");
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

if (registry.verifiedMedia.length < 8) {
  throw new Error(`Expected at least 8 verified shared media items, got ${registry.verifiedMedia.length}`);
}

if (registry.photoCollections.length < 4) {
  throw new Error(`Expected at least 4 trusted federation photo collections, got ${registry.photoCollections.length}`);
}

const allowedImageHosts = new Set(["static.tildacdn.com"]);
const allowedSourceHosts = new Set([
  "masterskayakarate.ru",
  "disk.yandex.ru",
  "vk.com"
]);
const peopleSet = new Set(expectedPeople);
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

  for (const person of item.people ?? []) {
    if (!peopleSet.has(person)) {
      throw new Error(`Photo references a person outside the recruitment allowlist: ${person}`);
    }
  }

  if (item.kind === "person" && !(item.people?.length > 0)) {
    throw new Error(`Person photo must name the verified allowlisted person: ${item.id}`);
  }
}

for (const item of registry.photoCollections) {
  const sourceHost = new URL(item.url).hostname;
  if (!allowedSourceHosts.has(sourceHost)) {
    throw new Error(`Unapproved photo collection host: ${sourceHost}`);
  }
  if (sourceHost === "masterskayakarate.ru") {
    throw new Error("Masterskaya Karate must stay in the shared gallery, not in photo reports");
  }
}

console.log(
  `verify: 18 venues, 11 instructors, ${registry.verifiedMedia.length} shared media, ` +
  `${registry.photoCollections.length} federation collections, real logo guard PASS, identity guard PASS`
);
