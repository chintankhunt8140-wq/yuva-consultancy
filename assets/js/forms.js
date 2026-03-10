/**
 * forms.js — Form Validation + FormSubmit.co Email Integration
 * Yuva Consultancy Production Website
 * Email: ronakbhimani6480@gmail.com
 */

'use strict';

const FORM_EMAIL = 'ronakbhimani6480@gmail.com';

/* ── Validators ─────────────────────────────────────────── */
const validators = {
  name:    v => v.trim().length >= 2,
  phone:   v => /^[+]?[\d\s\-().]{8,18}$/.test(v.trim()),
  email:   v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), // optional
  service: v => v.trim() !== '',
  message: v => true, // optional
};

const errorMessages = {
  name:    'Please enter your full name (min 2 characters).',
  phone:   'Please enter a valid phone number.',
  email:   'Please enter a valid email address.',
  service: 'Please select a service.',
};

function validateField(input) {
  const name = input.name;
  const rule = validators[name];
  if (!rule) return true;

  const valid = rule(input.value);
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');

  if (valid) {
    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  } else {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = errorMessages[name] || 'This field is required.';
  }
  return valid;
}

function validateForm(form) {
  const fields = form.querySelectorAll('[name]');
  let allValid = true;
  fields.forEach(f => { if (!validateField(f)) allValid = false; });
  return allValid;
}

/* ── Real-time Validation ────────────────────────────────── */
document.querySelectorAll('.js-validate').forEach(form => {
  form.querySelectorAll('[name]').forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
});

/* ── Form Submission ─────────────────────────────────────── */
document.querySelectorAll('.js-contact-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const alertEl  = form.querySelector('.form-alert');
    const originalHTML = submitBtn.innerHTML;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> Sending…`;
    if (alertEl) alertEl.className = 'form-alert alert';

    const data = new FormData(form);
    data.append('_subject', `New Enquiry – Yuva Consultancy`);
    data.append('_template', 'table');
    data.append('_captcha', 'false');

    try {
      const res = await fetch(`https://formsubmit.co/${FORM_EMAIL}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });

      if (res.ok) {
        if (alertEl) {
          alertEl.className = 'form-alert alert alert-success visible';
          alertEl.innerHTML = '✅ <strong>Message sent!</strong> Our expert will contact you within 24 hours.';
        }
        form.reset();
        form.querySelectorAll('.form-control').forEach(f => f.classList.remove('error'));
        window.showToast?.('✅ Consultation request received!');
      } else {
        throw new Error('Server rejected the request');
      }
    } catch {
      // Fallback: open mailto
      const fields  = Object.fromEntries(data.entries());
      const subject = encodeURIComponent('Consultation Request – Yuva Consultancy');
      const body    = encodeURIComponent(
        `Name: ${fields['Full Name'] || fields.name || ''}\n` +
        `Phone: ${fields['Phone Number'] || fields.phone || ''}\n` +
        `Email: ${fields['Email'] || fields.email || ''}\n` +
        `Service: ${fields['Service Needed'] || fields.service || ''}\n` +
        `Message: ${fields.message || ''}`
      );
      window.open(`mailto:${FORM_EMAIL}?subject=${subject}&body=${body}`);

      if (alertEl) {
        alertEl.className = 'form-alert alert alert-success visible';
        alertEl.innerHTML = '✅ <strong>Request received!</strong> We\'ll be in touch shortly.';
      }
      window.showToast?.('✅ Request sent successfully!');
    } finally {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalHTML;
    }
  });
});
