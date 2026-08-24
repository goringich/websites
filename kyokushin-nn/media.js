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

const federationSource = "https://shin-nnov.orgs.biz/";

const verifiedMedia = [
  {
    id: "federation-1",
    image: "https://sun9-79.userapi.com/s/v1/ig2/sq5ZwNkzvkAvgC2XEa_GU_Af_ilyiA5Nvsunurfo_MPPUPZYp5yZcikMhDv5QWNBMdcUg35ytTiV5avADw2v569-.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Тренировка Нижегородской федерации СинКёкусинкай"
  },
  {
    id: "federation-2",
    image: "https://sun9-36.userapi.com/s/v1/ig2/VBMgYg-pi84M-uFRbiAZTZ56duGaLkWz0aux0ufSrCPPZV1H9KBxqspF_lrzOXliqomSwF0Mr9GSf2k9omuDyYBK.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Спортсмены Нижегородской федерации СинКёкусинкай"
  },
  {
    id: "federation-3",
    image: "https://sun9-14.userapi.com/s/v1/ig2/Y5Xafy1863xbFqj60zvZEHiDB3-jiINrqP3AY-T_Xjcg3tkvZ2Ynv7FJZ0Oq-18dK5yoreXBlp7051-zntTszeTV.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Каратэ СинКёкусинкай в Нижнем Новгороде"
  },
  {
    id: "federation-4",
    image: "https://sun9-36.userapi.com/s/v1/ig2/eqY-SWEjAk3nmWol2QUNnitn8lH9G2PA757ilFYHtonMsJjXI3euMkfv5ij2cSgbcjENo6VGo9f-ryC1eP1rvC1M.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Тренировочный процесс СинКёкусинкай"
  },
  {
    id: "federation-5",
    image: "https://sun9-58.userapi.com/s/v1/ig2/T3LTt0UUZrW7N7UnBTAIY8X__G7cCkDi15Al92szKbfl3K5OsBEBw4xrskFBRF2-WsOQ65TQRgmFbpKAzUTpwj4R.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Тренировка спортсменов федерации"
  },
  {
    id: "federation-6",
    image: "https://sun9-23.userapi.com/s/v1/ig2/7AnTr-5amcRvOw5BkDmW9BfAs4HwTfzB_WYbkXin_Or2PkYHhw-VwEDkTE9mXF2OIkExBEmCsu9twbKXbo-14mXJ.jpg?as=32x48%2C48x72%2C72x108%2C108x162%2C160x240%2C240x360%2C360x540%2C480x720%2C540x810%2C640x960%2C720x1080%2C853x1280&cs=510x765&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Каратэ Нижегородской федерации"
  },
  {
    id: "federation-7",
    image: "https://sun9-5.userapi.com/s/v1/ig2/aZZRBZd8slSCaorqp-EglxfneC1MMh_pNR558FRhWa9GFZic--fOGzwq0UMoR0D-Luy8cTPbA2LjMXmHhnNtVLGB.jpg?as=32x48%2C48x72%2C72x108%2C108x162%2C160x240%2C240x360%2C360x540%2C480x720%2C540x810%2C640x960%2C720x1080%2C853x1280&cs=510x765&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Спортсмен СинКёкусинкай"
  },
  {
    id: "federation-8",
    image: "https://sun9-52.userapi.com/s/v1/ig2/RvCcEfTxdZLkufsej14kx6-W1d4KSvbqBjuEewMOVnijRY0-ga5zEIFnN0wxMFbo5sXRB52ldm7kaQuRTHbFwRMH.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853&cs=510x340&from=bu&quality=95",
    sourceUrl: federationSource,
    alt: "Команда Нижегородской федерации СинКёкусинкай"
  },
  {
    id: "masterskaya-2026",
    kind: "story",
    sourceUrl: "https://masterskayakarate.ru/tpost/czhy6ukv31-zhara-2026-kak-eto-bilo",
    title: "Фото и видео · лето 2026",
    meta: "Материалы тренировочного проекта"
  }
];

const trainerPhotos = {
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
    image: "https://cdn1.tenchat.ru/static/vbc-gostinder/user-picture/c5fe4cf5-e2af-4cec-be74-0e4e6b2b3bc7.jpeg?crop=480%2C480%2Cx0%2Cy0&fmt=webp&height=480&width=480",
    sourceUrl: "https://tenchat.ru/5138057",
    position: "50% 36%"
  }
};

const photoCollections = [
  {
    title: "Кю-тест федерации",
    meta: "29 декабря 2024 · Ольга Осинина",
    provider: "Яндекс Диск",
    cover: "https://sun9-36.userapi.com/s/v1/ig2/brw1eJzc2Do-ZwBV0hQsh1o8UN_v18Si3-m1ZwePZnkGkj84PUdR4mPYqIC2AQL_EOczqLwCNy6VfhPIW5ysexCf.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x427%2C720x480%2C1080x720%2C1280x853%2C1440x960%2C2500x1667&cs=200x133&from=bu&quality=95",
    coverAlt: "Кю-тест Нижегородской федерации СинКёкусинкай",
    url: "https://disk.yandex.ru/d/ofHWan78kjOw0g"
  },
  {
    title: "Сборы по базовой технике",
    meta: "7 декабря 2024 · Ольга Осинина",
    provider: "Яндекс Диск",
    cover: "https://sun9-62.userapi.com/s/v1/ig2/aPpH7wetO9uWCbrzS7kfjavhGMFkgYit3wEM3MZbruZP1wEsIjcwzUnj5LucQYYmmoZivfcJHD10wLkJDMDGcNtV.jpg?as=32x21%2C48x32%2C72x48%2C108x72%2C160x107%2C240x160%2C360x240%2C480x320%2C540x360%2C640x426%2C720x480%2C1080x720%2C1280x853%2C1440x960%2C2560x1706&cs=200x133&from=bu&quality=95",
    coverAlt: "Учебно-тренировочные сборы по базовой технике",
    url: "https://disk.yandex.ru/d/3CG2VKD0irTKBw"
  },
  {
    title: "Сборы по кумитэ",
    meta: "10 ноября 2024 · Ольга Осинина",
    provider: "Яндекс Диск",
    cover: verifiedMedia[3].image,
    coverAlt: "Тренировочный процесс СинКёкусинкай",
    url: "https://disk.yandex.ru/d/C7mUQHK866gmPQ"
  },
  {
    title: "Областные соревнования",
    meta: "16 ноября 2025",
    provider: "VK",
    cover: verifiedMedia[7].image,
    coverAlt: "Команда Нижегородской федерации СинКёкусинкай",
    url: "https://vk.com/album10551693_311746056"
  }
];

window.KYOKUSHIN_MEDIA = {
  allowedPeople,
  verifiedMedia,
  trainerPhotos,
  photoCollections
};