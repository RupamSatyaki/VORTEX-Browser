/**
 * settings/sections/proxy/index.js
 * Proxy & Tor section — shell UI + ProxyManager.mount() init.
 *
 * ProxyManager.mount(container) handles everything:
 *   - CSS injection (proxy/styles.css via 'px-styles' id check)
 *   - IPC event binding (proxy:statusUpdate, tor:* events)
 *   - Full proxy form, Tor panel, bypass list, status card UI
 *   - ProxyState singleton event emitter
 */

const ProxySection = (() => {

  function render(container, settings) {
    container.innerHTML = ProxyUI.render();
    ProxyHandler.bind(container, settings);
  }

  return { render };

})();
