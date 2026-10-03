/* Делись — подстановка данных объекта по ?id= (object.html и /pages/object-unreg/) */
(function () {
  const brokerShortName = name => String(name || "").trim().split(/\s+/).slice(0, 2).join(" ");
  const FIELD = {
    id:        o => 'ID' + o.id,
    title:     o => o.title,
    area:      o => o.area,
    floor:     o => o.floors ? `${o.floor}/${o.floors} эт.` : o.floor + ' эт.',
    floorOnly: o => o.floors ? `${o.floor}/${o.floors}` : String(o.floor),
    rooms:     o => (o.rooms === 'С' ? 'Студия' : o.rooms),
    type:      o => o.type,
    address:   o => `${o.city}, ${o.address}`,
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
             <b class="obj-deal__final">${Commission.render(o.commission)}</b>
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

    const action = (closed ? '' : `<a href="/#form" class="btn btn--brand btn--sm obj-panel__btn">Записаться на показ</a>`) + extra;

    const broker = `
      <div class="obj-broker">
        ${b.deals ? `<span class="obj-broker__rating" title="Закрытых сделок на площадке">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4 4.2 13.4l.7-4.3-3.1-3 4.3-.6L8 1.6z"/></svg>
          ${b.deals}
        </span>` : ''}
        <div class="broker-ava broker-ava--lg">
          ${b.photo ? `<img src="../${b.photo}" alt="" class="broker-ava__photo">` : `<span class="broker-ava__initials">${b.initials || '—'}</span>`}
          ${b.logo ? `<img src="../${b.logo}" alt="" class="broker-ava__logo">` : ''}
        </div>
        <div class="obj-broker__info">
          <div class="obj-broker__role">Брокер объекта</div>
          <div class="obj-broker__name">${brokerShortName(b.name)}</div>
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
    // Only show characteristics of the selected object, never template apartment values.
    const params = document.getElementById('obj-params');
    if (params) {
      const rows = [['Тип объекта', o.type], ['Площадь', o.area], ['Цена', o.salePrice || o.price || o.startPrice], [o.type === 'Дом' ? 'Этажей' : 'Этаж', o.floor]];
      if (o.rooms) rows.push([o.id === 'rublevo-16' ? 'Спален' : 'Комнат', o.rooms]);
      if (o.id === 'rublevo-16') rows.push(['Площадь по отчёту', '450 м²'], ['Мебель', 'FENDI CASA'], ['Техника', 'Miele'], ['Дополнительно', 'Хаммам и СПА-зона']);
      params.replaceChildren(...rows.filter(([,value]) => value !== undefined && value !== '').map(([label,value]) => {
        const row = document.createElement('div'); row.className = 'obj-param-row';
        for (const [cls,text] of [['obj-param-label',label],['obj-param-dots',''],['obj-param-value',String(value)]]) { const span=document.createElement('span');span.className=cls;span.textContent=text;row.appendChild(span); }
        return row;
      }));
    }


    // Карточка адреса на карте
    const setTxt = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    setTxt('[data-map-addr]', `${o.city}, ${o.address}`);
    setTxt('[data-map-metro]', o.metro);
    setTxt('[data-map-walk]', o.walk);
    const isDirect = o.format === 'direct';
    setTxt('[data-map-desc]', o.status === 'closed'
      ? `Продан ${isDirect ? 'прямой продажей' : 'аукционным способом'} за ${o.days} ${plur(o.days, 'день', 'дня', 'дней')}: ${o.requests} обращений, ${o.shows} показов, ${o.offers} предложений.`
      : isDirect
        ? `Прямая продажа. ${o.price === "Цена по запросу" ? o.price : "Цена " + o.price}. Показы по договорённости.`
        : `Аукцион идёт. Показы ${o.showDates}. Начальная цена ${o.startPrice}.`);

    // Текстовые поля
    document.querySelectorAll('[data-field]').forEach(el => {
      const fn = FIELD[el.dataset.field];
      if (el.dataset.field === 'commission') el.innerHTML = Commission.render(o.commission);
      else if (fn) el.textContent = fn(o);
    });

    // Фотографии (галерея)
    const img = '../' + o.image;
    const main = document.getElementById('obj-gallery-main');
    if (main) main.src = img;
    const bg = document.querySelector('.obj-gallery__main-bg');
    if (bg) bg.style.backgroundImage = "url('" + img + "')";
    const photos = o.photos || [o.image];
    document.querySelectorAll('.obj-thumb').forEach((thumb, i) => {
      thumb.hidden = i >= photos.length;
      const t = thumb.querySelector('img');
      if (t) { t.src = '../' + (photos[i] || o.image); t.alt = o.title + ' — фото ' + (i + 1); }
      thumb.querySelector('.obj-thumb__more-label')?.remove();
    });
    if (o.description) { const text = document.getElementById('obj-text'); if (text) text.textContent = o.description; }
    if (main) main.alt = o.title;

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
