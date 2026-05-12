/**
 * features/videoDownloader/scripts/panelController.js
 * Sidebar panel open/close/toggle — same pattern as Assistant.
 * Webview shrinks when panel opens.
 */

const VDLPanelController = (() => {

  let _open = false;

  const VIDEO_SITES = /youtube\.com|youtu\.be|instagram\.com|twitter\.com|x\.com|tiktok\.com|facebook\.com|reddit\.com|vimeo\.com|dailymotion\.com|twitch\.tv/i;

  function init() {
    // Toolbar button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#nav-video-dl')) toggle();
    });

    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#vdl-close-btn')) close();
    });

    // Keyboard shortcut Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
      }
    });

    // Clear done button
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#vdl-clear-done-btn')) return;
      document.querySelectorAll('.vdl-dl-card.done').forEach(c => c.remove());
      _checkEmpty();
    });

    // Auto-detect URL when active tab changes
    document.addEventListener('vortex-tab-switched', _autoDetect);
  }

  function toggle() { _open ? close() : open(); }

  function open() {
    _open = true;
    const panel   = document.getElementById('vdl-panel');
    const wrapper = document.getElementById('ast-wrapper') || document.getElementById('webview-container')?.parentElement;

    if (panel) panel.classList.add('open');

    // Shrink webview — insert panel into ast-wrapper if exists
    const astWrapper = document.getElementById('ast-wrapper');
    if (astWrapper && panel && !astWrapper.contains(panel)) {
      astWrapper.appendChild(panel);
    }

    // Adjust webview border radius
    const wvContainer = document.getElementById('webview-container');
    if (wvContainer) wvContainer.style.borderRadius = '12px 0 0 12px';

    setTimeout(() => {
      _autoDetect();
      document.getElementById('vdl-url-input')?.focus();
    }, 300);
  }

  function close() {
    _open = false;
    document.getElementById('vdl-panel')?.classList.remove('open');
    const wvContainer = document.getElementById('webview-container');
    if (wvContainer) wvContainer.style.borderRadius = '12px';
  }

  function isOpen() { return _open; }

  function _autoDetect() {
    if (!_open) return;
    const wv = document.querySelector('webview.vortex-wv.active');
    if (!wv) return;
    const url   = wv.src || '';
    const input = document.getElementById('vdl-url-input');
    const badge = document.getElementById('vdl-auto-badge');
    if (!input) return;

    if (VIDEO_SITES.test(url)) {
      // Only fill URL — do NOT auto-fetch (user must click Fetch manually)
      if (input.value !== url) {
        input.value = url;
        if (badge) badge.classList.add('visible');
      }
    } else {
      if (badge) badge.classList.remove('visible');
    }
  }

  function _checkEmpty() {
    const list  = document.getElementById('vdl-downloads-list');
    const empty = document.getElementById('vdl-downloads-empty');
    if (!list || !empty) return;
    const hasCards = list.querySelectorAll('.vdl-dl-card').length > 0;
    empty.style.display = hasCards ? 'none' : 'flex';
  }

  return { init, toggle, open, close, isOpen, _checkEmpty };

})();
