/**
 * settings/sections/passwords/scripts/passwordsHandler.js
 * Initializes PasswordManager inside the passwords section container.
 *
 * PasswordManager is defined in js/passwords/index.js.
 * It handles its own IPC bridge, CSS injection, vault unlock UI,
 * and full password manager UI internally.
 *
 * passwords/styles.css is already loaded via index.html <link>
 * so PasswordManager's dynamic CSS injection is a no-op (id check prevents duplicate).
 */

const PasswordsHandler = (() => {

  let _rendered = false;

  function bind(container, _settings) {
    if (_rendered) return;

    const root = container.querySelector('#pm-root');
    if (!root) return;

    if (typeof PasswordManager !== 'undefined') {
      // PasswordManager.render() is async — handles vault check + lock screen
      PasswordManager.render(root);
      _rendered = true;
    } else {
      root.innerHTML = `
        <div style="padding:32px;text-align:center;color:#4a8080;font-size:13px;">
          Password Manager is not available.
        </div>`;
    }
  }

  // Called if section needs to re-render (e.g. after vault lock/unlock)
  function reset() { _rendered = false; }

  // Re-render with fresh state — used when vault is locked/unlocked
  function refresh(container, settings) {
    _rendered = false;
    bind(container, settings);
  }

  return { bind, reset, refresh };

})();
