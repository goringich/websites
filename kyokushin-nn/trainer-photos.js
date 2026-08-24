const trainerPhotoRegistry = window.KYOKUSHIN_MEDIA?.trainerPhotos ?? {};
const instructorListNode = document.querySelector("#instructorList");

const decorateTrainerCards = () => {
  if (!instructorListNode) {
    return;
  }

  instructorListNode.querySelectorAll(".instructor-card:not([data-photo-ready])").forEach((card) => {
    const panel = card.querySelector(".instructor-panel");
    const title = panel?.querySelector("h3");
    const photo = title ? trainerPhotoRegistry[title.textContent.trim()] : null;

    if (!panel || !title || !photo) {
      return;
    }

    const frame = document.createElement("div");
    frame.className = "instructor-photo-frame";
    frame.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.className = "instructor-photo-image";
    image.src = photo.image;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.style.objectPosition = photo.position ?? "50% 40%";

    const fallback = document.createElement("span");
    fallback.className = "instructor-photo-fallback";
    fallback.textContent = title.textContent
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2);

    image.addEventListener("error", () => frame.classList.add("is-error"), { once: true });
    frame.append(image, fallback);
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
}
