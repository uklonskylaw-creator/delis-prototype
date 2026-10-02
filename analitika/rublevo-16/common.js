/* Общее для списка и страницы дома: форматирование, итоги прозвона, просмотр фото */
var STATUS = {
  todo: 'Не звонили', noanswer: 'Не дозвонились', selling: 'Ещё продаётся',
  sold: 'Продан', withdrawn: 'Снят с продажи'
};
var LS_KEY = 'rublevo16_calls_v1';
function lsGet() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch (e) { return {} } }
function lsSet(v) { try { localStorage.setItem(LS_KEY, JSON.stringify(v)) } catch (e) {} }
var LOCAL = lsGet();

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] }) }
function mln(v) { if (!v) return '—'; var m = v / 1e6; return (m >= 100 ? Math.round(m) : m.toFixed(1).replace('.', ',')) + ' млн ₽' }
function rub(v) { return Math.round(v).toLocaleString('ru-RU').replace(/[ ,]/g, ' ') }
function dmy(s) { if (!s) return ''; var p = s.split('-'); return p[2] + '.' + p[1] + '.' + p[0] }
function phoneFmt(p) { p = String(p).replace(/\D/g, ''); return p.length === 11 ? '+7 (' + p.slice(1, 4) + ') ' + p.slice(4, 7) + '-' + p.slice(7, 9) + '-' + p.slice(9) : p }
function telHref(p) { return 'tel:+7' + String(p).replace(/\D/g, '').slice(1) }
function plural(n, a, b, c) { n = Math.abs(n) % 100; var n1 = n % 10; if (n > 10 && n < 20) return c; if (n1 > 1 && n1 < 5) return b; if (n1 === 1) return a; return c }
function median(a) { if (!a.length) return 0; a = a.slice().sort(function (x, y) { return x - y }); var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2 }
function kindLabel(h) { return (h.kind || 'Дом') + (h.no ? (h.no.indexOf(',') > -1 ? ' · номер у агентств разный' : ' · дом ' + h.no) : '') }
function plotTxt(v) { return String(v).replace('.', ',') + ' сот.' }
function exposure(days) { if (!days) return 'видели один день'; return days >= 14 ? Math.round(days / 7) + ' нед.' : days + ' ' + plural(days, 'день', 'дня', 'дней') }
function initials(name) { var w = String(name || '').replace(/\(.*\)/, '').trim().split(/\s+/); return ((w[0] || '?')[0] + ((w[1] || '')[0] || '')).toUpperCase() }

function call(h) {
  var l = LOCAL[h.id] || {}, s = h.call || {};
  return {
    status: l.status || s.status || 'todo',
    sold_price: l.sold_price != null ? l.sold_price : (s.sold_price || ''),
    sold_date: l.sold_date != null ? l.sold_date : (s.sold_date || ''),
    note: l.note != null ? l.note : (s.note || '')
  };
}
function factPrice(h) { var v = parseFloat(String(call(h).sold_price).replace(',', '.')); if (!v) return 0; return v < 10000 ? v * 1e6 : v }
function saveCall(h, key, val) {
  LOCAL[h.id] = LOCAL[h.id] || {}; LOCAL[h.id][key] = val;
  if (key === 'sold_price' && val && call(h).status === 'todo') LOCAL[h.id].status = 'sold';
  lsSet(LOCAL);
}
function callFormHtml(h) {
  var c = call(h);
  var opts = Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (c.status === k ? ' selected' : '') + '>' + STATUS[k] + '</option>' }).join('');
  return '<div class="callform" data-call="' + h.id + '">' +
    '<div class="two"><label for="st-' + h.id + '">Итог звонка<select id="st-' + h.id + '" data-k="status">' + opts + '</select></label>' +
    '<label for="sp-' + h.id + '">Цена сделки, млн<input id="sp-' + h.id + '" data-k="sold_price" inputmode="decimal" placeholder="напр. 380" value="' + esc(c.sold_price) + '"></label></div>' +
    '<div class="two"><label for="sd-' + h.id + '">Когда продан<input id="sd-' + h.id + '" data-k="sold_date" placeholder="месяц и год" value="' + esc(c.sold_date) + '"></label>' +
    '<label for="nt-' + h.id + '">Кто говорил, что сказал<textarea id="nt-' + h.id + '" data-k="note" rows="1">' + esc(c.note) + '</textarea></label></div>' +
    '<div class="saved"></div></div>';
}
function bindCallForm(root, h, onChange) {
  root.querySelectorAll('[data-k]').forEach(function (inp) {
    var ev = inp.tagName === 'SELECT' ? 'change' : 'input';
    inp.addEventListener(ev, function () {
      saveCall(h, inp.dataset.k, inp.value);
      var st = root.querySelector('[data-k=status]'); if (st) st.value = call(h).status;
      root.querySelector('.saved').textContent = 'Сохранено в этом браузере. Пришлите итоги в чат кнопкой «Скопировать итоги прозвона».';
      if (ev === 'change' && onChange) onChange();
    });
    if (ev === 'input' && onChange) inp.addEventListener('change', onChange);
  });
}
function exportCalls(houses) {
  var lines = houses.filter(function (h) { return !h.ours }).map(function (h) {
    var c = call(h); if (c.status === 'todo' && !c.sold_price && !c.note) return null;
    return h.id + ' | ' + kindLabel(h) + ', ' + h.area + ' м², объявл. ' + mln(h.price_last) + ' | ' + STATUS[c.status] +
      (c.sold_price ? ' | сделка ' + c.sold_price + ' млн' : '') + (c.sold_date ? ' | ' + c.sold_date : '') + (c.note ? ' | ' + c.note.replace(/\n/g, ' ') : '');
  }).filter(Boolean);
  if (!lines.length) { toast('Пока нечего копировать: внесите итог хотя бы одного звонка'); return }
  copyText('Итоги прозвона, Резиденция Рублёво\n' + lines.join('\n'));
}

function toast(t) { var el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove() }, 2000) }
function copyText(t) {
  var fallback = function () { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Скопировано') } catch (e) { toast('Выделите текст и скопируйте вручную') } ta.remove() };
  try { navigator.clipboard.writeText(t).then(function () { toast('Скопировано') }, fallback) } catch (e) { fallback() }
}
function bindCopy(root) { root.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); copyText(b.dataset.copy) } }) }

function agentHtml(p) {
  var f = phoneFmt(p.phone);
  return '<div class="agent"><div class="agent__ava">' + esc(initials(p.name || 'А')) + '</div><div class="agent__info">' +
    '<a class="agent__tel" href="' + telHref(p.phone) + '">' + esc(f) + '</a><span class="agent__name">' + esc(p.name || 'имя скрыто') + '</span><span>' + authorTag(p.type, true) + '</span></div>' +
    '<button class="copy" type="button" data-copy="' + esc(f) + '">Копировать</button></div>';
}

/* Просмотр фото на весь экран */
var LB = null;
function openLb(h, i) {
  closeLb();
  LB = { h: h, i: i, el: document.createElement('div') };
  LB.el.className = 'lb'; LB.el.setAttribute('role', 'dialog'); LB.el.setAttribute('aria-label', 'Фото: ' + kindLabel(h));
  LB.el.innerHTML = '<div class="lb-top"><span></span><button type="button" class="lb-x" aria-label="Закрыть">×</button></div>' +
    '<div class="lb-stage"><img alt=""><button type="button" class="lb-prev" aria-label="Предыдущее">‹</button><button type="button" class="lb-next" aria-label="Следующее">›</button></div>' +
    '<div class="lb-strip">' + h.photos.map(function (p, j) { return '<img src="' + esc(p) + '" data-j="' + j + '" alt="" loading="lazy">' }).join('') + '</div>';
  document.body.appendChild(LB.el); document.body.style.overflow = 'hidden';
  LB.el.querySelector('.lb-x').onclick = closeLb;
  LB.el.querySelector('.lb-prev').onclick = function () { lbGo(LB.i - 1) };
  LB.el.querySelector('.lb-next').onclick = function () { lbGo(LB.i + 1) };
  LB.el.querySelector('.lb-stage').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeLb() });
  LB.el.querySelectorAll('.lb-strip img').forEach(function (t) { t.onclick = function () { lbGo(+t.dataset.j) } });
  var x0 = null;
  LB.el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX }, { passive: true });
  LB.el.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) lbGo(LB.i + (dx < 0 ? 1 : -1)); x0 = null });
  lbGo(i); LB.el.querySelector('.lb-x').focus();
}
function lbGo(i) {
  var n = LB.h.photos.length; i = (i + n) % n; LB.i = i;
  LB.el.querySelector('.lb-stage img').src = LB.h.photos[i];
  LB.el.querySelector('.lb-top span').textContent = kindLabel(LB.h) + ' · ' + (i + 1) + ' / ' + n;
  LB.el.querySelectorAll('.lb-strip img').forEach(function (t, j) { t.className = j === i ? 'on' : ''; if (j === i) t.scrollIntoView({ block: 'nearest', inline: 'center' }) });
}
function closeLb() { if (!LB) return; LB.el.remove(); LB = null; document.body.style.overflow = '' }
document.addEventListener('keydown', function (e) { if (!LB) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') lbGo(LB.i - 1); if (e.key === 'ArrowRight') lbGo(LB.i + 1) });

function headerHtml(title, right) {
  return '<header class="header"><div class="header__inner"><a class="header__logo" href="index.html"><img src="img/logo.svg" alt=""><span>ДЕЛИСЬ</span></a>' +
    '<div class="header__title">' + esc(title) + '</div>' + (right || '') + '</div></header>';
}

/* Агентство из подписи объявления: «Имя (Агентство)» → «Агентство» */
function orgName(a) {
  a = String(a || '').trim(); if (!a || a === 'Циан' || a === 'недоступно') return '';
  var m = a.match(/\(([^)]+)\)/); return (m ? m[1] : a).replace(/\s*\(.*$/, '').trim();
}

/* Тип автора объявления */
var AUTHOR = { owner: 'Собственник', broker: 'Частный маклер', agency: 'Агентство' };
function authorTag(t, sm) { t = t || 'agency'; return '<span class="tag tag--' + t + (sm ? ' tag--sm' : '') + '">' + AUTHOR[t] + '</span>' }

/* Карта: подложка OpenFreeMap (векторная, рисует MapLibre слоем внутри Leaflet), как в CRM с 24.09.2026.
   Плитки tile.openstreetmap.org не годятся: OSM блокирует страницы без адреса сайта и чужие сайты («Access blocked»). */
var VILLAGE = [55.80345, 37.3792];
var OFM_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
var OFM_ATTR = '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';
function pinClass(h) { if (h.ours) return 'ours'; if (call(h).status === 'sold') return 'sold'; return h.market === 'active' ? 'active' : 'gone' }
function mapFail(el, text) { var d = document.createElement('div'); d.className = 'map-fail'; d.textContent = text; el.appendChild(d) }
function makeMap(el, center, zoom) {
  if (!window.L) { mapFail(el, 'Карта не загрузилась.'); return null }
  var m = L.map(el, { scrollWheelZoom: false, maxZoom: 19 }).setView(center, zoom);
  try {
    if (!L.maplibreGL) throw new Error('нет MapLibre');
    var gl = L.maplibreGL({ style: OFM_STYLE, attributionControl: { customAttribution: OFM_ATTR } }).addTo(m);
    gl.getMaplibreMap().on('error', function () { if (!gl.getMaplibreMap().isStyleLoaded()) mapFail(el, 'Подложка карты не загрузилась (нет интернета?). Метки работают.') });
  } catch (e) { mapFail(el, 'Подложка карты не загрузилась: браузер без WebGL или нет интернета. Метки работают.') }
  return m;
}
function housePin(h) { return L.divIcon({ className: '', html: '<div class="pin pin--' + pinClass(h) + '">' + h.num + '</div>', iconSize: [30, 30], iconAnchor: [15, 15] }) }
function mapLinks(g) {
  return '<div class="geo-links"><a class="pill-btn" href="https://yandex.ru/maps/?pt=' + g[1] + ',' + g[0] + '&z=18&l=map" target="_blank" rel="noopener">Яндекс Карты ↗</a>' +
    '<a class="pill-btn" href="https://www.google.com/maps?q=' + g[0] + ',' + g[1] + '" target="_blank" rel="noopener">Google Maps ↗</a>' +
    '<button class="copy" type="button" data-copy="' + g[0] + ', ' + g[1] + '">' + g[0] + ', ' + g[1] + '</button></div>';
}

/* Продавцы дома, сгруппированные по агентству: кто, сколько объявлений, когда, по какой цене, с каких номеров */
function sellerGroups(h) {
  var g = {}, order = [];
  h.links.forEach(function (l) {
    var key = orgName(l.agent) || ('Без названия, ' + phoneFmt(l.phone));
    if (!g[key]) { g[key] = { name: key, phones: {}, type: 'agency', n: 0, first: l.date, last: l.date, lo: l.price, hi: l.price, sites: {}, people: {} }; order.push(key) }
    var s = g[key]; s.n++;
    if (l.phone) s.phones[l.phone] = 1;
    if (l.author === 'owner') s.type = 'owner'; else if (l.author === 'broker' && s.type !== 'owner') s.type = 'broker';
    if (l.date < s.first) s.first = l.date; if (l.date > s.last) s.last = l.date;
    s.lo = Math.min(s.lo, l.price); s.hi = Math.max(s.hi, l.price); s.sites[l.site] = 1;
    var who = String(l.agent || '').replace(/\s*\(.*$/, '').trim(); if (who && who !== key && who !== 'Циан' && who !== 'недоступно') s.people[who] = 1;
  });
  return order.map(function (k) { return g[k] }).sort(function (a, b) { return b.last < a.last ? -1 : 1 });
}
function sellerGroupHtml(s) {
  var phones = Object.keys(s.phones);
  return '<div class="seller"><div class="seller__head"><b>' + esc(s.name) + '</b>' + authorTag(s.type, true) + '</div>' +
    '<div class="seller__meta">' + s.n + ' ' + plural(s.n, 'объявление', 'объявления', 'объявлений') + ' · ' + dmy(s.first) + (s.first !== s.last ? ' — ' + dmy(s.last) : '') +
    ' · ' + (s.lo === s.hi ? mln(s.lo) : mln(s.lo) + ' – ' + mln(s.hi)) + ' · ' + Object.keys(s.sites).join(', ') + '</div>' +
    (!PUBLIC && Object.keys(s.people).length ? '<div class="seller__meta">Агенты: ' + esc(Object.keys(s.people).join(', ')) + '</div>' : '') +
    (PUBLIC ? '' : '<div class="seller__tels">') + (PUBLIC ? [] : phones).map(function (p) { var f = phoneFmt(p); return '<span class="seller__tel"><a href="' + telHref(p) + '">' + esc(f) + '</a><button class="copy" type="button" data-copy="' + esc(f) + '">Копировать</button></span>' }).join('') + (PUBLIC ? '' : '</div>') + '</div>';
}

/* Клиентская версия (на сайте): без телефонов, прозвона и имён агентов. Флаг ставит build_public.py в data.js */
var PUBLIC = !!window.PUBLIC_MODE;
var AUTHOR_NAME = 'Михаил Уклонский', AUTHOR_PHONE = '+7 (995) 590-59-00', AUTHOR_TEL = 'tel:+79955905900';
function authorHtml() {
  return '<div class="author"><img class="author__ava" src="img/mikhail.jpg" alt="' + AUTHOR_NAME + '"><div class="author__body"><span class="author__label">Аналитика подготовлена</span>' +
    '<b>' + AUTHOR_NAME + '</b><span class="author__role">«Делись» · партнёрские продажи недвижимости</span></div>' +
    '<div class="author__contact"><a class="btn btn--brand" href="' + AUTHOR_TEL + '">' + AUTHOR_PHONE + '</a><span>Telegram, MAX</span></div></div>';
}
function headerRight(workBtnHtml) { return PUBLIC ? '<a class="pill-btn pill-btn--dark" href="' + AUTHOR_TEL + '"><span class="hide-sm">Связаться: </span>' + AUTHOR_PHONE + '</a>' : workBtnHtml }

function months(days) { var m = days / 30.4; return m < 1 ? Math.max(1, Math.round(days / 7)) + ' нед.' : (m < 10 ? m.toFixed(1).replace('.0', '').replace('.', ',') : Math.round(m)) + ' мес.' }
var MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
function monthYear(iso) { var p = iso.split('-'); return MONTHS_RU[+p[1] - 1] + ' ' + p[0] }

/* ===== Движение: появление при прокрутке и счётчики. Без анимаций, если человек их отключил ===== */
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function initMotion(selector) {
  if (REDUCED || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion');
  var els = document.querySelectorAll(selector || '.reveal');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el) });
  // страховка: всё, что не показалось за 2,5 с (печать, превью), показываем
  setTimeout(function () { els.forEach(function (el) { el.classList.add('in') }) }, 2500);
}
function markReveal(selector) { document.querySelectorAll(selector).forEach(function (el) { el.classList.add('reveal') }) }
/* Счётчик: анимирует первое число в тексте элемента от 0 до значения, формат сохраняется */
function countUp(el, ms) {
  if (REDUCED || !el) return;
  var final = el.textContent, m = final.match(/\d+(?:[\s\u00a0]\d{3})*/); if (!m) return;
  var target = parseInt(m[0].replace(/\D/g, ''), 10), t0 = null; if (!target) return;
  var step = function (t) {
    if (!t0) t0 = t; var p = Math.min(1, (t - t0) / (ms || 900)), e = 1 - Math.pow(1 - p, 3);
    el.textContent = final.replace(m[0], rub(Math.round(target * e)));
    if (p < 1) requestAnimationFrame(step); else el.textContent = final;
  };
  requestAnimationFrame(step);
}

/* высота шапки для липких элементов под ней */
function syncHeaderHeight() { var h = document.querySelector('#hdr .header'); if (h) document.documentElement.style.setProperty('--hdr-h', Math.round(h.getBoundingClientRect().height) + 'px') }
window.addEventListener('resize', syncHeaderHeight);
window.addEventListener('load', syncHeaderHeight);
