import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [styles, team] = await Promise.all([
  readFile(new URL("../art-direction-v3.css", import.meta.url), "utf8"),
  readFile(new URL("../team.js", import.meta.url), "utf8")
]);

const contract = styles.split("/* Accessibility regression: WCAG AA contrast for functional small text. */")[1];
assert.ok(contract, "Missing accessibility contrast source contract");
for (const selector of [
  "body .topbar-link",
  "body .button.button-primary",
  "body .venue-actions .mini-button.call",
  "body .hero-visual > .hero-video-play",
  "body .photo-story-link .photo-story-kicker",
  "body .photo-story-link .photo-story-meta",
  "body .hero-proof div > span",
  "body .team-heading .kicker",
  "body .groups-heading .kicker",
  "body .filter-label",
  "body .roster-card-featured .roster-halls",
  "body .roster-card-featured .roster-role",
  "body .venue-actions .mini-button",
  "body .instructor-phone",
  "body .chip",
  "body .hero-photo-link"
]) {
  assert.ok(contract.includes(selector), `Missing bounded style selector: ${selector}`);
}
for (const property of [
  "background-color: #c92019 !important",
  "color: #fff !important",
  "color: #a91e14 !important",
  "color: #5b564d !important",
  "color: #ff6255 !important",
  "min-height: 48px !important",
  "min-width: 48px !important"
]) {
  assert.ok(contract.includes(property), `Missing accessible computed style: ${property}`);
}
assert.match(team, /fallback\.setAttribute\("aria-hidden", "true"\)/,
  "Decorative initials must not be announced as redundant instructor names");

function brightness(hex) {
  const channels = hex.match(/[a-f0-9]{2}/gi)?.map((value) => parseInt(value, 16) / 255);
  assert.equal(channels?.length, 3, `Invalid hex color: ${hex}`);
  const rgb = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(foreground, background) {
  const a = brightness(foreground);
  const b = brightness(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Actual Chromium computed-style ratios are independently checked on the
// GitHub Actions release artifact. This source gate protects palette minima.
for (const [label, foreground, background] of [
  ["white functional text on darkened red", "#ffffff", "#c92019"],
  ["section kicker on warm paper", "#a91e14", "#f1ede3"],
  ["section kicker on pale card", "#a91e14", "#fffaf0"],
  ["filter labels on pale card", "#5b564d", "#fffaf0"],
  ["featured instructor role on charcoal", "#ff6255", "#141412"]
]) {
  const ratio = contrast(foreground, background);
  assert.ok(ratio >= 4.5, `${label}: contrast ${ratio.toFixed(2)} is below 4.5:1`);
}
console.log("verify-contrast-accessibility: PASS — bounded AA palette, visible touch targets and decorative fallback");
