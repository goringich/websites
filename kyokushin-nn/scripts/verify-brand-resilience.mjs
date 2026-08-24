import { readFile } from "node:fs/promises";

const [html, experienceStyles, artStyles] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8")
]);
const logoUrl = "https://wkosydney.com.au/assets/images/logo.jpg";
const fallbackMarker = "radial-gradient(circle at center, #ef2d1d 0 32%, #fff 33% 100%)";

if (html.includes('<img class="brand-logo"')) {
  throw new Error("Brand mark must not regress to a failure-visible external <img> hotlink");
}

for (const marker of [
  '<span class="brand-logo" role="img" aria-label="Shinkyokushinkai"></span>',
  `background-image: url("${logoUrl}"), radial-gradient(`,
  "background-color: #fff",
  "background-size: contain, cover"
]) {
  if (!html.includes(marker)) {
    throw new Error(`Brand resilience critical-source contract is missing: ${marker}`);
  }
}

for (const marker of [
  'body[data-art-direction="dojo-editorial-v3"] .brand-logo',
  `url("${logoUrl}")`,
  fallbackMarker,
  "background-size: contain, cover"
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

const htmlLogoOccurrences = html.split(logoUrl).length - 1;
const experienceLogoOccurrences = experienceStyles.split(logoUrl).length - 1;
if (htmlLogoOccurrences !== 1 || experienceLogoOccurrences !== 1) {
  throw new Error(`Brand URL references must stay controlled at one critical + one final-cascade declaration, got html=${htmlLogoOccurrences}, experience=${experienceLogoOccurrences}`);
}

console.log("verify-brand-resilience: PASS — external Shinkyokushinkai mark has critical + final-cascade CSS fallbacks and cannot render as a broken <img>");
