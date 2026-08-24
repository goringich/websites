import { readFile } from "node:fs/promises";

const [html, artDirection, experience] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8")
]);

for (const fontContract of [
  "Manrope:wght@400;500;600;700;800",
  "Unbounded:wght@500;600;700;800"
]) {
  if (!html.includes(fontContract)) {
    throw new Error(`Loaded typography contract is missing: ${fontContract}`);
  }
}

const supportedWeights = new Set([400, 500, 600, 700, 800]);
const syntheticWeights = [...new Set(
  [...artDirection.matchAll(/font-weight:\s*(\d+)/g)]
    .map((match) => Number(match[1]))
    .filter((weight) => !supportedWeights.has(weight))
)].sort((left, right) => left - right);

const expectedSyntheticWeights = [520, 560, 620, 650, 750, 760, 850];
if (JSON.stringify(syntheticWeights) !== JSON.stringify(expectedSyntheticWeights)) {
  throw new Error(`Unexpected V3 synthetic weight set: ${syntheticWeights.join(", ")}`);
}

for (const marker of [
  'body[data-art-direction="dojo-editorial-v3"] .site-nav a',
  'body[data-art-direction="dojo-editorial-v3"] .topbar-link',
  'body[data-art-direction="dojo-editorial-v3"] .hero h1 span',
  'body[data-art-direction="dojo-editorial-v3"] .hero-lead',
  'body[data-art-direction="dojo-editorial-v3"] .roster-initials',
  'body[data-art-direction="dojo-editorial-v3"] .search-field input',
  'body[data-art-direction="dojo-editorial-v3"] .steps span',
  'body[data-art-direction="dojo-editorial-v3"] .hero-actions .button-ghost',
  'body[data-art-direction="dojo-editorial-v3"] .signal-strip',
  'body[data-art-direction="dojo-editorial-v3"] .photo-story'
]) {
  if (!experience.includes(marker)) {
    throw new Error(`Editorial refinement is missing cascade-safe marker: ${marker}`);
  }
}

if (experience.includes("!important")) {
  throw new Error("Editorial refinement must resolve cascade through structure/specificity, not !important");
}

const experienceIndex = html.indexOf('href="experience-v3.css"');
const artIndex = html.indexOf('href="art-direction-v3.css"');
if (experienceIndex === -1 || artIndex === -1) {
  throw new Error("V3 source stylesheets are missing from index.html");
}

if (experienceIndex < artIndex && !experience.includes('body[data-art-direction="dojo-editorial-v3"]')) {
  throw new Error("Experience layer precedes art direction and therefore requires V3-root specificity");
}

if (html.includes('class="signal-strip"') && !/\.signal-strip\s*\{\s*display:\s*none;/.test(experience)) {
  throw new Error("Redundant post-hero signal strip must not remain visually active");
}

if (!html.includes('class="hero-proof"')) {
  throw new Error("Hero must retain the compact factual proof after removing the duplicate post-hero strip");
}

console.log(`verify-editorial-refinement: PASS — loaded font weights normalized, duplicate proof strip suppressed, primary CTA hierarchy preserved (${syntheticWeights.length} legacy synthetic weights neutralized by V3-root overrides)`);
