const rosterNode = document.querySelector("#trainerRoster");

const rosterPhotoRegistry = window.KYOKUSHIN_MEDIA?.trainerPhotos ?? {};

const trainerProfileMeta = {
  "Сергей Жуков": {
    role: "Инструктор · руководство федерации",
    note: "Нижний Новгород"
  },
  "Андрей Троцко": {
    role: "Инструктор · президент федерации",
    note: "Нижний Новгород"
  },
  "Владимир Жуков": {
    role: "Инструктор · мастер спорта России",
    note: "FULL CONTACT · 2 дан"
  },
  "Дарья Осинина": {
    role: "Инструктор",
    note: "Нижний Новгород"
  },
  "Юлия Фролова": {
    role: "Инструктор",
    note: "Нижний Новгород"
  },
  "Иван Гаврилин": {
    role: "Инструктор · спортсмен",
    note: "Нижний Новгород"
  },
  "Сергей Глухов": {
    role: "Инструктор",
    note: "Нижний Новгород"
  },
  "Сергей Захаров": {
    role: "Инструктор",
    note: "Клуб «Восток»"
  },
  "Андрей Коннов": {
    role: "Инструктор",
    note: "Дзержинск"
  },
  "Георгий Пигиданов": {
    role: "Инструктор · мастер спорта России",
    note: "FULL CONTACT"
  },
  "Кирилл Антоневич": {
    role: "Инструктор",
    note: "Мастерская карате"
  }
};

const rosterInitials = (name) => name
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2);

const phoneLink = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;

const trainerAnchor = (name) => `trainer-${name
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/[^а-яa-z0-9]+/gi, "-")
  .replace(/^-|-$/g, "")}`;

const makeRosterCard = (instructor, index) => {
  const card = document.createElement("article");
  card.className = "roster-card";
  card.id = trainerAnchor(instructor.name);

  const photo = rosterPhotoRegistry[instructor.name];
  const hasVerifiedPortrait = photo?.kind === "person" && photo.person === instructor.name;
  card.dataset.portrait = hasVerifiedPortrait ? "verified" : "pending";
  if (index < 2 && hasVerifiedPortrait) card.classList.add("roster-card-featured");

  const media = document.createElement("div");
  media.className = "roster-media";

  const fallback = document.createElement("span");
  fallback.className = "roster-initials";
  fallback.textContent = rosterInitials(instructor.name);
  media.append(fallback);

  if (hasVerifiedPortrait) {
    const image = document.createElement("img");
    image.className = "roster-photo";
    image.src = photo.image;
    image.alt = instructor.name;
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    image.style.objectPosition = photo.position ?? "50% 35%";
    image.addEventListener("error", () => card.dataset.portrait = "pending", { once: true });
    media.prepend(image);
  }

  const number = document.createElement("span");
  number.className = "roster-number";
  number.textContent = String(index + 1).padStart(2, "0");
  media.append(number);

  const body = document.createElement("div");
  body.className = "roster-body";

  const meta = trainerProfileMeta[instructor.name] ?? {
    role: "Инструктор",
    note: instructor.venues[0]?.city ?? "Нижегородская область"
  };

  const role = document.createElement("p");
  role.className = "roster-role";
  role.textContent = meta.role;

  const title = document.createElement("h3");
  title.textContent = instructor.name;

  const note = document.createElement("p");
  note.className = "roster-note";
  note.textContent = meta.note;

  const facts = document.createElement("div");
  facts.className = "roster-facts";

  const venues = document.createElement("span");
  venues.innerHTML = `<strong>${instructor.venues.length}</strong>${instructor.venues.length === 1 ? "зал" : instructor.venues.length < 5 ? "зала" : "залов"}`;

  const cityCount = new Set(instructor.venues.map((venue) => venue.city)).size;
  const cities = document.createElement("span");
  cities.innerHTML = `<strong>${cityCount}</strong>${cityCount === 1 ? "город" : "города"}`;

  facts.append(venues, cities);

  const actions = document.createElement("div");
  actions.className = "roster-actions";

  const call = document.createElement("a");
  call.className = "roster-call";
  call.href = phoneLink(instructor.phone);
  call.textContent = instructor.phone;

  const halls = document.createElement("a");
  halls.className = "roster-halls";
  halls.href = "#groups";
  halls.textContent = "Секции ↘";

  actions.append(call, halls);
  body.append(role, title, note, facts, actions);
  card.append(media, body);
  return card;
};

if (rosterNode && typeof instructors !== "undefined") {
  rosterNode.replaceChildren(...instructors.map(makeRosterCard));
}
