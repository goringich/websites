import { readFile } from "node:fs/promises";

const [html, script] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8")
]);

const requiredHtml = [
  "id=\"groups\"",
  "id=\"searchInput\"",
  "id=\"cityFilters\"",
  "id=\"dayFilters\"",
  "script.js",
  "styles.css"
];

for (const marker of requiredHtml) {
  if (!html.includes(marker)) {
    throw new Error(`Missing HTML marker: ${marker}`);
  }
}

const cityNnCount = (script.match(/city: "Нижний Новгород"/g) || []).length;
const cityDzerzhinskCount = (script.match(/city: "Дзержинск"/g) || []).length;
const phoneCount = (script.match(/phone: "\+7/g) || []).length;

if (cityNnCount !== 16 || cityDzerzhinskCount !== 2) {
  throw new Error(`Expected 18 venues (16 + 2), got ${cityNnCount + cityDzerzhinskCount}`);
}

if (phoneCount !== 11) {
  throw new Error(`Expected 11 instructors, got ${phoneCount}`);
}

if (script.includes("innerHTML")) {
  throw new Error("Unsafe innerHTML usage is not allowed");
}

console.log("verify: 18 venues, 11 instructors, required UI hooks present");
