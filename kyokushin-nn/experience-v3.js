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
window.KYOKUSHIN_EXPERIENCE_V3_READY = true;
