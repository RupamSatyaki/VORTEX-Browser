/**
 * settings/sections/shortcuts/index.js
 * Keyboard Shortcuts section — static display, no settings to save.
 */

const ShortcutsSection = (() => {

  function render(container, _settings) {
    // Shortcuts are static — no settings object needed
    container.innerHTML = ShortcutsUI.render();
    ShortcutsHandler.bind(container, _settings);
  }

  return { render };

})();
