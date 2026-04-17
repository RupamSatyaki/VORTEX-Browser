/**
 * settings/sections/passwords/ui/passwordsUI.js
 * Shell container HTML for Password Manager — pure HTML, no logic.
 * Actual content rendered by PasswordManager.render() from passwords/index.js
 *
 * Note: PasswordManager.render() takes the container directly and builds
 * its own full UI (lock screen + vault UI). No wrapper needed.
 */

const PasswordsUI = (() => {

  function render() {
    // Minimal shell — PasswordManager fills this container completely.
    // padding:0 matches original sec-passwords style so PM layout is correct.
    return `
      <div id="pm-root"
        style="flex:1;min-height:0;display:flex;flex-direction:column;padding:0;">
      </div>`;
  }

  return { render };

})();
