/**
 * settings/sections/search/index.js
 * Search Engine section — assembles UI + binds scripts.
 */

const SearchSection = (() => {

  function render(container, settings) {
    container.innerHTML = SearchUI.render(settings);
    SearchHandler.bind(container, settings);
  }

  return { render };

})();
