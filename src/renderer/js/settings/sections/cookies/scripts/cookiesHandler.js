/**
 * settings/sections/cookies/scripts/cookiesHandler.js
 * Initializes CookieManager inside the cookies section container.
 *
 * CookieManager is defined in js/cookieManager.js and uses its own
 * IPC bridge (postMessage to parent). We just call render() on it.
 */

const CookiesHandler = (() => {

  let _rendered = false;

  function bind(container, _settings) {
    const root = container.querySelector('#cm-root');
    if (!root) return;

    // CookieManager.render() handles everything internally
    if (typeof CookieManager !== 'undefined') {
      CookieManager.render(root);
      _rendered = true;
    } else {
      root.innerHTML = `
        <div style="padding:32px;text-align:center;color:#4a8080;font-size:13px;">
          Cookie Manager is not available.
        </div>`;
    }
  }

  // Re-render if needed (e.g. section revisited)
  function refresh(container) {
    if (_rendered) return; // already rendered — CookieManager manages its own state
    bind(container);
  }

  return { bind, refresh };

})();
