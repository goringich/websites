(() => {
  const CONTENT_API_FRAGMENT = "/repos/goringich/websites/contents/kyokushin-nn/content/site.json";
  const CAMP_HOSTS = new Set(["kples.ru", "www.kples.ru", "vk.ru", "vk.com"]);
  const HERO_ASSET_HOSTS = new Set(["kples.ru", "www.kples.ru"]);
  const FORBIDDEN_HOSTS = new Set([
    "vega52.ru",
    "www.vega52.ru"
  ]);
  const FORBIDDEN_FILLER = [
    "Тренировки, где техника становится характером",
    "Спортивные сборы, природа и тренировочный ритм",
    "Движение каждый день"
  ];
  const VERIFIED_IDENTITY_STATUS = "verified";
  const MIN_IDENTITY_EVIDENCE_LENGTH = 24;

  const hostOf = (url) => {
    if (!url) return "";
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
  };

  const hostAllowed = (url, allowed, { allowEmpty = true } = {}) => {
    if (!url) return allowEmpty;
    const host = hostOf(url);
    return Boolean(host && allowed.has(host) && !FORBIDDEN_HOSTS.has(host));
  };

  const isHostOrSubdomain = (host, domain) => Boolean(
    host && (host === domain || host.endsWith(`.${domain}`))
  );

  const isUserApiAsset = (url) => isHostOrSubdomain(hostOf(url), "userapi.com");
  const isTenChatAsset = (url) => isHostOrSubdomain(hostOf(url), "tenchat.ru");
  const isInstagramAsset = (url) => isHostOrSubdomain(hostOf(url), "cdninstagram.com");
  const isFacebookAsset = (url) => isHostOrSubdomain(hostOf(url), "fbcdn.net");
  const isOkAsset = (url) => {
    const host = hostOf(url);
    return isHostOrSubdomain(host, "okcdn.ru") || isHostOrSubdomain(host, "mycdn.me");
  };

  const trainerSourceClass = (sourceUrl) => {
    const host = hostOf(sourceUrl);
    if (!host) return null;
    if (host === "vk.ru" || host === "vk.com") return "vk";
    if (isHostOrSubdomain(host, "tenchat.ru")) return "tenchat";
    if (isHostOrSubdomain(host, "instagram.com")) return "instagram";
    if (isHostOrSubdomain(host, "facebook.com")) return "facebook";
    if (isHostOrSubdomain(host, "ok.ru")) return "ok";
    if (host === "shin-nnov.orgs.biz") return "federation-mirror";
    return null;
  };

  const trainerAssetMatchesSource = (photo, sourceClass) => {
    if (sourceClass === "vk") return isUserApiAsset(photo.src);
    if (sourceClass === "tenchat") return isTenChatAsset(photo.src);
    if (sourceClass === "instagram") return isInstagramAsset(photo.src) || isFacebookAsset(photo.src);
    if (sourceClass === "facebook") return isFacebookAsset(photo.src);
    if (sourceClass === "ok") return isOkAsset(photo.src);
    return false;
  };

  const isLegacyGeorgiyPhoto = (instructor) => Boolean(
    instructor?.name === "Георгий Пигиданов"
    && trainerSourceClass(instructor.photo?.sourceUrl) === "federation-mirror"
    && isUserApiAsset(instructor.photo?.src)
  );

  const trainerPhotoErrors = (instructor) => {
    const photo = instructor?.photo;
    if (!photo) return [];

    const errors = [];
    if (!photo.src || hostOf(photo.src) === null || FORBIDDEN_HOSTS.has(hostOf(photo.src))) {
      errors.push(`${instructor.name}: некорректный или запрещённый asset фотографии.`);
      return errors;
    }
    if (!photo.sourceUrl || hostOf(photo.sourceUrl) === null || FORBIDDEN_HOSTS.has(hostOf(photo.sourceUrl))) {
      errors.push(`${instructor.name}: для портрета обязателен исходный публичный профиль/пост/альбом.`);
      return errors;
    }

    if (isLegacyGeorgiyPhoto(instructor)) return errors;

    const sourceClass = trainerSourceClass(photo.sourceUrl);
    if (!sourceClass || sourceClass === "federation-mirror") {
      errors.push(`${instructor.name}: источник портрета не входит в подтверждённые публичные social/profile source classes.`);
      return errors;
    }
    if (!trainerAssetMatchesSource(photo, sourceClass)) {
      errors.push(`${instructor.name}: CDN/asset не соответствует исходной social-платформе ${sourceClass}.`);
    }
    if (photo.identityStatus !== VERIFIED_IDENTITY_STATUS) {
      errors.push(`${instructor.name}: identityStatus должен быть verified до публикации именованного портрета.`);
    }
    if (String(photo.identityEvidence || "").trim().length < MIN_IDENTITY_EVIDENCE_LENGTH) {
      errors.push(`${instructor.name}: требуется краткое source-bound доказательство личности.`);
    }
    if (photo.sourcePlatform && photo.sourcePlatform !== sourceClass) {
      errors.push(`${instructor.name}: sourcePlatform не совпадает с фактическим источником ${sourceClass}.`);
    }
    return errors;
  };

  const validate = (content) => {
    const errors = [];
    if (!content || typeof content !== "object") return ["Контент не является объектом."];

    const hero = content.hero?.media;
    if (!hero?.src || !hostAllowed(hero.src, HERO_ASSET_HOSTS, { allowEmpty: false })) {
      errors.push("Главное фото/видео должно быть из первичного источника Красного Плёса (kples.ru). ");
    }
    if (!hostAllowed(hero?.poster, CAMP_HOSTS)) {
      errors.push("Poster главного экрана должен быть из подтверждённого источника лагеря/VK или оставаться пустым.");
    }
    if (!hostAllowed(hero?.sourceUrl, CAMP_HOSTS, { allowEmpty: false })) {
      errors.push("Для главного медиа обязателен подтверждённый source URL.");
    }

    for (const item of content.gallery ?? []) {
      if (!hostAllowed(item.src, CAMP_HOSTS)) errors.push(`Галерея ${item.id || ""}: media URL вне подтверждённых источников.`);
      if (!hostAllowed(item.poster, CAMP_HOSTS)) errors.push(`Галерея ${item.id || ""}: poster вне подтверждённых источников.`);
      if (!hostAllowed(item.sourceUrl, CAMP_HOSTS, { allowEmpty: false })) errors.push(`Галерея ${item.id || ""}: обязателен подтверждённый источник.`);
    }

    for (const item of content.photoReports ?? []) {
      if (!hostAllowed(item.url, CAMP_HOSTS, { allowEmpty: false })) errors.push(`Фотоотчёт ${item.title || ""}: URL вне подтверждённых источников.`);
    }

    for (const instructor of content.instructors ?? []) {
      errors.push(...trainerPhotoErrors(instructor));
    }

    const serialized = JSON.stringify(content);
    for (const host of FORBIDDEN_HOSTS) {
      if (serialized.includes(host)) errors.push(`Запрещён неподходящий медиа-источник: ${host}.`);
    }
    for (const phrase of FORBIDDEN_FILLER) {
      if (serialized.includes(phrase)) errors.push(`Запрещён неподтверждённый рекламный текст: «${phrase}».`);
    }

    return [...new Set(errors)];
  };

  const decodeBase64Utf8 = (encoded) => {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const showBlocked = (errors) => {
    const dialog = document.querySelector("#resultDialog");
    const title = document.querySelector("#dialogTitle");
    const body = document.querySelector("#dialogBody");
    const status = document.querySelector("#statusText");
    const detail = document.querySelector("#statusDetail");
    if (status) {
      status.textContent = "Медиа заблокировано";
      status.classList.remove("is-ok");
      status.classList.add("is-error");
    }
    if (detail) detail.textContent = `${errors.length} ошибок provenance`;
    if (title) title.textContent = "Публикация заблокирована медиаполитикой";
    if (body) body.textContent = errors.join("\n");
    dialog?.showModal();
  };

  const validateRawEditor = () => {
    const raw = document.querySelector("#rawEditor")?.value;
    if (!raw) return [];
    try {
      return validate(JSON.parse(raw));
    } catch {
      return ["JSON контента некорректен."];
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#publishButton")?.addEventListener("click", (event) => {
      const errors = validateRawEditor();
      if (!errors.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showBlocked(errors);
    }, true);
  });

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    const method = String(init?.method || (typeof input !== "string" ? input?.method : "") || "GET").toUpperCase();
    if (method === "PUT" && url.includes(CONTENT_API_FRAGMENT)) {
      let payload;
      try {
        payload = JSON.parse(init.body);
        const content = JSON.parse(decodeBase64Utf8(payload.content));
        const errors = validate(content);
        if (errors.length) {
          showBlocked(errors);
          throw new Error(`Real-media policy blocked CMS publish: ${errors.join(" | ")}`);
        }
      } catch (error) {
        if (String(error?.message || "").startsWith("Real-media policy blocked")) throw error;
        throw new Error(`Real-media policy could not verify CMS payload: ${error?.message || error}`);
      }
    }
    return nativeFetch(input, init);
  };

  window.KYOKUSHIN_ADMIN_MEDIA_POLICY = {
    validate,
    trainerPhotoErrors,
    campHosts: [...CAMP_HOSTS],
    trainerSourceClasses: ["vk", "tenchat", "instagram", "facebook", "ok"]
  };
})();
