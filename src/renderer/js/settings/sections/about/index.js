/**
 * settings/sections/about/index.js
 * About Vortex section — assembles UI + binds scripts.
 */

const AboutSection = (() => {

  function render(container, settings) {
    container.innerHTML = AboutUI.render();
    // bind is async (loads version + checks default browser)
    AboutHandler.bind(container, settings);
  }

  return { render };

})();
