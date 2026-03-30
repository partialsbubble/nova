(function () {
  // 1. Kill window.open() — including click-gesture triggered ones
  window.open = function () { return null; };

  // Reapply after any script might overwrite it
  Object.defineProperty(window, 'open', {
    get: function () { return function () { return null; }; },
    set: function () {},
    configurable: false,
  });

  // 2. Kill dialog methods
  window.alert   = function () {};
  window.confirm = function () { return false; };
  window.prompt  = function () { return null; };

  // 3. Intercept ALL clicks and middle-clicks that might open a new tab/window
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (a && (a.target === '_blank' || a.target === '_new')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('mousedown', function (e) {
    // Middle-click (button 1) opens new tab in most browsers
    if (e.button === 1) {
      const a = e.target.closest('a');
      if (a) e.preventDefault();
    }
  }, true);

  // 4. Sandbox all iframes to block popups from embeds
  function sandboxIframes() {
    document.querySelectorAll('iframe').forEach(function (iframe) {
      const existing = iframe.getAttribute('sandbox') || '';
      if (!existing.includes('allow-popups')) {
        if (!iframe.hasAttribute('sandbox')) {
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
        }
      } else {
        // Strip allow-popups and allow-popups-to-escape-sandbox
        const cleaned = existing
          .replace(/allow-popups-to-escape-sandbox/g, '')
          .replace(/allow-popups/g, '')
          .trim();
        iframe.setAttribute('sandbox', cleaned);
      }
    });
  }

  // 5. Remove overlay/modal/cookie DOM elements
  function nuke() {
    const selectors = [
      '[class*="popup"]',  '[id*="popup"]',
      '[class*="modal"]',  '[id*="modal"]',
      '[class*="overlay"]','[id*="overlay"]',
      '[class*="banner"]', '[id*="banner"]',
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="consent"]','[id*="consent"]',
      '[role="dialog"]',   '[aria-modal="true"]',
    ];
    document.querySelectorAll(selectors.join(','))
      .forEach(function (el) { el.remove(); });

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    sandboxIframes();
  }

  // 6. Watch for new popups or iframes being injected
  const observer = new MutationObserver(nuke);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', nuke);
  } else {
    nuke();
  }
})();
