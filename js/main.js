/* СОЛД – Делись — main.js */

let _catalogItems = [];
let _catalogView = null;       /* null = список скрыт до клика по view-toggle */

// Ссылка на карточку объекта зависит от авторизации:
// гость → версия для незарегистрированных, вошедший → полная версия
function objectHref(id) {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('delis_user') || 'null'); } catch (e) {}
  const page = user ? 'object.html' : 'object-unreg.html';
  return `pages/${page}?id=${id}`;
}

// Префикс до корня сайта (для ссылок, работающих с любой вложенности)
function rootPrefix() {
  if (location.pathname.includes('/pages/cabinet/')) return '../../';
  if (location.pathname.includes('/pages/')) return '../';
  return '';
}

// Проводим ссылки навигации шапки на статичные страницы
function initHeaderNav() {
  const base = rootPrefix();
  const map = {
    'О проекте': base + 'about.html',
    'Вакансии':  base + 'vacancies.html',
    'Контакты':  base + 'contacts.html'
  };
  document.querySelectorAll('a.header__nav-link').forEach(a => {
    const t = a.textContent.trim();
    if (map[t]) a.href = map[t];
  });
}

// Бургер-меню для мобильных (вставляется на все страницы с main.js)
function initBurger() {
  const inner = document.querySelector('.header__inner');
  if (!inner || document.querySelector('.header__burger')) return;
  const base = rootPrefix();
  let user = null;
  try { user = JSON.parse(localStorage.getItem('delis_user') || 'null'); } catch (e) {}

  const burger = document.createElement('button');
  burger.className = 'header__burger';
  burger.type = 'button';
  burger.setAttribute('aria-label', 'Меню');
  burger.innerHTML = '<span></span><span></span><span></span>';
  inner.appendChild(burger);

  const auth = user
    ? `<a href="${base}pages/cabinet/profile.html" class="btn btn--dark">Личный кабинет</a>`
    : `<a href="${base}pages/cabinet/login.html" class="btn btn--outline">Вход</a>
       <a href="${base}pages/cabinet/register.html" class="btn btn--dark">Регистрация</a>`;

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.innerHTML = `
    <div class="mobile-menu__panel">
      <button class="mobile-menu__close" type="button" aria-label="Закрыть">&times;</button>
      <nav class="mobile-menu__nav">
        <a href="${base}index.html">Главная</a>
        <a href="${base}catalog.html">Каталог объектов</a>
        <a href="${base}about.html">О проекте</a>
        <a href="${base}vacancies.html">Вакансии</a>
        <a href="${base}contacts.html">Контакты</a>
      </nav>
      <div class="mobile-menu__auth">${auth}</div>
    </div>`;
  document.body.appendChild(menu);

  const open = () => { menu.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('is-open'); document.body.style.overflow = ''; };
  burger.addEventListener('click', open);
  menu.querySelector('.mobile-menu__close').addEventListener('click', close);
  menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// Избранное: клики по сердечкам + иконка в шапке со счётчиком
function updateFavBadge() {
  const heart = document.querySelector('.header__icon-btn[aria-label="Избранное"]');
  if (!heart || typeof Favorites === 'undefined') return;
  let badge = heart.querySelector('.header__fav-badge');
  const n = Favorites.count();
  if (n > 0) {
    if (!badge) { badge = document.createElement('span'); badge.className = 'header__fav-badge'; heart.appendChild(badge); }
    badge.textContent = n;
  } else if (badge) {
    badge.remove();
  }
}
function initFavorites() {
  if (typeof Favorites === 'undefined') return;
  // Сердечки на карточках (делегирование — работает и после перерисовки списка)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const nowFav = Favorites.toggle(btn.dataset.fav);
    btn.classList.toggle('is-fav', nowFav);
    const img = btn.querySelector('img');
    if (img && btn.dataset.favOn) img.src = nowFav ? btn.dataset.favOn : btn.dataset.favOff;
    updateFavBadge();
  });
  // Иконка избранного в шапке → страница «Избранное»
  const heart = document.querySelector('.header__icon-btn[aria-label="Избранное"]');
  if (heart) {
    heart.setAttribute('href', rootPrefix() + 'pages/cabinet/favorites.html');
    heart.style.position = 'relative';
  }
  updateFavBadge();
}

// ---------- Catalog: "Топ объекты от Делись" (всегда плитка) ----------
async function renderCatalog() {
  const onCatalogPage = document.body.classList.contains('page-catalog');
  // Страница нужна, только если есть «Топ объекты» (главная) или это страница каталога
  if (!document.getElementById('catalog-grid') && !onCatalogPage) return;
  try {
    if (window.__OBJECTS) {
      _catalogItems = window.__OBJECTS;
    } else {
      const res = await fetch('data/objects.json?v=20260609f');
      _catalogItems = await res.json();
    }
    drawCatalog(_catalogItems);     // no-op, если нет #catalog-grid
    initRanges();
    if (onCatalogPage) {
      // На странице каталога список виден сразу — все объекты карточками
      _catalogView = 'cards';
      document.querySelectorAll('#view-toggle .view-toggle__btn').forEach(b =>
        b.classList.toggle('view-toggle__btn--active', b.dataset.view === 'cards'));
      drawMainList(getFiltered());
    } else {
      drawMainList(_catalogItems);
    }
    updateApplyCount();
  } catch (e) {
    console.warn('Failed to load objects.json', e);
  }
}
function drawCatalog(items) {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';
  items.slice(0, 7).forEach(o => grid.appendChild(objCard(o)));
  grid.appendChild(promoSlider());
}
function drawMainList(items) {
  const container = document.getElementById('main-list');
  if (!container) return;
  container.innerHTML = '';
  if (!_catalogView) { container.style.display = 'none'; return; }
  container.style.display = '';
  container.dataset.view = _catalogView;

  const count = document.createElement('div');
  count.className = 'main-list__count';
  count.textContent = `Найдено объектов: ${items.length}`;
  container.appendChild(count);

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'main-list__empty';
    empty.innerHTML = 'По вашему запросу ничего не найдено.<br>Попробуйте изменить фильтры или поиск.';
    container.appendChild(empty);
    return;
  }

  if (_catalogView === 'table') {
    container.appendChild(catalogTable(items));
  } else if (_catalogView === 'cards') {
    items.forEach(o => container.appendChild(objListRow(o)));
  }
  container.appendChild(catalogPagination());
}

function catalogTable(items) {
  const wrap = document.createElement('div');
  wrap.className = 'cat-table';
  const arrows = '<span class="cat-table__sort">↕</span>';
  const SVG_LOCK = `<svg class="cat-table__bonus-lock" viewBox="0 0 18 22" fill="none" stroke="#282828" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="14" height="16"><rect x="3" y="10" width="12" height="10" rx="2" fill="#282828"/><path d="M6 10V6.5a3 3 0 0 1 6 0V10"/></svg>`;
  // расширяем список: дублируем объекты, чтобы было ~20 строк
  const extended = [...items, ...items, ...items].slice(0, 22);
  const randId = () => Math.floor(100000 + Math.random() * 900000);
  wrap.innerHTML = `
    <div class="cat-table__head">
      <div>Id</div>
      <div>Тип</div>
      <div>Район</div>
      <div>Метро</div>
      <div>Этаж ${arrows}</div>
      <div>Год ${arrows}</div>
      <div>S, м² ${arrows}</div>
      <div>Цена ${arrows}</div>
      <div>Бонус ${arrows}</div>
      <div></div>
    </div>
    <div class="cat-table__body">
      ${extended.map((o, idx) => {
        const idNum = /^\d+$/.test(String(o.id || '')) ? o.id : randId();
        // каждая 3-я строка показывает замочек вместо суммы бонуса
        const bonusCell = (idx % 3 === 2)
          ? SVG_LOCK
          : (o.commission || '100 000 000 ₽');
        return `
        <div class="cat-table__row">
          <div>${idNum}</div>
          <div>${o.type || 'Студия'}</div>
          <div>${o.district || 'Лужский муниципальный район'}</div>
          <div class="cat-table__metro"><img src="images/icon-metro.svg" alt="" width="13" height="10"><span>${o.metro || 'Московская'}</span><img src="images/icon-walk.svg" alt="" width="9" height="13"><span>${o.walk || '10 мин.'}</span></div>
          <div>${o.floor || '20/20'}</div>
          <div>${o.year || '2022'}</div>
          <div>${o.area || '200.200'}</div>
          <div>${o.price || '100 000 000 ₽'}</div>
          <div class="cat-table__bonus-cell">${bonusCell}</div>
          <div class="cat-table__heart-cell"><button class="cat-table__heart" aria-label="В избранное"><img src="images/icon-heart-outline.svg" alt="" width="17" height="15"></button></div>
        </div>
      `;}).join('')}
    </div>
  `;
  wrap.querySelectorAll('.cat-table__heart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('is-active');
      const img = btn.querySelector('img');
      if (img) img.src = btn.classList.contains('is-active') ? 'images/icon-heart-filled.svg' : 'images/icon-heart-outline.svg';
    });
  });
  return wrap;
}
function objListRow(o) {
  const row = document.createElement('article');
  row.className = 'cat-row';
  const SVG_PIN = `<svg viewBox="0 0 14 14" fill="none" stroke="#7622D7" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 6c0 4-5 7-5 7s-5-3-5-7a5 5 0 0 1 10 0z"/><circle cx="7" cy="6" r="1.6"/></svg>`;
  const SVG_METRO = `<img src="images/icon-metro.svg" alt="" width="15" height="12">`;
  const SVG_WALK = `<img src="images/icon-walk.svg" alt="" width="10" height="14">`;
  const favOn = Favorites.has(o.id);
  const SVG_HEART = `<img src="images/${favOn ? 'icon-heart-filled' : 'icon-heart-outline'}.svg" alt="" width="20" height="18" class="cat-row__act-img">`;
  const SVG_PHONE = `<img src="images/icon-phone.svg" alt="" width="18" height="18" class="cat-row__act-img">`;
  const SVG_EXT = `<img src="images/icon-link.svg" alt="" width="18" height="18" class="cat-row__act-img">`;
  const href = objectHref(o.id);
  row.innerHTML = `
    <a href="${href}" class="cat-row__photo">
      <img src="${o.image}" alt="${o.title}">
    </a>
    <div class="cat-row__main">
      <div class="cat-row__head">
        <h3 class="cat-row__title">${o.title}</h3>
        <span class="cat-row__sep">•</span>
        <span class="cat-row__area">${o.area}</span>
      </div>
      <div class="cat-row__tags">
        <span class="cat-row__tag">Возможна ипотека</span>
        <span class="cat-row__tag">Вторичка</span>
        <span class="cat-row__tag">Объект «Делись»</span>
      </div>
      <div class="cat-row__loc"><span class="cat-row__icon">${SVG_PIN}</span><span>Санкт-Петербург, наб. реки Каменки, 3к3</span></div>
      <div class="cat-row__metro">
        <span class="cat-row__icon">${SVG_METRO}</span><span>${o.metro || 'Московская'}</span>
        <span class="cat-row__icon" style="margin-left:8px;">${SVG_WALK}</span><span>${o.walk || '10 мин.'}</span>
      </div>
    </div>
    <div class="cat-row__prices">
      <div class="cat-row__price-line"><span>Сумма</span><span class="cat-row__price-dots"></span><strong>${o.price}</strong></div>
      <div class="cat-row__price-line"><span>Цена, ₽/м²</span><span class="cat-row__price-dots"></span><strong>${o.pricePerM}</strong></div>
      <div class="cat-row__price-line cat-row__price-line--commission"><span><i>Комиссия за сделку</i></span><span class="cat-row__price-dots"></span><strong>${o.commission}</strong></div>
    </div>
    <div class="cat-row__agent">
      <div class="cat-row__agent-avatar"><span>LOGO</span></div>
      <div class="cat-row__agent-info">
        <div class="cat-row__agent-name">Квартирный клуб</div>
        <div class="cat-row__agent-line">Тел.: +7 911 111 22 33</div>
        <div class="cat-row__agent-line">Почта: p.e.realty@yandex.ru</div>
      </div>
    </div>
    <div class="cat-row__actions">
      <button class="cat-row__act cat-row__act--heart ${favOn ? 'is-fav' : ''}" data-fav="${o.id}" data-fav-on="images/icon-heart-filled.svg" data-fav-off="images/icon-heart-outline.svg" aria-label="В избранное">${SVG_HEART}</button>
      <button class="cat-row__act" aria-label="Позвонить">${SVG_PHONE}</button>
      <a href="${href}" class="cat-row__act" aria-label="Открыть">${SVG_EXT}</a>
    </div>
  `;
  return row;
}
function catalogPagination() {
  const wrap = document.createElement('div');
  wrap.className = 'cat-pagination';
  wrap.innerHTML = `
    <button class="cat-pagination__arrow" aria-label="Назад"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 5l-5 5 5 5"/></svg></button>
    <button class="cat-pagination__num is-active">1</button>
    <button class="cat-pagination__num">2</button>
    <button class="cat-pagination__num">3</button>
    <button class="cat-pagination__num">4</button>
    <button class="cat-pagination__num">5</button>
    <button class="cat-pagination__arrow cat-pagination__arrow--active" aria-label="Вперёд"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M8 5l5 5-5 5"/></svg></button>
  `;
  return wrap;
}
const _num = v => Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
const _bonusPct = o => _num(o.price) ? Math.round(_num(o.commission) / _num(o.price) * 1000) / 10 : 0;

// ===== Состояние фильтров =====
let _sortKey = null;          // ключ сортировки
let _ranges = {};             // key -> {min,max,from,to,step,unit}

function _objVal(o, key) {
  if (key === 'area')     return _num(o.area);
  if (key === 'price')    return _num(o.price);
  if (key === 'floor')    return Number(o.floor) || 0;
  if (key === 'bonusRub') return _num(o.commission);
  if (key === 'bonusPct') return _bonusPct(o);
  return 0;
}

// Проходит ли объект по всем активным фильтрам (читаем состояние прямо из DOM)
function objectMatches(o) {
  // Текстовый поиск
  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  if (q) {
    const hay = [o.title, o.metro, o.district, o.id, o.rooms].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  // Район
  const districts = [...document.querySelectorAll('.filter-select__dropdown .filter-check input:checked')]
    .map(i => i.parentElement.textContent.trim());
  if (districts.length && !districts.includes(o.district)) return false;
  // Тип недвижимости
  const types = [...document.querySelectorAll('[data-group="type"] .filter-check input:checked')]
    .map(i => i.parentElement.textContent.trim());
  if (types.length && !types.includes(o.type)) return false;
  // Количество комнат
  const rooms = [...document.querySelectorAll('[data-group="rooms"] .filter-pill--active')]
    .map(b => b.dataset.room);
  if (rooms.length && !rooms.includes(o.rooms)) return false;
  // «Не первый» этаж
  if (document.querySelector('[data-flag="not-first"]')?.checked && (Number(o.floor) || 0) <= 1) return false;
  // Диапазоны (площадь, цена, этаж, бонусы)
  for (const key in _ranges) {
    const r = _ranges[key];
    const v = _objVal(o, key);
    if (v < r.from || v > r.to) return false;
  }
  return true;
}

function getFiltered() {
  let arr = _catalogItems.filter(objectMatches);
  const k = _sortKey;
  if (k === 'area-asc')  arr.sort((a, b) => _num(a.area)  - _num(b.area));
  if (k === 'area-desc') arr.sort((a, b) => _num(b.area)  - _num(a.area));
  if (k === 'price-asc') arr.sort((a, b) => _num(a.price) - _num(b.price));
  if (k === 'price-desc')arr.sort((a, b) => _num(b.price) - _num(a.price));
  return arr;
}

// Список скрыт до первого действия — показываем его (в виде карточек)
function ensureListVisible() {
  if (!_catalogView) {
    _catalogView = 'cards';
    document.querySelectorAll('#view-toggle .view-toggle__btn').forEach(b =>
      b.classList.toggle('view-toggle__btn--active', b.dataset.view === 'cards'));
  }
}

function updateApplyCount() {
  const lbl = document.getElementById('filter-apply-label');
  if (lbl) lbl.textContent = `Показать (${getFiltered().length})`;
}

function refreshList({ scroll = false } = {}) {
  ensureListVisible();
  const arr = getFiltered();
  drawMainList(arr);
  updateApplyCount();
  if (scroll) document.getElementById('main-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.applySort = (key) => { _sortKey = key; refreshList(); };

// ===== Слайдеры диапазонов =====
function _fmtRange(n, unit) { return Math.round(n).toLocaleString('ru-RU') + (unit || ''); }

function renderRange(box) {
  const r = _ranges[box.dataset.key];
  if (!r) return;
  const span = r.max - r.min || 1;
  const pf = (r.from - r.min) / span * 100;
  const pt = (r.to - r.min) / span * 100;
  const fill = box.querySelector('.filter-range__fill');
  const thumbs = box.querySelectorAll('.filter-range__thumb');
  fill.style.left = pf + '%';
  fill.style.right = (100 - pt) + '%';
  thumbs[0].style.left = pf + '%';
  thumbs[1].style.left = pt + '%';
  box.querySelector('[data-from]').textContent = _fmtRange(r.from, r.unit);
  box.querySelector('[data-to]').textContent = _fmtRange(r.to, r.unit);
}

function initRanges() {
  document.querySelectorAll('.filter-range[data-key]').forEach(box => {
    const key = box.dataset.key;
    const vals = _catalogItems.map(o => _objVal(o, key));
    const step = Number(box.dataset.step) || 1;
    let min = Math.floor(Math.min(...vals) / step) * step;
    let max = Math.ceil(Math.max(...vals) / step) * step;
    if (min === max) max = min + step;
    _ranges[key] = { min, max, from: min, to: max, step, unit: box.dataset.unit || '' };
    renderRange(box);
    enableRangeDrag(box);
  });
}

function enableRangeDrag(box) {
  const key = box.dataset.key;
  const track = box.querySelector('.filter-range__track');
  box.querySelectorAll('.filter-range__thumb').forEach(thumb => {
    const which = thumb.dataset.thumb;
    thumb.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      thumb.classList.add('is-dragging');
      const move = (ev) => {
        const rect = track.getBoundingClientRect();
        let ratio = (ev.clientX - rect.left) / rect.width;
        ratio = Math.max(0, Math.min(1, ratio));
        const r = _ranges[key];
        let val = Math.round((r.min + ratio * (r.max - r.min)) / r.step) * r.step;
        if (which === 'from') r.from = Math.min(val, r.to);
        else r.to = Math.max(val, r.from);
        renderRange(box);
        updateApplyCount();
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        thumb.classList.remove('is-dragging');
        refreshList();
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  });
}

function objCard(o) {
  const href = objectHref(o.id);
  const card = document.createElement('article');
  card.className = 'obj-card';
  card.innerHTML = `
    <div class="obj-card__head">
      <h3 class="obj-card__title"><a href="${href}" class="obj-card__title-link">${o.title}</a></h3>
      <button class="obj-card__heart ${Favorites.has(o.id) ? 'is-fav' : ''}" data-fav="${o.id}" data-fav-on="images/icon-heart-filled.svg" data-fav-off="images/icon-heart.svg" aria-label="В избранное" style="position:relative;">
        <img src="${Favorites.has(o.id) ? 'images/icon-heart-filled.svg' : 'images/icon-heart.svg'}" alt="" width="24" height="24">
        ${o.likes ? `<span class="obj-card__heart-count">${o.likes}</span>` : ''}
      </button>
    </div>
    <div class="obj-card__tags">
      <span class="obj-tag"><img src="images/icon-metro.svg" alt="" width="16" height="16">${o.metro}</span>
      <span class="obj-tag"><img src="images/icon-walk.svg" alt="" width="16" height="16">${o.walk}</span>
    </div>
    <div class="obj-card__rows">
      <div class="obj-row"><span class="obj-row__key">Объект</span><span class="obj-row__dots"></span><span class="obj-row__val">Ст. ${o.area}</span></div>
      <div class="obj-row"><span class="obj-row__key">Сумма</span><span class="obj-row__dots"></span><span class="obj-row__val">${o.price}</span></div>
      <div class="obj-row"><span class="obj-row__key">Цена, ₽/м²</span><span class="obj-row__dots"></span><span class="obj-row__val">${o.pricePerM}</span></div>
      <div class="obj-row"><span class="obj-row__key">Комиссия за сделку</span><span class="obj-row__dots"></span><span class="obj-row__val">${o.commission}</span></div>
    </div>
    <a href="${href}" class="obj-card__media">
      <img src="${o.image}" alt="${o.title}">
      <span class="obj-card__badge">Объект «Делись»</span>
    </a>
  `;
  // Вся карточка кликабельна, кроме «сердечка» и вложенных ссылок
  card.addEventListener('click', (e) => {
    if (e.target.closest('.obj-card__heart') || e.target.closest('a')) return;
    window.location.href = href;
  });
  return card;
}

// ---------- Promo "Преимущества" slider ----------
const PROMO_SLIDES = [
  {
    title: 'Фиксация на 15 дней',
    text: 'Закрепите клиента за собой и предлагайте наши объекты',
    cta: 'Зафиксировать клиента',
    href: 'pages/fix-request.html',
    decor: 'images/promo-slide-1.svg'
  },
  {
    title: 'Безопасная сделка',
    text: 'Юридическая проверка документов и сопровождение от начала до конца',
    cta: 'Подключить проверку',
    decor: 'images/promo-slide-2.svg'
  },
  {
    title: 'Показ объекта для клиента',
    text: 'При необходимости проведём показ вашему клиенту самостоятельно — всё по договорённости',
    cta: 'Заказать показ',
    decor: 'images/promo-slide-3.svg'
  }
];

function promoSlider() {
  const el = document.createElement('div');
  el.className = 'promo-fixation';
  el.dataset.slide = '0';

  const render = () => {
    const i = +el.dataset.slide;
    const s = PROMO_SLIDES[i];
    const isFirst = i === 0;
    const isLast = i === PROMO_SLIDES.length - 1;
    el.innerHTML = `
      <span class="promo-fixation__flag">Преимущества</span>
      <img src="${s.decor || 'images/promo-decor.svg'}" alt="" class="promo-fixation__decor">
      <div class="promo-fixation__body">
        <h3 class="promo-fixation__title">${s.title}</h3>
        <p class="promo-fixation__text">${s.text}</p>
      </div>
      <div class="promo-fixation__bottom">
        <a href="${s.href ? rootPrefix() + s.href : '#'}" class="btn btn--outline-white promo-fixation__cta">${s.cta}</a>
        <div class="slider-arrows promo-fixation__arrows">
          ${!isFirst ? `<button class="slider-arrows__btn" data-dir="-1" aria-label="Назад"><img src="images/arrow-right.svg" alt="" width="16" height="16" style="transform:scaleX(-1)"></button>` : ''}
          ${!isLast  ? `<button class="slider-arrows__btn slider-arrows__btn--active" data-dir="1" aria-label="Вперёд"><img src="images/arrow-right.svg" alt="" width="16" height="16"></button>` : ''}
        </div>
      </div>
    `;
    el.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = +btn.dataset.dir;
        const next = Math.max(0, Math.min(PROMO_SLIDES.length - 1, +el.dataset.slide + dir));
        el.dataset.slide = String(next);
        render();
      });
    });
  };

  render();
  return el;
}

// ---------- Tabs: simple active swap ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tabs__btn');
  if (!btn) return;
  const tabs = btn.parentElement;
  tabs.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('tabs__btn--active'));
  btn.classList.add('tabs__btn--active');
});

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  initHeaderNav();
  initBurger();
  initFavorites();
  // ---------- Switch header buttons when user is logged in ----------
  try {
    const user = JSON.parse(localStorage.getItem('delis_user') || 'null');
    const auth = document.getElementById('header-auth');
    if (user && auth) {
      auth.innerHTML = `<a href="${rootPrefix()}pages/cabinet/profile.html" class="btn btn--dark header__cabinet-btn">Личный кабинет</a>`;
    }
  } catch (e) {}

  // ---------- View toggle (list / grid) ----------
  document.querySelectorAll('#view-toggle .view-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#view-toggle .view-toggle__btn').forEach(b => b.classList.remove('view-toggle__btn--active'));
      btn.classList.add('view-toggle__btn--active');
      _catalogView = btn.dataset.view;
      // выходим из режима карты, если он был открыт
      const mapBtn = document.querySelector('.searchbar__map');
      const mapView = document.getElementById('map-view');
      if (mapBtn && mapBtn.classList.contains('is-active')) {
        mapBtn.classList.remove('is-active');
        if (mapView) mapView.style.display = 'none';
      }
      drawMainList(getFiltered());
    });
  });

  // ---------- Map view toggle ----------
  const mapBtn = document.querySelector('.searchbar__map');
  const mapView = document.getElementById('map-view');
  let _ymapInited = false;
  let _ymapInstance = null;
  let _ymapPlacemarks = [];

  function initYandexMap() {
    if (_ymapInited || !window.ymaps) return;
    _ymapInited = true;
    ymaps.ready(() => {
      _ymapInstance = new ymaps.Map('ymap', {
        center: [59.9343, 30.3351],          // Санкт-Петербург
        zoom: 11,
        controls: ['zoomControl']
      }, { suppressMapOpenBlock: true });

      // кастомный layout пина — пилюля с иконкой и текстом
      const PinLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="map-pin">' +
          '<img src="images/icon-map-pin.svg" alt="" width="14" height="14">' +
          '<span>{{ properties.label }}</span>' +
        '</div>'
      );

      const points = [
        { coords: [59.985, 30.285], label: '3к мин.' },
        { coords: [59.955, 30.405], label: '2к мин.' },
        { coords: [59.925, 30.345], label: '1к мин.' }
      ];

      points.forEach(p => {
        const pm = new ymaps.Placemark(p.coords, { label: p.label }, {
          iconLayout: PinLayout,
          iconShape: { type: 'Rectangle', coordinates: [[-50, -30], [50, 0]] }
        });
        pm.events.add('click', () => {
          _ymapPlacemarks.forEach(other => {
            const el = other.getOverlay().then(o => {
              if (o && o.getLayout) o.getLayout().then(L => {
                const node = L.getElement && L.getElement().querySelector('.map-pin');
                if (node) node.classList.remove('map-pin--active');
              });
            });
          });
          pm.getOverlay().then(o => {
            if (o && o.getLayout) o.getLayout().then(L => {
              const node = L.getElement && L.getElement().querySelector('.map-pin');
              if (node) node.classList.add('map-pin--active');
            });
          });
          document.getElementById('map-card')?.classList.add('is-visible');
        });
        _ymapInstance.geoObjects.add(pm);
        _ymapPlacemarks.push(pm);
      });
    });
  }

  if (mapBtn && mapView) {
    mapBtn.addEventListener('click', () => {
      const isActive = mapBtn.classList.toggle('is-active');
      const card = document.getElementById('map-card');
      if (isActive) {
        const list = document.getElementById('main-list');
        if (list) list.style.display = 'none';
        mapView.style.display = 'block';
        if (card) card.classList.remove('is-visible');
        initYandexMap();
      } else {
        mapView.style.display = 'none';
        if (card) card.classList.remove('is-visible');
        if (_catalogView) drawMainList(getFiltered());
      }
    });
  }

  // Сердечко на карточке
  const mapHeart = document.querySelector('.map-card__heart');
  if (mapHeart) {
    mapHeart.addEventListener('click', (e) => {
      e.stopPropagation();
      mapHeart.classList.toggle('is-active');
      const img = mapHeart.querySelector('img');
      if (img) img.src = mapHeart.classList.contains('is-active')
        ? 'images/icon-heart-filled.svg'
        : 'images/icon-heart-outline.svg';
    });
  }

  // ---------- Sort dropdown ----------
  const sortLabel = document.getElementById('sort-label');
  document.querySelectorAll('.searchbar__sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.searchbar__sort-option').forEach(o => o.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (sortLabel) sortLabel.textContent = btn.textContent;
      document.getElementById('sort-dropdown')?.classList.remove('is-open');
      document.getElementById('sort-btn')?.classList.remove('is-open');
      if (window.applySort) window.applySort(btn.dataset.sort);
    });
  });
  // close when click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchbar__sort-wrap')) {
      document.getElementById('sort-dropdown')?.classList.remove('is-open');
      document.getElementById('sort-btn')?.classList.remove('is-open');
    }
  });

  // ---------- Поиск и фильтры ----------
  // Текстовый поиск (живой, с задержкой)
  let _searchT;
  document.getElementById('search-input')?.addEventListener('input', () => {
    clearTimeout(_searchT);
    _searchT = setTimeout(() => refreshList(), 250);
  });

  // Чекбоксы района / типа / этажа — применяем сразу
  document.querySelectorAll('.filter-select__dropdown input[type="checkbox"], [data-group="type"] input[type="checkbox"], [data-flag]').forEach(cb => {
    cb.addEventListener('change', () => refreshList());
  });

  // Пилюли «комнаты» — множественный выбор с возможностью снять
  document.querySelectorAll('[data-group="rooms"] .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('filter-pill--active');
      refreshList();
    });
  });

  // Кнопка «Показать» — применить и закрыть панель
  document.getElementById('filter-apply')?.addEventListener('click', () => {
    refreshList({ scroll: true });
    closeFilters();
  });

  // Кнопка «Сбросить» — очистить все фильтры
  document.getElementById('filter-reset')?.addEventListener('click', () => {
    document.querySelectorAll('#filter-overlay input[type="checkbox"]').forEach(c => c.checked = false);
    document.querySelectorAll('[data-group="rooms"] .filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
    const search = document.getElementById('search-input');
    if (search) search.value = '';
    for (const key in _ranges) { _ranges[key].from = _ranges[key].min; _ranges[key].to = _ranges[key].max; }
    document.querySelectorAll('.filter-range[data-key]').forEach(renderRange);
    refreshList();
  });
});
