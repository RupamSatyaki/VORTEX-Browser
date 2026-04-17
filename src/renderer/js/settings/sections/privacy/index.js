/**
 * settings/sections/privacy/index.js
 * Privacy & Security section — assembles UI + binds scripts.
 */

const PrivacySection = (() => {

  function render(container, settings) {
    container.innerHTML = PrivacyUI.render(settings);
    PrivacyHandler.bind(container, settings);
  }

  return { render };

})();
