/* Keep contact details out of the URL; continue in the existing signup flow. */
(() => {
  const form = document.getElementById('partner-form');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const phone = String(values.get('phone') || '');
    const field = form.elements.phone;
    if (phone.replace(/\D/g, '').length < 10) {
      field.setCustomValidity('Укажите телефон с кодом города или оператора.');
      field.reportValidity();
      return;
    }
    field.setCustomValidity('');
    try { sessionStorage.setItem('delis_partner_contact', JSON.stringify({name: String(values.get('name') || '').trim(), phone})); } catch (_) {}
    location.assign('/pages/cabinet/register/');
  });
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
})();
