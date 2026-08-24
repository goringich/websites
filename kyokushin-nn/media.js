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
  "Сергей Жуков": {
    kind: "club",
    image: verifiedMedia[0].image,
    sourceUrl: verifiedMedia[0].sourceUrl,
    position: "50% 38%"
  },
  "Андрей Троцко": {
    kind: "club",
    image: verifiedMedia[1].image,
    sourceUrl: verifiedMedia[1].sourceUrl,
    position: "50% 42%"
  },
  "Владимир Жуков": {
    kind: "club",
    image: verifiedMedia[2].image,
    sourceUrl: verifiedMedia[2].sourceUrl,
    position: "50% 36%"
  },
  "Дарья Осинина": {
    kind: "club",
    image: verifiedMedia[3].image,
    sourceUrl: verifiedMedia[3].sourceUrl,
    position: "50% 40%"
  },
  "Юлия Фролова": {
    kind: "club",
    image: verifiedMedia[4].image,
    sourceUrl: verifiedMedia[4].sourceUrl,
    position: "50% 38%"
  },
  "Иван Гаврилин": {
    kind: "club",
    image: verifiedMedia[0].image,
    sourceUrl: verifiedMedia[0].sourceUrl,
    position: "64% 40%"
  },
  "Сергей Глухов": {
    kind: "club",
    image: verifiedMedia[1].image,
    sourceUrl: verifiedMedia[1].sourceUrl,
    position: "38% 42%"
  },
  "Сергей Захаров": {
    kind: "club",
    image: verifiedMedia[2].image,
    sourceUrl: verifiedMedia[2].sourceUrl,
    position: "62% 38%"
  },
  "Андрей Коннов": {
    kind: "club",
    image: verifiedMedia[3].image,
    sourceUrl: verifiedMedia[3].sourceUrl,
    position: "40% 38%"
  },
  "Георгий Пигиданов": {
    kind: "person",
    person: "Георгий Пигиданов",
    image: "https://sun9-54.userapi.com/s/v1/ig2/WUuluYR3wScSgcKv4oCm9jAmB-zvo_4dyFVFIljMw2UJTyrZHVhb0EWfnr3Sxt8TGXwNwaxUR_a_A_Xrc6p3fL8o.jpg?as=32x43%2C48x64%2C72x97%2C108x145%2C160x215%2C240x322%2C360x484%2C480x645%2C540x725%2C640x860%2C720x967%2C953x1280&cs=240x0&from=bu&quality=95",
    sourceUrl: "https://shin-nnov.orgs.biz/",
    position: "50% 30%"
  },
  "Кирилл Антоневич": {
    kind: "person",
    person: "Кирилл Антоневич",
    image: "https://static.tildacdn.com/tild3832-3432-4365-a436-313238623462/____.svg",
    sourceUrl: "https://masterskayakarate.ru/",
    position: "50% 35%"
  }
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
