import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const logoUrl = "https://wkosydney.com.au/assets/images/logo.jpg";

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
    throw new Error(`Brand resilience source contract is missing: ${marker}`);
  }
}

const logoOccurrences = html.split(logoUrl).length - 1;
if (logoOccurrences !== 1) {
  throw new Error(`Brand logo URL must have exactly one controlled runtime reference, got ${logoOccurrences}`);
}

console.log("verify-brand-resilience: PASS — external Shinkyokushinkai mark has a deterministic CSS fallback and cannot render as a broken <img>");
