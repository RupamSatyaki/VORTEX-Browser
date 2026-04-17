/**
 * settings/sections/performance/index.js
 * Performance section — assembles UI + binds scripts.
 */

const PerformanceSection = (() => {

  function render(container, settings) {
    container.innerHTML = PerformanceUI.render(settings);
    PerformanceHandler.bind(container, settings);
  }

  return { render };

})();
