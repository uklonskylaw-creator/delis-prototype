/* Делись — вход, регистрация и демонстрационные учётные записи прототипа */
(function () {
  const STORE = 'delis_accounts';

  /* Учётки, заведённые заранее, чтобы было под чем зайти в кабинет */
  const SEED = [
    { email: 'mikhail@delis.ru', phone: '+7 (999) 000-00-01', password: 'delis-2026',
      name: 'Михаил Уклонский', agency: 'Уклонский и Партнёры', region: 'Санкт-Петербург и ЛО', role: 'Агентство' }
  ];

  function accounts() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { list = []; }
    // подмешиваем заготовленные, если их ещё нет
    SEED.forEach(s => {
      if (!list.some(a => a.email === s.email)) list.push(s);
    });
    return list;
  }

  function saveAccount(acc) {
    const list = accounts().filter(a => a.email !== acc.email);
    list.push(acc);
    localStorage.setItem(STORE, JSON.stringify(list));
  }

  const digits = s => String(s || '').replace(/\D/g, '');

  /* Телефон приводим к +7 (999) 000-00-00: восьмёрку в начале меняем на семёрку */
  function formatPhone(raw) {
    let d = digits(raw);
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] === '9') d = '7' + d;
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }

  function initPhoneMask(root) {
    (root || document).querySelectorAll('[data-phone], input[type="tel"]').forEach(inp => {
      if (inp.dataset.maskReady) return;
      inp.dataset.maskReady = '1';
      inp.addEventListener('input', () => {
        const atEnd = inp.selectionStart === inp.value.length;
        inp.value = formatPhone(inp.value);
        if (atEnd) inp.setSelectionRange(inp.value.length, inp.value.length);
      });
      inp.addEventListener('blur', () => { if (digits(inp.value).length < 11) inp.value = formatPhone(inp.value); });
    });
  }

  /* «Другой город» открывает поле с подсказками */
  function initRegion(root) {
    (root || document).querySelectorAll('[data-region]').forEach(sel => {
      // поле города ищем в той же форме или карточке шага, а не по всей странице
      const scope = sel.closest('form') || sel.closest('.auth-card') || document;
      const box = scope.querySelector('[data-other-city]');
      if (!box) return;
      const sync = () => {
        const other = sel.value === 'other';
        box.hidden = !other;
        const inp = box.querySelector('input');
        if (inp) inp.required = other;
      };
      sel.addEventListener('change', sync);
      sync();
    });
  }

  function randomPassword() {
    const words = ['delis', 'auction', 'agent', 'market', 'partner'];
    return words[Math.floor(Math.random() * words.length)] + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  window.DelisAuth = { accounts, saveAccount, formatPhone, digits, randomPassword, initPhoneMask, initRegion };

  document.addEventListener('DOMContentLoaded', () => {
    initPhoneMask(document);
    initRegion(document);
  });
})();
