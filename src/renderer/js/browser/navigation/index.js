/**
 * browser/navigation/index.js
 * Navigation module — public API, same interface as old navigation.js
 *
 * Delegates to:
 *   ui/toolbarHTML.js       — toolbar HTML
 *   ui/menuDropdownHTML.js  — menu dropdown HTML
 *   ui/profileMenuHTML.js   — profile dropdown HTML
 *   scripts/addressBar.js   — URL bar handlers
 *   scripts/securityIcon.js — security icon + popup
 *   scripts/progressBar.js  — loading progress bar
 *   scripts/hoverIcons.js   — address bar hover icons
 *   scripts/menuDropdown.js — nav dropdown menu
 *   scripts/profileMenu.js  — profile dropdown
 */

const Navigation = (() => {

  let _currentNavDomain = '';

  // ── render ─────────────────────────────────────────────────────────────────
  function render(isIncognito = false) {
    const container = document.getElementById('navbar-container');
    container.className = 'browser-toolbar';
    container.innerHTML = NavToolbarHTML.render(isIncognito);

    // Core button bindings
    document.getElementById('nav-back').addEventListener('click',    () => WebView.goBack());
    document.getElementById('nav-forward').addEventListener('click', () => WebView.goForward());
    document.getElementById('nav-reload').addEventListener('click',  () => WebView.reload());
    document.getElementById('btn-downloads').addEventListener('click', () => Panel.open('downloads'));
    document.getElementById('nav-summarize').addEventListener('click', () => Summarizer.open());
    document.getElementById('nav-whatsapp')?.addEventListener('click', () => WhatsAppPanel.toggle());
    document.getElementById('nav-devhub')?.addEventListener('click',   () => DevHub.toggle());

    // Init sub-modules
    if (typeof PermissionPopup !== 'undefined') PermissionPopup.initShortcut();
    if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.init();
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge.init();

    // Address bar
    NavAddressBar.bind();

    // Hover icons
    NavHoverIcons.bind();

    // Menu button
    document.getElementById('nav-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      NavMenuDropdown.toggle();
    });

    // Zoom buttons
    document.getElementById('zoom-in-btn').addEventListener('click',    () => WebView.zoomIn());
    document.getElementById('zoom-out-btn').addEventListener('click',   () => WebView.zoomOut());
    document.getElementById('zoom-reset-btn').addEventListener('click', () => WebView.zoomReset());

    // Profile button
    document.getElementById('btn-user').addEventListener('click', (e) => {
      e.stopPropagation();
      NavProfileMenu.toggle();
    });
  }

  // ── setURL ─────────────────────────────────────────────────────────────────
  function setURL(url) {
    NavAddressBar.setURL(url);
    NavSecurityIcon.update(url);
    if (window._updateBookmarkIcon) window._updateBookmarkIcon();

    try {
      _currentNavDomain = url && url.startsWith('http')
        ? new URL(url).hostname.replace(/^www\./, '')
        : '';
    } catch { _currentNavDomain = ''; }

    NavHoverIcons.setDomain(_currentNavDomain);

    if (typeof PermissionPopup !== 'undefined') PermissionPopup.updateBadge(_currentNavDomain);
    if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.updateBadge(_currentNavDomain);
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge._refreshBadge?.();
  }

  // ── navigate ───────────────────────────────────────────────────────────────
  function navigate() {
    NavAddressBar.navigate();
  }

  // ── progress ───────────────────────────────────────────────────────────────
  function startProgress() { NavProgressBar.start(); }
  function endProgress()   { NavProgressBar.end();   }

  // ── download badge ─────────────────────────────────────────────────────────
  function setDownloadBadge(count) {
    const badge = document.getElementById('dl-badge');
    if (!badge) return;
    if (count > 0) { badge.textContent = count > 99 ? '99+' : count; badge.classList.add('visible'); }
    else           { badge.classList.remove('visible'); }
  }

  // ── applySettings ──────────────────────────────────────────────────────────
  function applySettings(s) {
    if (s.engine) NavAddressBar.setSearchEngine(s.engine);
    if (typeof s.prefetch === 'boolean')    Prefetch.setEnabled(s.prefetch);
    if (typeof s.suggestions === 'boolean') Prefetch.setSuggestionsEnabled(s.suggestions);
    if (typeof s.tabpreview === 'boolean')  TabPreview.setEnabled(s.tabpreview);
    if (typeof s.tabsleep === 'boolean')    Tabs.setSleepEnabled(s.tabsleep);
    if (s.tabsleepMinutes !== undefined)    Tabs.setSleepTimeout(Number(s.tabsleepMinutes));
    if (typeof s.pip === 'boolean')         WebView.setPiPEnabled(s.pip);
    if (s.spellcheckLang && window.vortexAPI) window.vortexAPI.send('spellcheck:setLanguage', s.spellcheckLang);
    const waBtn = document.getElementById('nav-whatsapp');
    if (waBtn) waBtn.style.display = s.whatsappBtn !== false ? '' : 'none';
    const dhBtn = document.getElementById('nav-devhub');
    if (dhBtn) dhBtn.style.display = s.devhubBtn !== false ? '' : 'none';
  }

  // ── initShortcuts ──────────────────────────────────────────────────────────
  function _initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') { e.preventDefault(); WebView.openDevTools(); return; }
      if (e.key === 'F11') { e.preventDefault(); window.vortexAPI.send('window:fullscreen'); return; }
      if (!e.ctrlKey) return;
      switch (e.key) {
        case 't': e.preventDefault(); QuickLaunch.open(); break;
        case 'n':
          if (e.shiftKey) { e.preventDefault(); NavMenuDropdown._showComingSoon?.('Incognito Mode'); }
          else            { e.preventDefault(); window.vortexAPI.send('window:new'); }
          break;
        case 'w': e.preventDefault(); { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); } break;
        case 'h': e.preventDefault(); Panel.open('history'); break;
        case 'j': e.preventDefault(); Panel.open('downloads'); break;
        case 'b': e.preventDefault(); Panel.open('bookmarks'); break;
        case 'f': e.preventDefault(); WebView.findInPage(); break;
        case 'p': e.preventDefault(); if (e.shiftKey) WebView.pip(); else WebView.print(); break;
        case 's': e.preventDefault(); WebView.savePage(); break;
        case ',': e.preventDefault(); Panel.open('settings'); break;
        case 'r': if (e.shiftKey) { e.preventDefault(); WebView.hardReload(); } break;
        case 'k': e.preventDefault(); CommandPalette.open(); break;
        case 'Tab':
          if (e.shiftKey) { e.preventDefault(); Tabs.switchPrev(); }
          else            { e.preventDefault(); Tabs.switchNext(); }
          break;
      }
    });
  }

  // ── initProfile ────────────────────────────────────────────────────────────
  async function _initProfile() {
    await NavProfileMenu.init();
  }

  function _newTabURL() { return 'https://www.google.com'; }

  // ── Public API (same as old navigation.js) ─────────────────────────────────
  return {
    render,
    navigate,
    setURL,
    startProgress,
    endProgress,
    setDownloadBadge,
    applySettings,
    initShortcuts: _initShortcuts,
    initProfile:   _initProfile,
    newTabURL:     _newTabURL,
    _getSearchEngine: () => NavAddressBar._searchEngine || 'google',
  };

})();
