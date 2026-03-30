(function () {
  // 1. Kill window.open() hijacks
  window.open = function () { return null; };

  // 2. Kill alert / confirm / prompt dialogs
  window.alert   = function () {};
  window.confirm = function () { return false; };
  window.prompt  = function () { return null; };

  // 3. Remove existing overlay / modal / popup elements
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
      .forEach(el => el.remove());

    // Restore scroll if a modal locked the body
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  // 4. Watch for new popups being injected
  const observer = new MutationObserver(nuke);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Run once immediately on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', nuke);
  } else {
    nuke();
  }
})();
