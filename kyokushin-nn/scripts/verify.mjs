import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [
  html,
  styles,
  cards,
  mediaStyles,
  artStyles,
  experienceStyles,
  script,
  media,
  photoScript,
  trainerPhotoScript,
  teamScript,
  finderScript,
  experienceScript,
  motionScript,
  buildScript,
  packageJson,
  vercelJson
] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../cards.css", import.meta.url), "utf8"),
  readFile(new URL("../media-viewer.css", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
  readFile(new URL("../media.js", import.meta.url), "utf8"),
  readFile(new URL("../photo.js", import.meta.url), "utf8"),
  readFile(new URL("../trainer-photos.js", import.meta.url), "utf8"),
  readFile(new URL("../team.js", import.meta.url), "utf8"),
  readFile(new URL("../finder.js", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.js", import.meta.url), "utf8"),
  readFile(new URL("../motion-v3.js", import.meta.url), "utf8"),
  readFile(new URL("build-static.mjs", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../vercel.json", import.meta.url), "utf8")
]);

const requiredHtml = [
  'id="groups"', 'id="searchInput"', 'id="cityFilters"', 'id="dayFilters"',
  'id="photoMosaic"', 'id="photoCollections"', 'id="photoLightbox"', 'id="team"',
  'id="trainerRoster"', 'brand-logo', 'wkosydney.com.au/assets/images/logo.jpg',
  'styles.css', 'cards.css', 'media-viewer.css', 'experience-v3.css', 'art-direction-v3.css',
  'media.js', 'script.js', 'trainer-photos.js', 'team.js', 'finder.js', 'experience-v3.js', 'motion-v3.js', 'photo.js',
  'data-art-direction="dojo-editorial-v3"', 'x-kyokushin-art-direction',
  'site-nav', 'hero-visual', 'hero-proof', 'href="#team"', 'rel="canonical"', 'og:title',
  'og:image', 'twitter:card', 'lightbox-prev', 'lightbox-next', 'lightbox-source'
];
for (const marker of requiredHtml) {
  if (!html.includes(marker)) throw new Error(`Missing current HTML marker: ${marker}`);
}

for (const activeLegacy of [
  '<link rel="stylesheet" href="art-direction-v2.css">',
  '<link rel="stylesheet" href="experience.css">',
  '<script src="experience.js"'
]) {
  if (html.includes(activeLegacy)) throw new Error(`Rejected V2 visual dependency must not be active: ${activeLegacy}`);
}

for (const legacyCss of ["photo.css", "clean.css"]) {
  if (html.includes(legacyCss)) throw new Error(`Legacy conflicting stylesheet must not be linked: ${legacyCss}`);
}

for (const cssMarker of [".site-nav {", ".hero-visual {", ".hero-proof {", "@media (max-width: 620px)"]) {
  if (!styles.includes(cssMarker)) throw new Error(`Missing base layout rule: ${cssMarker}`);
}
for (const cssMarker of [".photo-story-link", ".instructor-card", ".instructor-panel", ".instructor-photo-frame", ".venue-list:has", "@media (max-width: 620px)"]) {
  if (!cards.includes(cssMarker)) throw new Error(`Missing component layout rule: ${cssMarker}`);
}
for (const cssMarker of [
  ".archive-cover-card", ".archive-card-cover", ".archive-card-provider", ".archive-card-cta",
  ".lightbox {", ".lightbox-image", ".lightbox-nav", "body.is-lightbox-open"
]) {
  if (!mediaStyles.includes(cssMarker)) throw new Error(`Missing media UX rule: ${cssMarker}`);
}
for (const cssMarker of [
  "--v3-red", "--v3-display", ".team-section {", ".trainer-roster {", ".roster-card {", ".roster-media {",
  '.roster-card[data-portrait="verified"]', ".hero::before {", ".photo-mosaic {", ".filters {", ".steps {", ".final-cta {",
  "[data-v3-reveal", "prefers-reduced-motion", "@media (max-width: 1120px)", "@media (max-width: 820px)", "@media (max-width: 620px)"
]) {
  if (!artStyles.includes(cssMarker)) throw new Error(`Missing current V3 art-direction rule: ${cssMarker}`);
}
for (const cssMarker of [
  "--page-progress", ".topbar::after", 'body[data-art-direction="dojo-editorial-v3"] .site-nav a',
  'body[data-art-direction="dojo-editorial-v3"] .hero-actions .button-ghost',
  'body[data-art-direction="dojo-editorial-v3"] .signal-strip',
  'body[data-art-direction="dojo-editorial-v3"] .photo-story',
  ".roster-card:focus-within", "scroll-margin-top"
]) {
  if (!experienceStyles.includes(cssMarker)) throw new Error(`Missing current V3 experience rule: ${cssMarker}`);
}
if (experienceStyles.includes("[data-reveal]") || experienceStyles.includes("@keyframes hero-enter")) {
  throw new Error("Rejected generic V2 reveal grammar must not exist in the current experience layer");
}

if (styles.includes("margin: -28px") || styles.includes("margin: -22px") || cards.includes("margin: -28px")) {
  throw new Error("Trainer layout must not rely on negative-margin photo hacks");
}
if (html.includes(">極<") || html.includes("Shinkyokushin.png")) {
  throw new Error("Deprecated placeholder/wrong Shinkyokushin logo must not be used");
}
for (const slop of ["Проверяем источник", "Если источник не подтверждает", "без случайных картинок", "не рекламные макеты"]) {
  if (html.includes(slop)) throw new Error(`Public copy must stay clean: ${slop}`);
}
for (const marker of ["showModal()", "moveLightbox", "archive-card-cover", "Открыть альбом", "card.remove()"] ) {
  if (!photoScript.includes(marker)) throw new Error(`Missing premium media behavior: ${marker}`);
}
if (photoScript.includes("is-image-error") || photoScript.includes("Фото недоступно")) {
  throw new Error("Visible broken-image placeholders are forbidden in the gallery renderer");
}

const cityNnCount = (script.match(/city: "Нижний Новгород"/g) || []).length;
const cityDzerzhinskCount = (script.match(/city: "Дзержинск"/g) || []).length;
const phoneCount = (script.match(/phone: "\+7/g) || []).length;
if (cityNnCount !== 16 || cityDzerzhinskCount !== 2) throw new Error(`Expected 18 venues (16 + 2), got ${cityNnCount + cityDzerzhinskCount}`);
if (phoneCount !== 11) throw new Error(`Expected 11 instructors, got ${phoneCount}`);

const expectedPeople = [
  "Сергей Жуков", "Андрей Троцко", "Владимир Жуков", "Дарья Осинина", "Юлия Фролова",
  "Иван Гаврилин", "Сергей Глухов", "Сергей Захаров", "Андрей Коннов", "Георгий Пигиданов", "Кирилл Антоневич"
];
const instructorNames = [...script.matchAll(/\n\s{4}name: "([^"]+)",\n\s{4}phone:/g)].map((match) => match[1]);
if (JSON.stringify(instructorNames) !== JSON.stringify(expectedPeople)) {
  throw new Error(`Instructor allowlist changed: ${instructorNames.join(", ")}`);
}

for (const name of expectedPeople) {
  if (!teamScript.includes(`"${name}"`)) throw new Error(`Trainer roster metadata missing: ${name}`);
}
for (const marker of [
  "rosterPhotoRegistry", "trainerProfileMeta", "hasPortrait", "dataset.portrait", "roster-card",
  "trainerRoster", "data.trainerFilter", "Показать секции"
]) {
  if (!teamScript.includes(marker)) throw new Error(`Missing trainer-roster behavior: ${marker}`);
}
if (!teamScript.includes('photo?.kind === "person"') || !teamScript.includes("photo.person === instructor.name")) {
  throw new Error("Roster may render photos only when person identity exactly matches instructor name");
}
if (!teamScript.includes("roster-initials")) {
  throw new Error("Trainer roster must retain an identity-safe initials fallback");
}
if (teamScript.includes("FULL CONTACT · 2 дан") || /"Владимир Жуков"[\s\S]{0,140}мастер спорта России/.test(teamScript)) {
  throw new Error("Unverified Vladimir Zhukov rank/title must not be published");
}
if (!/"Андрей Троцко"[\s\S]{0,140}президент федерации/.test(teamScript)) {
  throw new Error("Verified federation president role must remain attached to Andrey Trotsko");
}
if (!/"Георгий Пигиданов"[\s\S]{0,160}мастер спорта России/.test(teamScript)) {
  throw new Error("Verified Master of Sport title must remain attached to Georgiy Pigidанов");
}

for (const marker of [
  "data-trainer-filter", 'searchParams.set("trainer"', "scrollIntoView", "KYOKUSHIN_FINDER_READY",
  "instructors.some"
]) {
  if (!finderScript.includes(marker)) throw new Error(`Missing smart trainer finder behavior: ${marker}`);
}
for (const marker of [
  "IntersectionObserver", "aria-current", "--page-progress", "requestAnimationFrame",
  "KYOKUSHIN_EXPERIENCE_V3_READY"
]) {
  if (!experienceScript.includes(marker)) throw new Error(`Missing current V3 experience behavior: ${marker}`);
}
for (const marker of [
  "requestAnimationFrame", "IntersectionObserver", "pointermove", "prefers-reduced-motion",
  "--v3-scroll", "--v3-pointer-x", "dataset.v3Reveal", "is-v3-visible", "KYOKUSHIN_ART_DIRECTION_V3_READY"
]) {
  if (!motionScript.includes(marker)) throw new Error(`Missing current V3 motion behavior: ${marker}`);
}
if (experienceScript.includes("data.reveal") || experienceScript.includes("KYOKUSHIN_EXPERIENCE_READY")) {
  throw new Error("Rejected V2 experience runtime markers must not return");
}

const packageConfig = JSON.parse(packageJson);
const vercelConfig = JSON.parse(vercelJson);
if (packageConfig.scripts?.build !== "node scripts/build-static.mjs") {
  throw new Error("Production build script must generate the self-contained bundle");
}
if (vercelConfig.buildCommand !== "npm run build" || vercelConfig.outputDirectory !== "dist") {
  throw new Error("Vercel must serve the generated self-contained dist directory");
}
for (const marker of [
  '"styles.css"', '"experience-v3.css"', '"art-direction-v3.css"', '"finder.js"', '"experience-v3.js"', '"motion-v3.js"',
  "data-bundle", "dist/index.html", "data-static-directory", "staticDirectory", "Rejected V2 visual dependency"
]) {
  if (!buildScript.includes(marker)) throw new Error(`Current self-contained build guard missing: ${marker}`);
}

const publicSource = [
  html, styles, cards, mediaStyles, artStyles, experienceStyles, script, media,
  photoScript, trainerPhotoScript, teamScript, finderScript, experienceScript, motionScript
].join("\n");
for (const forbidden of ["Горохов", "ИФК", "IFK"]) {
  if (publicSource.includes(forbidden)) throw new Error(`Forbidden unrelated identity/federation marker found: ${forbidden}`);
}
for (const source of [script, media, photoScript, trainerPhotoScript, teamScript, finderScript, experienceScript, motionScript]) {
  if (source.includes("innerHTML")) throw new Error("Unsafe innerHTML usage is not allowed");
}
for (const removedPromoAsset of [
  "tild3731-3236-4264-a165-653239663730", "tild6633-6639-4866-b935-663238346266",
  "tild3939-3362-4535-b162-343938356166", "tild6638-3461-4431-b063-336138376236",
  "tild6361-3663-4064-a531-313031616532", "tild3633-3062-4863-a562-386138386236"
]) {
  if (media.includes(removedPromoAsset)) throw new Error(`Promo/synthetic-looking asset must not return: ${removedPromoAsset}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(media, context);
const registry = context.window.KYOKUSHIN_MEDIA;
if (!registry) throw new Error("Media registry was not initialized");
if (JSON.stringify([...registry.allowedPeople]) !== JSON.stringify(expectedPeople)) {
  throw new Error("Media allowlist must exactly match the 11 recruitment instructors");
}
if (registry.verifiedMedia.length !== 9) throw new Error(`Expected 8 real photos + 1 shared story card, got ${registry.verifiedMedia.length}`);
const realPhotos = registry.verifiedMedia.filter((item) => item.kind !== "story");
const sharedStories = registry.verifiedMedia.filter((item) => item.kind === "story");
if (realPhotos.length !== 8 || sharedStories.length !== 1) throw new Error(`Expected 8 real photos and 1 story card, got ${realPhotos.length} + ${sharedStories.length}`);
if (new URL(sharedStories[0].sourceUrl).hostname !== "masterskayakarate.ru") throw new Error("Masterskaya material must stay inside the common feed");

const isVkImageHost = (hostname) => hostname.endsWith(".userapi.com");
const isTrainerImageHost = (hostname) => isVkImageHost(hostname) || hostname === "cdn1.tenchat.ru";
const allowedSourceHosts = new Set(["masterskayakarate.ru", "shin-nnov.orgs.biz", "disk.yandex.ru", "vk.com", "tenchat.ru"]);
const mediaIds = new Set();
for (const item of realPhotos) {
  if (mediaIds.has(item.id)) throw new Error(`Duplicate media id: ${item.id}`);
  mediaIds.add(item.id);
  const imageHost = new URL(item.image).hostname;
  const sourceHost = new URL(item.sourceUrl).hostname;
  if (!isVkImageHost(imageHost)) throw new Error(`Gallery image must be a federation/VK photo, got: ${imageHost}`);
  if (sourceHost !== "shin-nnov.orgs.biz") throw new Error(`Gallery photo must come from federation source, got: ${sourceHost}`);
}

let personPhotoCount = 0;
for (const [name, item] of Object.entries(registry.trainerPhotos ?? {})) {
  if (!expectedPeople.includes(name)) throw new Error(`Unknown trainer photo key: ${name}`);
  if (item.kind !== "person" || item.person !== name) throw new Error(`Trainer registry may only contain source-bound person photos: ${name}`);
  if (!item.image || !isTrainerImageHost(new URL(item.image).hostname)) throw new Error(`Trainer portrait must use an approved source-bound image host: ${name}`);
  if (!item.sourceUrl || !allowedSourceHosts.has(new URL(item.sourceUrl).hostname)) throw new Error(`Trainer portrait must have a trusted source: ${name}`);
  personPhotoCount += 1;
}
if (personPhotoCount < 2) throw new Error("Expected at least two source-bound trainer portraits");
if (!registry.trainerPhotos["Кирилл Антоневич"] || new URL(registry.trainerPhotos["Кирилл Антоневич"].sourceUrl).hostname !== "tenchat.ru") {
  throw new Error("Kirill Antonovich portrait must stay bound to his verified trainer profile");
}
if (!trainerPhotoScript.includes("is-placeholder") || trainerPhotoScript.includes("Фото секции")) {
  throw new Error("Unknown trainer portraits must render as neutral initials, never club-image impersonations");
}

if (registry.photoCollections.length !== 4) throw new Error(`Expected exactly 4 federation photo reports, got ${registry.photoCollections.length}`);
for (const item of registry.photoCollections) {
  const sourceHost = new URL(item.url).hostname;
  const coverHost = new URL(item.cover).hostname;
  if (!allowedSourceHosts.has(sourceHost)) throw new Error(`Unapproved photo collection host: ${sourceHost}`);
  if (sourceHost === "masterskayakarate.ru") throw new Error("Masterskaya material belongs in the shared feed, not the report archive");
  if (!item.provider || !item.cover || !item.coverAlt) throw new Error(`Album must have provider, cover and accessible alt: ${item.title}`);
  if (!isVkImageHost(coverHost)) throw new Error(`Album cover must use federation/VK imagery: ${item.title}`);
}

console.log(
  `verify: pure V3 + resilient recruitment directory + trusted media PASS — ` +
  `18 venues, 11 instructors, 8 real gallery photos, 1 shared Masterskaya story, ` +
  `${personPhotoCount} source-bound trainer portrait(s), 4 visual album covers, lightbox enabled`
);
