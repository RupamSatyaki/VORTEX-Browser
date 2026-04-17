/**
 * settings/sections/updates/index.js
 * Updates section — shell UI + GitHub releases updater handler.
 */

const UpdatesSection = (() => {

  function render(container, settings) {
    container.innerHTML = UpdatesUI.render();
    UpdatesHandler.bind(container, settings);
  }

  return { render };

})();
