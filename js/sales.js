/* Uses the same public intake endpoint as uklonsky.ru/max_sale. */
(() => {
  const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  document.querySelectorAll('[data-sales-form]').forEach(form => {
    const field = form.elements.phone;
    field.addEventListener('input', () => field.setCustomValidity(''));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (form.elements.website?.value) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      if (!name || phone.replace(/\D/g, '').length < 10) {
        field.setCustomValidity('Укажите телефон с кодом города или оператора.');
        field.reportValidity(); return;
      }
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[role="status"]');
      if (button.disabled) return;
      const originalLabel = button.textContent;
      button.disabled = true; button.textContent = 'Отправляем…'; status.hidden = true;
      const subject = ({auction:'Аукционный метод продажи',owners:'Собственникам',home:'Продажа через партнёрскую сеть',marketing:'Маркетинговый план'})[form.dataset.subject] || 'Заявка';
      const message = ['🔔 <b>Заявка с сайта «Делись»</b>', '<b>Страница:</b> ' + escape(subject), '<b>Имя:</b> ' + escape(name), '<b>Телефон:</b> ' + escape(phone), (data.get('property') || data.get('object')) ? '<b>Объект:</b> ' + escape(data.get('property') || data.get('object')) : '', '<b>Согласие:</b> delis-2026-10-04, ' + new Date().toISOString() + ' (отдельный флажок; https://delis-agent.ru/legal/consent/)', '<b>Источник:</b> https://delis-agent.ru/' + ({auction:'auction/',owners:'owners/',home:'',marketing:'#marketing-plan'})[form.dataset.subject]].filter(Boolean).join('\n');
      try {
        const response = await fetch('https://uklonsky.ru/send.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:message}), signal:AbortSignal.timeout(20000)});
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('Request not accepted');
        form.reset(); status.textContent = 'Заявка отправлена. Мы свяжемся с вами по указанному телефону.';
      } catch (_) {
        status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните: +7 (995) 590-59-00.';
      } finally {
        status.hidden = false; button.disabled = false; button.textContent = originalLabel;
      }
    });
  });
})();
