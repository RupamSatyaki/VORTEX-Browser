/**
 * settings/sections/downloads/index.js
 * Downloads section — assembles UI + binds scripts.
 */

const DownloadsSection = (() => {

  function render(container, settings) {
    container.innerHTML = DownloadsUI.render(settings);
    DownloadsHandler.bind(container, settings);
  }

  return { render };

})();
