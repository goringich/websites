import { readFile } from "node:fs/promises";

const [team, experience, artDirection] = await Promise.all([
  readFile(new URL("../team.js", import.meta.url), "utf8"),
  readFile(new URL("../experience-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8")
]);

const portraitStateContract = 'card.dataset.portrait = hasVerifiedPortrait ? "verified" : "pending";';
if (!team.includes(portraitStateContract)) {
  throw new Error("Trainer roster must retain explicit verified/pending portrait state");
}

for (const marker of [
  'body[data-art-direction="dojo-editorial-v3"] .roster-card[data-portrait="pending"] {',
  'body[data-art-direction="dojo-editorial-v3"] .roster-card[data-portrait="pending"] .roster-media {',
  'body[data-art-direction="dojo-editorial-v3"] .roster-card[data-portrait="pending"] .roster-body {',
  'body[data-art-direction="dojo-editorial-v3"] .roster-card[data-portrait="pending"] .roster-initials {',
  'body[data-art-direction="dojo-editorial-v3"] .roster-card[data-portrait="pending"]:nth-child(5n) {',
  'min-height: 292px;',
  'grid-template-rows: 1fr;'
]) {
  if (!experience.includes(marker)) {
    throw new Error(`Typography-led pending roster composition is missing: ${marker}`);
  }
}

const pendingMediaRule = experience.match(
  /body\[data-art-direction="dojo-editorial-v3"\] \.roster-card\[data-portrait="pending"\] \.roster-media \{([\s\S]*?)\n\}/
)?.[1] ?? "";

if (!pendingMediaRule.includes("position: absolute;") || !pendingMediaRule.includes("inset: 0;")) {
  throw new Error("Pending trainer media must be a decorative poster layer, not a reserved photo row");
}

const pendingBodyRule = experience.match(
  /body\[data-art-direction="dojo-editorial-v3"\] \.roster-card\[data-portrait="pending"\] \.roster-body \{([\s\S]*?)\n\}/
)?.[1] ?? "";

if (!pendingBodyRule.includes("justify-content: flex-end;") || !pendingBodyRule.includes("min-height: 360px;")) {
  throw new Error("Pending trainer content must own the poster composition");
}

if (pendingMediaRule.includes("url(")) {
  throw new Error("Pending trainer composition must not invent portrait imagery");
}

for (const verifiedMarker of [
  '.roster-card[data-portrait="verified"] {',
  '.roster-card[data-portrait="verified"] .roster-media {',
  '.roster-photo {'
]) {
  if (!artDirection.includes(verifiedMarker)) {
    throw new Error(`Verified portrait treatment must remain photo-led: ${verifiedMarker}`);
  }
}

for (const verifiedSourceMarker of [
  'if (hasVerifiedPortrait) {',
  'image.className = "roster-photo";',
  'image.src = photo.image;',
  'media.prepend(image);'
]) {
  if (!team.includes(verifiedSourceMarker)) {
    throw new Error(`Verified portrait source path must remain image-backed: ${verifiedSourceMarker}`);
  }
}

if (/data-portrait="verified"[^\{]*\{[^}]*position:\s*absolute/s.test(experience)) {
  throw new Error("V3.6 typography overlay must not collapse verified portrait cards");
}

console.log("verify-roster-composition: PASS — pending trainers are typography-led posters, verified portraits remain photo-led, mobile placeholder height is compact");
