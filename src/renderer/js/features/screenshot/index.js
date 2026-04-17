/**
 * features/screenshot/index.js
 * Screenshot module — public API, same interface as old screenshot.js
 *
 * Delegates to:
 *   ui/screenshotPanel.js          — panel HTML + loading state
 *   scripts/screenshotHandler.js   — copy, save, close button bindings
 */

window.Screenshot = (() => {

  let _panel   = null;
  let _cleanup = null;

  function _close() {
    if (!_panel) return;
    _panel.classList.remove('visible');
    if (_cleanup) { _cleanup(); _cleanup = null; }
    setTimeout(() => { if (_panel) { _panel.remove(); _panel = null; } }, 250);
  }

  function _showLoading() {
    if (_panel) _panel.remove();
    _panel = ScreenshotPanelUI.buildLoading();
    document.body.appendChild(_panel);
    requestAnimationFrame(() => _panel.classList.add('visible'));
  }

  function _showPanel(dataURL, pageTitle, isFull) {
    if (_panel) _panel.remove();
    const { panel, name } = ScreenshotPanelUI.buildPanel(dataURL, pageTitle, isFull);
    _panel = panel;
    document.body.appendChild(_panel);
    requestAnimationFrame(() => _panel.classList.add('visible'));
    _cleanup = ScreenshotHandler.bindButtons(_panel, dataURL, name, _close);
  }

  // ── capture ────────────────────────────────────────────────────────────────
  async function capture(full = false) {
    const wcId = WebView.getActiveWcId();
    if (!wcId) { console.warn('[Screenshot] no active webview wcId'); return; }

    const pageTitle = document.title.replace(' — Vortex', '') || 'Page';
    _showLoading();

    try {
      const channel = full ? 'screenshot:captureFull' : 'screenshot:capture';
      const dataURL = await window.vortexAPI.invoke(channel, wcId);
      if (!dataURL) { _close(); return; }
      _showPanel(dataURL, pageTitle, full);
    } catch (err) {
      console.error('[Screenshot] capture failed:', err);
      _close();
    }
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') { e.preventDefault(); capture(false); }
    if (e.ctrlKey && e.shiftKey && e.key === 'F') { e.preventDefault(); capture(true);  }
  });

  // ── Public API (same as old screenshot.js) ─────────────────────────────────
  return { capture };

})();
