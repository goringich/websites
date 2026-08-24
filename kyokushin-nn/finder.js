const finderSearch = document.querySelector("#searchInput");
const finderGroups = document.querySelector("#groups");
const finderReset = document.querySelector("#resetFilters");
const finderEmptyReset = document.querySelector("#emptyReset");

const finderReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const updateTrainerUrl = (trainerName) => {
  const url = new URL(window.location.href);

  if (trainerName) {
    url.searchParams.set("trainer", trainerName);
    url.hash = "groups";
  } else {
    url.searchParams.delete("trainer");
    if (url.hash === "#groups") url.hash = "";
  }

  window.history.replaceState({}, "", url);
};

const applyTrainerFilter = (trainerName, { scroll = true, updateUrl = true } = {}) => {
  if (!finderSearch || !trainerName) return;

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

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-trainer-filter]");
  if (!control) return;

  event.preventDefault();
  applyTrainerFilter(control.dataset.trainerFilter);
});

const clearTrainerUrl = () => updateTrainerUrl("");
finderReset?.addEventListener("click", clearTrainerUrl);
finderEmptyReset?.addEventListener("click", clearTrainerUrl);

const initialTrainer = new URL(window.location.href).searchParams.get("trainer");
if (initialTrainer && typeof instructors !== "undefined" && instructors.some((item) => item.name === initialTrainer)) {
  applyTrainerFilter(initialTrainer, { scroll: false, updateUrl: false });
}
