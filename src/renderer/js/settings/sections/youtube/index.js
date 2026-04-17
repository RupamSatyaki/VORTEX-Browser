/**
 * settings/sections/youtube/index.js
 * YouTube section — assembles UI + binds scripts.
 */

const YoutubeSection = (() => {

  function render(container, settings) {
    container.innerHTML = YoutubeUI.render(settings);
    YoutubeHandler.bind(container, settings);
  }

  return { render };

})();
