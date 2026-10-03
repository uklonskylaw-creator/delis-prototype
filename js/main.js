/* СОЛД – Делись — main.js */


// The static prototype models sign-in locally; production must gate commission in the API.
const Commission = {
  authenticated() {
    try { return !!JSON.parse(localStorage.getItem('delis_user') || 'null'); } catch { return false; }
  },
  render(value) {
    if (this.authenticated()) return String(value || '—');
    return `<button type="button" class="commission-lock" data-commission-lock aria-label="Встречная комиссия доступна после регистрации"><svg class="commission-lock__money" width="20" height="16" viewBox="0 0 24 20" fill="none" aria-hidden="true"><rect x="1.5" y="3.5" width="21" height="13" rx="2.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 7h1m12 6h1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="commission-lock__blur" aria-hidden="true">••• ••• ₽</span><svg width="16" height="18" viewBox="0 0 20 22" fill="none" aria-hidden="true"><rect x="3" y="9" width="14" height="11" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M6 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="14" r="1.5" fill="currentColor"/></svg></button>`;
  },
  open() {
    let dialog = document.getElementById('commission-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'commission-dialog';
      dialog.className = 'commission-dialog';
      dialog.setAttribute('aria-labelledby', 'commission-dialog-title');
      dialog.innerHTML = `<button type="button" class="commission-dialog__close" aria-label="Закрыть">×</button><h2 id="commission-dialog-title">Комиссия доступна после регистрации</h2><p>Зарегистрируйтесь или войдите, чтобы увидеть размер встречной комиссии по объекту.</p><a href="/pages/cabinet/register/" class="btn btn--brand">Стать партнёром</a><a href="/pages/cabinet/login/" class="commission-dialog__login">Уже есть аккаунт? Войти</a>`;
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
      document.body.appendChild(dialog);
    }
    if (!dialog.open) dialog.showModal();
  }
};
document.addEventListener('click', e => {
  if (e.target.closest('[data-commission-lock]')) { e.preventDefault(); e.stopImmediatePropagation(); Commission.open(); }
}, true);

let _catalogItems = [];
let _catalogView = null;       /* null = список скрыт до клика по view-toggle */

// Ссылка на карточку объекта зависит от авторизации:
// гость → версия для незарегистрированных, вошедший → полная версия
function objectHref(id) {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('delis_user') || 'null'); } catch (e) {}
  const page = user ? 'object/' : 'object-unreg/';
  return `/pages/${page}?id=${id}`;
}

// Префикс до корня сайта (для ссылок, работающих с любой вложенности)
function rootPrefix() {
  return '/';
}

// Проводим ссылки навигации шапки на статичные страницы
function initHeaderNav() {
  const base = rootPrefix();
  const map = {
    'О проекте': base + 'about/',
    'Вакансии':  base + 'vacancies/',
    'Контакты':  base + 'contacts/'
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
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'delis-mobile-menu');
  burger.innerHTML = '<span></span><span></span><span></span>';
  inner.appendChild(burger);

  const auth = user
    ? `<a href="${base}pages/cabinet/profile/" class="btn btn--dark">Личный кабинет</a>`
    : `<a href="${base}pages/cabinet/login/" class="btn btn--outline">Вход</a>
       <a href="${base}pages/cabinet/register/" class="btn btn--dark">Регистрация</a>`;

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'delis-mobile-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-label', 'Навигация по сайту');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('inert', '');
  menu.innerHTML = `
    <div class="mobile-menu__panel">
      <button class="mobile-menu__close" type="button" aria-label="Закрыть">&times;</button>
      <nav class="mobile-menu__nav">
        <a href="${base}">Главная</a>
        <a href="${base}catalog/">Объекты</a>
        <a href="${base}agents/">Агентам</a>
        <a href="${base}owners/">Собственникам</a>
        <a href="${base}auction/">Аукционный метод</a>
        <a href="${base}about/">Как это работает</a>
        <a href="${base}vacancies/">Вакансии</a>
        <a href="${base}contacts/">Контакты</a>
      </nav>
      <div class="mobile-menu__auth">${auth}</div>
    </div>`;
  document.body.appendChild(menu);

  const open = () => { menu.removeAttribute('inert'); menu.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; menu.querySelector('.mobile-menu__close').focus(); };
  const close = () => { menu.classList.remove('is-open'); menu.setAttribute('inert', ''); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; burger.focus(); };
  burger.addEventListener('click', open);
  menu.querySelector('.mobile-menu__close').addEventListener('click', close);
  menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const nodes = [...menu.querySelectorAll('a, button')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
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
    heart.setAttribute('href', rootPrefix() + 'pages/cabinet/favorites/');
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
    initCitySelect();
  } catch (e) {
    console.warn('Failed to load objects.json', e);
  }
}
let _homeType = 'all';
let _regStatus = 'direct';   /* вкладка каталога: all | auction | direct | sold */
let _city = (() => { try { return localStorage.getItem('delis_city') || ''; } catch (e) { return ''; } })();

/* Формат объекта: аукцион или прямая продажа */
function objFormat(o) { return o.format === 'private' ? 'private' : (o.format === 'direct' ? 'direct' : 'auction'); }
function objSold(o) { return (o.status || 'closed') === 'closed'; }

/* Ярлык формата для карточки и карты */
function objBadge(o) {
  if (objSold(o)) return 'Продано' + (o.soldAt ? ' · ' + o.soldAt : '');
  return objFormat(o) === 'private' ? 'Закрытая продажа' : (objFormat(o) === 'direct' ? 'Прямая продажа' : 'Аукцион');
}

function byStatus(items) {
  return items.filter(o => {
    if (_city && o.city !== _city) return false;
    if (document.getElementById('catalog-grid') && _homeType !== 'all' && o.type !== _homeType) return false;
    if (_regStatus === 'private') return !objSold(o) && objFormat(o) === 'private';
    if (_regStatus === 'all')     return true;
    if (_regStatus === 'sold')    return objSold(o);
    if (_regStatus === 'direct')  return !objSold(o) && objFormat(o) === 'direct';
    return !objSold(o) && objFormat(o) === 'auction';   /* auction */
  });
}

function drawCatalog(items) {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const list = byStatus(items);
  if (!list.length) {
    grid.innerHTML = '<p class="catalog__empty">В этом разделе пока нет объектов.</p>';
    updateArrows();
    return;
  }
  list.slice(0, 12).forEach(o => grid.appendChild(objCard(o)));
  updateArrows();
}

/* «Услуги» в шапке: наведение на десктопе, клик на сенсорных экранах */
function initSubmenu() {
  const btn = document.querySelector('[data-submenu-btn]');
  const menu = document.querySelector('[data-submenu]');
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('is-open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__submenu-wrap')) menu.classList.remove('is-open');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('is-open')));
}

/* Карточка объекта, которая открывается по метке на карте */
function fillMapCard(id) {
  const box = document.getElementById('map-card');
  const o = _catalogItems.find(x => x.id === id);
  if (!box || !o) return;
  const closed = o.status === 'closed';
  const rows = closed
    ? [['Начальная цена', o.startPrice], ['Цена продажи', o.salePrice], ['Срок продажи', o.days + ' ' + plurDays(o.days)]]
    : objFormat(o) === 'direct'
      ? [['Цена', o.price], ['Встречная комиссия', Commission.render(o.commission)]]
      : [['Начальная цена', o.startPrice], ['Даты показов', o.showDates], ['Встречная комиссия', Commission.render(o.commission)]];
  box.innerHTML = `
    <a href="${objectHref(o.id)}" class="map-card__photo">
      <img src="${o.image}" alt="${o.title}" class="map-card__img">
      <span class="map-card__badge">${objBadge(o)}</span>
    </a>
    <div class="map-card__body">
      <div class="map-card__title-row">
        <span class="map-card__type">${o.title}</span>
      </div>
      <div class="map-card__addr">
        <img src="images/icon-pin-purple.svg" alt="" width="12" height="14">
        <span>${o.city}, ${o.address}</span>
      </div>
      <div class="map-card__metro">
        <img src="images/icon-metro.svg" alt="" width="13" height="10">
        <span>${o.metro}</span>
        <img src="images/icon-walk.svg" alt="" width="9" height="13">
        <span>${o.walk}</span>
      </div>
      <div class="map-card__prices">
        ${rows.map(([k, v]) => `<div class="map-card__price-row"><span>${k}</span><span class="map-card__dots"></span><b>${v}</b></div>`).join('')}
      </div>
    </div>`;
}


/* ---------- Селектор города рядом с кнопкой «Все фильтры» ---------- */
function initCitySelect() {
  const wrap = document.getElementById('city-select');
  if (!wrap) return;
  const btn = document.getElementById('city-btn');
  const label = document.getElementById('city-btn-label');
  const drop = document.getElementById('city-dropdown');
  const search = document.getElementById('city-search');
  const list = document.getElementById('city-list');

  const cities = [...new Set((_catalogItems || []).map(o => o.city).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'ru'));

  // город из сохранённого выбора мог исчезнуть из выдачи
  if (_city && !cities.includes(_city)) _city = '';
  label.textContent = _city || 'Все города';
  wrap.classList.toggle('city-select--set', !!_city);

  function draw(q) {
    const needle = (q || '').trim().toLowerCase();
    const rows = cities.filter(c => !needle || c.toLowerCase().includes(needle));
    list.innerHTML = '';
    const mk = (value, text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'city-select__option' + (value === _city ? ' is-active' : '');
      b.textContent = text;
      b.addEventListener('click', () => {
        _city = value;
        try { localStorage.setItem('delis_city', value); } catch (e) {}
        label.textContent = value || 'Все города';
        wrap.classList.toggle('city-select--set', !!value);
        close();
        drawCatalog(_catalogItems);
        if (_catalogView) refreshList(); else updateApplyCount();
      });
      return b;
    };
    if (!needle) list.appendChild(mk('', 'Все города'));
    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'city-select__empty';
      p.textContent = 'Город не найден';
      list.appendChild(p);
    }
    rows.forEach(c => list.appendChild(mk(c, c)));
  }

  function open() {
    drop.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    draw('');
    search.value = '';
    search.focus();
  }
  function close() {
    drop.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    drop.classList.contains('is-open') ? close() : open();
  });
  search.addEventListener('input', () => draw(search.value));
  drop.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  draw('');
}

/* Лента объектов: листание стрелками по одной карточке */
function updateArrows() {
  const grid = document.getElementById('catalog-grid');
  const wrap = grid && grid.closest('.catalog__slider');
  if (!wrap) return;
  const max = grid.scrollWidth - grid.clientWidth - 2;
  wrap.querySelector('.catalog__arrow--prev').disabled = grid.scrollLeft <= 2;
  wrap.querySelector('.catalog__arrow--next').disabled = grid.scrollLeft >= max;
  wrap.classList.toggle('is-static', max <= 0);
  const counter = wrap.querySelector('.catalog__position');
  const cards = grid.querySelectorAll('.obj-card');
  if (counter) {
    const step = cards.length ? cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(grid).gap) || 0) : 1;
    counter.textContent = cards.length ? `${Math.min(cards.length, Math.round(grid.scrollLeft / step) + 1)} / ${cards.length}` : '0 объектов';
  }
}

function initSlider() {
  const grid = document.getElementById('catalog-grid');
  const wrap = grid && grid.closest('.catalog__slider');
  if (!wrap) return;
  wrap.querySelectorAll('.catalog__arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      // листаем страницей: сколько карточек видно, столько и прокручиваем
      const card = grid.querySelector('.obj-card');
      const gap = parseFloat(getComputedStyle(grid).gap) || 24;
      const cardW = card ? card.getBoundingClientRect().width + gap : grid.clientWidth;
      const perView = Math.max(1, Math.round(grid.clientWidth / cardW));
      grid.scrollBy({ left: cardW * perView * Number(btn.dataset.slide), behavior: 'smooth' });
    });
  });
  grid.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}

/* Лента видео: свой MP4, встроенные видео и внешние источники. */
function initVideos() {
  const grid = document.getElementById('video-grid');
  if (!grid || !window.__VIDEOS) return;
  function drawVideos(list) {
    grid.innerHTML = list.map(v => {
      const play = v.type === 'file' || v.embed ? ` data-site-video="${window.__VIDEOS.indexOf(v)}"` : '';
      return `<li class="video-card">
        <a href="${v.url}" target="_blank" rel="noopener" class="video-card__media"${play}>
          <img src="${v.cover}" alt="${v.title}" loading="lazy" width="1672" height="941">
          <span class="video-card__play"><img src="images/icon-play.svg" alt="" width="48" height="48"></span>
          ${v.duration ? `<span class="video-card__duration">${v.duration}</span>` : ''}
        </a>
        ${v.author ? `<p class="video-card__author">${v.author}</p>` : ''}
        <h3 class="video-card__title"><a href="${v.url}" target="_blank" rel="noopener"${play}>${v.title}</a></h3>
      </li>`;
    }).join('');
  }

  // «Все видео» включает ролики из всех тематических разделов.
  const tabs = document.querySelectorAll('[data-vtab]');
  function drawTab(key) {
    const list = (window.__VIDEOS || []).filter(v => key === 'all' || v.tab === key);
    if (list.length) drawVideos(list);
    else grid.innerHTML = '<li class="video__empty">В этом разделе пока нет роликов.</li>';
  }
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.toggle('tabs__btn--active', b === btn));
    drawTab(btn.dataset.vtab);
    refresh();
  }));
  const active = document.querySelector('[data-vtab].tabs__btn--active');
  if (active) drawTab(active.dataset.vtab);

  const wrap = grid.closest('.video__slider');
  if (!wrap) return;
  function refresh() {
    const max = grid.scrollWidth - grid.clientWidth - 2;
    wrap.querySelector('[data-vslide="-1"]').disabled = grid.scrollLeft <= 2;
    wrap.querySelector('[data-vslide="1"]').disabled = grid.scrollLeft >= max;
    wrap.classList.toggle('is-static', max <= 0);
  }
  wrap.querySelectorAll('[data-vslide]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = grid.querySelector('.video-card');
      const gap = parseFloat(getComputedStyle(grid).gap) || 16;
      const w = card ? card.getBoundingClientRect().width + gap : grid.clientWidth;
      const perView = Math.max(1, Math.round(grid.clientWidth / w));
      grid.scrollBy({ left: w * perView * Number(btn.dataset.vslide), behavior: 'smooth' });
    });
  });
  grid.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh);
  refresh();
}

function initRegTabs() {
  document.getElementById('catalog-sale-type')?.addEventListener('change', e => document.querySelector(`[data-reg-tab="${e.target.value}"]`)?.click());
  document.getElementById('catalog-property-type')?.addEventListener('change', () => refreshList());
  const saleSelect = document.getElementById('mobile-sale-type');
  const propertySelect = document.getElementById('mobile-property-type');
  saleSelect?.addEventListener('change', () => document.querySelector(`[data-reg-tab="${saleSelect.value}"]`)?.click());
  propertySelect?.addEventListener('change', () => document.querySelector(`[data-property-type="${propertySelect.value}"]`)?.click());
  const trigger = document.getElementById('home-type-trigger');
  const menu = document.getElementById('home-type-menu');
  if (trigger && menu) {
    const options = [...menu.querySelectorAll('[data-property-type]')];
    const close = (restoreFocus = false) => {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) trigger.focus();
    };
    const open = () => {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      (options.find(o => o.dataset.propertyType === _homeType) || options[0]).focus();
    };
    trigger.addEventListener('click', () => menu.hidden ? open() : close());
    trigger.addEventListener('keydown', e => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); }
    });
    options.forEach(option => option.addEventListener('click', () => {
      _homeType = option.dataset.propertyType;
      if (propertySelect) propertySelect.value = _homeType;
      trigger.querySelector('.property-picker__label').textContent = option.querySelector('span').textContent;
      trigger.querySelector('.property-picker__icon').innerHTML = option.querySelector('svg').outerHTML;
      options.forEach(o => o.setAttribute('aria-selected', String(o === option)));
      drawCatalog(_catalogItems);
      close(true);
    }));
    menu.addEventListener('keydown', e => {
      const index = options.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      }
    });
    document.addEventListener('click', e => { if (!trigger.parentElement.contains(e.target)) close(); });
    trigger.parentElement.addEventListener('focusout', e => { if (!trigger.parentElement.contains(e.relatedTarget)) close(); });
  }
  const tabs = document.querySelectorAll('[data-reg-tab]');
  if (!tabs.length) return;
  // подсветка всегда совпадает с тем, что показано
  tabs.forEach(b => b.classList.toggle('is-active', b.dataset.regTab === _regStatus));
  tabs.forEach(btn => btn.addEventListener('click', () => {
    _regStatus = btn.dataset.regTab;
    if (saleSelect) saleSelect.value = _regStatus;
    const note = document.querySelector('.catalog-private-note');
    if (note) note.hidden = _regStatus !== 'private';
    tabs.forEach(b => b.classList.toggle('is-active', b === btn));
    const catalogSale = document.getElementById('catalog-sale-type'); if (catalogSale) catalogSale.value = _regStatus;
    drawCatalog(_catalogItems);
    if (typeof refreshList === 'function' && _catalogView) refreshList();
  }));
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
  if (items.length > 12) container.appendChild(catalogPagination());
}

function catalogTable(items) {
  const wrap = document.createElement('div');
  wrap.className = 'cat-table cat-table--registry';
  const arrows = '<span class="cat-table__sort">↕</span>';
  const soldTab = _regStatus === 'sold';
  const allTab  = _regStatus === 'all';
  const col7 = soldTab ? 'Продан за' : (allTab || _regStatus === 'direct' ? 'Цена' : 'Начальная');
  const col8 = soldTab ? 'Срок' : (allTab ? 'Формат' : 'Показы');
  wrap.innerHTML = `
    <div class="cat-table__head">
      <div>Объект</div>
      <div>Тип</div>
      <div>Город</div>
      <div>Метро</div>
      <div>Этаж ${arrows}</div>
      <div>S, м² ${arrows}</div>
      <div>${col7} ${arrows}</div>
      <div>${col8} ${soldTab ? arrows : ''}</div>
      <div>Комиссия ${arrows}</div>
      <div></div>
    </div>
    <div class="cat-table__body">
      ${items.map(o => {
        const sold = objSold(o);
        const dir = objFormat(o) === 'direct';
        const v7 = sold ? o.salePrice : (dir ? o.price : o.startPrice);
        const v8 = sold ? (allTab ? objBadge(o) : o.days + ' ' + plurDays(o.days))
                        : (allTab ? objBadge(o) : (dir ? 'По договорённости' : o.showDates));
        return `
        <div class="cat-table__row" data-href="${objectHref(o.id)}">
          <div>${o.title}</div>
          <div>${o.type}</div>
          <div>${shortCity(o.city)}</div>
          <div class="cat-table__metro"><img src="images/icon-metro.svg" alt="" width="13" height="10"><span>${o.metro}</span><img src="images/icon-walk.svg" alt="" width="9" height="13"><span>${o.walk}</span></div>
          <div>${o.floor}</div>
          <div>${o.area}</div>
          <div>${v7}</div>
          <div>${v8}</div>
          <div class="cat-table__accent">${Commission.render(o.commission)}</div>
          <div class="cat-table__link-cell"><a href="${objectHref(o.id)}" aria-label="Открыть"><img src="images/icon-link.svg" alt="" width="16" height="16"></a></div>
        </div>`;
      }).join('')}
    </div>
  `;
  wrap.querySelectorAll('.cat-table__row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      window.location.href = row.dataset.href;
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
  const SVG_EXT = `<img src="images/icon-link.svg" alt="" width="18" height="18" class="cat-row__act-img">`;
  const href = objectHref(o.id);
  const closed = o.status === 'closed';

  const isDirect = objFormat(o) === 'direct';
  const prices = closed
    ? [[isDirect ? 'Цена в продаже' : 'Начальная цена', o.startPrice, ''],
       ['Цена продажи', o.salePrice, ' cat-row__price-line--commission'],
       ['Срок продажи', o.days + ' ' + plurDays(o.days), '']]
    : isDirect
      ? [['Цена', o.price, ''],
         ['Встречная комиссия', Commission.render(o.commission), ' cat-row__price-line--commission']]
      : [['Начальная цена', o.startPrice, ''],
         ['Даты показов', o.showDates, ''],
         ['Встречная комиссия', Commission.render(o.commission), ' cat-row__price-line--commission']];

  const b = o.broker || {};
  const side = `
    <div class="cat-row__broker">
      <div class="broker-ava">
        ${b.photo ? `<img src="${b.photo}" alt="" class="broker-ava__photo">` : `<span class="broker-ava__initials">${b.initials || '—'}</span>`}
        ${b.logo ? `<img src="${b.logo}" alt="" class="broker-ava__logo">` : ''}
      </div>
      <div class="cat-row__broker-info">
        <div class="cat-row__broker-name">${b.name || ''}</div>
        <div class="cat-row__broker-agency">${b.agency || ''}</div>
        <a class="cat-row__broker-phone" href="tel:${String(b.phone || '').replace(/[^+0-9]/g, '')}">${b.phone || ''}</a>
      </div>
    </div>`;

  row.innerHTML = `
    <a href="${href}" class="cat-row__photo">
      <img src="${o.image}" alt="${o.title}">
    </a>
    <div class="cat-row__main">
      <div class="cat-row__head">
        <h3 class="cat-row__title"><a href="${href}">${o.title}</a></h3>
        <span class="cat-row__sep">•</span>
        <span class="cat-row__area">${o.area}</span>
      </div>
      <div class="cat-row__tags">
        <span class="cat-row__tag">${objBadge(o)}</span>
        <span class="cat-row__tag">${o.type}</span>
      </div>
      <div class="cat-row__loc"><span class="cat-row__icon">${SVG_PIN}</span><span>${o.city}, ${o.address}</span></div>
      <div class="cat-row__metro">
        <span class="cat-row__icon">${SVG_METRO}</span><span>${o.metro}</span>
        <span class="cat-row__icon" style="margin-left:8px;">${SVG_WALK}</span><span>${o.walk}</span>
      </div>
    </div>
    <div class="cat-row__prices">
      ${prices.map(([k, v, mod]) => `<div class="cat-row__price-line${mod}"><span>${k}</span><span class="cat-row__price-dots"></span><strong>${v}</strong></div>`).join('')}
    </div>
    ${side}
    <div class="cat-row__actions">
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
  const phoneType = document.getElementById('catalog-property-type')?.value;
  if (phoneType && phoneType !== 'all' && o.type !== phoneType) return false;
  // Текстовый поиск
  const q = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
  if (q) {
    const hay = [o.title, o.city, o.address, o.metro, o.district, o.id, o.rooms].join(' ').toLowerCase();
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
  let arr = byStatus(_catalogItems).filter(objectMatches);
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
    if (!Commission.authenticated() && ['bonusPct', 'bonusRub'].includes(key)) { box.innerHTML = Commission.render(''); return; }
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
  const closed = o.status === 'closed';
  const direct = objFormat(o) === 'direct';
  const b = o.broker || {};
  const card = document.createElement('article');
  card.className = 'obj-card' + (closed ? ' obj-card--closed' : ' obj-card--live');

  const rows = closed
    ? [[direct ? 'Цена в продаже' : 'Начальная цена', o.startPrice],
       ['Цена продажи', o.salePrice, 'accent'],
       ['Срок продажи', o.days + ' ' + plurDays(o.days)]]
    : direct
      ? [['Площадь', o.area],
         ['Цена', o.price, 'accent']]
      : [['Начальная цена', o.startPrice],
         ['Даты показов', o.showDates]];

  const comm = closed ? '' : Commission.render(o.commission);

  card.innerHTML = `
    <a href="${href}" class="obj-card__media">
      <img src="${o.image}" alt="${o.title}">
      <span class="obj-card__badge${closed ? ' obj-card__badge--sold' : (direct ? ' obj-card__badge--direct' : ' obj-card__badge--live')}">${objBadge(o)}</span>
    </a>
    <div class="obj-card__body">
      <h3 class="obj-card__title"><a href="${href}" class="obj-card__title-link">${o.title}</a></h3>
      <ul class="obj-card__facts">
        <li><img src="images/icon-pin-purple.svg" alt="" width="13" height="15"><span>${shortCity(o.city)}, ${o.address || ''}</span></li>
        <li><img src="images/icon-metro.svg" alt="" width="14" height="11"><span>${o.metro} · ${o.walk}</span></li>
        <li class="obj-card__kind"><img src="images/icon-home.svg" alt="" width="14" height="14"><span>${objKind(o)}${o.floors ? `, ${o.floor}/${o.floors} эт.` : ''}</span></li>
        <li><img src="images/icon-area.svg" alt="" width="14" height="14"><span>${o.area}</span></li>
      </ul>
      <div class="obj-card__rows">
        ${rows.map(([k, v, mod]) => `<div class="obj-row"><span class="obj-row__key">${k}</span><span class="obj-row__dots"></span><span class="obj-row__val${mod ? ' obj-row__val--' + mod : ''}">${v}</span></div>`).join('')}
      </div>
      <div class="obj-card__foot">
        <div class="obj-card__agent">
          <div class="broker-ava broker-ava--sm">
            ${b.photo ? `<img src="${b.photo}" alt="" class="broker-ava__photo">` : `<span class="broker-ava__initials">${b.initials || '—'}</span>`}
            ${b.logo ? `<img src="${b.logo}" alt="" class="broker-ava__logo">` : ''}
          </div>
          <div class="obj-card__agent-info">
            <span class="obj-card__agent-name">${b.name || ''}</span>
            <span class="obj-card__agent-agency">${b.agency || ''}</span>
          </div>
        </div>
        ${comm ? `<span class="obj-card__comm" title="Встречная комиссия">${comm}</span>` : ''}
      </div>
    </div>
  `;
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    window.location.href = href;
  });
  return card;
}

/* «1-к квартира», «студия», «загородный дом» — характеристика для карточки */
function objKind(o) {
  const rooms = String(o.rooms || '').trim();
  switch (o.type) {
    case 'Квартира':
      if (rooms === 'С') return 'Студия';
      return rooms && rooms !== '—' ? rooms + '-к квартира' : 'Квартира';
    case 'Апартаменты':
      return rooms && rooms !== '—' && rooms !== 'С' ? rooms + '-к апартаменты' : 'Апартаменты';
    case 'Дом':
      return 'Загородный дом';
    case 'Коммерция':
      return 'Коммерческое помещение';
    default:
      return o.type || '';
  }
}

function shortCity(city) {
  return String(city || '').replace('Ленинградская область', 'Ленобласть');
}

function plurDays(n) {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return 'день';
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return 'дня';
  return 'дней';
}


// ---------- Tabs: simple active swap ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tabs__btn');
  if (!btn) return;
  const tabs = btn.parentElement;
  tabs.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('tabs__btn--active'));
  btn.classList.add('tabs__btn--active');
});

/* Бегущая строка с data-marquee-speed: длительность круга под ширину ленты, скорость в px/с не зависит от числа логотипов */
function initMarqueeSpeed() {
  document.querySelectorAll('[data-marquee-speed]').forEach(track => {
    const group = track.querySelector('.marquee__group');
    if (!group) return;
    const original = group.innerHTML;
    const apply = () => {
      track.style.animation = 'none';
      group.innerHTML = original;
      track.querySelectorAll('.marquee__group').forEach(el => { if (el !== group) el.remove(); });
      const min = track.parentElement.clientWidth;
      while (group.getBoundingClientRect().width < min && group.children.length < 250) group.insertAdjacentHTML('beforeend', original);
      const distance = group.getBoundingClientRect().width;
      const copy = group.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('a,button').forEach(el => el.tabIndex = -1);
      track.appendChild(copy);
      track.style.setProperty('--marquee-distance', distance + 'px');
      track.style.animationDuration = distance / (Number(track.dataset.marqueeSpeed) || 70) + 's';
      void track.offsetWidth;
      track.style.animation = '';
      track.style.animationDuration = distance / (Number(track.dataset.marqueeSpeed) || 70) + 's';
    };
    Promise.all([...group.querySelectorAll('img')].map(img => { img.loading = 'eager'; return img.decode().catch(() => {}); })).then(apply);
    let timer;
    new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(apply, 120); }).observe(track.parentElement);
  });
}

/* Блок «Маркетинговый план»: вариант вёрстки из ?mp=N (по умолчанию 1), переключатель только на localhost */
function initMarketingPlan() {
  const sec = document.getElementById('marketing-plan');
  if (!sec) return;
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const fromUrl = new URLSearchParams(location.search).get('mp');
  let v = /^[1-5]$/.test(fromUrl || '') ? fromUrl : '1';
  const sw = document.getElementById('mp-switch');
  const pick = (n) => {
    v = n;
    document.body.dataset.mp = n;
    if (sw) sw.querySelectorAll('[data-mp-pick]').forEach(b => b.classList.toggle('is-active', b.dataset.mpPick === n));
  };
  pick(v);
  if (sw && local) {
    sw.hidden = false;
    sw.querySelectorAll('[data-mp-pick]').forEach(b => b.addEventListener('click', () => {
      pick(b.dataset.mpPick);
      history.replaceState(null, '', '?mp=' + b.dataset.mpPick + '#marketing-plan');
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  // окно заявки
  const modal = document.getElementById('mp-modal');
  if (!modal) return;
  const form = document.getElementById('mp-form');
  const wrap = modal.querySelector('.mp-modal__form-wrap');
  const done = modal.querySelector('.mp-modal__done');
  const open = () => {
    wrap.hidden = false; done.hidden = true;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { const f = form.querySelector('input[name="name"]'); if (f) f.focus(); }, 50);
  };
  const close = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
  document.querySelectorAll('[data-mp-open]').forEach(b => b.addEventListener('click', open));
  modal.querySelectorAll('[data-mp-close]').forEach(b => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
  // прототип: бэкенда нет, заявка никуда не уходит — показываем подтверждение
  form.addEventListener('submit', (e) => { e.preventDefault(); form.reset(); wrap.hidden = true; done.hidden = false; });

}

/* Видео партнёров: вкладки по типу объекта и плеер во встроенном окне (ссылка остаётся запасным путём) */
function initPartnerVideos() {
  const sec = document.getElementById('partner-video');
  if (!sec) return;
  const items = sec.querySelectorAll('[data-pv-cat]');
  sec.querySelectorAll('[data-pv-tab]').forEach(btn => btn.addEventListener('click', () => {
    sec.querySelectorAll('[data-pv-tab]').forEach(b => b.classList.toggle('tabs__btn--active', b === btn));
    const t = btn.dataset.pvTab;
    items.forEach(el => el.classList.toggle('is-hidden', t !== 'all' && el.dataset.pvCat !== t));
    sec.querySelector('.pv-hero-card').hidden = sec.querySelector('.pv-featured').classList.contains('is-hidden');
  }));

 }

/* One accessible player for the partner section and the video library. */
function initMediaPlayer() {
  const player = document.getElementById('pv-player');
  if (!player) return;
  const frame = player.querySelector('.pv-player__frame');
  const title = player.querySelector('.site-video-player__title');
  const source = player.querySelector('.site-video-player__source');
  const error = player.querySelector('.site-video-player__error');
  const close = () => player.close();
  const clear = () => { frame.querySelector('video')?.pause(); frame.replaceChildren(); document.body.style.overflow = ''; };
  player.addEventListener('close', clear);
  player.querySelector('[data-pv-close]').addEventListener('click', close);
  player.addEventListener('click', e => {
    if (e.target !== player) return;
    const r = player.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-site-video], [data-pv-embed]');
    if (!a) return;
    const v = a.hasAttribute('data-site-video') ? window.__VIDEOS?.[Number(a.dataset.siteVideo)] : null;
    if (!v && !a.dataset.pvEmbed) return;
    e.preventDefault();
    frame.replaceChildren(); error.hidden = true;
    title.textContent = v?.title || a.dataset.videoTitle || a.closest('article, li')?.querySelector('h3')?.textContent || 'Видео партнёров';
    source.href = v?.url || a.href;
    source.textContent = v?.type === 'file' ? 'Об аукционном методе ↗' : 'Открыть на сайте источника ↗';
    if (v?.type === 'file') {
      const video = document.createElement('video');
      video.controls = true; video.playsInline = true; video.preload = 'metadata';
      video.poster = v.cover; video.src = v.mediaSrc || v.url;
      video.addEventListener('error', () => { error.hidden = false; });
      frame.appendChild(video);
      player.showModal(); document.body.style.overflow = 'hidden';
      video.play().catch(() => {});
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = v?.embed || a.dataset.pvEmbed;
      iframe.title = title.textContent;
      iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
      player.showModal(); document.body.style.overflow = 'hidden';
    }
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  initMarketingPlan();
  initPartnerVideos();
  initMediaPlayer();
  renderCatalog();
  initMarqueeSpeed();
  initHeaderNav();
  initBurger();
  initFavorites();
  initRegTabs();
  initSlider();
  initVideos();
  initSubmenu();
  // ---------- Switch header buttons when user is logged in ----------
  try {
    const user = JSON.parse(localStorage.getItem('delis_user') || 'null');
    const auth = document.getElementById('header-auth');
    if (user && auth) {
      auth.innerHTML = `<a href="${rootPrefix()}pages/cabinet/profile/" class="btn btn--dark header__cabinet-btn">Личный кабинет</a>`;
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

      // метка объекта: чёрная точка с ценой, остриё в точке адреса
      const PinLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="map-pin">' +
          '<span>{{ properties.label }}</span>' +
          '<i class="map-pin__dot"></i>' +
        '</div>'
      );

      // точки берём из объектов текущей вкладки
      const points = byStatus(_catalogItems)
        .filter(o => o.lat && o.lon)
        .map(o => ({ coords: [o.lat, o.lon], label: o.mapLabel || o.price, id: o.id }));

      points.forEach(p => {
        const pm = new ymaps.Placemark(p.coords, { label: p.label }, {
          iconLayout: PinLayout,
          iconShape: { type: 'Rectangle', coordinates: [[-46, -44], [46, 0]] }
        });
        pm.events.add('click', () => {
          fillMapCard(p.id);
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
    const phoneType = document.getElementById('catalog-property-type'); if (phoneType) phoneType.value = 'all';
    document.querySelectorAll('[data-group="rooms"] .filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
    const search = document.getElementById('search-input');
    if (search) search.value = '';
    for (const key in _ranges) { _ranges[key].from = _ranges[key].min; _ranges[key].to = _ranges[key].max; }
    document.querySelectorAll('.filter-range[data-key]').forEach(renderRange);
    refreshList();
  });
});
