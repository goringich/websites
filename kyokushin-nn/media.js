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

const verifiedMedia = [
  {
    id: "training-1",
    image: "https://static.tildacdn.com/tild3731-3236-4264-a165-653239663730/__.jpg",
    sourceUrl: "https://masterskayakarate.ru/",
    alt: "Тренировка по каратэ"
  },
  {
    id: "training-2",
    image: "https://static.tildacdn.com/tild6633-6639-4866-b935-663238346266/photo.png",
    sourceUrl: "https://masterskayakarate.ru/",
    alt: "Клубная жизнь каратэ"
  },
  {
    id: "training-3",
    image: "https://static.tildacdn.com/tild3939-3362-4535-b162-343938356166/_.png",
    sourceUrl: "https://masterskayakarate.ru/",
    alt: "Тренировки и команда"
  },
  {
    id: "training-4",
    image: "https://static.tildacdn.com/tild6638-3461-4431-b063-336138376236/_.png",
    sourceUrl: "https://masterskayakarate.ru/",
    alt: "Тренировочный день"
  },
  {
    id: "training-5",
    image: "https://static.tildacdn.com/tild6361-3663-4064-a531-313031616532/photo.png",
    sourceUrl: "https://masterskayakarate.ru/",
    alt: "Клубная атмосфера"
  }
];

const trainerPhotos = {
  "Сергей Жуков": { image: verifiedMedia[0].image, position: "50% 38%" },
  "Андрей Троцко": { image: verifiedMedia[1].image, position: "50% 42%" },
  "Владимир Жуков": { image: verifiedMedia[2].image, position: "50% 36%" },
  "Дарья Осинина": { image: verifiedMedia[3].image, position: "50% 40%" },
  "Юлия Фролова": { image: verifiedMedia[4].image, position: "50% 38%" },
  "Иван Гаврилин": { image: verifiedMedia[0].image, position: "64% 40%" },
  "Сергей Глухов": { image: verifiedMedia[1].image, position: "38% 42%" },
  "Сергей Захаров": { image: verifiedMedia[2].image, position: "62% 38%" },
  "Андрей Коннов": { image: verifiedMedia[3].image, position: "40% 38%" },
  "Георгий Пигиданов": { image: verifiedMedia[4].image, position: "60% 40%" },
  "Кирилл Антоневич": { image: verifiedMedia[0].image, position: "50% 34%" }
};

const photoCollections = [
  {
    title: "Кю-тест федерации",
    meta: "29 декабря 2024 · Ольга Осинина",
    url: "https://disk.yandex.ru/d/ofHWan78kjOw0g"
  },
  {
    title: "Сборы по базовой технике",
    meta: "7 декабря 2024 · Ольга Осинина",
    url: "https://disk.yandex.ru/d/3CG2VKD0irTKBw"
  },
  {
    title: "Сборы по кумитэ",
    meta: "10 ноября 2024 · Ольга Осинина",
    url: "https://disk.yandex.ru/d/C7mUQHK866gmPQ"
  },
  {
    title: "Областные соревнования",
    meta: "16 ноября 2025",
    url: "https://vk.com/album10551693_311746056"
  }
];

window.KYOKUSHIN_MEDIA = {
  allowedPeople,
  verifiedMedia,
  trainerPhotos,
  photoCollections
};
