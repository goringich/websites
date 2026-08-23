const instructors = [
  {
    name: "Сергей Жуков",
    phone: "+7 987 557-31-49",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №44",
        address: "ул. Надежды Сусловой, 5к3",
        days: ["Вт", "Чт"],
        schedule: [
          { days: "Вт", time: "17:30–18:30" },
          { days: "Чт", time: "17:30–18:30" }
        ]
      }
    ]
  },
  {
    name: "Андрей Троцко",
    phone: "+7 920 036-48-99",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №35",
        address: "ул. Фруктовая, 8",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "17:30–19:00" },
          { days: "Чт", time: "17:30–19:00" },
          { days: "Сб", time: "14:00–15:30" }
        ]
      },
      {
        city: "Нижний Новгород",
        name: "Школа №55",
        address: "ул. С. Есенина, 37",
        days: ["Пн", "Ср", "Пт"],
        schedule: [
          { days: "Пн", time: "17:00–18:30" },
          { days: "Ср", time: "17:00–18:30" },
          { days: "Пт", time: "17:00–18:30" }
        ]
      }
    ]
  },
  {
    name: "Владимир Жуков",
    phone: "+7 986 752-63-84",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №110",
        address: "ул. Сергея Акимова, 35",
        days: ["Пн", "Ср", "Пт"],
        schedule: [
          { days: "Пн", time: "19:00–20:00" },
          { days: "Ср", time: "18:30–19:30" },
          { days: "Пт", time: "19:00–20:00" }
        ]
      },
      {
        city: "Нижний Новгород",
        name: "Школа №14",
        address: "Холодный пер., 15А",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "17:00–18:00" },
          { days: "Чт", time: "17:00–18:00" },
          { days: "Сб", time: "15:00–16:00" }
        ]
      },
      {
        city: "Нижний Новгород",
        name: "СПЦ «Фулл Контакт»",
        address: "ул. Германа Лопатина, 12к1",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "19:00–20:00" },
          { days: "Чт", time: "19:00–20:00" },
          { days: "Сб", time: "13:00–14:00" }
        ]
      }
    ]
  },
  {
    name: "Дарья Осинина",
    phone: "+7 920 065-43-42",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №3",
        address: "ул. Маслякова, 1",
        days: ["Пн", "Ср", "Сб"],
        schedule: [
          { days: "Пн", time: "19:00–20:00" },
          { days: "Ср", time: "19:00–20:00" },
          { days: "Сб", time: "17:00–18:00" }
        ]
      }
    ]
  },
  {
    name: "Юлия Фролова",
    phone: "+7 920 044-08-18",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №140",
        address: "ул. Ветлужская, 2/2Б",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "18:00–20:00" },
          { days: "Чт", time: "18:00–20:00" },
          { days: "Сб", time: "14:30–15:30" }
        ]
      },
      {
        city: "Нижний Новгород",
        name: "Семейный клуб «Союз»",
        address: "д. Крутая, ул. Изумрудная, д. 13",
        days: ["Ср", "Сб"],
        schedule: [
          { days: "Ср", time: "17:30–19:30" },
          { days: "Сб", time: "10:00–12:00" }
        ]
      }
    ]
  },
  {
    name: "Иван Гаврилин",
    phone: "+7 920 017-85-50",
    venues: [
      {
        city: "Нижний Новгород",
        name: "ЖК «Анкудиновский парк» · ДС №45",
        address: "ул. Черкесская, д. 4, стр. 1",
        days: ["Пн", "Ср", "Сб"],
        schedule: [
          { days: "Пн", time: "17:30–18:30, 18:30–19:30" },
          { days: "Ср", time: "17:30–18:30" },
          { days: "Сб", time: "16:00–17:00, 17:00–18:00" }
        ]
      }
    ]
  },
  {
    name: "Сергей Глухов",
    phone: "+7 920 250-70-77",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Детский клуб «Юность»",
        address: "ул. Чаадаева, 30А",
        days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        schedule: [
          { days: "Пн / Ср / Пт", time: "17:00–18:00, 19:00–20:30" },
          { days: "Вт / Чт", time: "16:00–17:00, 18:00–20:00" },
          { days: "Сб", time: "12:00–13:00, 13:30–15:30" }
        ]
      }
    ]
  },
  {
    name: "Сергей Захаров",
    phone: "+7 910 146-84-28",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Клуб «Восток»",
        address: "ул. Смирнова, 13А",
        days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        schedule: [
          { days: "Пн–Сб", time: "16:00–17:00" },
          { days: "Пн–Сб", time: "17:10–18:10" },
          { days: "Пн–Сб", time: "18:20–19:20" },
          { days: "Пн–Сб", time: "19:30–20:30" }
        ]
      }
    ]
  },
  {
    name: "Андрей Коннов",
    phone: "+7 930 813-78-20",
    venues: [
      {
        city: "Дзержинск",
        name: "Школа №20",
        address: "ул. Попова, 26А",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "18:00–19:00" },
          { days: "Чт", time: "18:00–19:00" },
          { days: "Сб", time: "16:00–17:00" }
        ]
      },
      {
        city: "Дзержинск",
        name: "Клуб киокушинкай",
        address: "ул. Циолковского, 72",
        days: ["Пн", "Ср", "Пт"],
        schedule: [
          { days: "Пн", time: "17:00–20:00" },
          { days: "Ср", time: "17:00–20:00" },
          { days: "Пт", time: "17:00–20:00" }
        ]
      }
    ]
  },
  {
    name: "Георгий Пигиданов",
    phone: "+7 910 141-46-95",
    venues: [
      {
        city: "Нижний Новгород",
        name: "СПЦ «Фулл Контакт»",
        address: "ул. Германа Лопатина, 12к1",
        days: ["Пн", "Ср", "Пт"],
        schedule: [
          { days: "Пн", time: "18:00–19:00" },
          { days: "Ср", time: "18:00–19:00" },
          { days: "Пт", time: "18:00–19:00" }
        ]
      },
      {
        city: "Нижний Новгород",
        name: "Школа №51",
        address: "ул. Генерала Зимина, 75",
        days: ["Вт", "Чт", "Сб"],
        schedule: [
          { days: "Вт", time: "18:00–19:00" },
          { days: "Чт", time: "18:00–19:00" },
          { days: "Сб", time: "12:00–13:00" }
        ]
      }
    ]
  },
  {
    name: "Кирилл Антоневич",
    phone: "+7 904 781-78-88",
    venues: [
      {
        city: "Нижний Новгород",
        name: "Школа №22",
        address: "ул. Верхне-Печёрская, 5А",
        days: [],
        schedule: []
      },
      {
        city: "Нижний Новгород",
        name: "Школа №7",
        address: "ул. Верхне-Печёрская, 4А",
        days: [],
        schedule: []
      }
    ]
  }
];

const state = {
  city: "all",
  day: "all",
  query: ""
};

const elements = {
  list: document.querySelector("#instructorList"),
  resultCount: document.querySelector("#resultCount"),
  search: document.querySelector("#searchInput"),
  cityFilters: document.querySelector("#cityFilters"),
  dayFilters: document.querySelector("#dayFilters"),
  reset: document.querySelector("#resetFilters"),
  emptyState: document.querySelector("#emptyState"),
  emptyReset: document.querySelector("#emptyReset"),
  year: document.querySelector("#year")
};

const normalize = (value) => value
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/[^а-яa-z0-9№+]+/gi, " ")
  .trim();

const phoneHref = (phone) => `tel:${phone.replace(/[^+\d]/g, "")}`;

const mapHref = (venue) => {
  const query = `${venue.city}, ${venue.address}, ${venue.name}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
};

const venueMatches = (instructor, venue) => {
  const cityMatches = state.city === "all" || venue.city === state.city;
  const dayMatches = state.day === "all" || venue.days.includes(state.day);
  const haystack = normalize([
    instructor.name,
    instructor.phone,
    venue.city,
    venue.name,
    venue.address,
    ...venue.schedule.flatMap((item) => [item.days, item.time])
  ].join(" "));
  const searchMatches = !state.query || haystack.includes(normalize(state.query));

  return cityMatches && dayMatches && searchMatches;
};

const makeLink = ({ className, href, text, external = false }) => {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.textContent = text;

  if (external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
};

const renderSchedule = (venue) => {
  const schedule = document.createElement("div");
  schedule.className = "schedule";

  if (!venue.schedule.length) {
    const unknown = document.createElement("p");
    unknown.className = "schedule-unknown";
    unknown.textContent = "Расписание уточняйте у инструктора";
    schedule.append(unknown);
    return schedule;
  }

  venue.schedule.forEach((item) => {
    const row = document.createElement("div");
    row.className = "schedule-row";

    const days = document.createElement("span");
    days.className = "schedule-days";
    days.textContent = item.days;

    const time = document.createElement("span");
    time.className = "schedule-time";
    time.textContent = item.time;

    row.append(days, time);
    schedule.append(row);
  });

  return schedule;
};

const renderVenue = (instructor, venue) => {
  const card = document.createElement("article");
  card.className = "venue-card";

  const main = document.createElement("div");
  main.className = "venue-main";

  const city = document.createElement("span");
  city.className = "venue-city";
  city.textContent = venue.city;

  const title = document.createElement("h4");
  title.textContent = venue.name;

  const address = document.createElement("p");
  address.className = "venue-address";
  address.textContent = venue.address;

  const actions = document.createElement("div");
  actions.className = "venue-actions";
  actions.append(
    makeLink({
      className: "mini-button call",
      href: phoneHref(instructor.phone),
      text: "Позвонить"
    }),
    makeLink({
      className: "mini-button",
      href: mapHref(venue),
      text: "На карте ↗",
      external: true
    })
  );

  main.append(city, title, address, actions);
  card.append(main, renderSchedule(venue));
  return card;
};

const renderInstructor = (instructor, venues, index) => {
  const card = document.createElement("section");
  card.className = "instructor-card";

  const panel = document.createElement("div");
  panel.className = "instructor-panel";

  const number = document.createElement("span");
  number.className = "instructor-index";
  number.textContent = String(index + 1).padStart(2, "0");

  const title = document.createElement("h3");
  title.textContent = instructor.name;

  const phone = makeLink({
    className: "instructor-phone",
    href: phoneHref(instructor.phone),
    text: instructor.phone
  });

  panel.append(number, title, phone);

  const venueList = document.createElement("div");
  venueList.className = "venue-list";
  venues.forEach((venue) => venueList.append(renderVenue(instructor, venue)));

  card.append(panel, venueList);
  return card;
};

const pluralizeVenues = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} зал`;
  }

  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return `${count} зала`;
  }

  return `${count} залов`;
};

const render = () => {
  elements.list.replaceChildren();
  let venueCount = 0;
  let visibleInstructorIndex = 0;

  instructors.forEach((instructor) => {
    const venues = instructor.venues.filter((venue) => venueMatches(instructor, venue));
    if (!venues.length) {
      return;
    }

    venueCount += venues.length;
    elements.list.append(renderInstructor(instructor, venues, visibleInstructorIndex));
    visibleInstructorIndex += 1;
  });

  elements.resultCount.textContent = pluralizeVenues(venueCount);
  elements.emptyState.hidden = venueCount !== 0;
  elements.list.hidden = venueCount === 0;
  elements.reset.hidden = state.city === "all" && state.day === "all" && !state.query;
};

const setActiveChip = (container, selector, value) => {
  container.querySelectorAll(".chip").forEach((button) => {
    const active = button.dataset[selector] === value;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

const resetFilters = () => {
  state.city = "all";
  state.day = "all";
  state.query = "";
  elements.search.value = "";
  setActiveChip(elements.cityFilters, "city", "all");
  setActiveChip(elements.dayFilters, "day", "all");
  render();
};

elements.cityFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-city]");
  if (!button) {
    return;
  }

  state.city = button.dataset.city;
  setActiveChip(elements.cityFilters, "city", state.city);
  render();
});

elements.dayFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (!button) {
    return;
  }

  state.day = button.dataset.day;
  setActiveChip(elements.dayFilters, "day", state.day);
  render();
});

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.reset.addEventListener("click", resetFilters);
elements.emptyReset.addEventListener("click", resetFilters);

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    elements.search.focus();
  }

  if (event.key === "Escape" && document.activeElement === elements.search) {
    elements.search.value = "";
    state.query = "";
    elements.search.blur();
    render();
  }
});

elements.year.textContent = new Date().getFullYear();
render();
