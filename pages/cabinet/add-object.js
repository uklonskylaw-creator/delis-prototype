/* ===== Мастер добавления объекта =====
   Набор шагов и полей берётся из add-object-data.js по выбранному типу. */

const AO_KEY = 'delis_draft_object';

const KINDS = {
  live: ['Квартира', 'Квартира в новостройке', 'Комната или доля', 'Дом/Дача',
         'Коттедж', 'Таунхаус', 'Часть дома', 'Участок', 'Гараж'],
  comm: ['Офис', 'Здание', 'Торговая площадь', 'Помещение свободного назначения',
         'Производство', 'Склад', 'Бизнес', 'Коммерческая земля']
};

const METRO_SPB = ['Проспект Славы', 'Международная', 'Ломоносовская', 'Бухарестская', 'Волковская',
                   'Обводный канал', 'Звёздная', 'Купчино', 'Электросила', 'Московская'];

let aoStep = 0;
let aoData = aoLoad();

function aoLoad() { try { return JSON.parse(localStorage.getItem(AO_KEY) || '{}'); } catch { return {}; } }
function aoSave() { localStorage.setItem(AO_KEY, JSON.stringify(aoData)); }
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
  return `<div class="ao-input-wrap">
    <input class="ao-input${f.u ? ' ao-input--unit' : ''}" placeholder="${f.ph || ''}"
      value="${esc(v)}" ${f.max ? `maxlength="${f.max}"` : ''}
      oninput="aoSet('${f.k}', this.value)${f.max ? `; aoCnt(this,${f.max})` : ''}">
    ${f.u ? `<span class="ao-unit">${f.u}</span>` : ''}
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
    <div class="ao-thumbs">${list.map(n => `<div class="ao-thumb">${n}</div>`).join('')}</div>`;
}
function fMetro(f) {
  const cur = aoGet(f.k, '');
  return `<div class="ao-chips">${METRO_SPB.map(m =>
    `<button type="button" class="ao-chip${cur === m ? ' ao-chip--on' : ''}"
      onclick="aoPick('${f.k}','${esc(m)}',false)">${m}</button>`).join('')}</div>`;
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
    <div class="ao-group"><span class="ao-label">Сделка</span>
      <div class="ao-chips">${['Аренда', 'Продажа'].map(d =>
        `<button type="button" class="ao-chip${aoGet('deal', 'Продажа') === d ? ' ao-chip--on' : ''}"
          onclick="aoPick('deal','${d}',false)">${d}</button>`).join('')}</div>
    </div>
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

  document.getElementById('ao-kicker').textContent =
    isStart ? 'Новый объект' : `${aoGet('deal', 'Продажа')} · ${aoGet('kind')}`;
  document.getElementById('ao-side-step').textContent = isStart ? 'Новое объявление' : st.t;
  document.getElementById('ao-bar').style.width =
    Math.round((aoStep / Math.max(1, aoTotal() - 1)) * 100) + '%';

  const hint = document.getElementById('ao-hint');
  if (isStart) {
    hint.innerHTML = `<div class="ao-hint__title">С чего начнём</div>
      <div class="ao-hint__text">Выберите тип сделки и категорию объекта. Дальше состав полей
      подстроится под выбранный тип.</div>`;
  } else {
    const done = aoStep, total = aoTotal() - 1;
    hint.innerHTML = `<div class="ao-hint__title">Шаг ${done} из ${total}</div>
      <div class="ao-hint__text">Заполненные поля сохраняются автоматически — можно закрыть
      страницу и вернуться позже.</div>`;
  }

  document.getElementById('ao-body').innerHTML = isStart ? startHTML() : stepBodyHTML(st);
  document.getElementById('ao-back').style.visibility = isStart ? 'hidden' : 'visible';
  document.getElementById('ao-next').textContent =
    isStart ? 'Создать' : (aoStep === aoTotal() - 1 ? 'Разместить объект' : 'Дальше');

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
function aoFiles(k, inp) {
  aoSet(k, [...(aoGet(k, []) || []), ...Array.from(inp.files).map(f => f.name)]);
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
    localStorage.removeItem(AO_KEY);
    location.href = 'objects.html';
    return;
  }
  aoStep++; aoRender();
}
function aoBack() { if (aoStep > 0) { aoStep--; aoRender(); } }
function aoWarn(msg) {
  const el = document.getElementById('ao-warn');
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3500);
}

// ---------- Карта ----------
let aoMapDone = false;
function aoMap() {
  if (aoMapDone || !window.ymaps) return;
  ymaps.ready(() => {
    const el = document.getElementById('ao-map');
    if (!el) return;
    const map = new ymaps.Map(el, { center: [59.9386, 30.3141], zoom: 11, controls: ['zoomControl'] });
    map.behaviors.disable('scrollZoom');
    aoMapDone = true;
  });
}

function aoFromHash() {
  const k = location.hash.match(/kind=([^&]+)/);
  if (k) aoSet('kind', decodeURIComponent(k[1]));
  const m = location.hash.match(/step=(\d+)/);
  if (m) aoStep = Math.min(aoTotal() - 1, Math.max(0, Number(m[1])));
}
window.addEventListener('hashchange', () => { aoFromHash(); aoRender(); });
document.addEventListener('DOMContentLoaded', () => { aoFromHash(); aoRender(); });
