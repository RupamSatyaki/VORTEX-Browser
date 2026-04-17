/**
 * settings/sections/sync/index.js
 * Sync & Backup section — assembles UI + binds scripts.
 */

const SyncSection = (() => {

  function render(container, settings) {
    container.innerHTML = SyncUI.render();
    SyncHandler.bind(container, settings);
  }

  return { render };

})();
