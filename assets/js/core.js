/**
 * core.js — Header Scroll, Mobile Nav, Active Links, Smooth Scroll
 * Yuva Consultancy Production Website
 */

'use strict';

/* ── Header Scroll Shrink ───────────────────────────────── */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ── Scroll Progress Bar ────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? window.scrollY / total : 0;
    bar.style.transform = `scaleX(${pct})`;
  }, { passive: true });
})();

/* ── Mobile Navigation ──────────────────────────────────── */
(function initMobileNav() {
  const btn  = document.getElementById('hamburger-btn');
  const nav  = document.getElementById('mobile-nav');
  const body = document.body;
  if (!btn || !nav) return;

  const open  = () => { btn.setAttribute('aria-expanded', 'true');  nav.classList.add('open');    body.style.overflow = 'hidden'; };
  const close = () => { btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); body.style.overflow = ''; };
  const toggle= () => btn.getAttribute('aria-expanded') === 'true' ? close() : open();

  btn.addEventListener('click', toggle);

  // Close when a link is clicked
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on ESC
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) close();
  });
})();

/* ── Active Nav Link Detection ──────────────────────────── */
(function setActiveNav() {
  // Resolve current page slug
  const parts = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const slug  = parts.length > 0 ? parts[parts.length - 1] : '';

  document.querySelectorAll('[data-nav-link]').forEach(link => {
    const href   = link.getAttribute('href') || '';
    const target = href.replace(/\/$/, '').split('/').filter(Boolean).pop() || '';

    if (
      (slug === '' && (href === '/' || href === '/index.html' || target === ''))
      || (slug !== '' && target === slug)
    ) {
      link.classList.add('active');
    }
  });
})();

/* ── Smooth Scroll for Anchor Links ─────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── Toast Notification (global helper) ─────────────────── */
window.showToast = function(message, type = 'success', duration = 3500) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
};
