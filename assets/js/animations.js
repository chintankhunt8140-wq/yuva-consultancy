/**
 * animations.js — Scroll-Reveal via IntersectionObserver
 * Yuva Consultancy Production Website
 */

'use strict';

(function initScrollReveal() {
  // Elements with data-reveal attribute
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  // Respect prefers-reduced-motion
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOK) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();

/* ── Stagger Children ──────────────────────────────────────
   Adds auto-incremented [data-delay] to children with [data-stagger]
   Usage: <div data-stagger="100"> ... <div data-reveal="fade-up"> ... </div> */
(function initStagger() {
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const step = parseInt(parent.getAttribute('data-stagger'), 10) || 100;
    const children = parent.querySelectorAll('[data-reveal]');
    children.forEach((child, i) => {
      if (!child.hasAttribute('data-delay')) {
        child.setAttribute('data-delay', Math.min(i * step, 600));
      }
    });
  });
})();
