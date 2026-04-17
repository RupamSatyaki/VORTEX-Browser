/**
 * browser/webview/index.js
 * WebView module — public API, same interface as old webview.js
 *
 * Delegates to:
 *   ui/translateBar.js      — translate bar show/hide/buttons
 *   ui/zoomBar.js           — zoom status bar
 *   scripts/listeners.js    — attachRegular/attachVortex event bindings
 *   scripts/preloader.js    — vortex:// page preloading
 *   scripts/favicon.js      — favicon URL + DOM extraction
 *   scripts/ytAdblock.js    — YouTube ad blocker injection
 *   scripts/langDetect.js   — page language detection
 *   scripts/zoom.js         — per-tab zoom management
 *   scripts/find.js         — find in page bar
 */

const WebView = (() => {

  // ── State ──────────────────────────────────────────────────────────────────
  const webviews = {};
  let activeId = null;
  let webviewPreloadPath = '';
  let downloadsPageUrl   = '';
  let settingsPageUrl    = '';
  let newtabPageUrl      = '';
  let _pipEnabled = true;
  let _pipSites   = [];

  const VORTEX_PAGES = {
    'vortex://downloads': { fileUrl: () => downloadsPageUrl, title: 'Downloads' },
    'vortex://settings':  { fileUrl: () => settingsPageUrl,  title: 'Settings'  },
    'vortex://newtab':    { fileUrl: () => newtabPageUrl,    title: 'New Tab'   },
  };

  const activeIdGetter = () => activeId;

  // ── PiP helpers ────────────────────────────────────────────────────────────
  function setPiPEnabled(val)   { _pipEnabled = val; }
  function setPiPSites(sites)   { _pipSites = Array.isArray(sites) ? sites : []; }
  function setYTAdblock(en, sp) { WVYTAdblock.setEnabled(en, sp); }

  function _isPipAllowed(wv) {
    if (!_pipEnabled) return false;
    if (!_pipSites.length) return true;
    try {
      const hostname = new URL(wv.src || '').hostname.replace(/^www\./, '');
      return _pipSites.some(s => hostname === s || hostname.endsWith('.' + s));
    } catch (_) { return true; }
  }

  // ── createWebview ──────────────────────────────────────────────────────────
  function createWebview(tabId, url, opts = {}) {
    if (webviews[tabId]) return;
    if (window.TabHistory && !opts.incognito) TabHistory.onTabCreated(tabId, url);

    const isVortexPage = !!VORTEX_PAGES[url];

    if (isVortexPage) {
      let wv = WVPreloader.consume(url);
      if (wv) {
        wv.dataset.tabId = tabId;
        delete wv.dataset.preloadFor;
      } else {
        const container = document.getElementById('webview-container');
        wv = document.createElement('webview');
        wv.src = VORTEX_PAGES[url].fileUrl();
        wv.className = 'vortex-wv';
        wv.dataset.tabId = tabId;
        if (url === 'vortex://newtab' && webviewPreloadPath) {
          wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
        }
        container.appendChild(wv);
      }
      webviews[tabId] = wv;
      WVListeners.attachVortex(wv, tabId, url, VORTEX_PAGES, webviewPreloadPath, webviews, activeIdGetter);
      return;
    }

    const container = document.getElementById('webview-container');
    const wv = document.createElement('webview');
    wv.src = url || 'https://www.google.com';
    wv.setAttribute('allowpopups', '');
    wv.setAttribute('nodeintegration', '');
    if (webviewPreloadPath) wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
    if (opts.incognito)     wv.setAttribute('partition', 'incognito');
    wv.className = 'vortex-wv';
    wv.dataset.tabId = tabId;
    if (opts.incognito) wv.dataset.incognito = '1';
    container.appendChild(wv);
    webviews[tabId] = wv;
    WVListeners.attachRegular(wv, tabId, opts, webviews, activeIdGetter);
    WVFind.attachListener(wv);
  }

  // ── switchTo ───────────────────────────────────────────────────────────────
  function switchTo(tabId) {
    if (_pipEnabled && activeId && activeId !== tabId) {
      const prevWv = webviews[activeId];
      if (prevWv && _isPipAllowed(prevWv)) {
        try { window.vortexAPI.invoke('pip:trigger', prevWv.getWebContentsId()).catch(() => {}); } catch (_) {}
      }
    }

    activeId = tabId;
    WVFind.close(webviews, activeId);
    WVTranslateBar.hide();
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge.onTabChange(tabId);

    Object.entries(webviews).forEach(([id, wv]) => wv.classList.toggle('active', id === tabId));

    const wv = webviews[tabId];
    if (wv) {
      const tab = Tabs.getActiveTab();
      const displayUrl = (tab?.url?.startsWith('vortex://')) ? tab.url : wv.src;
      Navigation.setURL(displayUrl);

      if (tab?.url?.startsWith('vortex://') && tab.url !== 'vortex://newtab') {
        wv.executeJavaScript(`
          (function() {
            var h = window.innerHeight + 'px'; var w = window.innerWidth + 'px';
            document.documentElement.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;';
            document.body.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;display:flex;flex-direction:column;position:fixed;top:0;left:0;right:0;bottom:0;';
            var page = document.querySelector('.page');
            if (page) page.style.cssText = 'max-width:800px;width:100%;margin:0 auto;padding:40px 28px 20px;flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;height:' + h + ';';
          })();
        `).catch(() => {});
      }
      WVZoomBar.show(WVZoom.get(tabId));
    }
  }

  // ── captureTab ─────────────────────────────────────────────────────────────
  async function _captureTab(tabId, wv) {
    try {
      const wcId   = wv.getWebContentsId();
      const dataURL = await window.vortexAPI.invoke('tab:capture', wcId);
      if (dataURL) TabPreview.setCache(tabId, dataURL);
    } catch (_) {}
  }

  // ── destroyWebview ─────────────────────────────────────────────────────────
  function destroyWebview(tabId) {
    const wv = webviews[tabId];
    if (!wv) return;
    const vortexUrl = Object.keys(VORTEX_PAGES).find(u => wv.src === VORTEX_PAGES[u].fileUrl());
    wv.remove();
    delete webviews[tabId];
    TabPreview.removeCache(tabId);
    if (vortexUrl) WVPreloader.build(vortexUrl, VORTEX_PAGES, webviewPreloadPath);
  }

  // ── init ───────────────────────────────────────────────────────────────────
  async function init() {
    const [preloadPath, downloadsPath, settingsPath, newtabPath] = await Promise.all([
      window.vortexAPI.invoke('app:webviewPreload').catch(() => null),
      window.vortexAPI.invoke('app:downloadsPage').catch(() => null),
      window.vortexAPI.invoke('app:settingsPage').catch(() => null),
      window.vortexAPI.invoke('app:newtabPage').catch(() => null),
    ]);

    function toFileUrl(p) {
      if (!p) return null;
      if (p.startsWith('file://') || p.startsWith('vortex-app://')) return p;
      return 'file:///' + p.replace(/\\/g, '/').replace(/^\/+/, '');
    }

    if (preloadPath) {
      webviewPreloadPath = preloadPath.replace(/^file:\/\/\/?/, '').replace(/\//g, '\\');
    }
    if (!webviewPreloadPath) {
      for (const s of document.querySelectorAll('script[src]')) {
        if (s.src.includes('webview')) {
          webviewPreloadPath = s.src.replace(/browser\/webview\/index\.js|webview\.js/, 'webviewPreload.js').replace('file:///', '').replace(/\//g, '\\');
          break;
        }
      }
    }
    if (downloadsPath) downloadsPageUrl = toFileUrl(downloadsPath);
    if (settingsPath)  settingsPageUrl  = toFileUrl(settingsPath);
    if (newtabPath)    newtabPageUrl    = toFileUrl(newtabPath);

    WVPreloader.buildAll(VORTEX_PAGES, webviewPreloadPath);

    // Wire translate bar + find bar + zoom keyboard
    WVTranslateBar.bindButtons();
    WVFind.bindBar(() => webviews, () => activeId);
    WVZoomBar.bindKeyboard();
  }

  // ── loadURL ────────────────────────────────────────────────────────────────
  function loadURL(url) {
    const wv = webviews[activeId];
    if (!wv) return;
    if (VORTEX_PAGES[url]) {
      wv.src = VORTEX_PAGES[url].fileUrl();
      Navigation.setURL(url);
      Tabs.updateTab(activeId, { url, title: VORTEX_PAGES[url].title });
    } else {
      wv.src = url;
    }
  }

  // ── Simple actions ─────────────────────────────────────────────────────────
  function goBack()       { const wv = webviews[activeId]; if (wv?.canGoBack())    wv.goBack(); }
  function goForward()    { const wv = webviews[activeId]; if (wv?.canGoForward()) wv.goForward(); }
  function reload()       { webviews[activeId]?.reload(); }
  function hardReload()   { webviews[activeId]?.reloadIgnoringCache(); }
  function print()        { webviews[activeId]?.print(); }
  function savePage()     { webviews[activeId]?.savePage(require('path').join(require('os').homedir(), 'Downloads', 'page.html'), 'HTMLComplete').catch(()=>{}); }
  function openDevTools() { webviews[activeId]?.openDevTools(); }
  function findInPage()   { WVFind.open(webviews, activeId); }

  // ── Zoom ───────────────────────────────────────────────────────────────────
  function zoomIn()    { WVZoom.zoomIn(activeId, webviews); }
  function zoomOut()   { WVZoom.zoomOut(activeId, webviews); }
  function zoomReset() { WVZoom.zoomReset(activeId, webviews); }

  // ── PiP ────────────────────────────────────────────────────────────────────
  function pip() {
    if (!_pipEnabled) return;
    const wv = webviews[activeId];
    if (!wv || !_isPipAllowed(wv)) return;
    try { window.vortexAPI.invoke('pip:trigger', wv.getWebContentsId()).catch(() => {}); } catch (_) {}
  }

  // ── Public API (same as old webview.js) ────────────────────────────────────
  return {
    init, createWebview, switchTo, destroyWebview, loadURL,
    goBack, goForward, reload, hardReload, print, savePage, openDevTools,
    findInPage, zoomIn, zoomOut, zoomReset, pip,
    setPiPEnabled, setPiPSites, setYTAdblock,
    _captureTab,
    setActiveId(id) { activeId = id; },
    getActiveWcId() {
      const wv = webviews[activeId];
      if (!wv) return null;
      try { return wv.getWebContentsId(); } catch (_) { return null; }
    },
    getWcId(tabId) {
      const wv = webviews[tabId];
      if (!wv) return null;
      try { return wv.getWebContentsId(); } catch (_) { return null; }
    },
  };

})();
