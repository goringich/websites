import { readFile } from "node:fs/promises";

const [css, motion, contractRaw, audit] = await Promise.all([
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../motion-v3.js", import.meta.url), "utf8"),
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
  "data.v3Reveal",
  "is-v3-visible",
  "KYOKUSHIN_ART_DIRECTION_V3_READY"
]) {
  if (!motion.includes(marker)) {
    throw new Error(`Missing V3 motion-system marker: ${marker}`);
  }
}

if (motion.includes("innerHTML")) {
  throw new Error("V3 motion layer must not use innerHTML");
}

for (const antiPattern of [
  "generic dark athletic landing-page skeleton",
  "rounded/pill UI borrowed from SaaS patterns",
  "generic fade-up reveal used as primary motion language",
  "limited brand-specific visual grammar"
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

console.log("verify-art-direction-v3: PASS — structural direction/motion contract present; perceptual QA remains explicitly blocked");
