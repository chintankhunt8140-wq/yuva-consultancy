/**
 * core.js — Header Scroll, Mobile Nav, Active Links, Smooth Scroll
 */

'use strict';

(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? window.scrollY / total : 0;
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
})();

(function initMobileNav() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('mobile-nav');
  const body = document.body;
  if (!btn || !nav) return;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const open = () => {
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('open');
    nav.removeAttribute('inert');
    body.style.overflow = 'hidden';
    const first = nav.querySelector(focusableSelector);
    if (first) first.focus();
  };

  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    nav.setAttribute('inert', '');
    body.style.overflow = '';
    btn.focus();
  };

  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  const toggle = () => (isOpen() ? close() : open());

  nav.setAttribute('inert', '');
  btn.addEventListener('click', toggle);
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close();
    if (e.key === 'Tab' && isOpen()) {
      const focusables = Array.from(nav.querySelectorAll(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !btn.contains(e.target) && !nav.contains(e.target)) close();
  });
})();

(function setActiveNav() {
  const parts = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const slug = parts.length > 0 ? parts[parts.length - 1] : '';

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const target = href.replace(/\/$/, '').split('/').filter(Boolean).pop() || '';

    if ((slug === '' && (href === '/' || href === '/index.html' || target === '')) || (slug !== '' && target === slug)) {
      link.classList.add('active');
    }
  });
})();

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


(function initMobileStickyCta() {
  const bar = document.createElement('div');
  bar.className = 'mobile-sticky-cta';
  bar.innerHTML = `
    <a href="tel:+919099665509" class="mobile-sticky-btn mobile-sticky-call" aria-label="Call Yuva Consultancy">📞 Call</a>
    <a href="#" data-wa class="mobile-sticky-btn mobile-sticky-wa" aria-label="Chat on WhatsApp">💬 WhatsApp</a>
  `;
  document.body.appendChild(bar);
})();

window.showToast = function showToast(message, type = 'success', duration = 3500) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
};
