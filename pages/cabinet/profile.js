/* Делись — редактирование профиля: данные, пароль, фото профиля, логотип агентства */
function initProfileEdit() {
  const nameEl  = document.getElementById('pf-name');
  const phoneEl = document.getElementById('pf-phone');
  const emailEl = document.getElementById('pf-email');

  function getUserSafe() {
    try { return JSON.parse(localStorage.getItem('delis_user') || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveUser(patch) {
    const u = getUserSafe();
    Object.assign(u, patch);
    localStorage.setItem('delis_user', JSON.stringify(u));
  }

  const user = getUserSafe();
  const put0 = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
  put0('pf-role', user.role);
  put0('pf-short', user.about);
  put0('pf-about', user.about);
  put0('pf-inn', user.inn);
  if (user.tags) {
    const tb = document.getElementById('pf-tags');
    if (tb) tb.innerHTML = user.tags.split(',').map(t => t.trim()).filter(Boolean)
      .map(t => `<span class="profile-tag">${t}</span>`).join('');
  }
  if (user.name  && nameEl)  nameEl.textContent  = user.name;
  if (user.phone && phoneEl) phoneEl.textContent = user.phone;
  if (user.email && emailEl) emailEl.textContent = user.email;
  // Применяем сохранённые изображения
  if (user.avatar) document.querySelectorAll('.profile-card__avatar').forEach(i => i.src = user.avatar);
  if (user.logo)   document.querySelectorAll('.agency-id__logo-img').forEach(i => i.src = user.logo);

  // ===== Модалка: редактировать профиль (данные + пароль) =====
  const modal = document.createElement('div');
  modal.className = 'pf-modal';
  modal.innerHTML = `
    <div class="pf-modal__panel">
      <div class="pf-modal__head">
        <h3 class="pf-modal__title">Редактировать профиль</h3>
        <button class="pf-modal__close" type="button" aria-label="Закрыть">&times;</button>
      </div>
      <form class="pf-form" id="pf-form">
        <label class="pf-field"><span>ФИО</span><input name="name" type="text" required></label>
        <label class="pf-field"><span>Должность</span><input name="role" type="text" placeholder="Директор, риелтор, руководитель отдела"></label>
        <label class="pf-field"><span>Телефон</span><input name="phone" type="text" data-phone required></label>
        <label class="pf-field"><span>Почта</span><input name="email" type="email" required></label>
        <label class="pf-field"><span>Специализация</span><input name="tags" type="text" placeholder="Через запятую: вторичка, загородная, коммерция"></label>
        <label class="pf-field"><span>О себе</span><textarea name="about" rows="3" placeholder="С какими объектами работаете, чем полезны коллегам"></textarea></label>
        <div class="pf-divider"><span>Агентство</span></div>
        <label class="pf-field"><span>Название</span><input name="agency" type="text" placeholder="Название агентства"></label>
        <label class="pf-field"><span>ИНН</span><input name="inn" type="text" inputmode="numeric" placeholder="10 или 12 цифр"></label>
        <div class="pf-divider"><span>Сменить пароль</span></div>
        <label class="pf-field"><span>Новый пароль</span><input name="pass" type="password" minlength="6" placeholder="Оставьте пустым, чтобы не менять"></label>
        <label class="pf-field"><span>Повторите пароль</span><input name="pass2" type="password" minlength="6" placeholder="Повторите новый пароль"></label>
        <div class="pf-field__error" id="pf-pass-error">Пароли не совпадают</div>
        <div class="pf-form__actions">
          <button type="button" class="pf-modal__cancel">Отмена</button>
          <button type="submit" class="btn btn--brand">Сохранить</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const form = modal.querySelector('#pf-form');
  const passErr = modal.querySelector('#pf-pass-error');
  const open = () => {
    const txt = (id) => document.getElementById(id)?.textContent.trim() || '';
    form.name.value  = nameEl  ? nameEl.textContent.trim()  : '';
    form.phone.value = phoneEl ? phoneEl.textContent.trim() : '';
    form.email.value = emailEl ? emailEl.textContent.trim() : '';
    form.role.value = txt('pf-role');
    form.about.value = txt('pf-short') || txt('pf-about');
    form.agency.value = getUserSafe().agency || '';
    const innTxt = txt('pf-inn');
    form.inn.value = innTxt === '—' ? '' : innTxt;
    const tagsBox = document.getElementById('pf-tags');
    form.tags.value = tagsBox ? [...tagsBox.querySelectorAll('.profile-tag')].map(t => t.textContent.trim()).join(', ') : '';
    form.pass.value = ''; form.pass2.value = '';
    passErr.classList.remove('is-visible');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => { modal.classList.remove('is-open'); document.body.style.overflow = ''; };

  document.querySelectorAll('.agency-edit-btn').forEach(b => b.addEventListener('click', open));
  modal.querySelector('.pf-modal__close').addEventListener('click', close);
  modal.querySelector('.pf-modal__cancel').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Проверка пароля (только если заполнен)
    if (form.pass.value || form.pass2.value) {
      if (form.pass.value !== form.pass2.value) {
        passErr.classList.add('is-visible');
        return;
      }
    }
    passErr.classList.remove('is-visible');
    if (nameEl)  nameEl.textContent  = form.name.value;
    if (phoneEl) phoneEl.textContent = form.phone.value;
    if (emailEl) emailEl.textContent = form.email.value;
    const put = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    put('pf-role', form.role.value);
    put('pf-short', form.about.value);
    put('pf-about', form.about.value);
    put('pf-inn', form.inn.value);
    const tagsBox = document.getElementById('pf-tags');
    if (tagsBox && form.tags.value.trim()) {
      tagsBox.innerHTML = form.tags.value.split(',').map(t => t.trim()).filter(Boolean)
        .map(t => `<span class="profile-tag">${t}</span>`).join('');
    }
    const patch = {
      name: form.name.value, phone: form.phone.value, email: form.email.value,
      role: form.role.value, about: form.about.value, agency: form.agency.value,
      inn: form.inn.value, tags: form.tags.value
    };
    if (form.pass.value) patch.hasCustomPassword = true; // пароль в демо не храним в открытом виде
    saveUser(patch);
    close();
  });

  // ===== Универсальное окно загрузки изображения =====
  const imgModal = document.createElement('div');
  imgModal.className = 'pf-modal';
  imgModal.innerHTML = `
    <div class="pf-modal__panel">
      <div class="pf-modal__head">
        <h3 class="pf-modal__title" id="img-title">Сменить фото</h3>
        <button class="pf-modal__close" type="button" aria-label="Закрыть">&times;</button>
      </div>
      <div class="img-picker">
        <div class="img-picker__preview"><img id="img-preview" src="" alt=""></div>
        <label class="btn btn--outline img-picker__btn">
          Выбрать файл
          <input type="file" accept="image/*" id="img-file" hidden>
        </label>
        <p class="img-picker__hint">JPG или PNG, до ~2 МБ</p>
      </div>
      <div class="pf-form__actions">
        <button type="button" class="pf-modal__cancel">Отмена</button>
        <button type="button" class="btn btn--brand" id="img-save">Сохранить</button>
      </div>
    </div>`;
  document.body.appendChild(imgModal);

  const imgPreview = imgModal.querySelector('#img-preview');
  const imgFile = imgModal.querySelector('#img-file');
  const imgTitle = imgModal.querySelector('#img-title');
  let pendingDataUrl = null;
  let activeOnSave = null;

  function openPicker(title, currentSrc, onSave) {
    imgTitle.textContent = title;
    imgPreview.src = currentSrc || '';
    pendingDataUrl = null;
    activeOnSave = onSave;
    imgFile.value = '';
    imgModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closePicker() { imgModal.classList.remove('is-open'); document.body.style.overflow = ''; }

  imgFile.addEventListener('change', () => {
    const file = imgFile.files && imgFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { pendingDataUrl = reader.result; imgPreview.src = reader.result; };
    reader.readAsDataURL(file);
  });
  imgModal.querySelector('.pf-modal__close').addEventListener('click', closePicker);
  imgModal.querySelector('.pf-modal__cancel').addEventListener('click', closePicker);
  imgModal.addEventListener('click', (e) => { if (e.target === imgModal) closePicker(); });
  imgModal.querySelector('#img-save').addEventListener('click', () => {
    if (pendingDataUrl && activeOnSave) activeOnSave(pendingDataUrl);
    closePicker();
  });

  // Фото профиля
  document.querySelectorAll('.profile-card__avatar-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.querySelector('.profile-card__avatar')?.src || '';
      openPicker('Сменить фото профиля', cur, (data) => {
        document.querySelectorAll('.profile-card__avatar').forEach(i => i.src = data);
        saveUser({ avatar: data });
      });
    });
  });

  // Логотип агентства (только на странице агентства)
  document.querySelectorAll('.agency-id__refresh').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.querySelector('.agency-id__logo-img')?.src || '';
      openPicker('Обновить логотип агентства', cur, (data) => {
        document.querySelectorAll('.agency-id__logo-img').forEach(i => i.src = data);
        saveUser({ logo: data });
      });
    });
  });

  // Закрытие любой модалки по Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); closePicker(); }
  });
}
