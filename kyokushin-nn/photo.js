const photoRegistry = window.KYOKUSHIN_MEDIA ?? {
  verifiedMedia: [],
  photoCollections: []
};

const photoMosaic = document.querySelector("#photoMosaic");
const photoCollectionsNode = document.querySelector("#photoCollections");

const externalLink = (className, href) => {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
};

const createPhotoCard = (item) => {
  const card = externalLink("photo-card", item.sourceUrl);
  card.setAttribute("aria-label", "Открыть фотографию");

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => card.classList.add("is-image-error"), { once: true });

  card.append(image);
  return card;
};

const createArchiveCard = (item, index) => {
  const card = externalLink("archive-card", item.url);

  const number = document.createElement("span");
  number.className = "archive-card-index";
  number.textContent = String(index + 1).padStart(2, "0");

  const body = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = item.title;
  const meta = document.createElement("p");
  meta.textContent = item.meta;
  body.append(title, meta);

  const arrow = document.createElement("span");
  arrow.className = "archive-card-arrow";
  arrow.textContent = "↗";

  card.append(number, body, arrow);
  return card;
};

if (photoMosaic) {
  photoMosaic.replaceChildren(...photoRegistry.verifiedMedia.map(createPhotoCard));
}

if (photoCollectionsNode) {
  photoCollectionsNode.replaceChildren(...photoRegistry.photoCollections.map(createArchiveCard));
}
