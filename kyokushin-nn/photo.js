const photoRegistry = window.KYOKUSHIN_MEDIA ?? {
  verifiedMedia: [],
  photoCollections: []
};

const photoMosaic = document.querySelector("#photoMosaic");
const photoCollectionsNode = document.querySelector("#photoCollections");
const lightbox = document.querySelector("#photoLightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxCounter = lightbox?.querySelector(".lightbox-counter");
const lightboxSource = lightbox?.querySelector(".lightbox-source");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrev = lightbox?.querySelector(".lightbox-prev");
const lightboxNext = lightbox?.querySelector(".lightbox-next");

const realPhotos = photoRegistry.verifiedMedia.filter((item) => item.kind !== "story");
let activePhotoIndex = 0;

const externalLink = (className, href) => {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
};

const updateLightbox = () => {
  const item = realPhotos[activePhotoIndex];
  if (!item || !lightboxImage || !lightboxCounter || !lightboxSource) return;

  lightboxImage.src = item.image;
  lightboxImage.alt = item.alt;
  lightboxCounter.textContent = `${activePhotoIndex + 1} / ${realPhotos.length}`;
  lightboxSource.href = item.sourceUrl;
};

const openLightbox = (index) => {
  if (!lightbox || !realPhotos[index]) return;
  activePhotoIndex = index;
  updateLightbox();
  lightbox.showModal();
  document.body.classList.add("is-lightbox-open");
};

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.close();
  document.body.classList.remove("is-lightbox-open");
};

const moveLightbox = (delta) => {
  if (!realPhotos.length) return;
  activePhotoIndex = (activePhotoIndex + delta + realPhotos.length) % realPhotos.length;
  updateLightbox();
};

const createPhotoCard = (item) => {
  if (item.kind === "story") {
    const card = externalLink("photo-card photo-story-link", item.sourceUrl);

    const kicker = document.createElement("span");
    kicker.className = "photo-story-kicker";
    kicker.textContent = "Фото и видео";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const meta = document.createElement("span");
    meta.className = "photo-story-meta";
    meta.textContent = item.meta;

    const arrow = document.createElement("span");
    arrow.className = "photo-story-arrow";
    arrow.textContent = "↗";

    card.append(kicker, title, meta, arrow);
    return card;
  }

  const index = realPhotos.findIndex((photo) => photo.id === item.id);
  const card = document.createElement("button");
  card.className = "photo-card photo-open";
  card.type = "button";
  card.setAttribute("aria-label", `Открыть фотографию: ${item.alt}`);
  card.addEventListener("click", () => openLightbox(index));

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.sizes = "(max-width: 620px) 100vw, (max-width: 980px) 50vw, 40vw";

  image.addEventListener("error", () => {
    if (item.fallbackImage && image.src !== item.fallbackImage) {
      image.src = item.fallbackImage;
      return;
    }
    card.remove();
  });

  card.append(image);
  return card;
};

const createArchiveCard = (item, index) => {
  const card = externalLink("archive-card archive-cover-card", item.url);
  card.setAttribute("aria-label", `${item.title}. Открыть альбом`);

  const image = document.createElement("img");
  image.className = "archive-card-cover";
  image.src = item.cover;
  image.alt = item.coverAlt ?? "";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => card.classList.add("is-cover-error"), { once: true });

  const shade = document.createElement("span");
  shade.className = "archive-card-shade";
  shade.setAttribute("aria-hidden", "true");

  const top = document.createElement("div");
  top.className = "archive-card-top";

  const number = document.createElement("span");
  number.className = "archive-card-index";
  number.textContent = String(index + 1).padStart(2, "0");

  const provider = document.createElement("span");
  provider.className = "archive-card-provider";
  provider.textContent = item.provider;
  top.append(number, provider);

  const body = document.createElement("div");
  body.className = "archive-card-body";

  const title = document.createElement("h4");
  title.textContent = item.title;

  const meta = document.createElement("p");
  meta.textContent = item.meta;

  const cta = document.createElement("span");
  cta.className = "archive-card-cta";
  cta.textContent = "Открыть альбом";

  body.append(title, meta, cta);

  const arrow = document.createElement("span");
  arrow.className = "archive-card-arrow";
  arrow.textContent = "↗";

  card.append(image, shade, top, body, arrow);
  return card;
};

if (photoMosaic) {
  photoMosaic.replaceChildren(...photoRegistry.verifiedMedia.map(createPhotoCard));
}

if (photoCollectionsNode) {
  photoCollectionsNode.replaceChildren(...photoRegistry.photoCollections.map(createArchiveCard));
}

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => moveLightbox(-1));
lightboxNext?.addEventListener("click", () => moveLightbox(1));
lightbox?.addEventListener("close", () => document.body.classList.remove("is-lightbox-open"));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});
