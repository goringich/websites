import { readFile } from "node:fs/promises";

const [html, experienceStyles, artStyles, motionSource] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../motion-v3.js", import.meta.url), "utf8")
]);
const deniedLogoOrigin = "wkosydney.com.au";
const fallbackMarker = "font: 700 24px/1 Georgia, serif";

if (html.includes('<img class="brand-logo"')) {
  throw new Error("Brand mark must not regress to a failure-visible external <img> hotlink");
}

for (const marker of [
  '<span class="brand-logo" aria-hidden="true">極</span>',
  "border: 2px solid #b93026",
  "background: #fff"
]) {
  if (!html.includes(marker)) {
    throw new Error(`Brand resilience critical-source contract is missing: ${marker}`);
  }
}

for (const marker of [
  'body[data-art-direction="dojo-editorial-v3"] .brand-logo',
  "display: grid",
  "place-items: center",
  fallbackMarker
]) {
  if (!experienceStyles.includes(marker)) {
    throw new Error(`Brand resilience final-cascade contract is missing: ${marker}`);
  }
}

const basePosition = html.indexOf('href="styles.css"');
const experiencePosition = html.indexOf('href="experience-v3.css"');
const artPosition = html.indexOf('href="art-direction-v3.css"');
if (basePosition === -1 || experiencePosition === -1 || artPosition === -1 || !(basePosition < experiencePosition && experiencePosition < artPosition)) {
  throw new Error("Brand fallback relies on the verified base -> experience-v3 -> art-direction-v3 cascade order");
}

const artBrandBlock = artStyles.match(/\.brand-logo\s*\{([\s\S]*?)\}/)?.[1] ?? "";
if (/background(?:-image)?\s*:/.test(artBrandBlock)) {
  throw new Error("Late art-direction .brand-logo rule must not erase the resilient experience-layer background");
}

if ([html, experienceStyles, artStyles].some(source => source.includes(deniedLogoOrigin))) {
  throw new Error("Remote unowned logo host must not be in first-screen brand source");
}

for (const marker of [
  'body[data-art-direction="dojo-editorial-v3"] .hero-visual img',
  "opacity: 0",
  ".hero-visual img.is-hero-media-ready",
  "opacity: 1"
]) {
  if (!experienceStyles.includes(marker)) {
    throw new Error(`Hero-media resilience CSS contract is missing: ${marker}`);
  }
}

for (const marker of [
  'document.querySelector(".hero-visual img")',
  "v3HeroMedia.complete",
  "v3HeroMedia.naturalWidth > 0",
  'addEventListener("load", markV3HeroMediaReady',
  'addEventListener("error", markV3HeroMediaUnavailable',
  'classList.add("is-hero-media-ready")',
  "v3HeroMedia.hidden = true"
]) {
  if (!motionSource.includes(marker)) {
    throw new Error(`Hero-media resilience runtime contract is missing: ${marker}`);
  }
}

if (!html.includes('<div class="hero-visual">') || !html.includes('alt="Тренировка Нижегородской федерации СинКёкусинкай"')) {
  throw new Error("Hero-media resilience must preserve the real federation photo and its truthful accessible description");
}

console.log("verify-brand-resilience: PASS — logo and hero-photo external dependencies fail into intentional first-screen states without broken-image UI");
