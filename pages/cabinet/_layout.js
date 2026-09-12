/* Shared cabinet layout helpers: sidebar markup, auth guard, mock data */

// === Mock user (loaded from localStorage) ===
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('delis_user') || 'null');
  } catch { return null; }
}

// Demo profile if user not registered yet (so designer can browse)
const DEMO = {
  name: 'Алексеевский Михаил Александрович',
  role: 'Эксперт по недвижимости',
  phone: '+7 (999) 000-00-03',
  email: 'mikhail@delis.ru',
  avatar: '../../images/form-person.png',
  agency: 'Делись',
  agencyLogo: 'Д',
  agencyDesc: 'Информационный агентский агрегатор по вторичной недвижимости в Санкт-Петербурге и Ленинградской области. Помогаем риелторам зарабатывать на чужих объектах и продавать свои.',
  stats: { objects: 10, employees: 16, rating: 5.0 },
  skills: ['Покупка', 'Продажа', 'Аренда', 'Юридическая поддержка', 'Ипотека']
};

// === Sidebar renderer ===
function renderSidebar(activePage) {
  // Частный агент: без раздела «Сотрудники» (определяем по странице или типу аккаунта)
  const isAgent = document.body.dataset.lk === 'agent' || getUser()?.type === 'agent';
  let items = [
    { id: 'profile',    label: 'Личная информация', href: 'profile.html' },
    { id: 'objects',    label: 'Объекты',            href: 'objects.html' },
    { id: 'favorites',  label: 'Избранное',          href: 'favorites.html' },
    { id: 'employees',  label: 'Сотрудники',         href: 'employees.html' },
    { id: 'clients',    label: 'Клиенты',            href: 'clients.html' }
  ];
  if (isAgent) items = items.filter(it => it.id !== 'employees');
  return `
    <aside class="cab-side">
      ${items.map(it => `
        <a href="${it.href}" class="cab-side__item ${it.id === activePage ? 'cab-side__item--active' : ''}">
          ${it.label}
        </a>
      `).join('')}
      <a href="#" class="cab-side__item cab-side__item--exit" onclick="logout(event)">Выйти</a>
    </aside>
  `;
}

function logout(e) {
  e.preventDefault();
  if (confirm('Выйти из аккаунта?')) {
    localStorage.removeItem('delis_user');
    location.href = '../../index.html';
  }
}

// === Header (compact, for cabinet) ===
function renderHeader() {
  const user = getUser() || DEMO;
  return `
    <header class="header">
      <div class="header__inner">
        <div class="header__left">
          <a href="../../index.html" class="header__logo">
            <img src="../../images/logo.svg" alt="" class="header__logo-img">
            <span class="header__logo-text">ДЕЛИСЬ</span>
          </a>
        </div>
        <nav class="header__nav">
          <a href="../../index.html" class="header__nav-link">Главная</a>
          <a href="profile.html" class="header__nav-link">Кабинет</a>
        </nav>
        <div class="header__right">
          <button class="header__icon-btn" aria-label="Поиск">
            <img src="../../images/icon-search-header.svg" alt="" width="24" height="24">
          </button>
          <a href="favorites.html" class="header__icon-btn" aria-label="Избранное">
            <img src="../../images/icon-heart.svg" alt="" width="24" height="24">
          </a>
          <span style="font-size:13px;color:var(--color-gray-500);">${user.name?.split(' ')[0] || 'Гость'}</span>
        </div>
      </div>
    </header>
  `;
}

// Mount layout into page
function mountCabinet(activePage) {
  document.getElementById('cab-header')?.replaceWith(...
    new DOMParser().parseFromString(renderHeader(), 'text/html').body.childNodes
  );
  const slot = document.getElementById('cab-sidebar-slot');
  if (slot) {
    const tmp = document.createElement('div');
    tmp.innerHTML = renderSidebar(activePage);
    slot.replaceWith(tmp.firstElementChild);
  }
}
