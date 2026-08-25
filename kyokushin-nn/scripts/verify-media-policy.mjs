import { readFile } from "node:fs/promises";
import vm from "node:vm";

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
  "trainer-photo-source",
  "trainer-photo-identity-status",
  "trainer-photo-identity-evidence",
  "trainer-photo-asset-source-pair",
  "cmsTrainerSourceClass",
  "cmsTrainerAssetMatchesSource",
  "CMS_VERIFIED_IDENTITY_STATUS",
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
  "identityStatus должен быть verified",
  "trainerAssetMatchesSource",
  "sourcePlatform",
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

const policyContext = {
  URL,
  TextDecoder,
  Uint8Array,
  atob,
  console: { warn() {}, log() {}, error() {} },
  document: {
    addEventListener() {},
    querySelector() { return null; }
  },
  window: {
    fetch: async () => ({ ok: true })
  }
};
vm.runInNewContext(adminPolicy, policyContext, { filename: "admin/media-policy.js" });
const validate = policyContext.window.KYOKUSHIN_ADMIN_MEDIA_POLICY?.validate;
if (typeof validate !== "function") throw new Error("Admin media policy validator is not executable");

const clone = (value) => JSON.parse(JSON.stringify(value));
const baseErrors = validate(clone(content));
if (baseErrors.length) throw new Error(`Current CMS content violates media policy: ${baseErrors.join(" | ")}`);

const kirillTenChat = clone(content);
const kirill = kirillTenChat.instructors.find((item) => item.name === "Кирилл Антоневич");
if (!kirill) throw new Error("Kirill trainer record missing");
kirill.photo = {
  src: "https://cdn1.tenchat.ru/static/vbc-gostinder/user-picture/c5fe4cf5-e2af-4cec-be74-0e4e6b2b3bc7.jpeg?crop=480%2C480%2Cx0%2Cy0&fmt=webp&height=480&width=480",
  sourceUrl: "https://tenchat.ru/5138057",
  sourcePlatform: "tenchat",
  identityStatus: "verified",
  identityEvidence: "Public professional profile names Кирилл Антоневич in Нижний Новгород, identifies him as a martial-arts trainer and links the same Мастерская каратэ organization.",
  position: "50% 30%"
};
const tenChatErrors = validate(kirillTenChat);
if (tenChatErrors.length) throw new Error(`Verified TenChat portrait chain must pass: ${tenChatErrors.join(" | ")}`);

const wrongCdn = clone(kirillTenChat);
wrongCdn.instructors.find((item) => item.name === "Кирилл Антоневич").photo.src = "https://example.com/random.jpg";
if (!validate(wrongCdn).some((item) => item.includes("CDN/asset"))) {
  throw new Error("TenChat source paired with an unrelated CDN must fail closed");
}

const missingIdentity = clone(kirillTenChat);
delete missingIdentity.instructors.find((item) => item.name === "Кирилл Антоневич").photo.identityStatus;
if (!validate(missingIdentity).some((item) => item.includes("identityStatus"))) {
  throw new Error("Named social portrait without verified identityStatus must fail closed");
}

const weakEvidence = clone(kirillTenChat);
weakEvidence.instructors.find((item) => item.name === "Кирилл Антоневич").photo.identityEvidence = "same name";
if (!validate(weakEvidence).some((item) => item.includes("доказательство личности"))) {
  throw new Error("Named social portrait without source-bound identity evidence must fail closed");
}

const mirrorMisuse = clone(kirillTenChat);
const mirrorPhoto = mirrorMisuse.instructors.find((item) => item.name === "Кирилл Антоневич").photo;
mirrorPhoto.src = "https://sun9-54.userapi.com/example.jpg";
mirrorPhoto.sourceUrl = "https://shin-nnov.orgs.biz/";
mirrorPhoto.sourcePlatform = "vk";
if (!validate(mirrorMisuse).some((item) => item.includes("source classes"))) {
  throw new Error("Secondary federation mirror must not become a generic portrait authority");
}

console.log("verify-media-policy: PASS — current content plus verified social portrait chains are allowed; wrong CDN, unverified identity, weak evidence and mirror misuse fail closed");
