const v3NavLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const v3NavSections = v3NavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && v3NavSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

    if (!visible) return;

    v3NavLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, {
    rootMargin: "-28% 0px -58% 0px",
    threshold: [0, 0.15, 0.4]
  });

  v3NavSections.forEach((section) => navObserver.observe(section));
}

let v3ProgressFrame = 0;
const updateV3PageProgress = () => {
  v3ProgressFrame = 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  document.documentElement.style.setProperty("--page-progress", `${(progress * 100).toFixed(2)}%`);
};

window.addEventListener("scroll", () => {
  if (v3ProgressFrame) return;
  v3ProgressFrame = window.requestAnimationFrame(updateV3PageProgress);
}, { passive: true });

updateV3PageProgress();

const CMS_RAW_URL = "https://raw.githubusercontent.com/goringich/websites/project/kyokushin-nn/kyokushin-nn/content/site.json";
const CMS_LOCAL_URL = "/content/site.json";

const installCmsRuntimeStyle = () => {
  if (document.querySelector("#cms-runtime-style")) return;
  const style = document.createElement("style");
  style.id = "cms-runtime-style";
  style.textContent = `
    .hero-visual > video.cms-hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
    .hero-visual[data-media=video]{isolation:isolate}
    .hero-visual[data-media=video] .hero-visual-shade,.hero-visual[data-media=video] .hero-visual-copy,.hero-visual[data-media=video] .hero-photo-link{z-index:2}
    .photo-video-card{position:relative;display:block;isolation:isolate;text-decoration:none;color:#fff}
    .photo-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .photo-video-overlay{position:absolute;z-index:1;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,.74))}
    .photo-video-title{position:absolute;z-index:2;left:18px;right:70px;bottom:17px;font-size:16px;line-height:1.15}
    .photo-video-badge{position:absolute;z-index:2;right:14px;top:14px;padding:7px 9px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(0,0,0,.34);font-size:10px;font-weight:800;backdrop-filter:blur(8px)}
    .roster-external{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 12px;border:1px solid currentColor;border-radius:999px;color:inherit;font-size:11px;font-weight:800;text-decoration:none}
    .roster-external:hover{opacity:.72}
  `;
  document.head.append(style);
};

const applyHeroContent = (content) => {
  const hero = content?.hero;
  if (!hero) return;

  const eyebrow = document.querySelector(".hero .eyebrow");
  if (eyebrow) {
    const dot = document.createElement("span");
    dot.className = "eyebrow-dot";
    dot.setAttribute("aria-hidden", "true");
    eyebrow.replaceChildren(dot, document.createTextNode(hero.eyebrow || "Сборы · Керженец"));
  }

  const title = document.querySelector("#hero-title");
  if (title) {
    const accent = document.createElement("span");
    accent.textContent = hero.accent || "С первого шага.";
    title.replaceChildren(document.createTextNode(hero.title || "Каратэ."), document.createElement("br"), accent);
  }

  const lead = document.querySelector(".hero-lead");
  if (lead && hero.lead) lead.textContent = hero.lead;

  const visual = document.querySelector(".hero-visual");
  if (!visual || !hero.media) return;

  const media = hero.media;
  const shade = document.createElement("div");
  shade.className = "hero-visual-shade";
  shade.setAttribute("aria-hidden", "true");

  const copy = document.createElement("div");
  copy.className = "hero-visual-copy";
  const label = document.createElement("span");
  label.textContent = media.label || "Керженец · Красный Плёс";
  const caption = document.createElement("strong");
  caption.textContent = media.caption || "Спортивные сборы на Керженце";
  copy.append(label, caption);

  const source = document.createElement("a");
  source.className = "hero-photo-link";
  source.href = media.sourceUrl || "#photos";
  source.target = media.sourceUrl ? "_blank" : "";
  source.rel = media.sourceUrl ? "noopener noreferrer" : "";
  source.textContent = media.sourceUrl ? "Источник ↗" : "Смотреть фото ↘";

  let mediaNode;
  if (media.type === "video") {
    const video = document.createElement("video");
    video.className = "cms-hero-video";
    video.src = media.src;
    if (media.poster) video.poster = media.poster;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", media.alt || "Спортивные сборы на Керженце");
    video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
    mediaNode = video;
    visual.dataset.media = "video";
  } else {
    const image = document.createElement("img");
    image.src = media.src;
    image.alt = media.alt || "Спортивные сборы на Керженце";
    image.loading = "eager";
    image.decoding = "async";
    mediaNode = image;
    visual.dataset.media = "image";
  }

  visual.replaceChildren(mediaNode, shade, copy, source);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && media.poster) ogImage.content = media.poster;
  const ogAlt = document.querySelector('meta[property="og:image:alt"]');
  if (ogAlt) ogAlt.content = media.alt || "Спортивные сборы на Керженце";
};

const isValidCmsContent = (content) => Boolean(
  content && Array.isArray(content.instructors) && content.instructors.length === 11
  && Array.isArray(content.gallery) && content.hero?.media?.src
);

const applyCmsContent = (content) => {
  if (!isValidCmsContent(content)) return false;
  window.KYOKUSHIN_CONTENT = content;
  window.KYOKUSHIN_MEDIA_APPLY_CONTENT?.(content);
  window.KYOKUSHIN_APP?.applyContent?.(content);
  window.KYOKUSHIN_TEAM?.applyContent?.(content);
  window.KYOKUSHIN_PHOTO?.applyContent?.(content);
  applyHeroContent(content);
  window.dispatchEvent(new CustomEvent("kyokushin:content-ready", { detail: { version: content.version } }));
  return true;
};

const fetchCmsContent = async () => {
  const urls = [`${CMS_RAW_URL}?v=${Date.now()}`, `${CMS_LOCAL_URL}?v=${Date.now()}`];
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const content = await response.json();
      if (applyCmsContent(content)) return true;
    } catch {
      // The embedded build seed remains the safe fallback.
    }
  }
  return false;
};

installCmsRuntimeStyle();
if (window.KYOKUSHIN_CONTENT) applyCmsContent(window.KYOKUSHIN_CONTENT);
fetchCmsContent();

window.KYOKUSHIN_CMS_RUNTIME = {
  refresh: fetchCmsContent,
  apply: applyCmsContent,
  source: CMS_RAW_URL
};
window.KYOKUSHIN_EXPERIENCE_V3_READY = true;
