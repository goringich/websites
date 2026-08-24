import { readFile } from "node:fs/promises";

const vercelConfig = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

if (vercelConfig.$schema !== "https://openapi.vercel.sh/vercel.json") {
  throw new Error("vercel.json must pin the official Vercel configuration schema");
}

const rules = new Map((vercelConfig.headers ?? []).map((rule) => [rule.source, rule.headers]));
const globalHeaders = new Map((rules.get("/(.*)") ?? []).map(({ key, value }) => [key, value]));
const healthHeaders = new Map((rules.get("/health.json") ?? []).map(({ key, value }) => [key, value]));

const expectedGlobal = new Map([
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  ["Content-Security-Policy", "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests"]
]);

for (const [key, value] of expectedGlobal) {
  if (globalHeaders.get(key) !== value) {
    throw new Error(`Runtime security header mismatch: ${key}=${globalHeaders.get(key) ?? "missing"}`);
  }
}

const csp = globalHeaders.get("Content-Security-Policy") ?? "";
for (const riskyDirective of ["default-src", "script-src", "style-src", "img-src", "font-src", "connect-src"]) {
  if (csp.includes(riskyDirective)) {
    throw new Error(`Baseline CSP must not accidentally constrain current external media/font/runtime dependencies: ${riskyDirective}`);
  }
}

if (healthHeaders.get("Cache-Control") !== "no-store, max-age=0") {
  throw new Error("/health.json browser cache must be disabled so exact-release proof cannot use stale health data");
}
if (healthHeaders.get("CDN-Cache-Control") !== "no-store") {
  throw new Error("/health.json CDN cache must be disabled so exact-release proof cannot use stale health data");
}

if (vercelConfig.buildCommand !== "npm run build" || vercelConfig.outputDirectory !== "dist") {
  throw new Error("Runtime header work must not weaken the canonical Vercel build/output contract");
}

console.log("verify-runtime-headers: PASS — anti-framing/nosniff/referrer/permissions baseline present and release health is no-store at browser/CDN layers");
