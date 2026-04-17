/**
 * browser/webview/scripts/zoom.js
 * Per-tab zoom management.
 */

const WVZoom = (() => {

  const _levels = {};

  function get(tabId)  { return _levels[tabId] ?? 1.0; }

  function apply(tabId, level, webviews, activeId) {
    const wv = webviews[tabId];
    if (!wv) return;
    level = parseFloat(Math.min(3.0, Math.max(0.25, level)).toFixed(2));
    _levels[tabId] = level;
    try {
      const wcId = wv.getWebContentsId();
      window.vortexAPI.invoke('webview:setZoom', wcId, level).catch(() => {});
    } catch (_) {}
    if (tabId === activeId) WVZoomBar.show(level);
  }

  function zoomIn(activeId, webviews)    { apply(activeId, get(activeId) + 0.1, webviews, activeId); }
  function zoomOut(activeId, webviews)   { apply(activeId, get(activeId) - 0.1, webviews, activeId); }
  function zoomReset(activeId, webviews) { apply(activeId, 1.0, webviews, activeId); }

  return { get, apply, zoomIn, zoomOut, zoomReset };

})();
