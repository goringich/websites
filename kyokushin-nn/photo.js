const photoMosaic = document.querySelector("#photoMosaic");
const photoCollectionsNode = document.querySelector("#photoCollections");

let photoContent = window.KYOKUSHIN_CONTENT ?? null;

const externalLink = (className, href) => {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
};

const createStoryCard = (item) => {
  const card = externalLink("photo-card photo-story-link", item.sourceUrl);
  const kicker = document.createElement("span");
  kicker.className = "photo-story-kicker";
  kicker.textContent = "Керженец";

  const title = document.createElement("strong");
  title.textContent = item.title || "Материалы лагеря";

  const meta = document.createElement("span");
  meta.className = "photo-story-meta";
  meta.textContent = item.meta || "Красный Плёс";

  const arrow = document.createElement("span");
  arrow.className = "photo-story-arrow";
  arrow.textContent = "↗";

  card.append(kicker, title, meta, arrow);
  return card;
};

const createVideoCard = (item) => {
  const card = externalLink("photo-card photo-video-card", item.sourceUrl || item.src);
  card.setAttribute("aria-label", `${item.title || item.alt || "Видео со сборов"}. Открыть источник`);

  const video = document.createElement("video");
  video.className = "photo-video";
  video.src = item.src;
  if (item.poster) video.poster = item.poster;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-hidden", "true");

  const overlay = document.createElement("span");
  overlay.className = "photo-video-overlay";

  const title = document.createElement("strong");
  title.className = "photo-video-title";
  title.textContent = item.title || "Сборы на Керженце";

  const badge = document.createElement("span");
  badge.className = "photo-video-badge";
  badge.textContent = "Видео ↗";

  card.addEventListener("mouseenter", () => video.play().catch(() => {}));
  card.addEventListener("mouseleave", () => video.pause());
  card.append(video, overlay, title, badge);
  return card;
};

const createImageCard = (item) => {
  const card = externalLink("photo-card photo-image-card", item.sourceUrl || item.src);
  const image = document.createElement("img");
  image.src = item.src;
  image.alt = item.alt || item.title || "Сборы на Керженце";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => card.remove(), { once: true });
  card.append(image);
  return card;
};

const createPhotoCard = (item) => {
  if (item.type === "video") return createVideoCard(item);
  if (item.type === "image") return createImageCard(item);
  return createStoryCard(item);
};

const createArchiveCard = (item, index) => {
  const card = externalLink("archive-card", item.url);
  card.setAttribute("aria-label", `${item.title}. Открыть материал`);

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

const renderPhotoContent = () => {
  if (photoMosaic) {
    const items = Array.isArray(photoContent?.gallery) ? photoContent.gallery : [];
    photoMosaic.replaceChildren(...items.map(createPhotoCard));
  }

  if (photoCollectionsNode) {
    const reports = Array.isArray(photoContent?.photoReports) ? photoContent.photoReports : [];
    photoCollectionsNode.replaceChildren(...reports.map(createArchiveCard));
  }
};

window.KYOKUSHIN_PHOTO = {
  applyContent(content) {
    photoContent = content;
    renderPhotoContent();
    return true;
  },
  render: renderPhotoContent
};

renderPhotoContent();
