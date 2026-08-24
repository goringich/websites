const rosterNode = document.querySelector("#trainerRoster");

let teamContent = window.KYOKUSHIN_CONTENT ?? null;

const rosterInitials = (name) => String(name)
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2);

const phoneLink = (phone) => `tel:${String(phone).replace(/[^+\d]/g, "")}`;

const trainerAnchor = (name) => `trainer-${String(name)
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/[^а-яa-z0-9]+/gi, "-")
  .replace(/^-|-$/g, "")}`;

const makeFact = (value, label) => {
  const fact = document.createElement("span");
  const number = document.createElement("strong");
  number.textContent = String(value);
  fact.append(number, document.createTextNode(label));
  return fact;
};

const hasPortrait = (instructor) => Boolean(
  instructor?.photo?.src && instructor?.photo?.sourceUrl
);

const makeRosterCard = (instructor, index) => {
  const card = document.createElement("article");
  card.className = "roster-card";
  card.id = trainerAnchor(instructor.name);

  const hasVerifiedPortrait = hasPortrait(instructor);
  card.dataset.portrait = hasVerifiedPortrait ? "verified" : "pending";
  if (hasVerifiedPortrait) card.classList.add("roster-card-featured");

  const media = document.createElement("div");
  media.className = "roster-media";

  const fallback = document.createElement("span");
  fallback.className = "roster-initials";
  fallback.textContent = rosterInitials(instructor.name);
  media.append(fallback);

  if (hasVerifiedPortrait) {
    const image = document.createElement("img");
    image.className = "roster-photo";
    image.src = instructor.photo.src;
    image.alt = instructor.name;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    image.style.objectPosition = instructor.photo.position ?? "50% 35%";
    image.addEventListener("error", () => {
      image.remove();
      card.dataset.portrait = "pending";
      card.classList.remove("roster-card-featured");
    }, { once: true });
    media.prepend(image);
  }

  const number = document.createElement("span");
  number.className = "roster-number";
  number.textContent = String(index + 1).padStart(2, "0");
  media.append(number);

  const body = document.createElement("div");
  body.className = "roster-body";

  const role = document.createElement("p");
  role.className = "roster-role";
  role.textContent = instructor.role || "Инструктор";

  const title = document.createElement("h3");
  title.textContent = instructor.name;

  const note = document.createElement("p");
  note.className = "roster-note";
  note.textContent = instructor.note || instructor.venues?.[0]?.city || "Нижегородская область";

  const facts = document.createElement("div");
  facts.className = "roster-facts";

  const venueCount = instructor.venues?.length ?? 0;
  const venueLabel = venueCount === 1 ? "зал" : venueCount < 5 ? "зала" : "залов";
  const cityCount = new Set((instructor.venues ?? []).map((venue) => venue.city)).size;
  const cityLabel = cityCount === 1 ? "город" : "города";
  facts.append(makeFact(venueCount, venueLabel), makeFact(cityCount, cityLabel));

  const actions = document.createElement("div");
  actions.className = "roster-actions";

  const call = document.createElement("a");
  call.className = "roster-call";
  call.href = phoneLink(instructor.phone);
  call.textContent = instructor.phone;
  call.setAttribute("aria-label", `Позвонить тренеру ${instructor.name}`);

  const halls = document.createElement("a");
  halls.className = "roster-halls";
  halls.href = "#groups";
  halls.dataset.trainerFilter = instructor.name;
  halls.textContent = "Показать секции ↘";
  halls.setAttribute("aria-label", `Показать секции тренера ${instructor.name}`);

  actions.append(call, halls);

  for (const item of instructor.links ?? []) {
    const link = document.createElement("a");
    link.className = "roster-external";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.label;
    actions.append(link);
  }

  body.append(role, title, note, facts, actions);
  card.append(media, body);
  return card;
};

const renderTeam = () => {
  const people = teamContent?.instructors;
  if (!rosterNode || !Array.isArray(people) || !people.length) return;
  const ordered = [...people].sort((left, right) => Number(hasPortrait(right)) - Number(hasPortrait(left)));
  rosterNode.replaceChildren(...ordered.map(makeRosterCard));
};

window.KYOKUSHIN_TEAM = {
  applyContent(content) {
    if (!Array.isArray(content?.instructors)) return false;
    teamContent = content;
    renderTeam();
    return true;
  },
  render: renderTeam
};

renderTeam();
