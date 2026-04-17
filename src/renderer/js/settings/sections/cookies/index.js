/**
 * settings/sections/cookies/index.js
 * Cookie Manager section — shell UI + CookieManager.render() init.
 */

const CookiesSection = (() => {

  function render(container, settings) {
    container.innerHTML = CookiesUI.render();
    CookiesHandler.bind(container, settings);
  }

  return { render };

})();
