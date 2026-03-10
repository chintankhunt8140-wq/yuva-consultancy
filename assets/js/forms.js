/**
 * forms.js — Validation + FormSubmit handling
 */

'use strict';

const FORM_EMAIL = 'ronakbhimani6480@gmail.com';
const STORAGE_KEY = 'yuva_form_data';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000;

const validators = {
  name: (v) => {
    const trimmed = v.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmed);
  },
  phone: (v) => {
    const cleaned = v.replace(/[\s\-().]/g, '');
    return /^[+]?[\d]{8,15}$/.test(cleaned);
  },
  email: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  service: (v) => v.trim() !== '',
  message: () => true,
};

const errorMessages = {
  name: 'Please enter your full name (min 2 characters, letters only)',
  phone: 'Please enter a valid phone number (8-15 digits)',
  email: 'Please enter a valid email address',
  service: 'Please select a service from the dropdown',
};

function mapFieldKey(inputName = '') {
  const name = inputName.toLowerCase().replace(/\s+/g, '');
  if (name.includes('name')) return 'name';
  if (name.includes('phone')) return 'phone';
  if (name.includes('email')) return 'email';
  if (name.includes('service')) return 'service';
  if (name.includes('message')) return 'message';
  return name;
}

function announceError(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

function validateField(input) {
  const fieldKey = mapFieldKey(input.name);
  const rule = validators[fieldKey];
  if (!rule) return true;

  const valid = rule(input.value);
  const group = input.closest('.form-group');
  const errorEl = group?.querySelector('.form-error');

  input.classList.toggle('error', !valid);
  input.classList.toggle('valid', valid && input.value.trim() !== '');

  if (errorEl) {
    errorEl.textContent = valid ? '' : (errorMessages[fieldKey] || 'This field is required.');
  }

  if (!valid) announceError(errorMessages[fieldKey] || 'Invalid field');
  return valid;
}

function validateForm(form) {
  let allValid = true;
  form.querySelectorAll('[name]').forEach((field) => {
    if (field.type === 'hidden' || field.disabled) return;
    if (!validateField(field)) allValid = false;
  });
  return allValid;
}

function setButtonLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '<span class="btn-spinner"></span> Sending…';
    return;
  }
  button.disabled = false;
  button.classList.remove('loading');
  button.innerHTML = button.dataset.originalText || 'Submit';
}

function showAlert(form, type, message) {
  const alertEl = form.querySelector('.form-alert, .alert');
  if (!alertEl) return;
  alertEl.className = `form-alert alert alert-${type} visible`;
  alertEl.innerHTML = message;
}

function resetFormState(form) {
  form.reset();
  form.querySelectorAll('.form-control').forEach((field) => field.classList.remove('error', 'valid', 'has-value'));
  form.querySelectorAll('.form-error').forEach((el) => {
    el.textContent = '';
  });
  const alertEl = form.querySelector('.form-alert, .alert');
  if (alertEl) alertEl.classList.remove('visible');
}

function saveFormData(form) {
  if (!window.localStorage) return;
  const data = {};
  form.querySelectorAll('[name]').forEach((field) => {
    if (field.type !== 'hidden' && field.name) data[field.name] = field.value;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

function loadFormData(form) {
  if (!window.localStorage) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const { data, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    Object.entries(data).forEach(([name, value]) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (field && value) field.value = value;
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function clearFormData() {
  if (window.localStorage) localStorage.removeItem(STORAGE_KEY);
}

function bindValidation(form) {
  form.querySelectorAll('[name]').forEach((input) => {
    input.addEventListener('blur', () => input.value && validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}

function bindSubmission(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.submitting === 'true') return;

    if (!validateForm(form)) {
      const firstError = form.querySelector('.form-control.error');
      if (firstError) firstError.focus();
      showAlert(form, 'error', '❌ Please fix the errors above before submitting.');
      return;
    }

    form.dataset.submitting = 'true';
    const submitBtn = form.querySelector('[type="submit"]');
    setButtonLoading(submitBtn, true);

    const data = new FormData(form);
    data.set('_subject', 'New Consultation Request – Yuva Consultancy');
    data.set('_template', 'table');
    data.set('_captcha', 'false');

    try {
      const response = await fetch(`https://formsubmit.co/${FORM_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });

      if (!response.ok) throw new Error('Request failed');

      showAlert(form, 'success', '✅ <strong>Message sent successfully!</strong> Our expert will contact you within 24 hours.');
      clearFormData();
      setTimeout(() => resetFormState(form), 800);
      if (window.showToast) window.showToast('✅ Consultation request received!');
    } catch (error) {
      console.error('Form submission error:', error);
      showAlert(form, 'error', '⚠️ Unable to send right now. Please call or WhatsApp us.');
    } finally {
      form.dataset.submitting = 'false';
      setButtonLoading(submitBtn, false);
    }
  });
}

document.querySelectorAll('.js-contact-form').forEach((form) => {
  bindValidation(form);
  bindSubmission(form);
  loadFormData(form);

  let saveTimeout;
  form.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveFormData(form), 800);
  });
});

document.querySelectorAll('input[type="tel"]').forEach((input) => {
  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'tel');
  input.addEventListener('input', (e) => {
    let value = e.target.value;
    value = value.startsWith('+') ? `+${value.slice(1).replace(/[^\d]/g, '')}` : value.replace(/[^\d]/g, '');
    e.target.value = value;
  });
});
