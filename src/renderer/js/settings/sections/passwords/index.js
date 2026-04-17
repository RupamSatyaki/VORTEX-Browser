/**
 * settings/sections/passwords/index.js
 * Password Manager section — shell UI + PasswordManager.render() init.
 *
 * PasswordManager.render(container) handles everything:
 *   - Lock screen (setup or unlock)
 *   - Vault UI (entries, generator, import/export)
 *   - CSS injection (no-op if already loaded via index.html)
 *   - IPC bridge via postMessage to parent
 */

const PasswordsSection = (() => {

  function render(container, settings) {
    // Apply padding:0 to match original sec-passwords style
    container.style.padding = '0';
    container.innerHTML = PasswordsUI.render();
    PasswordsHandler.bind(container, settings);
  }

  return { render };

})();
