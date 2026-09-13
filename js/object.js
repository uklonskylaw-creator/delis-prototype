/* Делись — подстановка данных объекта по ?id= (object.html и object-unreg.html) */
(function () {
  const FIELD = {
    id:        o => 'ID' + o.id,
    title:     o => o.title,
    area:      o => o.area,
    floor:     o => o.floor + ' эт.',
    floorOnly: o => String(o.floor),
    rooms:     o => (o.rooms === 'С' ? 'Студия' : o.rooms),
    type:      o => o.type,
    address:   o => `${o.city}, ${o.address} · рядом с м. ${o.metro}`,
    metro:     o => 'м. ' + o.metro,
    walk:      o => o.walk,
    price:     o => o.price,
    pricePerM: o => o.pricePerM + ' ₽/м²',
    commission:o => o.commission
  };

  function plur(n, one, few, many) {
    const d = n % 10, dd = n % 100;
    if (d === 1 && dd !== 11) return one;
    if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
    return many;
  }

  /* Правая панель: у проданного объекта — итоги, у активного — условия и запись на показ */
  function renderPanel(o) {
    const box = document.querySelector('[data-obj-panel]');
    if (!box) return;
    const closed = o.status === 'closed';
    const direct = o.format === 'direct';
    const b = o.broker || {};

    const prices = closed
      ? `<div class="obj-deal">
           <div class="obj-deal__col">
             <span class="obj-deal__label">${direct ? 'Цена в продаже' : 'Начальная цена'}</span>
             <b class="obj-deal__start">${o.startPrice}</b>
           </div>
           <div class="obj-deal__col obj-deal__col--final">
             <span class="obj-deal__label">Цена продажи</span>
             <b class="obj-deal__final">${o.salePrice}</b>
           </div>
         </div>`
      : `<div class="obj-deal">
           <div class="obj-deal__col">
             <span class="obj-deal__label">${direct ? 'Цена' : 'Начальная цена'}</span>
             <b class="obj-deal__start">${direct ? o.price : o.startPrice}</b>
           </div>
           <div class="obj-deal__col obj-deal__col--final">
             <span class="obj-deal__label">Встречная комиссия${o.commissionType === 'percent' ? ' (от цены продажи)' : ''}</span>
             <b class="obj-deal__final">${o.commission}</b>
           </div>
         </div>`;

    const rows = closed
      ? [['Площадь', o.area]]
      : [['Площадь', o.area], ['Даты показов', o.showDates || 'по договорённости']];

    const stats = closed
      ? `<div class="obj-panel__stats obj-panel__stats--four">
           <div><b>${o.days}</b><span>${plur(o.days, 'день', 'дня', 'дней')} продажи</span></div>
           <div><b>${o.requests}</b><span>обращений</span></div>
           <div><b>${o.shows}</b><span>показов</span></div>
           <div><b>${o.offers}</b><span>предложений</span></div>
         </div>`
      : '';

    const extra = `
      <div class="obj-panel__links">
        <button type="button" class="obj-link${o.video ? '' : ' obj-link--off'}"${o.video ? '' : ' disabled'}>
          <img src="../images/icon-presentation.svg" alt="" width="18" height="18">
          Видеообзор
        </button>
        <button type="button" class="obj-link${o.site ? '' : ' obj-link--off'}"${o.site ? '' : ' disabled'}>
          <img src="../images/icon-external-link.svg" alt="" width="18" height="18">
          Сайт объекта
        </button>
      </div>`;

    const action = (closed ? '' : `<a href="../index.html#form" class="btn btn--brand btn--sm obj-panel__btn">Записаться на показ</a>`) + extra;

    const broker = `
      <div class="obj-broker">
        <div class="broker-ava broker-ava--lg">
          ${b.photo ? `<img src="../${b.photo}" alt="" class="broker-ava__photo">` : `<span class="broker-ava__initials">${b.initials || '—'}</span>`}
          ${b.logo ? `<img src="../${b.logo}" alt="" class="broker-ava__logo">` : ''}
        </div>
        <div class="obj-broker__info">
          <div class="obj-broker__role">Брокер объекта</div>
          <div class="obj-broker__name">${b.name || ''}</div>
          <div class="obj-broker__agency">${b.agency || ''}</div>
          <a href="tel:${(b.phone || '').replace(/[^+\d]/g, '')}" class="obj-broker__phone">${b.phone || ''}</a>
        </div>
      </div>`;

    box.innerHTML = `
      <div class="obj-panel__status obj-panel__status--${closed ? 'sold' : 'live'}">
        ${closed ? '' : '<i class="obj-panel__pulse"></i>'}
        ${closed ? 'Продано · ' + o.soldAt : (o.format === 'direct' ? 'Прямая продажа' : 'Аукцион')}
      </div>
      ${prices}
      <div class="obj-prices">
        ${rows.map(([k, v]) => `
          <div class="obj-prices__row">
            <span class="obj-prices__label">${k}</span>
            <span class="obj-prices__dots"></span>
            <b class="obj-prices__val">${v}</b>
          </div>`).join('')}
      </div>
      ${stats}
      ${broker}
      ${action}
    `;
  }

  async function init() {
    const id = new URLSearchParams(location.search).get('id');
    let items;
    if (window.__OBJECTS) {
      items = window.__OBJECTS;
    } else {
      try {
        items = await (await fetch('../data/objects.json?v=20260609f')).json();
      } catch (e) {
        console.warn('Не удалось загрузить objects.json', e);
        return;
      }
    }
    const o = items.find(x => x.id === id) || items[0];
    if (!o) return;

    // подпись для метки на карте: цена продажи или начальная, кратко
    const rub = Number(String(o.salePrice || o.startPrice || '').replace(/[^\d]/g, '')) || 0;
    window.__OBJ_PIN = rub ? (rub / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' млн' : '';

    renderPanel(o);

    // Карточка адреса на карте
    const setTxt = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    setTxt('[data-map-addr]', `${o.city}, ${o.address}`);
    setTxt('[data-map-metro]', o.metro);
    setTxt('[data-map-walk]', o.walk);
    const isDirect = o.format === 'direct';
    setTxt('[data-map-desc]', o.status === 'closed'
      ? `Продан ${isDirect ? 'прямой продажей' : 'аукционным способом'} за ${o.days} ${plur(o.days, 'день', 'дня', 'дней')}: ${o.requests} обращений, ${o.shows} показов, ${o.offers} предложений.`
      : isDirect
        ? `Прямая продажа. Цена ${o.price}. Показы по договорённости.`
        : `Аукцион идёт. Показы ${o.showDates}. Начальная цена ${o.startPrice}.`);

    // Текстовые поля
    document.querySelectorAll('[data-field]').forEach(el => {
      const fn = FIELD[el.dataset.field];
      if (fn) el.textContent = fn(o);
    });

    // Фотографии (галерея)
    const img = '../' + o.image;
    const main = document.getElementById('obj-gallery-main');
    if (main) main.src = img;
    const bg = document.querySelector('.obj-gallery__main-bg');
    if (bg) bg.style.backgroundImage = "url('" + img + "')";
    document.querySelectorAll('.obj-thumb img').forEach(t => t.src = img);

    // Подписи в чате (полная версия)
    const summary = `${o.title} · ${o.area} · ${o.price}`;
    document.querySelectorAll('.chat-item__subtitle, .chat-main__subtitle')
      .forEach(el => el.textContent = summary);

    document.title = `${o.title} — Делись`;

    // Сердечко «В избранное» (сохраняется в localStorage)
    const heart = document.querySelector('.obj-head__heart');
    if (heart && typeof Favorites !== 'undefined') {
      const setIcon = (fav) => {
        heart.classList.toggle('is-active', fav);
        const himg = heart.querySelector('img');
        if (himg) himg.src = '../images/' + (fav ? 'icon-heart-filled.svg' : 'icon-heart-outline.svg');
      };
      setIcon(Favorites.has(o.id));
      heart.addEventListener('click', () => setIcon(Favorites.toggle(o.id)));
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
