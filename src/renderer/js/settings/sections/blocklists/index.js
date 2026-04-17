/**
 * settings/sections/blocklists/index.js
 * Ad & Tracker Blocklist section — shell UI + BlocklistManager.render() init.
 */

const BlocklistsSection = (() => {

  function render(container, settings) {
    container.innerHTML = BlocklistsUI.render();
    BlocklistsHandler.bind(container, settings);
  }

  return { render };

})();
