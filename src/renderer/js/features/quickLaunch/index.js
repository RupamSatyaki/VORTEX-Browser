/**
 * features/quickLaunch/index.js
 * QuickLaunch module — public API, same interface as old quickLaunch.js
 *
 * Delegates to:
 *   ui/popularSitesUI.js          — SITES data + filter + buildItem
 *   ui/bookmarksGridUI.js         — bookmark item + add button DOM
 *   ui/addBookmarkUI.js           — add bookmark panel HTML
 *   scripts/popularSitesHandler.js— render list, category filter, search
 *   scripts/bookmarksHandler.js   — render grid, add panel logic
 *   scripts/qlOmnibox.js          — suggestions, show/hide, navigate
 */

const QuickLaunch = (() => {

  let _visible = false;

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open() {
    if (_visible) { close(); return; }
    _visible = true;
    document.getElementById('ql-panel')?.classList.add('visible');
    document.getElementById('ql-backdrop')?.classList.add('visible');
    setTimeout(() => {
      const inp = document.getElementById('ql-search');
      if (inp) { inp.value = ''; inp.focus(); }
    }, 80);
    _renderBookmarks();
    _renderProfile();
    QLPopularSitesHandler.render('', 'all', _openURL);
  }

  function close() {
    if (!_visible) return;
    _visible = false;
    document.getElementById('ql-panel')?.classList.remove('visible');
    document.getElementById('ql-backdrop')?.classList.remove('visible');
    QLOmnibox.hide();
    document.getElementById('ql-menu-dropdown')?.classList.remove('visible');
  }

  function _openURL(url) {
    close();
    if (window.Prefetch) Prefetch.prefetch(url);
    Tabs.createTab(url);
  }

  function _navigate(input) {
    const url = QLOmnibox.navigate(input);
    if (url) _openURL(url);
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async function _renderProfile() {
    const el = document.getElementById('ql-profile-pic');
    if (!el) return;
    try {
      const p = await window.vortexAPI.invoke('storage:read', 'profile');
      if (p?.avatarType === 'image' && p.avatarData) {
        el.innerHTML = `<img src="${p.avatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
      } else if (p?.name) {
        el.textContent = p.name[0].toUpperCase();
      }
    } catch (_) {}
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  function _renderBookmarks() {
    QLBookmarksHandler.renderGrid(
      _openURL,
      () => QLBookmarksHandler.openAddPanel(_renderBookmarks)
    );
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Backdrop close
    document.getElementById('ql-backdrop')?.addEventListener('click', close);

    // Omnibox search input
    QLOmnibox.bindSearchInput(_openURL, close);

    // Popular sites menu button + category buttons + search
    QLPopularSitesHandler.bindMenuBtn();
    QLPopularSitesHandler.bindCategoryBtns(_openURL);
    QLPopularSitesHandler.bindPopSearch(_openURL, _navigate);

    // Profile pic → settings
    document.getElementById('ql-profile-pic')?.addEventListener('click', () => {
      close();
      Panel.open('settings');
    });
  }

  // ── Public API (same as old quickLaunch.js) ───────────────────────────────
  return { open, close, init };

})();
