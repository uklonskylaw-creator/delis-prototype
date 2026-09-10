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
    address:   o => `Санкт-Петербург, ${o.district} р-н · рядом с м. ${o.metro}`,
    metro:     o => 'м. ' + o.metro,
    price:     o => o.price,
    pricePerM: o => o.pricePerM + ' ₽/м²',
    commission:o => o.commission
  };

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
