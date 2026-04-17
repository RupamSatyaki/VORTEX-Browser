/**
 * browser/webview/ui/zoomBar.js
 * Zoom status bar show/hide + keyboard shortcuts.
 */

const WVZoomBar = (() => {

  function show(level) {
    const bar = document.getElementById('zoom-status-bar');
    if (!bar) return;
    const pct = Math.round(level * 100);
    const pctEl = bar.querySelector('#zoom-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    bar.classList.add('visible');
    clearTimeout(bar._hideTimer);
    if (pct === 100) {
      bar._hideTimer = setTimeout(() => bar.classList.remove('visible'), 1500);
    }
  }

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!e.ctrlKey) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); WebView.zoomIn(); }
      else if (e.key === '-')             { e.preventDefault(); WebView.zoomOut(); }
      else if (e.key === '0')             { e.preventDefault(); WebView.zoomReset(); }
    });
  }

  return { show, bindKeyboard };

})();
