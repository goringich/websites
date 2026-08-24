import { readFile } from "node:fs/promises";

const [css, motion, experienceCss, experienceJs, buildScript, contractRaw, audit] = await Promise.all([
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
  "--v3-red",
  "--v3-display",
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
  'rejectedSourceCssFiles',
  '"art-direction-v2.css"',
  '"experience.css"',
  'rejectedSourceJsFiles',
  '"experience.js"',
  '"experience-v3.css"',
  '"art-direction-v3.css"',
  '"experience-v3.js"',
  '"motion-v3.js"',
  "Rejected v2 visual layer leaked into production"
]) {
  if (!buildScript.includes(marker)) {
    throw new Error(`Pure-V3 production build contract missing marker: ${marker}`);
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

console.log("verify-art-direction-v3: PASS — pure V3 source/build architecture present; perceptual QA remains explicitly blocked");
