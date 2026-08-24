const experienceReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealTargets = [
  ".section-heading",
  ".team-heading",
  ".photo-card",
  ".photo-story-link",
  ".archive-cover-card",
  ".roster-card",
  ".instructor-card",
  ".steps li",
  ".final-cta .button"
];

const revealNodes = [...document.querySelectorAll(revealTargets.join(","))];
revealNodes.forEach((node, index) => {
  node.dataset.reveal = "";
  node.style.setProperty("--reveal-order", String(index % 6));
});

if (experienceReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-revealed"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.08
  });

  revealNodes.forEach((node) => revealObserver.observe(node));
}

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, {
    rootMargin: "-28% 0px -58% 0px",
    threshold: [0, 0.15, 0.4]
  });

  navSections.forEach((section) => navObserver.observe(section));
}

let scrollFrame = 0;
const updatePageProgress = () => {
  scrollFrame = 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  document.documentElement.style.setProperty("--page-progress", `${(progress * 100).toFixed(2)}%`);
};

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updatePageProgress);
}, { passive: true });

updatePageProgress();
window.KYOKUSHIN_EXPERIENCE_READY = true;
