const rosterNode = document.querySelector("#trainerRoster");

const rosterPhotoRegistry = window.KYOKUSHIN_MEDIA?.trainerPhotos ?? {};

const trainerProfileMeta = {
  "Сергей Жуков": {
    role: "Инструктор",
    note: "Нижний Новгород"
  },
  "Андрей Троцко": {
    role: "Инструктор · президент федерации",
    note: "Нижний Новгород"
  },
  "Владимир Жуков": {
    role: "Инструктор · спортсмен",
    note: "СПЦ «Фулл Контакт»"
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
    note: "СПЦ «Фулл Контакт»"
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

const hasPortrait = (instructor) => {
  const photo = rosterPhotoRegistry[instructor.name];
  return photo?.kind === "person" && photo.person === instructor.name;
};

const makeFact = (value, label) => {
  const fact = document.createElement("span");
  const number = document.createElement("strong");
  number.textContent = String(value);
  fact.append(number, document.createTextNode(label));
  return fact;
};

const makeRosterCard = (instructor, index) => {
  const card = document.createElement("article");
  card.className = "roster-card";
  card.id = trainerAnchor(instructor.name);

  const photo = rosterPhotoRegistry[instructor.name];
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
    image.src = photo.image;
    image.alt = instructor.name;
    image.loading = index < 2 ? "eager" : "lazy";
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

  const venueCount = instructor.venues.length;
  const venueLabel = venueCount === 1 ? "зал" : venueCount < 5 ? "зала" : "залов";
  const cityCount = new Set(instructor.venues.map((venue) => venue.city)).size;
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
  const data = halls.dataset;
  data.trainerFilter = instructor.name;
  halls.textContent = "Показать секции ↘";
  halls.setAttribute("aria-label", `Показать секции тренера ${instructor.name}`);

  actions.append(call, halls);
  body.append(role, title, note, facts, actions);
  card.append(media, body);
  return card;
};

if (rosterNode && typeof instructors !== "undefined") {
  const rosterInstructors = [...instructors].sort((left, right) => Number(hasPortrait(right)) - Number(hasPortrait(left)));
  rosterNode.replaceChildren(...rosterInstructors.map(makeRosterCard));
}
