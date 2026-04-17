/**
 * settings/sections/changelog/scripts/changelogHandler.js
 * Initializes changelog rendering inside the changelog section.
 *
 * renderChangelog() is defined in js/changelog/index.js.
 * It fetches JSON files and renders the full changelog UI.
 *
 * We override the target container so it renders into #cl-root
 * instead of the old #sec-changelog element.
 */

const ChangelogHandler = (() => {

  let _rendered = false;

  function bind(container, _settings) {
    if (_rendered) return;

    const root = container.querySelector('#cl-root');
    if (!root) return;

    root.innerHTML = ChangelogUI.renderLoading();

    if (typeof renderChangelog === 'undefined') {
      root.innerHTML = ChangelogUI.renderError('changelog/index.js not loaded');
      return;
    }

    // renderChangelog() targets #sec-changelog by default.
    // We temporarily override it to target #cl-root instead.
    _renderInto(root);
    _rendered = true;
  }

  async function _renderInto(root) {
    try {
      const oldId = root.id;
      root.id = 'sec-changelog';
      await renderChangelog();
      root.id = oldId;

      // Remove duplicate section-title injected by renderChangelog()
      const titleEl = root.querySelector('.section-title');
      if (titleEl) titleEl.remove();

      // clToggle and clGroupToggle are now defined in changelog/index.js
      // onclick attributes work directly — no delegation needed

    } catch (e) {
      root.innerHTML = ChangelogUI.renderError(e.message);
    }
  }

  function reset() { _rendered = false; }

  return { bind, reset };

})();
