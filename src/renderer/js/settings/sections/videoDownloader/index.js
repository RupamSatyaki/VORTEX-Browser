/**
 * settings/sections/videoDownloader/index.js
 */

const VideoDownloaderSection = (() => {

  let _container = null;

  function render(container, settings) {
    _container = container;
    container.innerHTML = VideoDownloaderUI.render(settings);
    VideoDownloaderHandler.bind(container, settings);
  }

  // Called on every navigate to this section
  function refresh() {
    if (_container) VideoDownloaderHandler.refresh(_container);
  }

  return { render, refresh };

})();
