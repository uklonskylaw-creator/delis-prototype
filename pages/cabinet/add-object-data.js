/* ===== Состав форм по типам объектов =====
   Источник: карта форм подачи объявления Циан (ветка «Продажа»),
   обход от 18.09.2026. Поля, их порядок, наборы значений и валидация
   перенесены без изменений. Оформление — наше. */

// --- Часто повторяющиеся наборы значений ---
const V = {
  houseType:   ['Кирпичный', 'Монолитный', 'Панельный', 'Блочный', 'Деревянный', 'Сталинский', 'Монолитно-кирпичный'],
  rooms:       ['Студия', '1', '2', '3', '4', '5', '6+', 'Свободная планировка'],
  roomsNoFree: ['Студия', '1', '2', '3', '4', '5', '6+'],
  realtyType:  ['Квартира', 'Апартаменты'],
  layout:      ['Смежная', 'Изолированная', 'Смежно-изолированная'],
  saleType:    ['Свободная', 'Альтернативная'],
  doorWidth:   ['62–65 см', '65–69 см', '70–79 см', 'от 80 см', 'Я не знаю'],

  landUnits:   ['Сот.', 'Га'],
  landCat:     ['Земли населённых пунктов', 'Земли сельхозназначения', 'Другое'],
  landStatus:  ['ИЖС', 'ДНП', 'Садоводство', 'Фермерское хозяйство', 'ЛПХ'],
  houseKind:   ['Для постоянного проживания', 'Дача'],
  houseMat:    ['Кирпичный', 'Монолитный', 'Деревянный', 'Щитовой', 'Каркасный', 'Блочный',
                'Газобетонный', 'Газосиликатный', 'Пенобетонный блок'],
  houseState:  ['Можно жить', 'Нужен ремонт', 'Нужно достроить', 'Нужен капремонт или под снос'],
  wc:          ['На улице', 'В доме'],
  heatingHouse:['Центральное', 'Газовое', 'Электрическое', 'Печь', 'Камин', 'Твердотопливный котёл',
                'Дизельное', 'Автономное', 'Нет отопления'],
  extraHouse:  ['Гараж', 'Терраса', 'Погреб', 'Бассейн', 'Баня', 'Охрана'],

  garageType:  ['Машиноместо', 'Гараж', 'Бокс'],
  garageStatus:['Кооператив', 'Собственность', 'По доверенности'],
  garageComm:  ['Электричество', 'Вода', 'Отопление', 'Система пожаротушения'],
  garagePark:  ['Наземная', 'Многоуровневая', 'Подземная', 'Нет парковки'],

  buildingClass: ['A+', 'A', 'B+', 'B', 'B-', 'C'],
  repairFull:  ['Типовой', 'Дизайнерский', 'Под чистовую отделку', 'Нужен капитальный', 'Нужен косметический'],
  repairOffice:['Офисная отделка', 'Под чистовую', 'Нужен капитальный', 'Нужен косметический'],
  repairProd:  ['Типовой', 'Нужен капитальный', 'Нужен косметический'],
  category:    ['Действующее', 'Проект', 'Строящееся'],
  priceMode:   ['За м²', 'За всё'],
  entrance:    ['Общий с улицы', 'Общий со двора', 'Отдельный с улицы', 'Отдельный со двора'],
  houseLine:   ['Первая', 'Вторая', 'Иная'],
  parking:     ['Наземная', 'Многоуровневая', 'Подземная', 'На крыше', 'Нет парковки'],
  landOwn:     ['В собственности', 'В аренде'],
  ventilation: ['Естественная', 'Приточная', 'Нет вентиляции'],
  conditioning:['Местное', 'Центральное', 'Нет кондиционирования'],
  heating:     ['Автономное', 'Центральное', 'Нет отопления'],
  fire:        ['Гидрантная', 'Спринклерная', 'Порошковая', 'Газовая', 'Сигнализация', 'Нет системы пожаротушения'],
  wetPoints:   ['1', '2', '3', '4+', 'Нет'],
  tax:         ['УСН', 'НДС включён'],
  dealType:    ['Продажа помещения', 'Переуступка прав аренды'],
  shopType:    ['Помещение в торговом комплексе', 'Street retail'],
  showcase:    ['Есть', 'Нет'],
  gates:       ['На пандусе', 'Докового типа', 'На нулевой отметке'],
  craneEquip:  ['Мостовой кран', 'Кран-балка', 'Ж/д кран', 'Козловой кран'],
  floorMat:    ['Полимерный', 'Бетон', 'Линолеум', 'Асфальт', 'Плитка', 'Наливной',
                'Железобетонный', 'Дерево', 'Ламинат'],
  prodPark:    ['На территории объекта', 'За территорией', 'Нет'],
  prodParkType:['Для грузового транспорта', 'Для легковесного транспорта'],
  bizKind:     ['Арендный бизнес', 'Готовый бизнес'],
  bizRentCat:  ['База', 'База отдыха', 'Гостевой дом', 'Гостиница', 'Доходный дом', 'Клиентский офис',
                'Мини-отель', 'Офис', 'ПСН', 'Рабочее место', 'Рабочий кабинет', 'Склад',
                'Стрит ритейл', 'Торговая площадь', 'Торговый комплекс', 'Торговый центр', 'Хостел'],
  bizReadyCat: ['Общественное питание', 'Услуги', 'Красота и здоровье', 'Развлечения', 'Торговля',
                'Производство и сельское хозяйство', 'Интернет-магазин', 'Другое'],
  bizRealty:   ['В аренде', 'В собственности'],
  hideAddr:    ['Скрыть', 'Не скрывать'],
  commLandCat: ['Поселение', 'Сельскохозяйственная', 'Иная'],
  commLandUse: ['Сельскохозяйственное использование', 'ИЖС', 'МЖС', 'Высотная застройка',
                'Общественное использование объектов капитального строительства', 'Деловое управление',
                'Торговые центры', 'Гостиничное обслуживание', 'Обслуживание автотранспорта',
                'Рекреация', 'Промышленность', 'Склады', 'Общее пользование территории'],
  commLandLine:['На участке', 'По границе участка', 'Нет'],
  roads:       ['Асфальтированная дорога', 'Грунтовая дорога', 'Нет подъездных путей'],
  purpose:     ['Административное здание', 'Бизнес-центр', 'Деловой центр', 'Бизнес-квартал',
                'Объект свободного назначения', 'Производственный комплекс', 'Индустриальный парк',
                'Промплощадка', 'Производственно-складской комплекс', 'Логистический центр'],
  psnPurpose:  ['Пекарня', 'Банк', 'Бар', 'Салон красоты', 'Кафе/ресторан', 'Автомойка', 'Автосервис',
                'Клуб', 'Фитнес', 'Хостел', 'Гостиница', 'Медицинский центр', 'Аптека', 'Сауна',
                'Школа', 'Магазин', 'Шоурум', 'Стоматология', 'Фотостудия', 'Мастерская', 'Spa салон',
                'АЗС', 'Автосалон', 'Антикафе', 'Арендный бизнес', 'Боулинг', 'Букмекерская контора',
                'Гипермаркет', 'Детский сад', 'Завод', 'Зоомагазин'],
  food:        ['Кафе', 'Ресторан', 'Столовая', 'Буфет'],
  foodShop:    ['Кафе', 'Ресторан', 'Столовая', 'Буфет', 'Фуд-корт'],
  fun:         ['Кинотеатр', 'Фитнес-центр', 'Бассейн'],
  funShop:     ['Кинотеатр', 'Фитнес-центр', 'Бассейн', 'Аквапарк', 'Боулинг', 'Игровая комната', 'Игровые автоматы'],
  trade:       ['Супермаркет', 'Магазин', 'Аптека', 'Киоск'],
  services:    ['Автомойка', 'Банкомат', 'Отделение банка', 'Салон красоты', 'Медицинский центр', 'Нотариальная контора'],
  servicesShop:['Автомойка', 'Банкомат', 'Отделение банка', 'Салон красоты', 'Медицинский центр',
                'Нотариальная контора', 'Беби-ситинг'],
  zones:       ['Выставочно-складской комплекс', 'Складские помещения', 'Конференц-зал', 'Центральный ресепшн'],
  prodFood:    ['Буфет', 'Столовая'],
  prodZones:   ['Гостиница', 'Офисные помещения', 'Центральный ресепшн'],
  prodExtra:   ['Ответственное хранение', 'Транспортные услуги', 'Таможня']
};

// --- Кирпичики шагов, общие для многих веток ---
const S = {
  photoFlat: { t: 'Фотографии и планировка', f: [
    { k: 'photos', type: 'photos' },
    { k: 'plan', type: 'photos', l: 'Планировка' },
    { k: 'video', l: 'Видео — файл или ссылка на VK Видео / Rutube', ph: 'https://' },
    { k: 'tour', l: '3D-тур', ph: 'https://' }
  ]},
  photoSimple: (label) => ({ t: label || 'Фото и планировка', f: [
    { k: 'photos', type: 'photos' },
    { k: 'video', l: 'Видео — файл или ссылка на VK Видео / Rutube', ph: 'https://' },
    { k: 'tour', l: '3D-тур', ph: 'https://' }
  ]}),
  descr: (label) => ({ t: label || 'Описание объекта', f: [
    { k: 'title', l: 'Заголовок', ph: 'До 33 знаков', max: 33,
      hint: 'Виден только при продвижении' },
    { k: 'descr', l: 'Описание', type: 'textarea', max: 3000 }
  ]}),
  termsFlat: { t: 'Цена и условия сделки', f: [
    { k: 'price', l: 'Цена', u: '₽' },
    { k: 'mortgage', l: 'Ипотека', type: 'chips', o: ['Возможна', 'Невозможна'] },
    { k: 'saleType', l: 'Тип продажи', type: 'chips', o: V.saleType },
    { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
    { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
    { k: 'phone2', l: 'Дополнительный номер' }
  ]},
  termsComm: { t: 'Условия сделки и контакты', f: [
    { k: 'tax', l: 'Налог', type: 'chips', o: V.tax },
    { k: 'dealType', l: 'Тип сделки', type: 'chips', o: V.dealType },
    { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
    { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
    { k: 'phone2', l: 'Дополнительный номер' }
  ]},
  publish: { t: 'Публикация объекта', f: [{ k: 'plan', type: 'publish' }] },
  featuresComm: (wet) => ({ t: 'Особенности', skip: true, f: [
    { k: 'ventilation', l: 'Вентиляция', type: 'chips', o: V.ventilation },
    { k: 'conditioning', l: 'Кондиционирование', type: 'chips', o: V.conditioning },
    { k: 'heating', l: 'Отопление', type: 'chips', o: V.heating },
    { k: 'fire', l: 'Система пожаротушения', type: 'chips', o: V.fire },
    ...(wet ? [
      { k: 'wet', l: 'Мокрые точки', type: 'chips', o: V.wetPoints },
      { k: 'power', l: 'Электрическая мощность', u: 'кВт' }
    ] : [])
  ]}),
  infra: (shop) => ({ t: 'Инфраструктура', skip: true, f: [
    { k: 'food', l: 'Общественное питание', type: 'chips', o: shop ? V.foodShop : V.food, multi: true },
    { k: 'fun', l: 'Развлечения и здоровье', type: 'chips', o: shop ? V.funShop : V.fun, multi: true },
    { k: 'trade', l: 'Торговля', type: 'chips', o: V.trade, multi: true },
    { k: 'services', l: 'Услуги', type: 'chips', o: shop ? V.servicesShop : V.services, multi: true },
    { k: 'zones', l: 'Специальные зоны', type: 'chips', o: V.zones, multi: true }
  ]}),
  locFlat: { t: 'Расположение', f: [
    { k: 'address', l: 'Адрес', ph: 'Укажите улицу и номер дома',
      hint: 'Редактировать адрес можно в течение 2 дней после публикации' },
    { k: 'map', type: 'map' },
    { k: 'metro', l: 'Основная станция метро', type: 'metro' },
    { k: 'floor', l: 'Этаж' },
    { k: 'floors', l: 'Этажей в доме' },
    { k: 'flatNo', l: 'Номер квартиры', hint: 'Не покажем номер квартиры в объявлении' },
    { k: 'year', l: 'Год постройки', group: 'О здании' },
    { k: 'ceiling', l: 'Высота потолков', u: 'м', group: 'О здании' },
    { k: 'houseType', l: 'Тип дома', type: 'chips', o: V.houseType, group: 'О здании' }
  ]},
  locPlain: (label, extra) => ({ t: 'Расположение', f: [
    { k: 'address', l: 'Адрес', ph: label || 'Укажите улицу и номер дома',
      hint: 'Редактировать адрес можно в течение 2 дней после публикации' },
    { k: 'map', type: 'map' },
    { k: 'metro', l: 'Основная станция метро', type: 'metro' },
    ...(extra || [])
  ]}),
  commRoom: (label) => ({ t: label || 'Параметры помещения', note:
    'Если продаёте несколько площадей в одном здании, добавьте их кнопкой «Добавить площадь»', f: [
    { k: 'area', l: 'Площадь', u: 'м²' },
    { k: 'floor', l: 'Этаж' },
    { k: 'priceMode', l: 'Цена', type: 'chips', o: V.priceMode },
    { k: 'price', l: '', u: '₽' },
    { k: 'photos', type: 'photos' },
    { k: 'addArea', type: 'addmore', l: '+ Добавить площадь' }
  ]})
};

// --- Ветки ---
const BRANCHES = {
  'Квартира': { price: '2 079 ₽', steps: [
    S.locFlat,
    { t: 'Параметры квартиры', f: [
      { k: 'rooms', l: 'Количество комнат', type: 'chips', o: V.rooms, req: true },
      { k: 'area', l: 'Общая площадь', u: 'м²', req: true },
      { k: 'areaLive', l: 'Жилая площадь', u: 'м²' },
      { k: 'areaKitchen', l: 'Площадь кухни', u: 'м²', req: true, err: 'Укажите площадь кухни' },
      { k: 'realtyType', l: 'Тип недвижимости', type: 'chips', o: V.realtyType, req: true, err: 'Выберите тип недвижимости' },
      { k: 'layout', l: 'Планировка', type: 'chips', o: V.layout },
      { k: 'cadastre', l: 'Кадастровый номер', ph: '00:00:0000000:0000' }
    ]},
    S.photoFlat,
    { t: 'Особенности', f: [
      { k: 'balcony', l: 'Балкон', type: 'counter' },
      { k: 'loggia', l: 'Лоджия', type: 'counter' },
      { k: 'view', l: 'Вид из окна', type: 'chips', o: ['Во двор', 'На улицу', 'На улицу и двор'] },
      { k: 'wcSep', l: 'Санузел раздельный', type: 'counter' },
      { k: 'wcComb', l: 'Санузел совмещённый', type: 'counter' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairFull },
      { k: 'redev', l: 'Перепланировка', type: 'chips', o: ['Нет', 'Есть'] },
      { k: 'furniture', l: 'Мебель', type: 'chips', o: ['С мебелью', 'Без мебели'] },
      { k: 'lift', l: 'Лифты', type: 'counter' },
      { k: 'porch', l: 'Подъезд', type: 'chips', o: ['Обычный', 'С консьержем'] },
      { k: 'yard', l: 'Придомовая территория', type: 'chips', o: ['Закрытая', 'Открытая'] },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.parking },
      { k: 'minors', l: 'Несовершеннолетние собственники', type: 'chips', o: ['Нет', 'Есть'], group: 'Юридические особенности' },
      { k: 'matcap', l: 'Материнский капитал при покупке', type: 'chips', o: ['Нет', 'Да'], group: 'Юридические особенности' }
    ]},
    { t: 'Доступная среда', skip: true, f: [
      { k: 'barrierFree', l: 'Безбарьерная среда', type: 'chips', o: ['Есть', 'Нет'] },
      { k: 'liftsAcc', l: 'Лифты и подъёмники', type: 'chips', o: ['Есть', 'Нет'] },
      { k: 'doorEntry', l: 'Дверной проём — входная дверь', type: 'chips', o: V.doorWidth },
      { k: 'doorBath', l: 'Дверной проём — ванная и санузел', type: 'chips', o: V.doorWidth },
      { k: 'doorRoom', l: 'Дверной проём — комнаты и кухня', type: 'chips', o: V.doorWidth }
    ]},
    S.descr('Описание квартиры'),
    S.termsFlat,
    { t: 'Проверка в Росреестре', skip: true, f: [
      { k: 'egrn', type: 'photos', l: 'Онлайн-выписка ЕГРН',
        hint: 'XML до 3 Мб. Даёт объекту значок «Проверено в Росреестре»' }
    ]},
    S.publish
  ]},

  'Комната или доля': { price: '1 950 ₽', steps: [
    S.locFlat,
    { t: 'Параметры квартиры', f: [
      { k: 'rooms', l: 'Количество комнат в квартире', type: 'chips', o: V.roomsNoFree },
      { k: 'area', l: 'Общая площадь', u: 'м²' },
      { k: 'areaLive', l: 'Жилая площадь', u: 'м²' },
      { k: 'areaKitchen', l: 'Площадь кухни', u: 'м²' },
      { k: 'realtyType', l: 'Тип недвижимости', type: 'chips', o: V.realtyType },
      { k: 'cadastre', l: 'Кадастровый номер', ph: '00:00:0000000:0000' },
      { k: 'sellWhat', l: 'Что продаёте', type: 'chips', o: ['Комнату', 'Долю'], group: 'Объект продажи' },
      { k: 'roomArea', l: 'Площадь комнаты', u: 'м²', group: 'Объект продажи', when: ['sellWhat', 'Комнату'] },
      { k: 'share', l: 'Размер доли', ph: '25% · 0,25 · 1/4', group: 'Объект продажи', when: ['sellWhat', 'Долю'] },
      { k: 'ownership', l: 'Право собственности', type: 'chips', o: ['Оформлено', 'Не оформлено'], group: 'Объект продажи', when: ['sellWhat', 'Долю'] },
      { k: 'redevBad', l: 'Несогласованная перепланировка', type: 'chips', o: ['Нет', 'Есть'], group: 'Объект продажи', when: ['sellWhat', 'Долю'] }
    ]},
    S.photoSimple('Фото и планировка'),
    { t: 'Особенности квартиры', f: [
      { k: 'balcony', l: 'Балкон', type: 'counter' },
      { k: 'loggia', l: 'Лоджия', type: 'counter' },
      { k: 'wcSep', l: 'Санузел раздельный', type: 'counter' },
      { k: 'wcComb', l: 'Санузел совмещённый', type: 'counter' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairFull, req: true, err: 'Укажите состояние квартиры' },
      { k: 'furniture', l: 'Мебель', type: 'chips', o: ['С мебелью', 'Без мебели'] },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.parking }
    ]},
    S.descr('Описание квартиры и комнаты'),
    { t: 'Цена и условия сделки', f: [
      { k: 'price', l: 'Цена', u: '₽' },
      { k: 'mortgage', l: 'Ипотека', type: 'chips', o: ['Возможна', 'Невозможна'] },
      { k: 'saleType', l: 'Тип продажи', type: 'chips', o: V.saleType },
      { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
      { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
      { k: 'phone2', l: 'Дополнительный номер' }
    ]},
    S.publish
  ]},

  'Дом/Дача': { price: '780 ₽', steps: [
    S.locPlain('Укажите адрес объекта', [{ k: 'village', l: 'Название коттеджного посёлка (если есть)' }]),
    S.photoSimple(),
    { t: 'Об участке', f: [
      { k: 'landArea', l: 'Площадь участка', u: 'сот.' },
      { k: 'landUnits', l: 'Единицы', type: 'chips', o: V.landUnits },
      { k: 'landCat', l: 'Категория земель', type: 'chips', o: V.landCat },
      { k: 'landStatus', l: 'Статус участка', type: 'chips', o: V.landStatus }
    ]},
    { t: 'О доме', f: [
      { k: 'houseKind', l: 'Тип дома', type: 'chips', o: V.houseKind, req: true, err: 'Укажите тип дома' },
      { k: 'area', l: 'Площадь дома', u: 'м²' },
      { k: 'bedrooms', l: 'Количество спален' },
      { k: 'floors', l: 'Количество этажей' },
      { k: 'year', l: 'Год постройки' },
      { k: 'material', l: 'Материал', type: 'chips', o: V.houseMat },
      { k: 'state', l: 'Состояние', type: 'chips', o: V.houseState }
    ]},
    { t: 'Коммуникации и удобства', f: [
      { k: 'wc', l: 'Санузел', type: 'chips', o: V.wc, req: true },
      { k: 'sewer', l: 'Канализация', type: 'chips', o: ['Центральная', 'Септик', 'Нет'], req: true },
      { k: 'water', l: 'Водоснабжение', type: 'chips', o: ['Центральное', 'Скважина', 'Колодец', 'Нет'], req: true },
      { k: 'gas', l: 'Газ', type: 'chips', o: ['Есть', 'По границе участка', 'Нет'], req: true, err: 'Укажите информацию о газе' },
      { k: 'heating', l: 'Отопление', type: 'chips', o: V.heatingHouse, req: true },
      { k: 'power', l: 'Электричество', type: 'chips', o: ['Есть', 'По границе участка', 'Нет'], req: true, err: 'Укажите информацию об электричестве' },
      { k: 'extra', l: 'Дополнительно', type: 'chips', o: V.extraHouse, multi: true }
    ]},
    S.descr(),
    S.termsFlat,
    S.publish
  ]},

  'Участок': { price: '690 ₽', steps: [
    S.locPlain('Укажите адрес объекта', [{ k: 'village', l: 'Название коттеджного посёлка (если есть)' }]),
    S.photoSimple('Фотографии и план'),
    { t: 'Об участке', f: [
      { k: 'landArea', l: 'Площадь участка', u: 'сот.' },
      { k: 'landUnits', l: 'Единицы', type: 'chips', o: V.landUnits },
      { k: 'landCat', l: 'Категория земель', type: 'chips', o: V.landCat },
      { k: 'landStatus', l: 'Статус участка', type: 'chips', o: V.landStatus }
    ]},
    { t: 'Коммуникации и удобства', f: [
      { k: 'sewer', l: 'Канализация', type: 'chips', o: ['Центральная', 'Септик', 'Нет'] },
      { k: 'water', l: 'Водоснабжение', type: 'chips', o: ['Центральное', 'Скважина', 'Колодец', 'Нет'] },
      { k: 'gas', l: 'Газ', type: 'chips', o: ['Есть', 'По границе участка', 'Нет'] },
      { k: 'power', l: 'Электричество', type: 'chips', o: ['Есть', 'По границе участка', 'Нет'] }
    ]},
    S.descr(),
    S.termsFlat,
    S.publish
  ]},

  'Гараж': { price: '144 ₽', steps: [
    S.locPlain('Улица и номер объекта'),
    { t: 'Параметры гаража, фото и видео', f: [
      { k: 'garageType', l: 'Тип', type: 'chips', o: V.garageType },
      { k: 'area', l: 'Площадь', u: 'м²' },
      { k: 'garageStatus', l: 'Статус', type: 'chips', o: V.garageStatus },
      { k: 'gsk', l: 'Гаражно-строительный кооператив' },
      { k: 'cadastre', l: 'Кадастровый номер', ph: '00:00:0000000:0000' },
      { k: 'photos', type: 'photos' },
      { k: 'video', l: 'Видео — ссылка на VK Видео / Rutube', ph: 'https://' }
    ]},
    { t: 'Инфраструктура и особенности', f: [
      { k: 'comm', l: 'Коммуникации', type: 'chips', o: V.garageComm, multi: true },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.garagePark }
    ]},
    S.descr('Описание'),
    { t: 'Цена и условия сделки', f: [
      { k: 'price', l: 'Цена', u: '₽' },
      { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
      { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
      { k: 'phone2', l: 'Дополнительный номер' }
    ]},
    S.publish
  ]},

  'Офис': { price: '2 100 ₽', steps: [
    S.locPlain('Введите адрес или название бизнес-центра'),
    S.commRoom(),
    { t: 'Параметры здания', f: [
      { k: 'class', l: 'Класс здания', type: 'chips', o: V.buildingClass },
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании', req: true, err: 'Заполните количество этажей' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairOffice },
      { k: 'layoutComm', l: 'Планировка', type: 'chips', o: ['Открытая', 'Кабинетная', 'Смешанная'], group: 'Дополнительные параметры' },
      { k: 'furniture', l: 'Мебель', type: 'chips', o: ['С мебелью', 'Без мебели'], group: 'Дополнительные параметры' },
      { k: 'access', l: 'Пропускной режим', type: 'chips', o: ['Есть', 'Нет'], group: 'Дополнительные параметры' },
      { k: 'legalAddr', l: 'Юридический адрес', type: 'chips', o: ['Можно предоставить', 'Нельзя'], group: 'Дополнительные параметры' },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000', group: 'Дополнительные параметры' },
      { k: 'occupied', l: 'Помещение занято', type: 'chips', o: ['Да', 'Нет'], group: 'Дополнительные параметры' },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.parking, group: 'Дополнительные параметры' },
      { k: 'parkingPrice', l: 'Стоимость парковки', u: '₽/мес.', group: 'Дополнительные параметры' },
      { k: 'parkingPlaces', l: 'Мест на парковке', group: 'Дополнительные параметры' },
      { k: 'buildingType', l: 'Тип здания', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'buildingArea', l: 'Площадь здания', u: 'м²', group: 'Дополнительные параметры' },
      { k: 'land', l: 'Участок', u: 'га', group: 'Дополнительные параметры' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn, group: 'Дополнительные параметры' },
      { k: 'video', l: 'Видео', ph: 'https://' },
      { k: 'tour', l: '3D-тур', ph: 'https://' }
    ]},
    S.featuresComm(true),
    S.infra(false),
    S.descr('Описание офиса'),
    S.termsComm,
    S.publish
  ]},

  'Здание': { price: '3 300 ₽', steps: [
    S.locPlain(),
    { t: 'Основные параметры здания', f: [
      { k: 'class', l: 'Класс здания', type: 'chips', o: V.buildingClass },
      { k: 'area', l: 'Площадь', u: 'м²' },
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании' },
      { k: 'price', l: 'Цена', u: '₽' },
      { k: 'purpose', l: 'Назначение', type: 'select', o: V.purpose, req: true, err: 'Укажите назначение' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairFull },
      { k: 'category', l: 'Категория', type: 'chips', o: V.category },
      { k: 'photos', type: 'photos' },
      { k: 'video', l: 'Видео', ph: 'https://' },
      { k: 'tour', l: '3D-тур', ph: 'https://' }
    ]},
    { t: 'Дополнительные параметры здания', skip: true, f: [
      { k: 'entrance', l: 'Вход', type: 'chips', o: V.entrance },
      { k: 'lift', l: 'Лифты', type: 'counter' },
      { k: 'travolator', l: 'Травалаторы', type: 'counter' },
      { k: 'escalator', l: 'Эскалаторы', type: 'counter' },
      { k: 'furniture', l: 'Мебель', type: 'chips', o: ['С мебелью', 'Без мебели'] },
      { k: 'houseLine', l: 'Линия домов', type: 'chips', o: V.houseLine },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000',
        hint: 'Укажите номер налоговой, обслуживающей ваш адрес — часто он важен при поиске' },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.parking },
      { k: 'parkingPrice', l: 'Стоимость парковки', u: '₽/мес.' },
      { k: 'parkingPlaces', l: 'Мест на парковке' },
      { k: 'land', l: 'Участок', u: 'га' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn }
    ]},
    S.featuresComm(false),
    S.descr('Описание помещения'),
    S.termsComm,
    S.publish
  ]},

  'Торговая площадь': { price: '768 ₽', steps: [
    S.locPlain('Введите адрес или название бизнес-центра'),
    S.commRoom(),
    { t: 'Параметры здания', f: [
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании', req: true, err: 'Заполните количество этажей' },
      { k: 'shopType', l: 'Тип помещения', type: 'chips', o: V.shopType },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairFull },
      { k: 'purpose', l: 'Назначение', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'entrance', l: 'Вход', type: 'chips', o: V.entrance, group: 'Дополнительные параметры' },
      { k: 'showcase', l: 'Витринные окна', type: 'chips', o: V.showcase, group: 'Дополнительные параметры' },
      { k: 'legalAddr', l: 'Юридический адрес', type: 'chips', o: ['Можно предоставить', 'Нельзя'], group: 'Дополнительные параметры' },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000', group: 'Дополнительные параметры' },
      { k: 'occupied', l: 'Помещение занято', type: 'chips', o: ['Да', 'Нет'], group: 'Дополнительные параметры' },
      { k: 'buildingType', l: 'Тип здания', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'buildingArea', l: 'Площадь здания', u: 'м²', group: 'Дополнительные параметры' },
      { k: 'land', l: 'Участок', u: 'га', group: 'Дополнительные параметры' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn, group: 'Дополнительные параметры' }
    ]},
    S.featuresComm(true),
    S.infra(true),
    S.descr('Описание торговой площади'),
    S.termsComm,
    S.publish
  ]},

  'Помещение свободного назначения': { price: '1 830 ₽', steps: [
    S.locPlain('Введите адрес или название бизнес-центра'),
    S.commRoom(),
    { t: 'Параметры здания', f: [
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании', req: true, err: 'Заполните количество этажей' },
      { k: 'psnPurpose', l: 'Назначение', type: 'chips', o: V.psnPurpose, multi: true, req: true,
        err: 'Укажите назначение', hint: 'Можно выбрать несколько' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairFull },
      { k: 'entrance', l: 'Вход', type: 'chips', o: V.entrance, group: 'Дополнительные параметры' },
      { k: 'showcase', l: 'Витринные окна', type: 'chips', o: V.showcase, group: 'Дополнительные параметры' },
      { k: 'legalAddr', l: 'Юридический адрес', type: 'chips', o: ['Можно предоставить', 'Нельзя'], group: 'Дополнительные параметры' },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000', group: 'Дополнительные параметры' },
      { k: 'occupied', l: 'Помещение занято', type: 'chips', o: ['Да', 'Нет'], group: 'Дополнительные параметры' },
      { k: 'buildingType', l: 'Тип здания', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'buildingArea', l: 'Площадь здания', u: 'м²', group: 'Дополнительные параметры' },
      { k: 'land', l: 'Участок', u: 'га', group: 'Дополнительные параметры' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn, group: 'Дополнительные параметры' }
    ]},
    S.featuresComm(true),
    S.descr('Описание помещения'),
    S.termsComm,
    S.publish
  ]},

  'Производство': { price: '630 ₽', steps: [
    S.locPlain(),
    S.commRoom('Параметры производства'),
    { t: 'Параметры здания', f: [
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairProd },
      { k: 'gates', l: 'Ворота', type: 'chips', o: V.gates, group: 'Дополнительные параметры' },
      { k: 'liftCargo', l: 'Грузовой лифт', type: 'counter', group: 'Дополнительные параметры' },
      { k: 'telpher', l: 'Тельфер', type: 'counter', group: 'Дополнительные параметры' },
      { k: 'liftPass', l: 'Пассажирский лифт', type: 'counter', group: 'Дополнительные параметры' },
      { k: 'crane', l: 'Крановое оборудование', type: 'chips', o: V.craneEquip, multi: true, group: 'Дополнительные параметры' },
      { k: 'floorMat', l: 'Материал пола', type: 'chips', o: V.floorMat, group: 'Дополнительные параметры' },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.prodPark, group: 'Дополнительные параметры' },
      { k: 'parkingType', l: 'Тип парковки', type: 'chips', o: V.prodParkType, group: 'Дополнительные параметры' },
      { k: 'legalAddr', l: 'Юридический адрес', type: 'chips', o: ['Можно предоставить', 'Нельзя'], group: 'Дополнительные параметры' },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000', group: 'Дополнительные параметры' },
      { k: 'buildingType', l: 'Тип здания', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'buildingArea', l: 'Площадь здания', u: 'м²', group: 'Дополнительные параметры' },
      { k: 'land', l: 'Участок', u: 'га', group: 'Дополнительные параметры' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn, group: 'Дополнительные параметры' }
    ]},
    { t: 'Инфраструктура и особенности', skip: true, f: [
      { k: 'food', l: 'Питание', type: 'chips', o: V.prodFood, multi: true },
      { k: 'zones', l: 'Услуги и специальные зоны', type: 'chips', o: V.prodZones, multi: true },
      { k: 'ventilation', l: 'Вентиляция', type: 'chips', o: V.ventilation },
      { k: 'conditioning', l: 'Кондиционирование', type: 'chips', o: V.conditioning },
      { k: 'heating', l: 'Отопление', type: 'chips', o: V.heating },
      { k: 'fire', l: 'Система пожаротушения', type: 'chips', o: V.fire },
      { k: 'wet', l: 'Мокрые точки', type: 'chips', o: V.wetPoints },
      { k: 'power', l: 'Электрическая мощность', u: 'кВт' },
      { k: 'prodExtra', l: 'Дополнительные услуги', type: 'chips', o: V.prodExtra, multi: true }
    ]},
    S.descr('Описание производства'),
    S.termsComm,
    S.publish
  ]},

  'Склад': { price: '1 446 ₽', steps: [
    S.locPlain('Введите адрес или название бизнес-центра'),
    S.commRoom('Параметры склада'),
    { t: 'Параметры здания', f: [
      { k: 'ceiling', l: 'Высота потолков', u: 'м' },
      { k: 'floors', l: 'Этажей в здании' },
      { k: 'repair', l: 'Ремонт', type: 'chips', o: V.repairProd },
      { k: 'gates', l: 'Ворота', type: 'chips', o: V.gates, group: 'Дополнительные параметры' },
      { k: 'liftCargo', l: 'Грузовой лифт', type: 'counter', group: 'Дополнительные параметры' },
      { k: 'telpher', l: 'Тельфер', type: 'counter', group: 'Дополнительные параметры' },
      { k: 'floorMat', l: 'Материал пола', type: 'chips', o: V.floorMat, group: 'Дополнительные параметры' },
      { k: 'legalAddr', l: 'Юридический адрес', type: 'chips', o: ['Можно предоставить', 'Нельзя'], group: 'Дополнительные параметры' },
      { k: 'taxOffice', l: 'Номер налоговой', ph: '000', group: 'Дополнительные параметры' },
      { k: 'parking', l: 'Парковка', type: 'chips', o: V.prodPark, group: 'Дополнительные параметры' },
      { k: 'parkingType', l: 'Тип парковки', type: 'chips', o: V.prodParkType, group: 'Дополнительные параметры' },
      { k: 'parkingPlaces', l: 'Мест на парковке', group: 'Дополнительные параметры' },
      { k: 'buildingType', l: 'Тип здания', type: 'select', o: V.purpose, group: 'Дополнительные параметры' },
      { k: 'buildingArea', l: 'Площадь здания', u: 'м²', group: 'Дополнительные параметры' },
      { k: 'land', l: 'Участок', u: 'га', group: 'Дополнительные параметры' },
      { k: 'landOwn', l: '', type: 'chips', o: V.landOwn, group: 'Дополнительные параметры' }
    ]},
    { t: 'Инфраструктура и особенности', skip: true, f: [
      { k: 'food', l: 'Питание', type: 'chips', o: V.prodFood, multi: true },
      { k: 'zones', l: 'Услуги и специальные зоны', type: 'chips', o: V.prodZones, multi: true },
      { k: 'ventilation', l: 'Вентиляция', type: 'chips', o: V.ventilation },
      { k: 'conditioning', l: 'Кондиционирование', type: 'chips', o: V.conditioning },
      { k: 'heating', l: 'Отопление', type: 'chips', o: V.heating },
      { k: 'fire', l: 'Система пожаротушения', type: 'chips', o: V.fire },
      { k: 'wet', l: 'Мокрые точки', type: 'chips', o: V.wetPoints },
      { k: 'power', l: 'Электрическая мощность', u: 'кВт' }
    ]},
    S.descr('Описание склада'),
    S.termsComm,
    S.publish
  ]},

  'Бизнес': { price: '2 760 ₽', steps: [
    { t: 'Тип бизнеса', f: [
      { k: 'bizKind', l: '', type: 'chips', o: V.bizKind, req: true,
        hint: 'Арендный — помещение в собственности с арендатором на долгий срок. Готовый — помещение в собственности или аренде с юрлицом, имуществом и сотрудниками' }
    ]},
    S.locPlain('Укажите улицу и номер дома', [
      { k: 'hideAddr', l: 'Точный адрес объекта', type: 'chips', o: V.hideAddr,
        hint: 'Если скрыть, покажем только район и улицу' }
    ]),
    { t: 'Параметры бизнеса', f: [
      { k: 'bizCatRent', l: 'Категория бизнеса', type: 'chips', o: V.bizRentCat, when: ['bizKind', 'Арендный бизнес'] },
      { k: 'bizCatReady', l: 'Категория бизнеса', type: 'chips', o: V.bizReadyCat, when: ['bizKind', 'Готовый бизнес'] },
      { k: 'price', l: 'Цена', u: '₽' },
      { k: 'profit', l: 'Месячная прибыль', u: '₽' },
      { k: 'area', l: 'Площадь', u: 'м²' },
      { k: 'floor', l: 'Этаж' },
      { k: 'furniture', l: 'Мебель', type: 'chips', o: ['С мебелью', 'Без мебели'] },
      { k: 'equipment', l: 'Оборудование', type: 'chips', o: ['Есть', 'Нет'] },
      { k: 'photos', type: 'photos', l: 'Фото здания и помещения' },
      { k: 'video', l: 'Видео', ph: 'https://' },
      { k: 'tour', l: '3D-тур', ph: 'https://' }
    ]},
    S.descr('Описание бизнеса'),
    { t: 'Условия сделки и контакты', f: [
      { k: 'tax', l: 'Налог', type: 'chips', o: V.tax },
      { k: 'bizRealty', l: 'Недвижимость', type: 'chips', o: V.bizRealty },
      { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
      { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
      { k: 'phone2', l: 'Дополнительный номер' }
    ]},
    S.publish
  ]},

  'Коммерческая земля': { price: '1 530 ₽', steps: [
    S.locPlain(),
    { t: 'Параметры участка', f: [
      { k: 'landArea', l: 'Площадь', u: 'сот.' },
      { k: 'landUnits', l: 'Единицы', type: 'chips', o: V.landUnits },
      { k: 'commLandCat', l: 'Категория земли', type: 'chips', o: V.commLandCat },
      { k: 'commLandUse', l: 'Вид разрешённого использования', type: 'chips', o: V.commLandUse, multi: true },
      { k: 'price', l: 'Цена', u: '₽' },
      { k: 'photos', type: 'photos' },
      { k: 'video', l: 'Видео', ph: 'https://' },
      { k: 'tour', l: '3D-тур', ph: 'https://' }
    ]},
    { t: 'Особенности участка', f: [
      { k: 'power', l: 'Электричество', type: 'chips', o: V.commLandLine },
      { k: 'gas', l: 'Газ', type: 'chips', o: V.commLandLine },
      { k: 'sewer', l: 'Канализация', type: 'chips', o: V.commLandLine },
      { k: 'water', l: 'Водоснабжение', type: 'chips', o: V.commLandLine },
      { k: 'roads', l: 'Подъездные пути', type: 'chips', o: V.roads }
    ]},
    S.descr('Описание участка'),
    { t: 'Условия сделки и контакты', f: [
      { k: 'bonus', l: 'Бонус посреднику', u: '₽' },
      { k: 'phone', l: 'Телефон', ph: '+7 (999) 000-00-00' },
      { k: 'phone2', l: 'Дополнительный номер' }
    ]},
    S.publish
  ]}
};

// Ветки, повторяющие другие
BRANCHES['Квартира в новостройке'] = BRANCHES['Квартира'];
BRANCHES['Коттедж'] = BRANCHES['Дом/Дача'];

// Таунхаус: как дом, но без «Типа дома»
BRANCHES['Таунхаус'] = { price: '780 ₽', steps: BRANCHES['Дом/Дача'].steps.map(st =>
  st.t === 'О доме' ? { ...st, f: st.f.filter(f => f.k !== 'houseKind') } : st) };

// Часть дома: как дом, без «Типа дома», но с размером доли
BRANCHES['Часть дома'] = { price: '780 ₽', steps: BRANCHES['Дом/Дача'].steps.map(st =>
  st.t === 'О доме'
    ? { ...st, f: [{ k: 'share', l: 'Размер доли', ph: 'прим. 25%, 0.25, 1/4' },
                   ...st.f.filter(f => f.k !== 'houseKind')] }
    : st) };
