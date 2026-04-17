/**
 * settings/sections/changelog/index.js
 * What's New / Changelog section — shell UI + renderChangelog() init.
 */

const ChangelogSection = (() => {

  function render(container, settings) {
    container.innerHTML = ChangelogUI.renderShell();
    ChangelogHandler.bind(container, settings);
  }

  return { render };

})();
