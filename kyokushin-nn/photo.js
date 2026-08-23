const photoRegistry = window.KYOKUSHIN_MEDIA ?? {
  verifiedMedia: [],
  photoCollections: []
};

const photoMosaic = document.querySelector("#photoMosaic");
const photoCollectionsNode = document.querySelector("#photoCollections");

const externalLink = (className, href, text) => {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
};

const createPhotoCard = (item) => {
  const card = document.createElement("figure");
  card.className = "photo-card";

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => card.classList.add("is-image-error"), { once: true });

  const caption = document.createElement("figcaption");
  const copy = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = item.title;
  const source = document.createElement("div");
  source.className = "photo-source";
  source.textContent = item.sourceLabel;
  copy.append(title, source);

  const sourceLink = externalLink("photo-source-link", item.sourceUrl, "Источник ↗");
  caption.append(copy, sourceLink);
  card.append(image, caption);
  return card;
};

const createArchiveCard = (item, index) => {
  const card = externalLink("archive-card", item.url, "");

  const number = document.createElement("span");
  number.className = "archive-card-index";
  number.textContent = String(index + 1).padStart(2, "0");

  const body = document.createElement("div");
  const title = document.createElement("h4");
  title.textContent = item.title;
  const meta = document.createElement("p");
  meta.textContent = item.meta;
  body.append(title, meta);

  const footer = document.createElement("div");
  footer.className = "archive-card-footer";
  const source = document.createElement("span");
  source.textContent = item.source;
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  footer.append(source, arrow);

  card.append(number, body, footer);
  return card;
};

if (photoMosaic) {
  photoMosaic.replaceChildren(...photoRegistry.verifiedMedia.map(createPhotoCard));
}

if (photoCollectionsNode) {
  photoCollectionsNode.replaceChildren(
    ...photoRegistry.photoCollections.map(createArchiveCard)
  );
}
