const finderSearch = document.querySelector("#searchInput");
const finderGroups = document.querySelector("#groups");
const finderReset = document.querySelector("#resetFilters");
const finderEmptyReset = document.querySelector("#emptyReset");
const finderCityFilters = document.querySelector("#cityFilters");
const finderDayFilters = document.querySelector("#dayFilters");

const finderReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let finderHydrating = false;

const hasInstructor = (trainerName) => typeof instructors !== "undefined"
  && instructors.some((item) => item.name === trainerName);

const getFilterButtons = (container, key) => container
  ? [...container.querySelectorAll(`[data-${key}]`)]
  : [];

const getActiveFilter = (container, key) => {
  const active = getFilterButtons(container, key)
    .find((button) => button.classList.contains("is-active"));

  return active?.dataset[key] ?? "all";
};

const clickFilter = (container, key, value) => {
  const buttons = getFilterButtons(container, key);
  const target = buttons.find((button) => button.dataset[key] === value)
    ?? buttons.find((button) => button.dataset[key] === "all");

  target?.click();
};

const replaceFinderUrl = (url) => {
  window.history.replaceState({}, "", url);
};

const updateFinderUrlFromControls = () => {
  if (finderHydrating) return;

  const url = new URL(window.location.href);
  const city = getActiveFilter(finderCityFilters, "city");
  const day = getActiveFilter(finderDayFilters, "day");
  const query = finderSearch?.value.trim() ?? "";
  const currentTrainer = url.searchParams.get("trainer");

  if (city === "all") url.searchParams.delete("city");
  else url.searchParams.set("city", city);

  if (day === "all") url.searchParams.delete("day");
  else url.searchParams.set("day", day);

  if (currentTrainer && currentTrainer === query && hasInstructor(currentTrainer)) {
    url.searchParams.delete("q");
  } else {
    url.searchParams.delete("trainer");
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
  }

  const hasFilters = ["city", "day", "q", "trainer"]
    .some((key) => url.searchParams.has(key));
  if (hasFilters) url.hash = "groups";

  replaceFinderUrl(url);
};

const updateTrainerUrl = (trainerName) => {
  const url = new URL(window.location.href);

  if (trainerName && hasInstructor(trainerName)) {
    url.searchParams.set("trainer", trainerName);
    url.searchParams.delete("q");
    url.hash = "groups";
  } else {
    url.searchParams.delete("trainer");
    if (url.hash === "#groups" && !["city", "day", "q"].some((key) => url.searchParams.has(key))) {
      url.hash = "";
    }
  }

  replaceFinderUrl(url);
};

const applyTrainerFilter = (trainerName, { scroll = true, updateUrl = true } = {}) => {
  if (!finderSearch || !trainerName || !hasInstructor(trainerName)) return;

  finderSearch.value = trainerName;
  finderSearch.dispatchEvent(new Event("input", { bubbles: true }));

  if (updateUrl) updateTrainerUrl(trainerName);

  if (scroll && finderGroups) {
    requestAnimationFrame(() => {
      finderGroups.scrollIntoView({
        behavior: finderReducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });
    });
  }
};

const hydrateFinderFromUrl = () => {
  const url = new URL(window.location.href);
  const city = url.searchParams.get("city") ?? "all";
  const day = url.searchParams.get("day") ?? "all";
  const trainer = url.searchParams.get("trainer");
  const query = url.searchParams.get("q") ?? "";

  finderHydrating = true;
  clickFilter(finderCityFilters, "city", city);
  clickFilter(finderDayFilters, "day", day);

  if (trainer && hasInstructor(trainer)) {
    applyTrainerFilter(trainer, { scroll: false, updateUrl: false });
  } else if (finderSearch) {
    finderSearch.value = query;
    finderSearch.dispatchEvent(new Event("input", { bubbles: true }));
  }
  finderHydrating = false;
};

const clearFinderUrl = () => {
  const url = new URL(window.location.href);
  ["city", "day", "q", "trainer"].forEach((key) => url.searchParams.delete(key));
  if (url.hash === "#groups") url.hash = "";
  replaceFinderUrl(url);
};

hydrateFinderFromUrl();

finderCityFilters?.addEventListener("click", updateFinderUrlFromControls);
finderDayFilters?.addEventListener("click", updateFinderUrlFromControls);
finderSearch?.addEventListener("input", updateFinderUrlFromControls);

finderReset?.addEventListener("click", clearFinderUrl);
finderEmptyReset?.addEventListener("click", clearFinderUrl);

window.addEventListener("popstate", hydrateFinderFromUrl);

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-trainer-filter]");
  if (!control) return;

  event.preventDefault();
  applyTrainerFilter(control.dataset.trainerFilter);
});

window.KYOKUSHIN_FINDER_READY = true;
