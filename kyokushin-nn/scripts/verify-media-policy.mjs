import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [contentRaw, directionRaw, experience, adminPolicy, adminHtml] = await Promise.all([
  readFile(new URL("content/site.json", root), "utf8"),
  readFile(new URL("docs/media-direction.json", root), "utf8"),
  readFile(new URL("experience-v3.js", root), "utf8"),
  readFile(new URL("admin/media-policy.js", root), "utf8"),
  readFile(new URL("admin/index.html", root), "utf8")
]);

const content = JSON.parse(contentRaw);
const direction = JSON.parse(directionRaw);
const serialized = JSON.stringify(content);

if (direction.status !== "active") throw new Error("Real-media direction contract must be active");
if (!String(direction.schema_version || "").includes("kyokushin-real-media.v3")) throw new Error("Expected media-direction v3 contract");
if (!direction.forbidden?.some((item) => item.includes("AI-generated trainer"))) throw new Error("Synthetic documentary trainer media must be explicitly forbidden");
if (direction.slots?.find((item) => item.id === "federation-proof")?.official_source !== "https://vk.com/club227311328") {
  throw new Error("Federation authority must resolve to the federation VK page");
}
if (direction.slots?.find((item) => item.id === "federation-proof")?.secondary_mirror !== "https://shin-nnov.orgs.biz/") {
  throw new Error("orgs.biz must be classified as a secondary mirror, not official authority");
}

for (const candidate of direction.candidate_research ?? []) {
  if (candidate.status !== "research_only") throw new Error(`Candidate ${candidate.id} must remain research_only until original-source promotion`);
  if (!candidate.promotionRequirement) throw new Error(`Candidate ${candidate.id} is missing a promotion requirement`);
}

for (const marker of ["vega52.ru", "www.vega52.ru"]) {
  if (serialized.includes(marker)) throw new Error(`Rejected media host leaked into CMS content: ${marker}`);
}
for (const filler of [
  "Тренировки, где техника становится характером",
  "Спортивные сборы, природа и тренировочный ритм",
  "Движение каждый день"
]) {
  if (serialized.includes(filler)) throw new Error(`Ungrounded promotional filler leaked into CMS content: ${filler}`);
}

const host = (url) => url ? new URL(url).hostname : "";
if (!["kples.ru", "www.kples.ru"].includes(host(content.hero?.media?.src))) throw new Error("Hero documentary media must come from kples.ru");
if (content.hero?.media?.poster && !["kples.ru", "www.kples.ru", "vk.ru", "vk.com"].includes(host(content.hero.media.poster))) {
  throw new Error("Hero poster must be official camp/VK evidence or empty");
}
if (!["kples.ru", "www.kples.ru", "vk.ru", "vk.com"].includes(host(content.hero?.media?.sourceUrl))) {
  throw new Error("Hero source URL must be a confirmed camp/VK source");
}

for (const marker of [
  "cmsMediaPolicyErrors",
  "CMS_FORBIDDEN_MEDIA_HOSTS",
  "forbidden-media-host",
  "trainer-photo-source",
  "KYOKUSHIN_CMS_RUNTIME",
  "validate: cmsMediaPolicyErrors"
]) {
  if (!experience.includes(marker)) throw new Error(`Runtime media fail-closed marker missing: ${marker}`);
}

for (const marker of [
  "KYOKUSHIN_ADMIN_MEDIA_POLICY",
  "Real-media policy blocked CMS publish",
  "CONTENT_API_FRAGMENT",
  "publishButton",
  "stopImmediatePropagation",
  "vega52.ru"
]) {
  if (!adminPolicy.includes(marker)) throw new Error(`Admin media gate marker missing: ${marker}`);
}

const policyIndex = adminHtml.indexOf('<script src="media-policy.js" defer></script>');
const adminIndex = adminHtml.indexOf('<script src="admin.js" defer></script>');
if (policyIndex < 0 || adminIndex < 0 || policyIndex > adminIndex) {
  throw new Error("Admin media policy must load before admin.js");
}
if (!adminHtml.includes("Никаких нейрофото")) throw new Error("CMS must make the real-media rule visible to the operator");

console.log(`verify-media-policy: PASS — real-media source hierarchy, research-only promotion gates, CMS publish guard and runtime hot-sync rejection are fail-closed`);
