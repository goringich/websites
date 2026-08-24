const REPO = "goringich/websites";
const BRANCH = "project/kyokushin-nn";
const CONTENT_PATH = "kyokushin-nn/content/site.json";
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${CONTENT_PATH}`;
const API_URL = `https://api.github.com/repos/${REPO}/contents/${CONTENT_PATH}`;
const KIRILL = "Кирилл Антоневич";
const KIRILL_ONLY_URL = "https://masterskayakarate.ru/tpost/czhy6ukv31-zhara-2026-kak-eto-bilo";
const EXPECTED_PEOPLE = [
  "Сергей Жуков","Андрей Троцко","Владимир Жуков","Дарья Осинина","Юлия Фролова",
  "Иван Гаврилин","Сергей Глухов","Сергей Захаров","Андрей Коннов","Георгий Пигиданов","Кирилл Антоневич"
];

const ui = {
  status: document.querySelector("#statusText"),
  detail: document.querySelector("#statusDetail"),
  token: document.querySelector("#tokenInput"),
  hero: document.querySelector("#heroEditor"),
  gallery: document.querySelector("#galleryEditor"),
  reports: document.querySelector("#reportsEditor"),
  trainers: document.querySelector("#trainersEditor"),
  raw: document.querySelector("#rawEditor"),
  reload: document.querySelector("#reloadButton"),
  validate: document.querySelector("#validateButton"),
  publish: document.querySelector("#publishButton"),
  addGallery: document.querySelector("#addGalleryButton"),
  addReport: document.querySelector("#addReportButton"),
  applyRaw: document.querySelector("#applyRawButton"),
  dialog: document.querySelector("#resultDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogBody: document.querySelector("#dialogBody"),
  dialogClose: document.querySelector("#dialogClose")
};

let model = null;
let currentSha = null;

const clone = (value) => JSON.parse(JSON.stringify(value));
const setStatus = (text, detail = "", kind = "") => {
  ui.status.textContent = text;
  ui.detail.textContent = detail || CONTENT_PATH;
  ui.status.classList.remove("is-ok", "is-error");
  if (kind) ui.status.classList.add(kind === "ok" ? "is-ok" : "is-error");
};

const showResult = (title, body) => {
  ui.dialogTitle.textContent = title;
  ui.dialogBody.textContent = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  ui.dialog.showModal();
};

const syncRaw = () => {
  if (model) ui.raw.value = `${JSON.stringify(model, null, 2)}\n`;
};

const field = ({ label, value = "", type = "text", full = false, multiline = false, onInput }) => {
  const wrap = document.createElement("div");
  wrap.className = `field${full ? " full" : ""}`;
  const title = document.createElement("label");
  title.textContent = label;
  let input;
  if (multiline) {
    input = document.createElement("textarea");
    input.value = value ?? "";
  } else if (type === "select") {
    input = document.createElement("select");
    for (const optionValue of ["video", "image", "story"]) {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      option.selected = optionValue === value;
      input.append(option);
    }
  } else {
    input = document.createElement("input");
    input.type = type;
    input.value = value ?? "";
  }
  input.addEventListener("input", () => {
    onInput?.(input.value);
    syncRaw();
  });
  wrap.append(title, input);
  return wrap;
};

const renderHero = () => {
  ui.hero.replaceChildren();
  const hero = model.hero;
  const media = hero.media;
  const fields = [
    ["Надзаголовок", hero.eyebrow, (v) => { hero.eyebrow = v; }],
    ["Заголовок", hero.title, (v) => { hero.title = v; }],
    ["Красная строка", hero.accent, (v) => { hero.accent = v; }],
    ["Текст", hero.lead, (v) => { hero.lead = v; }, true],
    ["Тип медиа", media.type, (v) => { media.type = v; }, false, "select"],
    ["Видео / изображение URL", media.src, (v) => { media.src = v; }],
    ["Poster URL", media.poster, (v) => { media.poster = v; }],
    ["Alt", media.alt, (v) => { media.alt = v; }],
    ["Подпись", media.label, (v) => { media.label = v; }],
    ["Описание", media.caption, (v) => { media.caption = v; }, true],
    ["Источник", media.sourceUrl, (v) => { media.sourceUrl = v; }]
  ];
  for (const [label, value, set, multiline, type] of fields) {
    ui.hero.append(field({ label, value, multiline, type: type || "text", full: multiline, onInput: set }));
  }
};

const renderGallery = () => {
  ui.gallery.replaceChildren();
  model.gallery.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "repeat-card";
    const head = document.createElement("div");
    head.className = "repeat-head";
    const title = document.createElement("strong");
    title.textContent = `${String(index + 1).padStart(2, "0")} · ${item.title || item.id || "Медиа"}`;
    const remove = document.createElement("button");
    remove.className = "danger";
    remove.type = "button";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => { model.gallery.splice(index, 1); renderAll(); });
    head.append(title, remove);

    const grid = document.createElement("div");
    grid.className = "repeat-grid";
    const defs = [
      ["Тип", item.type, (v) => { item.type = v; }, "select"],
      ["ID", item.id, (v) => { item.id = v; }],
      ["Название", item.title, (v) => { item.title = v; }],
      ["Подпись", item.meta, (v) => { item.meta = v; }],
      ["Media URL", item.src, (v) => { item.src = v; }],
      ["Poster URL", item.poster, (v) => { item.poster = v; }],
      ["Alt", item.alt, (v) => { item.alt = v; }],
      ["Источник", item.sourceUrl, (v) => { item.sourceUrl = v; }]
    ];
    for (const [label, value, set, type] of defs) grid.append(field({ label, value, type: type || "text", onInput: set }));
    card.append(head, grid);
    ui.gallery.append(card);
  });
};

const renderReports = () => {
  ui.reports.replaceChildren();
  model.photoReports.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "repeat-card";
    const head = document.createElement("div");
    head.className = "repeat-head";
    const title = document.createElement("strong");
    title.textContent = `${String(index + 1).padStart(2, "0")} · ${item.title || "Отчёт"}`;
    const remove = document.createElement("button");
    remove.className = "danger";
    remove.type = "button";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () => { model.photoReports.splice(index, 1); renderAll(); });
    head.append(title, remove);
    const grid = document.createElement("div");
    grid.className = "repeat-grid";
    grid.append(
      field({ label: "Название", value: item.title, onInput: (v) => { item.title = v; } }),
      field({ label: "Подпись", value: item.meta, onInput: (v) => { item.meta = v; } }),
      field({ label: "URL", value: item.url, full: true, onInput: (v) => { item.url = v; } })
    );
    card.append(head, grid);
    ui.reports.append(card);
  });
};

const renderTrainers = () => {
  ui.trainers.replaceChildren();
  model.instructors.forEach((instructor, index) => {
    const details = document.createElement("details");
    details.className = "trainer-card";
    if (index === 0) details.open = true;
    const summary = document.createElement("summary");
    const name = document.createElement("strong");
    name.textContent = instructor.name;
    const meta = document.createElement("span");
    meta.textContent = `${instructor.venues.length} зал(а) · ${instructor.phone}`;
    summary.append(name, meta);

    const body = document.createElement("div");
    body.className = "trainer-body";
    body.append(
      field({ label: "Телефон", value: instructor.phone, onInput: (v) => { instructor.phone = v; } }),
      field({ label: "Роль", value: instructor.role, onInput: (v) => { instructor.role = v; } }),
      field({ label: "Подпись", value: instructor.note, onInput: (v) => { instructor.note = v; } }),
      field({ label: "Фото URL", value: instructor.photo?.src || "", onInput: (v) => {
        if (!instructor.photo) instructor.photo = { src: "", sourceUrl: "", position: "50% 35%" };
        instructor.photo.src = v;
        if (!v && !instructor.photo.sourceUrl) delete instructor.photo;
      } }),
      field({ label: "Источник фото", value: instructor.photo?.sourceUrl || "", onInput: (v) => {
        if (!instructor.photo) instructor.photo = { src: "", sourceUrl: "", position: "50% 35%" };
        instructor.photo.sourceUrl = v;
      } })
    );

    if (instructor.name === KIRILL) {
      const link = instructor.links?.[0] ?? { label: "Материалы Кирилла ↗", url: KIRILL_ONLY_URL };
      instructor.links = [link];
      body.append(
        field({ label: "Единственная внешняя ссылка Кирилла", value: link.url, full: true, onInput: (v) => { link.url = v; } }),
        field({ label: "Текст ссылки", value: link.label, full: true, onInput: (v) => { link.label = v; } })
      );
    }

    const venuesWrap = field({
      label: "Залы и расписание · JSON",
      value: JSON.stringify(instructor.venues, null, 2),
      full: true,
      multiline: true,
      onInput: (value) => {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) instructor.venues = parsed;
        } catch { /* validation will report malformed JSON */ }
      }
    });
    venuesWrap.classList.add("venues-json");
    body.append(venuesWrap);
    details.append(summary, body);
    ui.trainers.append(details);
  });
};

const renderAll = () => {
  renderHero();
  renderGallery();
  renderReports();
  renderTrainers();
  syncRaw();
};

const countOccurrences = (text, needle) => text.split(needle).length - 1;
const validateModel = (value = model) => {
  const errors = [];
  if (!value || typeof value !== "object") return ["Контент не является объектом."];
  if (!Array.isArray(value.instructors)) errors.push("Нет массива instructors.");
  const people = value.instructors?.map((item) => item.name) ?? [];
  if (JSON.stringify(people) !== JSON.stringify(EXPECTED_PEOPLE)) errors.push("Список 11 тренеров изменён или нарушен порядок.");
  const venueCount = value.instructors?.reduce((sum, item) => sum + (item.venues?.length ?? 0), 0) ?? 0;
  if (venueCount !== 18) errors.push(`Должно быть 18 залов, сейчас ${venueCount}.`);

  const serialized = JSON.stringify(value);
  if (/[Жж]ара/.test(serialized)) errors.push("Кириллическое слово «Жара» запрещено в публичном контенте.");
  for (const marker of ["Горохов", "ИФК", "IFK"]) {
    if (serialized.includes(marker)) errors.push(`Запрещённый маркер: ${marker}.`);
  }
  if (countOccurrences(serialized, KIRILL_ONLY_URL) !== 1) errors.push("Ссылка проекта Кирилла должна встречаться ровно один раз.");
  if (countOccurrences(serialized, "masterskayakarate.ru") !== 1) errors.push("Домен masterskayakarate.ru допустим ровно один раз.");

  const kirill = value.instructors?.find((item) => item.name === KIRILL);
  if (kirill?.links?.length !== 1 || kirill.links[0]?.url !== KIRILL_ONLY_URL) errors.push("Единственная ссылка должна находиться в карточке Кирилла.");
  for (const instructor of value.instructors ?? []) {
    if (instructor.name !== KIRILL && instructor.links?.length) errors.push(`Внешние ссылки запрещены у ${instructor.name}.`);
  }

  if (!String(value.camp?.river || "").includes("Керженец")) errors.push("Контент должен быть привязан к Керженцу.");
  if (!String(value.hero?.media?.src || "").startsWith("https://kples.ru/")) errors.push("Главное медиа должно быть с официального Красного Плёса.");
  const permittedHosts = new Set(["kples.ru", "www.kples.ru", "vk.ru", "vk.com", "vega52.ru", "www.vega52.ru", "shin-nnov.orgs.biz", "sun9-54.userapi.com"]);
  const checkUrl = (url, label) => {
    if (!url) return;
    try {
      const host = new URL(url).hostname;
      if (!permittedHosts.has(host)) errors.push(`${label}: неподтверждённый домен ${host}.`);
    } catch { errors.push(`${label}: некорректный URL.`); }
  };
  for (const item of value.gallery ?? []) {
    checkUrl(item.src, `Галерея ${item.id || ""}`);
    checkUrl(item.poster, `Poster ${item.id || ""}`);
    checkUrl(item.sourceUrl, `Источник ${item.id || ""}`);
  }
  for (const item of value.photoReports ?? []) checkUrl(item.url, `Фотоотчёт ${item.title || ""}`);
  return errors;
};

const loadContent = async () => {
  setStatus("Загрузка…", "GitHub · project/kyokushin-nn");
  try {
    const response = await fetch(`${RAW_URL}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    model = await response.json();
    const errors = validateModel(model);
    renderAll();
    setStatus(errors.length ? "Есть ошибки" : "Готово", errors.length ? `${errors.length} ошибок` : `v${model.version} · ${model.instructors.length} тренеров`, errors.length ? "error" : "ok");
  } catch (error) {
    setStatus("Ошибка загрузки", error.message, "error");
    showResult("Не удалось загрузить CMS", error.stack || error.message);
  }
};

const encodeBase64Utf8 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const publishContent = async () => {
  const token = ui.token.value.trim();
  if (!token) return showResult("Нужен GitHub token", "Вставьте fine-grained token с Contents: Read and write только для goringich/websites. Токен не сохраняется.");
  const errors = validateModel();
  if (errors.length) return showResult("Публикация заблокирована", errors.join("\n"));

  setStatus("Публикация…", "Проверяю текущую ревизию GitHub");
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    const current = await fetch(`${API_URL}?ref=${encodeURIComponent(BRANCH)}`, { headers, cache: "no-store" });
    if (!current.ok) throw new Error(`GitHub read failed: ${current.status} ${await current.text()}`);
    const currentData = await current.json();
    currentSha = currentData.sha;

    model.updatedAt = new Date().toISOString();
    const text = `${JSON.stringify(model, null, 2)}\n`;
    const update = await fetch(API_URL, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "cms: update kyokushin site content",
        content: encodeBase64Utf8(text),
        sha: currentSha,
        branch: BRANCH
      })
    });
    if (!update.ok) throw new Error(`GitHub publish failed: ${update.status} ${await update.text()}`);
    const result = await update.json();
    currentSha = result.content?.sha || currentSha;
    syncRaw();
    setStatus("Опубликовано", `commit ${String(result.commit?.sha || "").slice(0, 10)}`, "ok");
    showResult("Контент опубликован", `GitHub commit: ${result.commit?.sha || "unknown"}\nСайт подтянет content/site.json автоматически без ручной правки JS.`);
  } catch (error) {
    setStatus("Ошибка публикации", error.message, "error");
    showResult("Публикация не выполнена", error.stack || error.message);
  }
};

ui.reload.addEventListener("click", loadContent);
ui.validate.addEventListener("click", () => {
  const errors = validateModel();
  if (errors.length) {
    setStatus("Есть ошибки", `${errors.length} ошибок`, "error");
    showResult("Проверка не пройдена", errors.join("\n"));
  } else {
    setStatus("Проверено", "11 тренеров · 18 залов · Керженец", "ok");
    showResult("Проверка пройдена", "Контент соответствует правилам публикации.");
  }
});
ui.publish.addEventListener("click", publishContent);
ui.addGallery.addEventListener("click", () => {
  model.gallery.push({ id: `kerzhenets-${Date.now()}`, type: "story", title: "Новый материал", meta: "Керженец", sourceUrl: "https://kples.ru/" });
  renderAll();
});
ui.addReport.addEventListener("click", () => {
  model.photoReports.push({ title: "Новый фотоотчёт", meta: "Керженец", url: "https://kples.ru/" });
  renderAll();
});
ui.applyRaw.addEventListener("click", () => {
  try {
    const candidate = JSON.parse(ui.raw.value);
    model = clone(candidate);
    renderAll();
    const errors = validateModel();
    showResult(errors.length ? "JSON применён с ошибками" : "JSON применён", errors.length ? errors.join("\n") : "Структура валидна.");
  } catch (error) {
    showResult("Некорректный JSON", error.message);
  }
});
ui.dialogClose.addEventListener("click", () => ui.dialog.close());
ui.dialog.addEventListener("click", (event) => { if (event.target === ui.dialog) ui.dialog.close(); });

loadContent();
