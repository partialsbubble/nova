(function () {

  // 1. Lock down window.open
  const noop = function () { return null; };
  try {
    Object.defineProperty(window, 'open', {
      get: function () { return noop; },
      set: function () {},
      configurable: false,
    });
  } catch (e) {
    window.open = noop;
  }

  // 2. Kill dialogs
  window.alert   = function () {};
  window.confirm = function () { return false; };
  window.prompt  = function () { return null; };

  // 3. Block _blank link clicks
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (a && (a.target === '_blank' || a.target === '_new')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  document.addEventListener('mousedown', function (e) {
    if (e.button === 1) {
      const a = e.target.closest('a');
      if (a) e.preventDefault();
    }
  }, true);

  // 4. THE KEY FIX: place a transparent overlay over every iframe.
  //    Clicks hit the overlay instead of the iframe, so the iframe
  //    never gets a user gesture and can't open a popup.
  //    The overlay uses pointer-events:none briefly after a real
  //    intentional click so the embed stays usable.
  function coverIframe(iframe) {
    if (iframe._popupCoverAttached) return;
    iframe._popupCoverAttached = true;

    const wrap = iframe.parentElement;
    if (!wrap) return;

    // Make sure the parent can contain an absolutely positioned child
    const pos = getComputedStyle(wrap).position;
    if (pos === 'static') wrap.style.position = 'relative';

    const cover = document.createElement('div');
    cover.style.cssText = [
      'position:absolute',
      'top:0', 'left:0', 'width:100%', 'height:100%',
      'z-index:2147483647',
      'background:transparent',
      'cursor:pointer',
    ].join(';');

    // When the user clicks the cover, let the click pass through to the
    // iframe for exactly 0ms — enough for interaction but not for popups.
    cover.addEventListener('mousedown', function (e) {
      cover.style.pointerEvents = 'none';
      setTimeout(function () {
        cover.style.pointerEvents = 'auto';
      }, 0);
    });

    wrap.appendChild(cover);
  }

  function coverAllIframes() {
    document.querySelectorAll('iframe').forEach(coverIframe);
  }

  // 5. Remove overlay/modal DOM elements
  function nukePopupElements() {
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
  }

  function run() {
    nukePopupElements();
    coverAllIframes();
  }

  // 6. Watch for dynamically added iframes or popups
  const observer = new MutationObserver(run);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
