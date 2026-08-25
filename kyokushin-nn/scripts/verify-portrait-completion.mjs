import { readFile } from "node:fs/promises";

const contentRaw = await readFile(new URL("../content/site.json", import.meta.url), "utf8");
const content = JSON.parse(contentRaw);

if (!Array.isArray(content.instructors) || content.instructors.length !== 11) {
  throw new Error(`Trainer portrait completion expects exactly 11 instructors; current=${content.instructors?.length ?? 0}`);
}

const missing = content.instructors
  .filter((instructor) => !instructor.photo?.src || !instructor.photo?.sourceUrl)
  .map((instructor) => instructor.name);

if (missing.length > 0) {
  throw new Error(
    `Trainer portrait completion gate requires 11/11 source-bound portraits; current=${11 - missing.length}/11; missing=${missing.join(", ")}`
  );
}

console.log("verify-portrait-completion: PASS — 11/11 source-bound trainer portraits present");
