/* ===== Мастер добавления объекта =====
   Структура шагов и состав полей повторяют форму подачи объявления Циан
   (ветка «Продажа здания»). Оформление — фирменное, «Делись». */

const AO_KEY = 'delis_draft_object';

// --- Справочники (в том же порядке и формулировках, что на Циан) ---
const AO = {
  deal: ['Аренда', 'Продажа'],
  residential: ['Квартира', 'Квартира в новостройке', 'Комната или доля', 'Дом/Дача',
                'Коттедж', 'Таунхаус', 'Часть дома', 'Участок', 'Гараж'],
  commercial: ['Офис', 'Здание', 'Торговая площадь', 'Помещение свободного назначения',
               'Производство', 'Склад', 'Бизнес', 'Коммерческая земля'],

  buildingClass: ['A+', 'A', 'B+', 'B', 'B-', 'C'],
  purpose: ['Административное здание', 'Бизнес-центр', 'Деловой центр', 'Бизнес-квартал',
            'Объект свободного назначения', 'Производственный комплекс', 'Индустриальный парк',
            'Промплощадка', 'Производственно-складской комплекс', 'Логистический центр'],
  repair: ['Типовой', 'Дизайнерский', 'Под чистовую отделку', 'Нужен капитальный', 'Нужен косметический'],
  category: ['Действующее', 'Проект', 'Строящееся'],

  entrance: ['Общий с улицы', 'Общий со двора', 'Отдельный с улицы', 'Отдельный со двора'],
  lifts: ['Лифты', 'Травалаторы', 'Эскалаторы'],
  furniture: ['С мебелью', 'Без мебели'],
  houseLine: ['Первая', 'Вторая', 'Иная'],
  parking: ['Наземная', 'Многоуровневая', 'Подземная', 'На крыше', 'Нет парковки'],
  landOwn: ['В собственности', 'В аренде'],

  ventilation: ['Естественная', 'Приточная', 'Нет вентиляции'],
  conditioning: ['Местное', 'Центральное', 'Нет кондиционирования'],
  heating: ['Автономное', 'Центральное', 'Нет отопления'],
  fire: ['Гидрантная', 'Спринклерная', 'Порошковая', 'Газовая', 'Сигнализация', 'Нет системы пожаротушения'],

  tax: ['УСН', 'НДС включён'],
  dealType: ['Продажа помещения', 'Переуступка прав аренды'],

  metro: ['Лубянка', 'Китай-город', 'Площадь Революции', 'Кузнецкий мост', 'Театральная',
          'Охотный ряд', 'Тургеневская', 'Чистые пруды', 'Александровский сад',
          'Сретенский бульвар', 'Трубная', 'Библиотека им. Ленина']
};

const AO_STEPS = [
  { id: 'start',    side: 'Новое объявление',      hintTitle: 'С чего начнём',        hint: 'Выберите тип сделки и категорию, в которой разместить объявление.' },
  { id: 'location', side: 'Расположение',          hintTitle: 'Давайте начнём!',      hint: 'Напишите без сокращений улицу и номер дома. Выберите полный адрес из подсказки или подвиньте отметку на карте.' },
  { id: 'params',   side: 'Параметры и фотографии',hintTitle: 'Расскажите главное',   hint: 'Добавьте актуальные фотографии и укажите основные параметры здания.' },
  { id: 'extra',    side: 'Дополнительные параметры', hintTitle: 'Расскажите подробнее', hint: 'Добавьте дополнительную информацию о здании.' },
  { id: 'features', side: 'Особенности',           hintTitle: 'Хочется больше деталей', hint: 'Чем больше особенностей помещения — тем чаще будут находить объявление.' },
  { id: 'descr',    side: 'Описание',              hintTitle: 'Опишите подробнее',    hint: 'В собственности ли объект, как устроено здание и что есть рядом. Только не вставляйте ссылки и рекламу.' },
  { id: 'terms',    side: 'Условия сделки и контакты', hintTitle: 'Как указать условия сделки', hint: 'Укажите систему налогообложения и тип сделки — будущему покупателю это важно.' },
  { id: 'publish',  side: 'Публикация',            hintTitle: 'Объявление почти готово!', hint: 'Проверьте условия размещения и опубликуйте объект в сети «Делись».' }
];

let aoStep = 0;
let aoData = load();

function load() {
  try { return JSON.parse(localStorage.getItem(AO_KEY) || '{}'); } catch { return {}; }
}
function save() {
  localStorage.setItem(AO_KEY, JSON.stringify(aoData));
}
function set(key, val) { aoData[key] = val; save(); }
function get(key, def) { return aoData[key] !== undefined ? aoData[key] : def; }

// --- Хелперы разметки ---
function chips(key, list, multi = false) {
  const cur = get(key, multi ? [] : '');
  return `<div class="ao-chips">${list.map(v => {
    const on = multi ? cur.includes(v) : cur === v;
    return `<button type="button" class="ao-chip${on ? ' ao-chip--on' : ''}"
      onclick="aoPick('${key}', ${JSON.stringify(v).replace(/"/g, '&quot;')}, ${multi})">${v}</button>`;
  }).join('')}</div>`;
}
function group(label, inner, sub) {
  return `<div class="ao-group">
    ${label ? `<span class="ao-label">${label}</span>` : ''}
    ${inner}
    ${sub ? `<div class="ao-sub">${sub}</div>` : ''}
  </div>`;
}
function input(key, ph = '', unit = '', type = 'text') {
  const v = get(key, '');
  return `<div class="ao-input-wrap">
    <input class="ao-input${unit ? ' ao-input--unit' : ''}" type="${type}" placeholder="${ph}"
      value="${String(v).replace(/"/g, '&quot;')}" oninput="aoSet('${key}', this.value)">
    ${unit ? `<span class="ao-unit">${unit}</span>` : ''}
  </div>`;
}
function select(key, list, ph = 'Выберите') {
  const v = get(key, '');
  return `<select class="ao-select" onchange="aoSet('${key}', this.value)">
    <option value="">${ph}</option>
    ${list.map(o => `<option${v === o ? ' selected' : ''}>${o}</option>`).join('')}
  </select>`;
}
function counter(key, label) {
  const v = Number(get(key, 0));
  return `<div class="ao-count">
    <span class="ao-count__label">${label}</span>
    <button type="button" class="ao-count__btn" onclick="aoStepVal('${key}', -1)">−</button>
    <span class="ao-count__val">${v}</span>
    <button type="button" class="ao-count__btn" onclick="aoStepVal('${key}', 1)">+</button>
  </div>`;
}

// --- Содержимое шагов ---
function stepHTML(id) {
  switch (id) {

    case 'start': return `
      <div class="ao-start">
        <div class="ao-card__title">Новое объявление</div>
        <div class="ao-card__note">Выберите категорию, в которой разместить объявление</div>
        ${group('Сделка', chips('deal', AO.deal))}
        ${group('Жилая недвижимость', chips('kind', AO.residential))}
        ${group('Коммерческая', chips('kind', AO.commercial))}
      </div>`;

    case 'location': return `
      <div class="ao-card__title">Введите адрес</div>
      ${group('', input('address', 'Укажите улицу и номер дома'), 'Редактировать адрес можно в течение 2 дней после публикации')}
      <div class="ao-map" id="ao-map"></div>
      ${group('Основная станция метро', chips('metro', AO.metro))}`;

    case 'params': return `
      <div class="ao-card__title">Основные параметры здания</div>
      ${group('Класс здания', chips('class', AO.buildingClass))}
      <div class="ao-row">
        ${group('Площадь', input('area', '', 'м²'))}
        ${group('Высота потолков', input('ceiling', '', 'м'))}
      </div>
      ${group('Этажей в здании', input('floors'))}
      ${group('Цена', input('price', '', '₽'))}
      ${group('Назначение', select('purpose', AO.purpose))}
      ${group('Ремонт', chips('repair', AO.repair))}
      ${group('Категория', chips('category', AO.category))}

      <div class="ao-section-title">Фото и планировка</div>
      <div class="ao-notice">
        Добавьте реальные фотографии помещения. Нельзя добавлять чужие фото, фото с водяными
        знаками и рекламные материалы. На фото не должно быть людей, животных, алкоголя, табака, оружия.
      </div>
      <div class="ao-drop">
        <label class="ao-drop__btn">Выберите файлы
          <input type="file" multiple accept="image/*" hidden onchange="aoPhotos(this)">
        </label>
        <span>или перетащите их сюда JPG, PNG или GIF до 10 Мб каждый</span>
      </div>
      <div class="ao-thumbs" id="ao-thumbs">${(get('photos', []) || []).map(n => `<div class="ao-thumb">${n}</div>`).join('')}</div>

      <div class="ao-section-title">Видео</div>
      ${group('Ссылка на VK Видео или Rutube', input('video', 'https://'))}

      <div class="ao-section-title">3D-тур</div>
      ${group('Ссылка на тур', input('tour', 'https://'))}`;

    case 'extra': return `
      <div class="ao-card__title">Дополнительные параметры здания</div>
      <div class="ao-card__note">Этот шаг можно пропустить</div>
      ${group('Вход', chips('entrance', AO.entrance))}
      ${group('Лифты', `<div class="ao-counters">${AO.lifts.map(l => counter('lift_' + l, l)).join('')}</div>`)}
      ${group('Мебель', chips('furniture', AO.furniture))}
      ${group('Линия домов', chips('houseLine', AO.houseLine))}
      ${group('Номер налоговой', input('taxOffice', '000'), 'Укажите номер налоговой, обслуживающей ваш адрес — часто он важен при поиске')}
      ${group('Парковка', chips('parking', AO.parking))}
      <div class="ao-row">
        ${group('Стоимость парковки', input('parkingPrice', '', '₽/мес.'))}
        ${group('Мест на парковке', input('parkingPlaces'))}
      </div>
      ${group('Участок', `<div class="ao-row" style="grid-template-columns:200px auto;align-items:center;">
        ${input('land', '', 'га')}
        ${chips('landOwn', AO.landOwn)}
      </div>`)}`;

    case 'features': return `
      <div class="ao-card__title">Особенности здания</div>
      <div class="ao-card__note">Этот шаг можно пропустить</div>
      ${group('Вентиляция', chips('ventilation', AO.ventilation))}
      ${group('Кондиционирование', chips('conditioning', AO.conditioning))}
      ${group('Отопление', chips('heating', AO.heating))}
      ${group('Система пожаротушения', chips('fire', AO.fire))}`;

    case 'descr': return `
      <div class="ao-card__title">Описание помещения</div>
      ${group('Заголовок', `${input('title', 'Бизнес-центр с парковкой')}
        <div class="ao-counter">${String(get('title', '')).length}/33</div>`)}
      ${group('Описание', `<textarea class="ao-textarea" maxlength="3000"
        placeholder="Продается здание под бизнес-центр или деловой центр, класс здания В. Есть парковка на 50 машиномест. 3 лифта и отдельный вход с внутреннего двора."
        oninput="aoSet('descr', this.value); aoCount(this, 3000)">${get('descr', '')}</textarea>
        <div class="ao-counter">${String(get('descr', '')).length}/3000</div>`)}`;

    case 'terms': return `
      <div class="ao-card__title">Условия сделки</div>
      <div class="ao-line"><span class="ao-line__label">Налог</span>${chips('tax', AO.tax)}</div>
      <div class="ao-line"><span class="ao-line__label">Тип сделки</span>${chips('dealType', AO.dealType)}</div>
      <div class="ao-line"><span class="ao-line__label">Бонус посреднику</span>
        <div style="max-width:260px;">${input('bonus', '', '₽')}</div>
      </div>
      <div class="ao-sub">Бонус видят агенты сети. Он выплачивается тому, кто приведёт покупателя.</div>

      <div class="ao-section-title">Контакты продавца</div>
      <div class="ao-line"><span class="ao-line__label">Телефон</span>
        <div style="max-width:320px;">${input('phone', '+7 (999) 000-00-00', '', 'tel')}</div>
      </div>
      <div class="ao-line"><span class="ao-line__label">Дополнительный номер</span>
        <div style="max-width:320px;">${input('phone2', 'Дополнительный номер', '', 'tel')}</div>
      </div>`;

    case 'publish': {
      const plans = [
        { id: 'base',  name: 'Обычное размещение', price: 'Бесплатно', desc: 'Объект видят агенты сети «Делись»' },
        { id: 'net',   name: 'Размещение в сети',  price: 'Бесплатно', desc: 'Объект попадает в подборки партнёров и в общий каталог' },
        { id: 'auc',   name: 'Аукцион',            price: 'По договорённости', desc: 'Сбор предложений от покупателей в заданный срок' }
      ];
      const cur = get('plan', 'base');
      return `
      <div class="ao-card__title">Публикация объявления</div>
      <div class="ao-card__note">Выберите формат размещения</div>
      ${plans.map(p => `
        <div class="ao-plan${cur === p.id ? ' ao-plan--on' : ''}" onclick="aoSet('plan','${p.id}'); aoRender()">
          <div class="ao-plan__head">
            <span class="ao-plan__name">${p.name}</span>
            <span class="ao-plan__price">${p.price}</span>
          </div>
          <div class="ao-plan__desc">${p.desc}</div>
        </div>`).join('')}
      <div class="ao-total">
        <div class="ao-total__row"><span>Тип объекта</span><span>${get('kind', '—')}</span></div>
        <div class="ao-total__row"><span>Адрес</span><span>${get('address', '—')}</span></div>
        <div class="ao-total__row"><span>Площадь</span><span>${get('area', '—')} м²</span></div>
        <div class="ao-total__row"><span>Бонус посреднику</span><span>${get('bonus', '—')} ₽</span></div>
        <div class="ao-total__row ao-total__row--sum"><span>Цена объекта</span><span>${get('price', '—')} ₽</span></div>
      </div>`;
    }
  }
  return '';
}

// --- Рендер ---
function aoRender() {
  const s = AO_STEPS[aoStep];
  document.getElementById('ao-kicker').textContent =
    aoStep === 0 ? 'Новый объект' : `${get('deal', 'Продажа')} · ${get('kind', 'объект')}`;
  document.getElementById('ao-side-step').textContent = s.side;
  document.getElementById('ao-bar').style.width = Math.round((aoStep / (AO_STEPS.length - 1)) * 100) + '%';
  document.getElementById('ao-hint-title').textContent = s.hintTitle;
  document.getElementById('ao-hint-text').textContent = s.hint;
  document.getElementById('ao-body').innerHTML = stepHTML(s.id);

  document.getElementById('ao-back').style.visibility = aoStep === 0 ? 'hidden' : 'visible';
  const next = document.getElementById('ao-next');
  next.textContent = aoStep === 0 ? 'Создать'
                   : aoStep === AO_STEPS.length - 1 ? 'Разместить объект' : 'Дальше';

  if (s.id === 'location') setTimeout(aoMap, 60);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function aoPick(key, val, multi) {
  if (multi) {
    const cur = get(key, []);
    set(key, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]);
  } else {
    set(key, get(key) === val ? '' : val);
  }
  aoRender();
}
function aoSet(key, val) { set(key, val); }
function aoStepVal(key, d) { set(key, Math.max(0, Number(get(key, 0)) + d)); aoRender(); }
function aoCount(el, max) {
  const c = el.parentElement.querySelector('.ao-counter');
  if (c) c.textContent = `${el.value.length}/${max}`;
}
function aoPhotos(inp) {
  const names = Array.from(inp.files).map(f => f.name);
  set('photos', [...(get('photos', []) || []), ...names]);
  aoRender();
}

function aoNext() {
  if (aoStep === 0 && !get('kind')) { alert('Выберите тип объекта'); return; }
  if (aoStep === AO_STEPS.length - 1) {
    localStorage.removeItem(AO_KEY);
    location.href = 'objects.html';
    return;
  }
  aoStep++; aoRender();
}
function aoBack() { if (aoStep > 0) { aoStep--; aoRender(); } }
function aoExit() { location.href = 'objects.html'; }

// --- Карта ---
let aoMapInited = false;
function aoMap() {
  if (aoMapInited || !window.ymaps) return;
  ymaps.ready(() => {
    const el = document.getElementById('ao-map');
    if (!el) return;
    const map = new ymaps.Map(el, { center: [59.9386, 30.3141], zoom: 12, controls: ['zoomControl'] });
    map.behaviors.disable('scrollZoom');
    aoMapInited = true;
  });
}

// Открыть конкретный шаг: add-object.html#step=3
function aoFromHash() {
  const m = location.hash.match(/step=(\d+)/);
  if (m) aoStep = Math.min(AO_STEPS.length - 1, Math.max(0, Number(m[1])));
}
window.addEventListener('hashchange', () => { aoFromHash(); aoRender(); });
document.addEventListener('DOMContentLoaded', () => { aoFromHash(); aoRender(); });
