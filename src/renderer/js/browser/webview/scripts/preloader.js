/**
 * browser/webview/scripts/preloader.js
 * Preloaded hidden webviews for vortex:// internal pages.
 */

const WVPreloader = (() => {

  const _preloaded = {};

  function build(vortexUrl, vortexPages, webviewPreloadPath) {
    const page = vortexPages[vortexUrl];
    if (!page) return;
    const fileUrl = page.fileUrl();
    if (!fileUrl || _preloaded[vortexUrl]) return;

    const container = document.getElementById('webview-container');
    const wv = document.createElement('webview');
    wv.src = fileUrl;
    wv.className = 'vortex-wv';
    wv.dataset.preloadFor = vortexUrl;
    if (vortexUrl === 'vortex://newtab' && webviewPreloadPath) {
      wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
    }
    container.appendChild(wv);

    const entry = { wv, ready: false };
    _preloaded[vortexUrl] = entry;
    wv.addEventListener('did-finish-load', () => { entry.ready = true; }, { once: true });
  }

  function buildAll(vortexPages, webviewPreloadPath) {
    Object.keys(vortexPages).forEach(url => build(url, vortexPages, webviewPreloadPath));
  }

  function consume(vortexUrl) {
    const entry = _preloaded[vortexUrl];
    if (!entry) return null;
    delete _preloaded[vortexUrl];
    return entry.wv;
  }

  return { build, buildAll, consume };

})();
