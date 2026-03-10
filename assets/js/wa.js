/**
 * wa.js — WhatsApp Integration
 * Yuva Consultancy Production Website
 */

'use strict';

(function initWhatsApp() {
  const WA_NUMBER  = '919099665509'; // +91 9099665509
  const DEFAULT_MSG = encodeURIComponent(
    'Hello! I am interested in a free consultation from Yuva Consultancy. Please help me with my business registration.'
  );

  // Hydrate all elements with data-wa or data-wa-msg
  document.querySelectorAll('[data-wa]').forEach(el => {
    const customMsg = el.getAttribute('data-wa-msg');
    const msg = customMsg ? encodeURIComponent(customMsg) : DEFAULT_MSG;
    el.href   = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    el.target = '_blank';
    el.rel    = 'noopener noreferrer';
  });

  // Service-specific WA messages (for service cards CTAs)
  document.querySelectorAll('[data-wa-service]').forEach(el => {
    const service = el.getAttribute('data-wa-service');
    const msg = encodeURIComponent(
      `Hello! I am interested in ${service} services from Yuva Consultancy. Please help me get started.`
    );
    el.href   = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    el.target = '_blank';
    el.rel    = 'noopener noreferrer';
  });
})();
