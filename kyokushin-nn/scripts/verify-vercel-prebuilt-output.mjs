import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd(), ".vercel/output");
const staticRoot = resolve(root, "static");
const requiredStaticFiles = ["index.html", "health.json", "robots.txt", "sitemap.xml"];

const configPath = resolve(root, "config.json");
let config;
try {
  config = JSON.parse(await readFile(configPath, "utf8"));
} catch (error) {
  throw new Error(`Vercel prebuilt output is missing a readable config.json: ${error.message}`);
}

if (config.version !== 3) {
  throw new Error(`Unexpected Vercel Build Output API version: ${String(config.version)}`);
}

for (const filename of requiredStaticFiles) {
  const path = resolve(staticRoot, filename);
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size === 0) {
      throw new Error(`${filename} is empty or not a regular file`);
    }
  } catch (error) {
    throw new Error(`Vercel prebuilt output is missing static/${filename}: ${error.message}`);
  }
}

const routes = config.routes ?? [];
const badIndexOverride = config.overrides?.["index.html"]?.path === "index";
if (badIndexOverride) {
  throw new Error("Vercel prebuilt config must not remap index.html to /index; that route was redirected back to / and produced a live root 404");
}

const indexSelfRedirect = routes.find((route) =>
  Number(route.status) >= 300 &&
  Number(route.status) < 400 &&
  route.headers?.Location === "/$1" &&
  String(route.src ?? "").includes("index")
);
if (indexSelfRedirect) {
  throw new Error(`Vercel prebuilt config contains the rejected cleanUrls index redirect: ${indexSelfRedirect.src}`);
}

const rootRewrite = routes.find((route) => route.dest === "/index.html" && String(route.src ?? "").includes("^/$"));
if (!rootRewrite) {
  throw new Error("Vercel prebuilt config must contain an explicit root rewrite to /index.html");
}

const html = await readFile(resolve(staticRoot, "index.html"), "utf8");
const health = JSON.parse(await readFile(resolve(staticRoot, "health.json"), "utf8"));
const expectedRelease = process.env.KYOKUSHIN_RELEASE_ID;

if (expectedRelease) {
  if (!html.includes(`name="x-kyokushin-release" content="${expectedRelease}"`)) {
    throw new Error(`static/index.html does not carry expected release ${expectedRelease}`);
  }
  if (health.release !== expectedRelease) {
    throw new Error(`static/health.json release mismatch: expected ${expectedRelease}, got ${health.release}`);
  }
}

if (health.artDirection !== "dojo-editorial-v3") {
  throw new Error(`static/health.json art direction mismatch: ${health.artDirection}`);
}

console.log(`verify-vercel-prebuilt-output: PASS — Build Output API v${config.version}, root routes to static/index.html, release=${health.release}`);
