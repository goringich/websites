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
    id: "masterskaya-hero",
    kind: "club",
    image: "https://static.tildacdn.com/tild3633-3062-4863-a562-386138386236/photo.png",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · официальный сайт клуба",
    title: "Клубная жизнь",
    alt: "Фото из действующего клуба «Мастерская карате» в Нижнем Новгороде",
    people: []
  },
  {
    id: "masterskaya-training",
    kind: "club",
    image: "https://static.tildacdn.com/tild3731-3236-4264-a165-653239663730/__.jpg",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · официальный сайт клуба",
    title: "Тренировки",
    alt: "Тренировочное фото из действующего клуба «Мастерская карате»",
    people: []
  },
  {
    id: "masterskaya-gallery-1",
    kind: "club",
    image: "https://static.tildacdn.com/tild6633-6639-4866-b935-663238346266/photo.png",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · галерея",
    title: "На татами",
    alt: "Фото из галереи клуба «Мастерская карате»",
    people: []
  },
  {
    id: "masterskaya-gallery-2",
    kind: "club",
    image: "https://static.tildacdn.com/tild3939-3362-4535-b162-343938356166/_.png",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · галерея",
    title: "Команда",
    alt: "Фото клубной жизни «Мастерской карате»",
    people: []
  },
  {
    id: "masterskaya-review-1",
    kind: "club",
    image: "https://static.tildacdn.com/tild6462-6664-4337-a337-373166623138/_.png",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · официальный сайт клуба",
    title: "Внутри клуба",
    alt: "Материал действующего клуба «Мастерская карате»",
    people: []
  },
  {
    id: "masterskaya-review-2",
    kind: "club",
    image: "https://static.tildacdn.com/tild3566-3166-4636-a431-363761333434/_.png",
    sourceUrl: "https://masterskayakarate.ru/",
    sourceLabel: "Мастерская карате · официальный сайт клуба",
    title: "Клуб рядом",
    alt: "Материал действующего клуба «Мастерская карате» в Нижнем Новгороде",
    people: []
  }
];

const photoCollections = [
  {
    title: "Кю-тест федерации",
    meta: "29 декабря 2024 · фотограф Ольга Осинина",
    url: "https://disk.yandex.ru/d/ofHWan78kjOw0g",
    source: "Нижегородская федерация СинКёкусинкай"
  },
  {
    title: "Сборы по базовой технике",
    meta: "7 декабря 2024 · фотограф Ольга Осинина",
    url: "https://disk.yandex.ru/d/3CG2VKD0irTKBw",
    source: "Нижегородская федерация СинКёкусинкай"
  },
  {
    title: "Сборы по кумитэ",
    meta: "10 ноября 2024 · фотограф Ольга Осинина",
    url: "https://disk.yandex.ru/d/C7mUQHK866gmPQ",
    source: "Нижегородская федерация СинКёкусинкай"
  },
  {
    title: "Областные соревнования",
    meta: "16 ноября 2025 · фотоотчёт",
    url: "https://vk.com/album10551693_311746056",
    source: "Нижегородская федерация СинКёкусинкай"
  },
  {
    title: "Мастерская карате",
    meta: "Тренировки · проекты · турниры · клубная жизнь",
    url: "https://masterskayakarate.ru/#gallery",
    source: "Клуб Кирилла Антоневича"
  }
];

window.KYOKUSHIN_MEDIA = {
  allowedPeople,
  verifiedMedia,
  photoCollections
};
