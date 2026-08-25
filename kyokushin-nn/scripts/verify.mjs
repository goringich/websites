import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [
  html, script, media, team, photo, finder, experience, trainerPhotos,
  contentRaw, mediaDirectionRaw, adminHtml, adminJs, adminCss, buildScript, packageRaw, vercelRaw
] = await Promise.all([
  read("../index.html"), read("../script.js"), read("../media.js"), read("../team.js"),
  read("../photo.js"), read("../finder.js"), read("../experience-v3.js"), read("../trainer-photos.js"),
  read("../content/site.json"), read("../docs/media-direction.json"), read("../admin/index.html"), read("../admin/admin.js"), read("../admin/admin.css"),
  read("build-static.mjs"), read("../package.json"), read("../vercel.json")
]);

const content = JSON.parse(contentRaw);
const mediaDirection = JSON.parse(mediaDirectionRaw);
const packageJson = JSON.parse(packageRaw);
const vercelJson = JSON.parse(vercelRaw);
const expectedPeople = [
  "Сергей Жуков","Андрей Троцко","Владимир Жуков","Дарья Осинина","Юлия Фролова",
  "Иван Гаврилин","Сергей Глухов","Сергей Захаров","Андрей Коннов","Георгий Пигиданов","Кирилл Антоневич"
];
const expectedPhones = [
  "+7 987 557-31-49","+7 920 036-48-99","+7 986 752-63-84","+7 920 065-43-42","+7 920 044-08-18",
  "+7 920 017-85-50","+7 920 250-70-77","+7 910 146-84-28","+7 930 813-78-20","+7 910 141-46-95","+7 904 781-78-88"
];
const kirillOnlyUrl = "https://masterskayakarate.ru/tpost/czhy6ukv31-zhara-2026-kak-eto-bilo";
const count = (text, needle) => text.split(needle).length - 1;

for (const marker of [
  'id="groups"','id="photoMosaic"','id="photoCollections"','id="team"','id="trainerRoster"',
  'data-art-direction="dojo-editorial-v3"','x-kyokushin-art-direction','hero-visual','site-nav',
  'media.js','script.js','team.js','finder.js','photo.js','experience-v3.js'
]) {
  if (!html.includes(marker)) throw new Error(`Missing HTML marker: ${marker}`);
}

if (!Array.isArray(content.instructors) || content.instructors.length !== 11) throw new Error("CMS must contain exactly 11 instructors");
if (JSON.stringify(content.instructors.map((item) => item.name)) !== JSON.stringify(expectedPeople)) throw new Error("CMS instructor allowlist/order changed");
if (JSON.stringify(content.instructors.map((item) => item.phone)) !== JSON.stringify(expectedPhones)) throw new Error("CMS instructor phones changed");
const venueCount = content.instructors.reduce((sum, item) => sum + (item.venues?.length ?? 0), 0);
const nnCount = content.instructors.flatMap((item) => item.venues ?? []).filter((venue) => venue.city === "Нижний Новгород").length;
const dzCount = content.instructors.flatMap((item) => item.venues ?? []).filter((venue) => venue.city === "Дзержинск").length;
if (venueCount !== 18 || nnCount !== 16 || dzCount !== 2) throw new Error(`Expected 18 venues (16+2), got ${venueCount} (${nnCount}+${dzCount})`);

const serialized = JSON.stringify(content);
if (!String(content.camp?.river || "").includes("Керженец")) throw new Error("CMS camp contract must target Керженец");
if (content.camp?.name !== "Красный Плёс") throw new Error("CMS camp must be Красный Плёс");
if (!String(content.hero?.media?.src || "").startsWith("https://kples.ru/")) throw new Error("Hero media must come from official Красный Плёс");
if (content.hero?.media?.poster && !String(content.hero.media.poster).startsWith("https://kples.ru/")) {
  throw new Error("Hero poster, when present, must come from the same official camp source family as the documentary media");
}
if (!Array.isArray(content.gallery) || content.gallery.length < 5) throw new Error("CMS gallery must contain Kerzhenets camp media");
if (!Array.isArray(content.photoReports) || content.photoReports.length !== 4) throw new Error("CMS must contain exactly four camp report links");

if (serialized.includes("vega52.ru")) throw new Error("Unrelated Kerzhenets river poster must not return as training/event evidence");
for (const genericCopy of [
  "Тренировки, где техника становится характером",
  "Спортивные сборы, природа и тренировочный ритм",
  "Движение каждый день"
]) {
  if (serialized.includes(genericCopy)) throw new Error(`Ungrounded promotional filler must not return: ${genericCopy}`);
}

if (mediaDirection.status !== "active") throw new Error("Real-media direction contract must be active");
if (!String(mediaDirection.principle || "").includes("documentary product content")) throw new Error("Media-direction principle is missing documentary truth ownership");
if (!mediaDirection.forbidden?.some((item) => item.includes("AI-generated trainer"))) throw new Error("Media-direction contract must explicitly forbid synthetic trainer documentary media");
if (!mediaDirection.current_audit?.reject?.some((item) => item.asset_host === "vega52.ru")) throw new Error("Media-direction audit must preserve the rejected unrelated poster regression");
if (!mediaDirection.done_when?.some((item) => item.includes("source-bound"))) throw new Error("Media-direction Done contract must require source-bound named portraits");

for (const instructor of content.instructors) {
  if (!instructor.photo) continue;
  if (!instructor.photo.src || !instructor.photo.sourceUrl) throw new Error(`Trainer photo provenance incomplete for ${instructor.name}`);
  if (!expectedPeople.includes(instructor.name)) throw new Error(`Trainer photo is outside allowlist: ${instructor.name}`);
}

if (/[Жж]ара/.test(serialized)) throw new Error("Visible Cyrillic 'Жара' is forbidden everywhere");
if (count(serialized, kirillOnlyUrl) !== 1) throw new Error("Kirill project URL must occur exactly once in CMS content");
if (count(serialized, "masterskayakarate.ru") !== 1) throw new Error("masterskayakarate.ru must occur exactly once in CMS content");
const kirill = content.instructors.find((item) => item.name === "Кирилл Антоневич");
if (kirill?.links?.length !== 1 || kirill.links[0]?.url !== kirillOnlyUrl) throw new Error("The only Masterskaya link must be inside Kirill's trainer record");
if (/жар/i.test(kirill.links[0]?.label || "")) throw new Error("Kirill link label must not mention Жара");
for (const instructor of content.instructors) {
  if (instructor.name !== "Кирилл Антоневич" && instructor.links?.length) throw new Error(`Unexpected external link for ${instructor.name}`);
}

const campHosts = new Set(["kples.ru","www.kples.ru","vk.ru","vk.com"]);
const assertCampUrl = (url, label) => {
  if (!url) return;
  const host = new URL(url).hostname;
  if (!campHosts.has(host)) throw new Error(`${label} must be official Kerzhenets/camp media, got ${host}`);
};
assertCampUrl(content.hero.media.src, "hero src");
assertCampUrl(content.hero.media.poster, "hero poster");
assertCampUrl(content.hero.media.sourceUrl, "hero source");
for (const item of content.gallery) {
  assertCampUrl(item.src, `gallery ${item.id} src`);
  assertCampUrl(item.poster, `gallery ${item.id} poster`);
  assertCampUrl(item.sourceUrl, `gallery ${item.id} source`);
}
for (const item of content.photoReports) assertCampUrl(item.url, `report ${item.title}`);

const publicSource = [html, script, media, team, photo, finder, experience, trainerPhotos, contentRaw].join("\n");
for (const forbidden of ["Горохов","ИФК","IFK"]) {
  if (publicSource.includes(forbidden)) throw new Error(`Forbidden public marker: ${forbidden}`);
}
for (const source of [script, media, team, photo, finder, experience, trainerPhotos, adminJs]) {
  if (source.includes("innerHTML")) throw new Error("Unsafe innerHTML usage is forbidden");
}
for (const removed of ["masterskaya-2026","tild3731-3236-4264-a165-653239663730"]) {
  if (publicSource.includes(removed)) throw new Error(`Removed unrelated media must not return: ${removed}`);
}

for (const marker of ["window.KYOKUSHIN_CONTENT","KYOKUSHIN_APP","applyContent","content.instructors"]) {
  if (!script.includes(marker) && !experience.includes(marker)) throw new Error(`CMS runtime marker missing: ${marker}`);
}
for (const marker of ["KYOKUSHIN_TEAM","roster-external","instructor.links","roster-initials"]) {
  if (!team.includes(marker)) throw new Error(`CMS trainer marker missing: ${marker}`);
}
for (const marker of ["photo-video-card","KYOKUSHIN_PHOTO","photoContent?.gallery","Керженец"]) {
  if (!photo.includes(marker) && !experience.includes(marker)) throw new Error(`Kerzhenets gallery marker missing: ${marker}`);
}
for (const marker of ["CMS_RAW_URL","raw.githubusercontent.com/goringich/websites/project/kyokushin-nn","cms-hero-video","fetchCmsContent"]) {
  if (!experience.includes(marker)) throw new Error(`CMS hot-sync marker missing: ${marker}`);
}

for (const marker of ["Kyokushin CMS",'type="password"','id="publishButton"','id="galleryEditor"','id="trainersEditor"']) {
  if (!adminHtml.includes(marker)) throw new Error(`CMS UI marker missing: ${marker}`);
}
for (const marker of ['const REPO = "goringich/websites"','const BRANCH = "project/kyokushin-nn"','const CONTENT_PATH = "kyokushin-nn/content/site.json"']) {
  if (!adminJs.includes(marker)) throw new Error(`CMS fixed source marker missing: ${marker}`);
}
for (const forbiddenStorage of ["localStorage","sessionStorage","indexedDB"]) {
  if (adminJs.includes(forbiddenStorage)) throw new Error(`CMS must not persist GitHub token via ${forbiddenStorage}`);
}
if (!adminJs.includes("Authorization: `Bearer ${token}`") || !adminJs.includes('method: "PUT"')) throw new Error("CMS must publish through GitHub Contents API");
if (!adminCss.includes(".admin-shell") || !adminCss.includes(".trainer-card")) throw new Error("CMS UI stylesheet is incomplete");

if (!buildScript.includes("readFile(contentUrl") || !buildScript.includes('id="kyokushin-content-seed"') || !buildScript.includes("cp(adminDir")) {
  throw new Error("Static build must consume CMS content, embed seed, and ship /admin/");
}
if (!buildScript.includes("Disallow: /admin/") || !buildScript.includes("cms: {")) throw new Error("Build must expose CMS health and noindex crawl policy");
if (packageJson.scripts?.build !== "node scripts/build-static.mjs") throw new Error("Build script changed unexpectedly");
if (vercelJson.outputDirectory !== "dist") throw new Error("Vercel must serve dist");

console.log(`verify: PASS — source-grounded Kerzhenets CMS, ${content.instructors.length} trainers, ${venueCount} venues, ${content.gallery.length} camp media items, exact-one Kirill link`);
