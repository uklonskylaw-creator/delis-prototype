/* ===== Мастер добавления объекта =====
   Набор шагов и полей берётся из add-object-data.js по выбранному типу. */

const AO_KEY = 'delis_draft_object';   // черновик нового объекта
const AO_EDIT_KEY = 'delis_edit_object';   // объект, открытый на редактирование

/* Режим редактирования включается ссылкой add-object.html#edit=<id объекта>.
   Черновик нового объявления при этом не трогаем — у него свой ключ. */
const aoEditId = (location.hash.match(/edit=(\d+)/) || [])[1] || null;
const aoIsEdit = aoEditId !== null;
const aoKey = () => (aoIsEdit ? AO_EDIT_KEY : AO_KEY);

const KINDS = {
  live: ['Квартира', 'Квартира в новостройке', 'Комната или доля', 'Дом/Дача',
         'Коттедж', 'Таунхаус', 'Часть дома', 'Участок', 'Гараж'],
  comm: ['Офис', 'Здание', 'Торговая площадь', 'Помещение свободного назначения',
         'Производство', 'Склад', 'Бизнес', 'Коммерческая земля']
};

let aoStep = 0;
let aoData = aoLoad();

function aoLoad() { try { return JSON.parse(localStorage.getItem(aoKey()) || '{}'); } catch { return {}; } }
function aoSave() {
  try {
    localStorage.setItem(aoKey(), JSON.stringify(aoData));
  } catch (e) {
    /* превью фотографий переполнили хранилище — держим их только в этой вкладке */
    aoWarn('Фотографий слишком много, чтобы сохранить черновик — не закрывайте страницу');
  }
}
function aoSet(k, v) { aoData[k] = v; aoSave(); }
function aoGet(k, d) { return aoData[k] !== undefined ? aoData[k] : d; }

function aoBranch() { return BRANCHES[aoGet('kind')] || null; }
function aoSteps() { const b = aoBranch(); return b ? b.steps : []; }
function aoTotal() { return aoSteps().length + 1; }          // +1 — стартовый экран

// ---------- Рендер отдельных типов полей ----------
const esc = s => String(s).replace(/"/g, '&quot;');

function fChips(f) {
  const cur = aoGet(f.k, f.multi ? [] : '');
  return `<div class="ao-chips">${f.o.map(v => {
    const on = f.multi ? cur.includes(v) : cur === v;
    return `<button type="button" class="ao-chip${on ? ' ao-chip--on' : ''}"
      onclick="aoPick('${f.k}','${esc(v)}',${!!f.multi})">${v}</button>`;
  }).join('')}</div>`;
}
function fInput(f) {
  const v = aoGet(f.k, '');
  const isAddr = f.k === 'address';
  return `<div class="ao-input-wrap">
    <input class="ao-input${f.u ? ' ao-input--unit' : ''}" placeholder="${f.ph || ''}"
      value="${esc(v)}" ${f.max ? `maxlength="${f.max}"` : ''}
      ${isAddr ? 'id="ao-addr" autocomplete="off" oninput="aoSuggest(this.value)" onblur="setTimeout(aoHideSuggest,150)"'
               : `oninput="aoSet('${f.k}', this.value)${f.max ? `; aoCnt(this,${f.max})` : ''}"`}>
    ${f.u ? `<span class="ao-unit">${f.u}</span>` : ''}
    ${isAddr ? '<div class="ao-suggest" id="ao-suggest"></div>' : ''}
  </div>${f.max ? `<div class="ao-counter">${String(v).length}/${f.max}</div>` : ''}`;
}
function fSelect(f) {
  const v = aoGet(f.k, '');
  return `<select class="ao-select" onchange="aoSet('${f.k}', this.value)">
    <option value="">Выберите</option>
    ${f.o.map(o => `<option${v === o ? ' selected' : ''}>${o}</option>`).join('')}
  </select>`;
}
function fTextarea(f) {
  const v = aoGet(f.k, '');
  return `<textarea class="ao-textarea" maxlength="${f.max || 3000}"
    oninput="aoSet('${f.k}', this.value); aoCnt(this, ${f.max || 3000})">${v}</textarea>
    <div class="ao-counter">${String(v).length}/${f.max || 3000}</div>`;
}
function fCounter(f) {
  return `<div class="ao-counters"><div class="ao-count">
    <span class="ao-count__label">${f.l}</span>
    <button type="button" class="ao-count__btn" onclick="aoBump('${f.k}',-1)">−</button>
    <span class="ao-count__val">${Number(aoGet(f.k, 0))}</span>
    <button type="button" class="ao-count__btn" onclick="aoBump('${f.k}',1)">+</button>
  </div></div>`;
}
function fPhotos(f) {
  const list = aoGet(f.k, []) || [];
  return `<div class="ao-notice">Добавьте реальные фотографии. Нельзя добавлять чужие фото,
    снимки с водяными знаками и рекламные материалы. На фото не должно быть людей, животных,
    алкоголя, табака, оружия.</div>
    <div class="ao-drop">
      <label class="ao-drop__btn">Выберите файлы
        <input type="file" multiple hidden onchange="aoFiles('${f.k}', this)"></label>
      <span>или перетащите их сюда JPG, PNG или GIF до 10 Мб каждый</span>
    </div>
    <div class="ao-thumbs">${list.map((ph, i) => {
      const name = typeof ph === 'string' ? ph : ph.n;
      const src = typeof ph === 'string' ? '' : ph.src;
      return `<div class="ao-thumb">
        ${src ? `<img src="${src}" alt="${esc(name)}">` : esc(name)}
        <button type="button" class="ao-thumb__del" title="Удалить"
          onclick="aoDropPhoto('${f.k}', ${i})">×</button>
      </div>`;
    }).join('')}</div>`;
}
function fMetro(f) {
  const cur = aoGet(f.k, '');
  const list = aoGet('metroList', []);
  if (!list.length) return `<div class="ao-sub">Станции появятся, когда вы выберете адрес из подсказки</div>`;
  return `<div class="ao-chips">${list.map(m =>
    `<button type="button" class="ao-chip ao-chip--metro${cur === m.name ? ' ao-chip--on' : ''}"
      onclick="aoPick('${f.k}','${esc(m.name)}',false)">
      <i class="ao-metro-dot" style="background:${METRO_LINE_COLOR[m.line] || '#999'}"></i>${m.name}
      <em class="ao-chip__note">${m.label}</em>
    </button>`).join('')}</div>`;
}

function fieldHTML(f) {
  if (f.when && aoGet(f.when[0]) !== f.when[1]) return '';
  let body;
  switch (f.type) {
    case 'chips':    body = fChips(f); break;
    case 'select':   body = fSelect(f); break;
    case 'textarea': body = fTextarea(f); break;
    case 'counter':  return `<div class="ao-group">${fCounter(f)}</div>`;
    case 'photos':   body = fPhotos(f); break;
    case 'metro':    body = fMetro(f); break;
    case 'map':      return `<div class="ao-group"><div class="ao-map" id="ao-map"></div></div>`;
    case 'addmore':  return `<div class="ao-group"><button type="button" class="ao-chip">${f.l}</button></div>`;
    case 'publish':  return publishHTML();
    default:         body = fInput(f);
  }
  return `<div class="ao-group">
    ${f.l ? `<span class="ao-label">${f.l}${f.req ? ' <span style="color:var(--color-danger)">*</span>' : ''}</span>` : ''}
    ${body}
    ${f.hint ? `<div class="ao-sub">${f.hint}</div>` : ''}
  </div>`;
}

function publishHTML() {
  const plans = [
    { id: 'base', n: 'Обычное размещение', p: 'Бесплатно', d: 'Объект видят агенты сети «Делись»' },
    { id: 'net',  n: 'Размещение в сети',  p: 'Бесплатно', d: 'Объект попадает в подборки партнёров и общий каталог' },
    { id: 'auc',  n: 'Аукцион',            p: 'По договорённости', d: 'Сбор предложений от покупателей в заданный срок' }
  ];
  const cur = aoGet('plan', 'base');
  const row = (l, v) => `<div class="ao-total__row"><span>${l}</span><span>${v || '—'}</span></div>`;
  return plans.map(p => `
    <div class="ao-plan${cur === p.id ? ' ao-plan--on' : ''}" onclick="aoSet('plan','${p.id}');aoRender()">
      <div class="ao-plan__head"><span class="ao-plan__name">${p.n}</span>
        <span class="ao-plan__price">${p.p}</span></div>
      <div class="ao-plan__desc">${p.d}</div>
    </div>`).join('') + `
    <div class="ao-total">
      ${row('Тип объекта', aoGet('kind'))}
      ${row('Адрес', aoGet('address'))}
      ${row('Площадь', aoGet('area') ? aoGet('area') + ' м²' : '')}
      ${row('Бонус посреднику', aoGet('bonus') ? aoGet('bonus') + ' ₽' : '')}
      <div class="ao-total__row ao-total__row--sum"><span>Цена</span>
        <span>${aoGet('price') ? aoGet('price') + ' ₽' : '—'}</span></div>
    </div>`;
}

// ---------- Экраны ----------
function startHTML() {
  const chip = (k, group) => {
    const on = aoGet('kind') === k;
    return `<button type="button" class="ao-chip${on ? ' ao-chip--on' : ''}"
      onclick="aoPickKind('${esc(k)}')">${k}</button>`;
  };
  return `
    <div class="ao-card__title">Новое объявление</div>
    <div class="ao-card__note">Выберите категорию, в которой разместить объект</div>
    <div class="ao-group"><span class="ao-label">Жилая недвижимость</span>
      <div class="ao-chips">${KINDS.live.map(k => chip(k)).join('')}</div></div>
    <div class="ao-group"><span class="ao-label">Коммерческая</span>
      <div class="ao-chips">${KINDS.comm.map(k => chip(k)).join('')}</div></div>`;
}

function stepBodyHTML(st) {
  let html = `<div class="ao-card__title">${st.t}</div>`;
  if (st.skip) html += `<div class="ao-card__note">Этот шаг можно пропустить</div>`;
  if (st.note) html += `<div class="ao-notice">${st.note}</div>`;
  let lastGroup = null;
  st.f.forEach(f => {
    if (f.group && f.group !== lastGroup) {
      html += `<div class="ao-section-title">${f.group}</div>`;
      lastGroup = f.group;
    }
    html += fieldHTML(f);
  });
  return html;
}

function aoRender() {
  const isStart = aoStep === 0;
  const st = isStart ? null : aoSteps()[aoStep - 1];

  document.getElementById('ao-kicker').textContent = aoIsEdit
    ? `Лот ${aoGet('lot', '')} · ${aoGet('kind')}`
    : (isStart ? 'Новый объект' : `Продажа · ${aoGet('kind')}`);
  document.getElementById('ao-side-step').textContent = isStart ? 'Новое объявление' : st.t;
  document.getElementById('ao-bar').style.width =
    Math.round((aoStep / Math.max(1, aoTotal() - 1)) * 100) + '%';

  const hint = document.getElementById('ao-hint');
  if (isStart) {
    hint.innerHTML = `<div class="ao-hint__title">С чего начнём</div>
      <div class="ao-hint__text">Выберите категорию объекта. Дальше состав полей
      подстроится под выбранный тип.</div>`;
  } else {
    const done = aoStep, total = aoTotal() - 1;
    hint.innerHTML = `<div class="ao-hint__title">Шаг ${done} из ${total}</div>
      <div class="ao-hint__text">${aoIsEdit
        ? 'Правки сохраняются сразу. Объект остаётся опубликованным — менять можно любой шаг.'
        : 'Заполненные поля сохраняются автоматически — можно закрыть страницу и вернуться позже.'}</div>`;
  }

  document.getElementById('ao-body').innerHTML = isStart ? startHTML() : stepBodyHTML(st);
  const back = document.getElementById('ao-back');
  back.style.visibility = isStart ? 'hidden' : 'visible';
  back.textContent = (aoIsEdit && aoStep === 1) ? 'Отмена' : 'Назад';
  document.getElementById('ao-next').textContent = aoIsEdit
    ? (aoStep === aoTotal() - 1 ? 'Сохранить изменения' : 'Дальше')
    : (isStart ? 'Создать' : (aoStep === aoTotal() - 1 ? 'Разместить объект' : 'Дальше'));

  if (st && st.f.some(f => f.type === 'map')) setTimeout(aoMap, 60);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Действия ----------
function aoPick(k, v, multi) {
  if (multi) {
    const cur = aoGet(k, []);
    aoSet(k, cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]);
  } else aoSet(k, aoGet(k) === v ? '' : v);
  aoRender();
}
function aoPickKind(k) {
  aoSet('kind', aoGet('kind') === k ? '' : k);
  aoRender();
}
function aoBump(k, d) { aoSet(k, Math.max(0, Number(aoGet(k, 0)) + d)); aoRender(); }
function aoCnt(el, max) {
  const c = el.closest('.ao-group')?.querySelector('.ao-counter');
  if (c) c.textContent = `${el.value.length}/${max}`;
}
/* Фото храним миниатюрами: полные снимки в localStorage не поместятся,
   а превью в 320 px хватает, чтобы видеть, что именно загружено. */
function aoFiles(k, inp) {
  const files = Array.from(inp.files);
  Promise.all(files.map(aoThumb)).then(shots => {
    aoSet(k, [...(aoGet(k, []) || []), ...shots]);
    aoRender();
  });
}

function aoThumb(file) {
  return new Promise(resolve => {
    if (!/^image\//.test(file.type)) { resolve({ n: file.name, src: '' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 320;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        resolve({ n: file.name, src: cv.toDataURL('image/jpeg', 0.72) });
      };
      img.onerror = () => resolve({ n: file.name, src: '' });
      img.src = reader.result;
    };
    reader.onerror = () => resolve({ n: file.name, src: '' });
    reader.readAsDataURL(file);
  });
}

function aoDropPhoto(k, i) {
  const list = (aoGet(k, []) || []).slice();
  list.splice(i, 1);
  aoSet(k, list);
  aoRender();
}

function aoNext() {
  if (aoStep === 0) {
    if (!aoGet('kind')) { aoWarn('Выберите тип объекта'); return; }
    if (!BRANCHES[aoGet('kind')]) { aoWarn('Для этого типа форма ещё не описана'); return; }
    aoStep = 1; aoRender(); return;
  }
  const st = aoSteps()[aoStep - 1];
  const miss = st.f.find(f => f.req && !f.when && !aoGet(f.k));
  if (miss) { aoWarn(miss.err || `Заполните поле «${miss.l}»`); return; }

  if (aoStep === aoTotal() - 1) {
    if (aoIsEdit) {
      localStorage.setItem('delis_edit_saved', aoGet('lot', ''));
      localStorage.removeItem(AO_EDIT_KEY);
    } else {
      localStorage.removeItem(AO_KEY);
    }
    location.href = 'objects.html';
    return;
  }
  aoStep++; aoRender();
}
function aoBack() {
  if (aoIsEdit && aoStep <= 1) { location.href = 'objects.html'; return; }
  if (aoStep > 0) { aoStep--; aoRender(); }
}
function aoWarn(msg) {
  const el = document.getElementById('ao-warn');
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ---------- Карта ----------
/* aoRender() пересоздаёт разметку шага, поэтому карту привязываем к текущему
   контейнеру: если прежний узел выпал из документа — строим карту заново. */
function aoMap() {
  if (!window.ymaps) return;
  ymaps.ready(() => {
    const el = document.getElementById('ao-map');
    if (!el) return;
    if (aoMapObj) {
      if (aoMapObj.container.getElement().isConnected) { aoMapPin(); return; }
      aoMapObj.destroy();
      aoMapObj = null;
      aoPlacemark = null;
    }
    aoMapObj = new ymaps.Map(el, { center: [59.9386, 30.3141], zoom: 11, controls: ['zoomControl'] });
    aoMapObj.behaviors.disable('scrollZoom');
    aoMapPin();
  });
}

/* Показывает метку по сохранённым координатам */
function aoMapPin() {
  const coords = aoGet('coords');
  if (!aoMapObj || !coords) return;
  aoMapObj.setCenter(coords, 16);
  if (aoPlacemark) aoMapObj.geoObjects.remove(aoPlacemark);
  aoPlacemark = new ymaps.Placemark(coords, {}, { preset: 'islands#violetDotIcon' });
  aoMapObj.geoObjects.add(aoPlacemark);
}

function aoFromHash() {
  const k = location.hash.match(/kind=([^&]+)/);
  if (k) aoSet('kind', decodeURIComponent(k[1]));
  const m = location.hash.match(/step=(\d+)/);
  if (m) aoStep = Math.min(aoTotal() - 1, Math.max(0, Number(m[1])));
  /* при правке категория уже выбрана — стартовый экран пропускаем */
  if (aoIsEdit && aoStep === 0) aoStep = 1;
}
window.addEventListener('hashchange', () => { aoFromHash(); aoRender(); });
document.addEventListener('DOMContentLoaded', () => { aoFromHash(); aoRender(); });

// ---------- Подсказка адреса, метка и ближайшее метро ----------
/* Адреса ищем в OpenStreetMap (Nominatim): подсказки Яндекса требуют платный ключ.
   Метро считаем сами по справочнику metro-spb.js — так быстрее и без запросов. */
const AO_GEO_URL = 'https://nominatim.openstreetmap.org/search';
const AO_SPB_BOX = '29.45,60.25,30.90,59.63';   // рамка города и ближайших пригородов

let aoSuggestTimer = null;
let aoSuggestSeq = 0;
let aoPlacemark = null;
let aoMapObj = null;
let aoSuggestCache = {};

function aoSuggest(q) {
  aoSet('address', q);
  clearTimeout(aoSuggestTimer);
  const box = document.getElementById('ao-suggest');
  if (!box) return;
  const query = (q || '').trim();
  if (query.length < 3) { box.innerHTML = ''; return; }
  aoSuggestTimer = setTimeout(() => aoFetchSuggest(query, box), 350);
}

function aoFetchSuggest(query, box) {
  if (aoSuggestCache[query]) { aoDrawSuggest(aoSuggestCache[query], box); return; }
  const seq = ++aoSuggestSeq;
  const url = AO_GEO_URL + '?format=jsonv2&limit=7&addressdetails=1&accept-language=ru'
    + '&countrycodes=ru&viewbox=' + AO_SPB_BOX + '&bounded=1'
    + '&q=' + encodeURIComponent(query);
  box.innerHTML = '<div class="ao-suggest__item ao-suggest__item--wait">Ищем адрес…</div>';
  fetch(url)
    .then(r => r.json())
    .then(list => {
      if (seq !== aoSuggestSeq) return;            // пришёл ответ на старый запрос
      const seen = {};
      const items = list.map(aoAddrItem).filter(function (it) {
        /* Nominatim отдаёт и дом, и магазины в нём — оставляем адрес один раз */
        if (!it || seen[it.value]) return false;
        seen[it.value] = 1;
        return true;
      });
      aoSuggestCache[query] = items;
      aoDrawSuggest(items, box);
    })
    .catch(() => { if (seq === aoSuggestSeq) box.innerHTML = ''; });
}

/* Из ответа Nominatim делаем короткий адрес: улица, дом */
function aoAddrItem(r) {
  const a = r.address || {};
  const street = a.road || a.pedestrian || a.neighbourhood || a.suburb;
  if (!street) return null;
  const city = a.city || a.town || a.village || a.municipality || 'Санкт-Петербург';
  const short = street + (a.house_number ? ', ' + a.house_number : '');
  return {
    title: short,
    note: city + (a.city_district ? ', ' + a.city_district : ''),
    value: city + ', ' + short,
    lat: Number(r.lat),
    lon: Number(r.lon)
  };
}

function aoDrawSuggest(items, box) {
  if (!items.length) {
    box.innerHTML = '<div class="ao-suggest__item ao-suggest__item--wait">Ничего не нашли — уточните адрес</div>';
    return;
  }
  box.innerHTML = items.map((it, i) =>
    `<div class="ao-suggest__item" onmousedown="aoPickAddr(${i})">
       <span class="ao-suggest__title">${it.title}</span>
       <span class="ao-suggest__note">${it.note}</span>
     </div>`).join('');
  box._items = items;
}

function aoHideSuggest() {
  const box = document.getElementById('ao-suggest');
  if (box) box.innerHTML = '';
}

function aoPickAddr(i) {
  const box = document.getElementById('ao-suggest');
  const it = box && box._items && box._items[i];
  if (!it) return;
  aoSet('address', it.value);
  aoSet('coords', [it.lat, it.lon]);
  aoSet('metroList', typeof metroNearby === 'function' ? metroNearby(it.lat, it.lon, 5) : []);
  aoHideSuggest();
  aoRender();
}
