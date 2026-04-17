/**
 * settings/sections/proxy/scripts/proxyHandler.js
 * Initializes ProxyManager inside the proxy section container.
 *
 * ProxyManager is defined in js/proxy/index.js.
 * It handles its own IPC, CSS injection (px-styles), state management
 * and full proxy/tor panel UI internally via ProxyManager.mount(container).
 *
 * ProxyManager.mount() is async and idempotent:
 *   - First call: full mount + IPC bind
 *   - Subsequent calls: re-render with fresh data (no duplicate IPC binds)
 */

const ProxyHandler = (() => {

  let _mounted = false;

  function bind(container, _settings) {
    const root = container.querySelector('#px-panel-root');
    if (!root) return;

    if (typeof ProxyManager !== 'undefined') {
      // ProxyManager.mount() handles idempotency internally
      ProxyManager.mount(root);
      _mounted = true;
    } else {
      root.innerHTML = `
        <div style="padding:32px;text-align:center;color:#4a8080;font-size:13px;">
          Proxy Manager is not available.
        </div>`;
    }
  }

  // Force re-mount (e.g. after settings panel re-open)
  function remount(container) {
    _mounted = false;
    bind(container);
  }

  return { bind, remount };

})();
