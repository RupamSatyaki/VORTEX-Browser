/**
 * settings/sections/languages/index.js
 * Languages section — assembles UI + binds scripts.
 */

const LanguagesSection = (() => {

  function render(container, settings) {
    container.innerHTML = LanguagesUI.render(settings);
    LanguagesHandler.bind(container, settings);
  }

  return { render };

})();
