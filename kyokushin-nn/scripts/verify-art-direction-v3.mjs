import { readFile } from "node:fs/promises";

const [html, css, motion, experienceCss, experienceJs, buildScript, contractRaw, audit] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../motion-v3.js", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.js", import.meta.url), "utf8"),
  readFile(new URL("build-static.mjs", import.meta.url), "utf8"),
  readFile(new URL("../docs/design/art-direction-v3.json", import.meta.url), "utf8"),
  readFile(new URL("../docs/design/audit-2026-08-24.md", import.meta.url), "utf8")
]);

const contract = JSON.parse(contractRaw);

if (contract.status !== "ART_DIRECTION_CONTRACT") {
  throw new Error(`Unexpected art-direction contract state: ${contract.status}`);
}

if (contract.owner_feedback?.verdict !== "rejected_current_visual_family") {
  throw new Error("Explicit owner rejection must remain a first-class negative reference");
}

if (contract.design_direction?.name !== "Dojo Editorial / Competition Poster") {
  throw new Error("V3 design direction identity changed unexpectedly");
}

for (const marker of [
  '<meta name="x-kyokushin-art-direction" content="dojo-editorial-v3">',
  'data-art-direction="dojo-editorial-v3"',
  'href="experience-v3.css"',
  'href="art-direction-v3.css"',
  'src="experience-v3.js"',
  'src="motion-v3.js"',
  "fonts.googleapis.com/css2",
  "family=Manrope",
  "family=Unbounded"
]) {
  if (!html.includes(marker)) {
    throw new Error(`Source HTML is not directly V3-ready: ${marker}`);
  }
}

for (const forbiddenActiveSource of [
  '<link rel="stylesheet" href="art-direction-v2.css">',
  '<link rel="stylesheet" href="experience.css">',
  '<script src="experience.js"',
  "window.__KYOKUSHIN_ASSET_FALLBACK__",
  "Kyokushin JS fallback failed"
]) {
  if (html.includes(forbiddenActiveSource)) {
    throw new Error(`Rejected/legacy visual runtime is active in source HTML: ${forbiddenActiveSource}`);
  }
}

for (const marker of [
  "--v3-red",
  "--v3-display",
  '"Unbounded"',
  '"Manrope"',
  ".hero {",
  "grid-template-columns: repeat(12",
  ".photo-mosaic {",
  ".trainer-roster {",
  ".filters {",
  ".steps {",
  ".final-cta {",
  "[data-v3-reveal",
  "prefers-reduced-motion"
]) {
  if (!css.includes(marker)) {
    throw new Error(`Missing V3 visual-system marker: ${marker}`);
  }
}

for (const marker of [
  "requestAnimationFrame",
  "IntersectionObserver",
  "pointermove",
  "prefers-reduced-motion",
  "--v3-scroll",
  "--v3-pointer-x",
  "dataset.v3Reveal",
  "is-v3-visible",
  "KYOKUSHIN_ART_DIRECTION_V3_READY"
]) {
  if (!motion.includes(marker)) {
    throw new Error(`Missing V3 motion-system marker: ${marker}`);
  }
}

for (const marker of [
  "--page-progress",
  "var(--v3-red",
  ".roster-card:focus-within",
  "scroll-margin-top"
]) {
  if (!experienceCss.includes(marker)) {
    throw new Error(`Missing V3 experience-style marker: ${marker}`);
  }
}

for (const marker of [
  "IntersectionObserver",
  "aria-current",
  "requestAnimationFrame",
  "--page-progress",
  "KYOKUSHIN_EXPERIENCE_V3_READY"
]) {
  if (!experienceJs.includes(marker)) {
    throw new Error(`Missing V3 experience runtime marker: ${marker}`);
  }
}

if (experienceCss.includes("[data-reveal]") || experienceJs.includes("revealTargets")) {
  throw new Error("Generic V2 fade-up reveal must not exist in the V3 experience layer");
}

if (motion.includes("innerHTML") || experienceJs.includes("innerHTML")) {
  throw new Error("V3 motion/experience layers must not use innerHTML");
}

for (const marker of [
  'const cssFiles = [',
  '"experience-v3.css"',
  '"art-direction-v3.css"',
  'const jsFiles = [',
  '"experience-v3.js"',
  '"motion-v3.js"',
  'const rejectedVisualFiles = [',
  '"art-direction-v2.css"',
  '"experience.css"',
  '"experience.js"',
  "Rejected V2 visual dependency is active in source HTML",
  "Rejected v2 visual layer leaked into production",
  "__KYOKUSHIN_ASSET_FALLBACK__"
]) {
  if (!buildScript.includes(marker)) {
    throw new Error(`Source-converged pure-V3 build contract missing marker: ${marker}`);
  }
}

for (const antiPattern of [
  "generic athletic/agency landing-page pattern",
  "classic 2-column text + framed photo composition",
  "pill-ish navigation and button language",
  "This makes the site feel assembled rather than art-directed",
  "That is polish, not motion direction"
]) {
  if (!audit.includes(antiPattern)) {
    throw new Error(`Design audit lost rejected-pattern evidence: ${antiPattern}`);
  }
}

if (contract.perceptual_qa?.required !== true) {
  throw new Error("Rendered perceptual QA must remain required");
}

if (contract.perceptual_qa?.current_capture_environment !== "blocked") {
  throw new Error("Source work must not claim perceptual review before rendered evidence exists");
}

console.log("verify-art-direction-v3: PASS — direct source and production share the pure V3 stack with explicit typography loading; perceptual QA remains blocked");
