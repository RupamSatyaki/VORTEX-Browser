/**
 * settings/sections/blocklists/scripts/blocklistsHandler.js
 * Initializes BlocklistManager inside the blocklists section container.
 *
 * BlocklistManager is defined in js/blocklist/index.js.
 * It handles its own IPC, CSS injection and full panel UI internally.
 *
 * blocklist/styles.css is injected dynamically by BlocklistManager itself
 * (it checks for 'bl-styles-link' id before injecting — no duplicate).
 */

const BlocklistsHandler = (() => {

  let _rendered = false;

  function bind(container, _settings) {
    if (_rendered) return;

    const body = container.querySelector('#bl-settings-body');
    if (!body) return;

    if (typeof BlocklistManager !== 'undefined') {
      BlocklistManager.render(body);
      _rendered = true;
    } else {
      body.innerHTML = `
        <div style="padding:32px;text-align:center;color:#4a8080;font-size:13px;">
          Blocklist Manager is not available.
        </div>`;
    }
  }

  function reset() { _rendered = false; }

  return { bind, reset };

})();
