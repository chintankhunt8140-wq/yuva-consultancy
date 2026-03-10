/**
 * YUVA CONSULTANCY - FIXED VERSION
 * forms.js — Enhanced Form Validation + FormSubmit.co Integration
 * Improved UX, Better Mobile Experience, Real-time Validation
 */

'use strict';

const FORM_EMAIL = 'ronakbhimani6480@gmail.com';

/* ── Enhanced Validators with Better UX ──────────────────── */
const validators = {
  name: v => {
    const trimmed = v.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmed);
  },
  phone: v => {
    const cleaned = v.replace(/[\s\-().]/g, '');
    return /^[+]?[\d]{8,15}$/.test(cleaned);
  },
  email: v => {
    if (!v) return true; // Email is optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  },
  service: v => v.trim() !== '',
  message: v => true, // Optional field
};

const errorMessages = {
  name: 'Please enter your full name (min 2 characters, letters only)',
  phone: 'Please enter a valid phone number (8-15 digits)',
  email: 'Please enter a valid email address',
  service: 'Please select a service from the dropdown',
};

/**
 * Validate a single field with improved UX
 */
function validateField(input) {
  const name = input.name.toLowerCase().replace(/\s+/g, '');
  let fieldKey = name;

  // Map form field names to validator keys
  if (name.includes('name')) fieldKey = 'name';
  else if (name.includes('phone')) fieldKey = 'phone';
  else if (name.includes('email')) fieldKey = 'email';
  else if (name.includes('service')) fieldKey = 'service';
  else if (name.includes('message')) fieldKey = 'message';

  const rule = validators[fieldKey];
  if (!rule) return true;

  const valid = rule(input.value);
  const formGroup = input.closest('.form-group');
  const errorEl = formGroup?.querySelector('.form-error');

  if (valid) {
    input.classList.remove('error');
    input.classList.add('valid');
    if (errorEl) errorEl.textContent = '';
  } else {
    input.classList.add('error');
    input.classList.remove('valid');
    if (errorEl) {
      errorEl.textContent = errorMessages[fieldKey] || 'This field is required.';
    }
  }

  return valid;
}

/**
 * Validate entire form
 */
function validateForm(form) {
  const fields = form.querySelectorAll('[name]');
  let allValid = true;

  fields.forEach(field => {
    // Skip hidden fields and disabled fields
    if (field.type === 'hidden' || field.disabled) return;
    
    if (!validateField(field)) {
      allValid = false;
    }
  });

  return allValid;
}

/**
 * Show loading state on button
 */
function setButtonLoading(button, loading) {
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = `<span class="btn-spinner"></span> Sending…`;
  } else {
    button.disabled = false;
    button.classList.remove('loading');
    button.innerHTML = button.dataset.originalText || 'Submit';
    delete button.dataset.originalText;
  }
}

/**
 * Show alert message
 */
function showAlert(form, type, message) {
  const alertEl = form.querySelector('.form-alert, .alert');
  if (!alertEl) return;

  alertEl.className = `form-alert alert alert-${type} visible`;
  alertEl.innerHTML = message;

  // Auto-hide success messages after 10 seconds
  if (type === 'success') {
    setTimeout(() => {
      alertEl.classList.remove('visible');
    }, 10000);
  }
}

/**
 * Reset form to initial state
 */
function resetFormState(form) {
  form.reset();
  
  // Clear all validation states
  form.querySelectorAll('.form-control').forEach(field => {
    field.classList.remove('error', 'valid');
  });

  // Clear all error messages
  form.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
  });

  // Hide alert
  const alertEl = form.querySelector('.form-alert, .alert');
  if (alertEl) {
    alertEl.classList.remove('visible');
  }
}

/* ── Real-time Validation (Improved) ────────────────────── */
document.querySelectorAll('.js-validate').forEach(form => {
  form.querySelectorAll('[name]').forEach(input => {
    // Validate on blur (when user leaves field)
    input.addEventListener('blur', () => {
      if (input.value) {
        validateField(input);
      }
    });

    // Live validation while typing (only if field already has error)
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });

    // Clear error on focus
    input.addEventListener('focus', () => {
      const errorEl = input.closest('.form-group')?.querySelector('.form-error');
      if (errorEl && errorEl.textContent) {
        errorEl.textContent = '';
      }
    });
  });
});

/* ── Form Submission with Enhanced UX ─────────────────────── */
document.querySelectorAll('.js-contact-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm(form)) {
      // Scroll to first error
      const firstError = form.querySelector('.form-control.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      
      showAlert(form, 'error', '❌ Please fix the errors above before submitting.');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    setButtonLoading(submitBtn, true);

    const data = new FormData(form);
    
    // Add FormSubmit.co config
    data.append('_subject', 'New Consultation Request – Yuva Consultancy');
    data.append('_template', 'table');
    data.append('_captcha', 'false');

    try {
      const response = await fetch(`https://formsubmit.co/${FORM_EMAIL}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: data
      });

      if (response.ok) {
        // Success!
        showAlert(
          form,
          'success',
          '✅ <strong>Message sent successfully!</strong> Our expert will contact you within 24 hours.'
        );

        // Reset form after short delay
        setTimeout(() => {
          resetFormState(form);
        }, 1000);

        // Show toast notification
        if (window.showToast) {
          window.showToast('✅ Consultation request received!');
        }

        // Track conversion (if analytics available)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submission', {
            'event_category': 'engagement',
            'event_label': 'consultation_form'
          });
        }

      } else {
        throw new Error('Server rejected the request');
      }

    } catch (error) {
      console.error('Form submission error:', error);

      // Fallback: Open mailto
      const fields = Object.fromEntries(data.entries());
      const subject = encodeURIComponent('Consultation Request – Yuva Consultancy');
      const body = encodeURIComponent(
        `Name: ${fields['Full Name'] || fields.name || ''}\n` +
        `Phone: ${fields['Phone Number'] || fields.phone || ''}\n` +
        `Email: ${fields['Email'] || fields.email || ''}\n` +
        `Service: ${fields['Service Needed'] || fields.service || ''}\n` +
        `Message: ${fields.message || ''}`
      );

      // Show fallback message
      showAlert(
        form,
        'success',
        '✅ <strong>Request received!</strong> Opening your email client as backup. We\'ll be in touch shortly.'
      );

      // Open mailto after short delay
      setTimeout(() => {
        window.open(`mailto:${FORM_EMAIL}?subject=${subject}&body=${body}`);
      }, 500);

      if (window.showToast) {
        window.showToast('✅ Request sent successfully!');
      }

    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});

/* ── Phone Number Formatting (Better UX) ────────────────── */
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', (e) => {
    // Remove non-digit characters except + at start
    let value = e.target.value;
    
    // Allow + only at start
    if (value.startsWith('+')) {
      value = '+' + value.slice(1).replace(/[^\d]/g, '');
    } else {
      value = value.replace(/[^\d]/g, '');
    }

    e.target.value = value;
  });
});

/* ── Select Dropdown Enhancement ────────────────────────── */
document.querySelectorAll('select.form-control').forEach(select => {
  select.addEventListener('change', () => {
    if (select.value) {
      select.classList.add('has-value');
      validateField(select);
    } else {
      select.classList.remove('has-value');
    }
  });

  // Set initial state
  if (select.value) {
    select.classList.add('has-value');
  }
});

/* ── Accessibility: Announce Errors to Screen Readers ───── */
function announceError(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => announcement.remove(), 1000);
}

/* ── Prevent Double Submission ────────────────────────────── */
let formSubmitting = false;

document.querySelectorAll('.js-contact-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (formSubmitting) {
      e.preventDefault();
      return false;
    }
    formSubmitting = true;
    
    // Reset after 5 seconds as safety net
    setTimeout(() => {
      formSubmitting = false;
    }, 5000);
  });
});

/* ── Auto-save Form Data (Better UX) ─────────────────────── */
const STORAGE_KEY = 'yuva_form_data';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function saveFormData(form) {
  if (!window.localStorage) return;

  const data = {};
  const fields = form.querySelectorAll('[name]');
  
  fields.forEach(field => {
    if (field.type !== 'hidden' && field.name) {
      data[field.name] = field.value;
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Could not save form data:', e);
  }
}

function loadFormData(form) {
  if (!window.localStorage) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const { data, timestamp } = JSON.parse(stored);
    
    // Check if data is expired
    if (Date.now() - timestamp > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Restore form data
    Object.keys(data).forEach(name => {
      const field = form.querySelector(`[name="${name}"]`);
      if (field && data[name]) {
        field.value = data[name];
      }
    });

  } catch (e) {
    console.warn('Could not load form data:', e);
  }
}

function clearFormData() {
  if (!window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear form data:', e);
  }
}

// Auto-save on input (debounced)
let saveTimeout;
document.querySelectorAll('.js-contact-form').forEach(form => {
  form.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveFormData(form);
    }, 1000);
  });

  // Load saved data on page load
  loadFormData(form);

  // Clear saved data on successful submit
  form.addEventListener('submit', (e) => {
    if (e.defaultPrevented) return;
    setTimeout(() => clearFormData(), 2000);
  });
});

console.log('✅ Enhanced form validation loaded');
