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

  /* Правая панель: у закрытого аукциона — итоги, у идущего — условия и запись на показ */
  function renderPanel(o) {
    const box = document.querySelector('[data-obj-panel]');
    if (!box) return;
    const closed = o.status === 'closed';

    const rows = closed
      ? [['Начальная цена', o.startPrice],
         ['Цена продажи', o.salePrice, true],
         ['Срок продажи', o.days + ' ' + plur(o.days, 'день', 'дня', 'дней')],
         ['Площадь', o.area]]
      : [['Начальная цена', o.startPrice],
         ['Даты показов', o.showDates],
         ['Комиссия за сделку', o.commission, true],
         ['Площадь', o.area]];

    const stats = closed
      ? `<div class="obj-panel__stats">
           <div><b>${o.requests}</b><span>обращений</span></div>
           <div><b>${o.shows}</b><span>показов</span></div>
           <div><b>${o.offers}</b><span>предложений</span></div>
         </div>`
      : '';

    const action = closed
      ? ''
      : `<a href="../index.html#form" class="btn btn--dark obj-panel__btn">Записаться на показ</a>`;

    box.innerHTML = `
      <div class="obj-panel__status obj-panel__status--${closed ? 'sold' : 'live'}">
        ${closed ? 'Аукцион закрыт · ' + o.soldAt : 'Аукцион идёт'}
      </div>
      <div class="obj-prices">
        ${rows.map(([k, v, accent]) => `
          <div class="obj-prices__row${accent ? ' obj-prices__row--commission' : ''}">
            <span class="obj-prices__label">${k}</span>
            <span class="obj-prices__dots"></span>
            <b class="obj-prices__val">${v}</b>
          </div>`).join('')}
      </div>
      ${stats}
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
    setTxt('[data-map-desc]', o.status === 'closed'
      ? `Продан аукционным способом за ${o.days} ${plur(o.days, 'день', 'дня', 'дней')}: ${o.requests} обращений, ${o.shows} показов, ${o.offers} предложений.`
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
