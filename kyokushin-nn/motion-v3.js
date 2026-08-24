const v3Root = document.documentElement;
const v3Hero = document.querySelector(".hero");
const v3HeroVisual = document.querySelector(".hero-visual");
const v3HeroMedia = document.querySelector(".hero-visual img");
const v3InstructorList = document.querySelector("#instructorList");
const v3CityFilters = document.querySelector("#cityFilters");
const v3DayFilters = document.querySelector("#dayFilters");
const v3Search = document.querySelector("#searchInput");

const v3ReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const v3FinePointer = window.matchMedia("(pointer: fine)");

let v3ScrollFrame = 0;
let v3FilterFrame = 0;
let v3HeroHeight = Math.max(v3Hero?.offsetHeight ?? 1, 1);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const updateV3HeroHeight = () => {
  v3HeroHeight = Math.max(v3Hero?.offsetHeight ?? 1, 1);
};

const updateV3Scroll = () => {
  v3ScrollFrame = 0;

  if (v3ReducedMotion.matches) {
    v3Root.style.setProperty("--v3-scroll", "0");
    return;
  }

  const progress = clamp(window.scrollY / v3HeroHeight, 0, 1);
  v3Root.style.setProperty("--v3-scroll", progress.toFixed(4));
};

const requestV3ScrollUpdate = () => {
  if (v3ScrollFrame) return;
  v3ScrollFrame = window.requestAnimationFrame(updateV3Scroll);
};

const resetV3Pointer = () => {
  v3Root.style.setProperty("--v3-pointer-x", "0");
  v3Root.style.setProperty("--v3-pointer-y", "0");
};

const markV3HeroMediaReady = () => {
  if (!v3HeroMedia || !v3HeroMedia.naturalWidth) return;
  v3HeroMedia.classList.add("is-hero-media-ready");
};

const markV3HeroMediaUnavailable = () => {
  if (!v3HeroMedia) return;
  v3HeroMedia.classList.remove("is-hero-media-ready");
  v3HeroMedia.hidden = true;
};

if (v3HeroMedia) {
  if (v3HeroMedia.complete) {
    if (v3HeroMedia.naturalWidth > 0) {
      markV3HeroMediaReady();
    } else {
      markV3HeroMediaUnavailable();
    }
  } else {
    v3HeroMedia.addEventListener("load", markV3HeroMediaReady, { once: true });
    v3HeroMedia.addEventListener("error", markV3HeroMediaUnavailable, { once: true });
  }
}

if (v3HeroVisual && v3FinePointer.matches && !v3ReducedMotion.matches) {
  v3HeroVisual.addEventListener("pointermove", (event) => {
    const rect = v3HeroVisual.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    v3Root.style.setProperty("--v3-pointer-x", x.toFixed(3));
    v3Root.style.setProperty("--v3-pointer-y", y.toFixed(3));
  }, { passive: true });

  v3HeroVisual.addEventListener("pointerleave", resetV3Pointer, { passive: true });
}

const v3RevealGroups = [
  {
    selector: ".section-heading, .team-heading, .archive-head, .final-cta h2",
    kind: "heading"
  },
  {
    selector: ".photo-card, .archive-cover-card, .roster-card, .venue-card",
    kind: "media"
  },
  {
    selector: ".results-meta, .steps li",
    kind: "rule"
  }
];

const v3RevealNodes = [];

v3RevealGroups.forEach(({ selector, kind }) => {
  [...document.querySelectorAll(selector)].forEach((node, index) => {
    node.dataset.v3Reveal = kind;
    node.style.setProperty("--v3-reveal-delay", `${(index % 5) * 55}ms`);
    v3RevealNodes.push(node);
  });
});

if (v3ReducedMotion.matches || !("IntersectionObserver" in window)) {
  v3RevealNodes.forEach((node) => node.classList.add("is-v3-visible"));
} else {
  const v3RevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-v3-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -7% 0px",
    threshold: 0.07
  });

  v3RevealNodes.forEach((node) => v3RevealObserver.observe(node));
}

const pulseV3Directory = () => {
  if (!v3InstructorList || v3ReducedMotion.matches) return;

  v3InstructorList.classList.add("is-v3-changing");
  if (v3FilterFrame) window.cancelAnimationFrame(v3FilterFrame);

  v3FilterFrame = window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      v3InstructorList.classList.remove("is-v3-changing");
    }, 120);
  });
};

v3CityFilters?.addEventListener("click", pulseV3Directory);
v3DayFilters?.addEventListener("click", pulseV3Directory);
v3Search?.addEventListener("input", pulseV3Directory);

const handleV3MotionPreference = () => {
  if (v3ReducedMotion.matches) {
    resetV3Pointer();
    v3Root.style.setProperty("--v3-scroll", "0");
    v3RevealNodes.forEach((node) => node.classList.add("is-v3-visible"));
  } else {
    requestV3ScrollUpdate();
  }
};

window.addEventListener("scroll", requestV3ScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  updateV3HeroHeight();
  requestV3ScrollUpdate();
}, { passive: true });

v3ReducedMotion.addEventListener?.("change", handleV3MotionPreference);

updateV3HeroHeight();
updateV3Scroll();
window.KYOKUSHIN_ART_DIRECTION_V3_READY = true;
