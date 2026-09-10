/* Делись — избранное (хранится в localStorage, общий модуль для всех страниц) */
(function (global) {
  const KEY = 'delis_favorites';

  function get() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function save(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }
  function has(id) { return get().includes(id); }
  function toggle(id) {
    const arr = get();
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1); else arr.push(id);
    save(arr);
    return i < 0; // true — добавлено в избранное
  }
  function remove(id) {
    const arr = get().filter(x => x !== id);
    save(arr);
  }

  global.Favorites = { get, has, toggle, remove, count: () => get().length };
})(window);
