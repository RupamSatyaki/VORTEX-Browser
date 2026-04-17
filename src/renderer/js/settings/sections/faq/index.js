/**
 * settings/sections/faq/index.js
 * Help & FAQ section — shell UI + search/filter/accordion handler.
 */

const FaqSection = (() => {

  function render(container, settings) {
    container.innerHTML = FaqUI.renderShell();
    FaqHandler.bind(container, settings);
  }

  return { render };

})();
