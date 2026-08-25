const allowedPeople = [
  "Сергей Жуков",
  "Андрей Троцко",
  "Владимир Жуков",
  "Дарья Осинина",
  "Юлия Фролова",
  "Иван Гаврилин",
  "Сергей Глухов",
  "Сергей Захаров",
  "Андрей Коннов",
  "Георгий Пигиданов",
  "Кирилл Антоневич"
];

const buildMediaRegistry = (content = window.KYOKUSHIN_CONTENT ?? {}) => {
  const trainerPhotos = {};

  for (const instructor of content.instructors ?? []) {
    if (!instructor?.photo?.src || !allowedPeople.includes(instructor.name)) continue;
    trainerPhotos[instructor.name] = {
      kind: "person",
      person: instructor.name,
      image: instructor.photo.src,
      sourceUrl: instructor.photo.sourceUrl,
      position: instructor.photo.position ?? "50% 35%"
    };
  }

  return {
    allowedPeople,
    verifiedMedia: Array.isArray(content.gallery) ? content.gallery : [],
    trainerPhotos,
    photoCollections: Array.isArray(content.photoReports) ? content.photoReports : []
  };
};

window.KYOKUSHIN_MEDIA = buildMediaRegistry();
window.KYOKUSHIN_MEDIA_APPLY_CONTENT = (content) => {
  window.KYOKUSHIN_MEDIA = buildMediaRegistry(content);
  return window.KYOKUSHIN_MEDIA;
};
