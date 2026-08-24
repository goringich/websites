const instructorListNode = document.querySelector("#instructorList");

const initialsFor = (name) => String(name)
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2);

const trainerPhotoRegistry = () => window.KYOKUSHIN_MEDIA?.trainerPhotos ?? {};

const decorateTrainerCards = () => {
  if (!instructorListNode) return;

  instructorListNode.querySelectorAll(".instructor-card:not([data-photo-ready])").forEach((card) => {
    const panel = card.querySelector(".instructor-panel");
    const title = panel?.querySelector("h3");
    const trainerName = title?.textContent.trim();
    if (!panel || !title || !trainerName) return;

    const photo = trainerPhotoRegistry()[trainerName];
    const frame = document.createElement("div");
    frame.className = "instructor-photo-frame";

    const fallback = document.createElement("span");
    fallback.className = "instructor-photo-fallback";
    fallback.textContent = initialsFor(trainerName);
    frame.append(fallback);

    if (photo?.kind === "person" && photo.person === trainerName) {
      frame.dataset.photoKind = "person";
      const image = document.createElement("img");
      image.className = "instructor-photo-image";
      image.src = photo.image;
      image.alt = trainerName;
      image.loading = "lazy";
      image.decoding = "async";
      image.style.objectPosition = photo.position ?? "50% 35%";
      image.addEventListener("error", () => frame.classList.add("is-error"), { once: true });
      frame.prepend(image);
    } else {
      frame.classList.add("is-placeholder");
      frame.setAttribute("aria-hidden", "true");
    }

    title.before(frame);
    card.dataset.photoReady = "true";
  });
};

if (instructorListNode) {
  decorateTrainerCards();
  new MutationObserver(decorateTrainerCards).observe(instructorListNode, {
    childList: true,
    subtree: true
  });
  window.addEventListener("kyokushin:directory-rendered", decorateTrainerCards);
}
