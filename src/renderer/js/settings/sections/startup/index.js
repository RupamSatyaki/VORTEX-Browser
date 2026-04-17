/**
 * settings/sections/startup/index.js
 * On Startup section — assembles UI + binds scripts.
 */

const StartupSection = (() => {

  function render(container, settings) {
    container.innerHTML = StartupUI.render(settings);
    StartupHandler.bind(container, settings);
  }

  return { render };

})();
