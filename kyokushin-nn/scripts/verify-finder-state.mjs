import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class EventTargetMock {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.target ??= this;
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
    return true;
  }
}

class ClassListMock {
  constructor(active = false) {
    this.values = new Set(active ? ["is-active"] : []);
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    if (force) this.values.add(value);
    else this.values.delete(value);
  }
}

const makeFilterGroup = (key, values) => {
  const group = new EventTargetMock();
  group.buttons = values.map((value, index) => {
    const button = new EventTargetMock();
    button.dataset = { [key]: value };
    button.classList = new ClassListMock(index === 0);
    button.setAttribute = () => {};
    button.click = () => {
      group.buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      group.dispatchEvent({ type: "click", target: button });
    };
    return button;
  });
  group.querySelectorAll = () => group.buttons;
  return group;
};

const cityFilters = makeFilterGroup("city", ["all", "Нижний Новгород", "Дзержинск"]);
const dayFilters = makeFilterGroup("day", ["all", "Пн", "Вт", "Сб"]);
const search = new EventTargetMock();
search.value = "";
const groups = { scrollIntoView: () => {} };
const reset = new EventTargetMock();
const emptyReset = new EventTargetMock();
const documentMock = new EventTargetMock();

documentMock.querySelector = (selector) => ({
  "#searchInput": search,
  "#groups": groups,
  "#resetFilters": reset,
  "#emptyReset": emptyReset,
  "#cityFilters": cityFilters,
  "#dayFilters": dayFilters
})[selector] ?? null;

const windowMock = new EventTargetMock();
windowMock.location = { href: "https://example.test/?city=%D0%94%D0%B7%D0%B5%D1%80%D0%B6%D0%B8%D0%BD%D1%81%D0%BA&day=%D0%92%D1%82&q=%D0%9F%D0%BE%D0%BF%D0%BE%D0%B2%D0%B0#groups" };
windowMock.matchMedia = () => ({ matches: false });
windowMock.history = {
  replaceState(_state, _title, value) {
    windowMock.location.href = String(value);
  }
};

const context = {
  URL,
  Event: class EventMock {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = options.bubbles ?? false;
      this.target = null;
    }
  },
  document: documentMock,
  window: windowMock,
  requestAnimationFrame: (callback) => callback(),
  instructors: [
    { name: "Андрей Коннов" },
    { name: "Сергей Жуков" }
  ]
};
vm.createContext(context);

const finder = await readFile(new URL("../finder.js", import.meta.url), "utf8");
vm.runInContext(finder, context);

const activeValue = (group, key) => group.buttons.find((button) => button.classList.contains("is-active")).dataset[key];

assert.equal(activeValue(cityFilters, "city"), "Дзержинск");
assert.equal(activeValue(dayFilters, "day"), "Вт");
assert.equal(search.value, "Попова");

const saturday = dayFilters.buttons.find((button) => button.dataset.day === "Сб");
saturday.click();
let url = new URL(windowMock.location.href);
assert.equal(url.searchParams.get("city"), "Дзержинск");
assert.equal(url.searchParams.get("day"), "Сб");
assert.equal(url.searchParams.get("q"), "Попова");
assert.equal(url.hash, "#groups");

search.value = "";
search.dispatchEvent({ type: "input", target: search });
url = new URL(windowMock.location.href);
assert.equal(url.searchParams.has("q"), false);

const trainerControl = {
  dataset: { trainerFilter: "Андрей Коннов" },
  closest: (selector) => selector === "[data-trainer-filter]" ? trainerControl : null
};
documentMock.dispatchEvent({
  type: "click",
  target: trainerControl,
  preventDefault: () => {}
});
url = new URL(windowMock.location.href);
assert.equal(search.value, "Андрей Коннов");
assert.equal(url.searchParams.get("trainer"), "Андрей Коннов");
assert.equal(url.searchParams.has("q"), false);

windowMock.location.href = "https://example.test/?city=%D0%9D%D0%B8%D0%B6%D0%BD%D0%B8%D0%B9+%D0%9D%D0%BE%D0%B2%D0%B3%D0%BE%D1%80%D0%BE%D0%B4&day=%D0%9F%D0%BD&q=%D0%A8%D0%BA%D0%BE%D0%BB%D0%B0#groups";
windowMock.dispatchEvent({ type: "popstate" });
assert.equal(activeValue(cityFilters, "city"), "Нижний Новгород");
assert.equal(activeValue(dayFilters, "day"), "Пн");
assert.equal(search.value, "Школа");

console.log("verify-finder-state: PASS");
