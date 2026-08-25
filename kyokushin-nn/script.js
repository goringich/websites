let instructors = Array.isArray(window.KYOKUSHIN_CONTENT?.instructors)
  ? window.KYOKUSHIN_CONTENT.instructors
  : [];

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

const normalize = (value) => String(value ?? "")
  .toLocaleLowerCase("ru-RU")
  .replace(/ё/g, "е")
  .replace(/[^а-яa-z0-9№+]+/gi, " ")
  .trim();

const phoneHref = (phone) => `tel:${String(phone).replace(/[^+\d]/g, "")}`;

const mapHref = (venue) => {
  const query = `${venue.city}, ${venue.address}, ${venue.name}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(query)}`;
};

const venueMatches = (instructor, venue) => {
  const cityMatches = state.city === "all" || venue.city === state.city;
  const dayMatches = state.day === "all" || (venue.days ?? []).includes(state.day);
  const haystack = normalize([
    instructor.name,
    instructor.phone,
    venue.city,
    venue.name,
    venue.address,
    ...(venue.schedule ?? []).flatMap((item) => [item.days, item.time])
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
  const rows = Array.isArray(venue.schedule) ? venue.schedule : [];

  if (!rows.length) {
    const unknown = document.createElement("p");
    unknown.className = "schedule-unknown";
    unknown.textContent = "Расписание уточняйте у инструктора";
    schedule.append(unknown);
    return schedule;
  }

  rows.forEach((item) => {
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
  card.dataset.instructor = instructor.name;

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
  if (mod10 === 1 && mod100 !== 11) return `${count} зал`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} зала`;
  return `${count} залов`;
};

const render = () => {
  if (!elements.list || !Array.isArray(instructors) || !instructors.length) return;

  elements.list.replaceChildren();
  let venueCount = 0;
  let visibleInstructorIndex = 0;

  instructors.forEach((instructor) => {
    const venues = (instructor.venues ?? []).filter((venue) => venueMatches(instructor, venue));
    if (!venues.length) return;

    venueCount += venues.length;
    elements.list.append(renderInstructor(instructor, venues, visibleInstructorIndex));
    visibleInstructorIndex += 1;
  });

  if (elements.resultCount) elements.resultCount.textContent = pluralizeVenues(venueCount);
  if (elements.emptyState) elements.emptyState.hidden = venueCount !== 0;
  elements.list.hidden = venueCount === 0;
  if (elements.reset) elements.reset.hidden = state.city === "all" && state.day === "all" && !state.query;

  window.dispatchEvent(new CustomEvent("kyokushin:directory-rendered", {
    detail: { instructors: visibleInstructorIndex, venues: venueCount }
  }));
};

const setActiveChip = (container, selector, value) => {
  if (!container) return;
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
  if (elements.search) elements.search.value = "";
  setActiveChip(elements.cityFilters, "city", "all");
  setActiveChip(elements.dayFilters, "day", "all");
  render();
};

elements.cityFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-city]");
  if (!button) return;
  state.city = button.dataset.city;
  setActiveChip(elements.cityFilters, "city", state.city);
  render();
});

elements.dayFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (!button) return;
  state.day = button.dataset.day;
  setActiveChip(elements.dayFilters, "day", state.day);
  render();
});

elements.search?.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.reset?.addEventListener("click", resetFilters);
elements.emptyReset?.addEventListener("click", resetFilters);

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

  if (event.key === "/" && !isTyping && elements.search) {
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

if (elements.year) elements.year.textContent = new Date().getFullYear();

const applyDirectoryContent = (content) => {
  if (!Array.isArray(content?.instructors)) return false;
  instructors = content.instructors;
  render();
  return true;
};

window.KYOKUSHIN_APP = {
  applyContent: applyDirectoryContent,
  getInstructors: () => instructors,
  render,
  resetFilters
};

if (instructors.length) render();
