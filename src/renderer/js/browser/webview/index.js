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

  const DEVICE_PRESETS = {
    iphone: {
      name: 'iPhone 12/13',
      width: 390,
      height: 844,
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 3,
      mobile: true,
      touch: true,
    },
    pixel: {
      name: 'Pixel 5',
      width: 393,
      height: 851,
      ua: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
      deviceScaleFactor: 2.75,
      mobile: true,
      touch: true,
    },
    ipad: {
      name: 'iPad Air',
      width: 820,
      height: 1180,
      ua: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      mobile: true,
      touch: true,
    }
  };

  const emulationState = {}; // { tabId: { presetKey, active } }

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
        wv.setAttribute('allowpopups', '');
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
    wv.src = url || 'vortex://newtab';
    wv.setAttribute('allowpopups', '');
    wv.setAttribute('nodeintegration', '');
    if (webviewPreloadPath) wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
    // YouTube gets dedicated ad-blocking session (partition must be set before src)
    if (typeof YTBlocker !== 'undefined') {
      const ytPartition = YTBlocker.getPartitionForUrl(url || '');
      if (ytPartition) wv.setAttribute('partition', ytPartition);
      else if (opts.incognito) wv.setAttribute('partition', 'incognito');
    } else if (opts.incognito) {
      wv.setAttribute('partition', 'incognito');
    }
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
      const container = document.getElementById('webview-container');
      container.classList.toggle('emulating', isEmulating(tabId));

      const tab = Tabs.getActiveTab();
      const displayUrl = (tab?.url?.startsWith('vortex://')) ? tab.url : wv.src;
      Navigation.setURL(displayUrl);
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
    delete emulationState[tabId];
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
      // Normalize to absolute Windows path (strip file:// prefix, fix slashes)
      webviewPreloadPath = preloadPath
        .replace(/^file:\/\/\/?/, '')
        .replace(/\//g, '\\');
      // On Windows, file:///C:/... → strip leading backslash if drive letter follows
      if (webviewPreloadPath.match(/^\\[A-Za-z]:\\/)) {
        webviewPreloadPath = webviewPreloadPath.slice(1);
      }
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

  // ── Emulation ──────────────────────────────────────────────────────────────
  function _fitDevice(tabId) {
    const wv = webviews[tabId];
    const state = emulationState[tabId];
    if (!wv || !state || !state.active) return;

    const preset = DEVICE_PRESETS[state.presetKey];
    if (!preset) return;

    const container = document.getElementById('webview-container');
    const pad = 60;
    const availW = container.clientWidth - pad;
    const availH = container.clientHeight - pad;

    const scale = Math.min(1, availW / preset.width, availH / preset.height);
    wv.style.transform = `scale(${scale})`;
    wv.style.transformOrigin = 'center center';
  }

  async function setDevice(tabId, presetKey) {
    const wv = webviews[tabId];
    const preset = DEVICE_PRESETS[presetKey];
    if (!wv || !preset) return;

    emulationState[tabId] = { presetKey, active: true };
    wv.setUserAgent(preset.ua);
    
    // Resize webview element to match device dimensions
    wv.style.width = preset.width + 'px';
    wv.style.height = preset.height + 'px';
    wv.style.margin = '0 auto';
    wv.style.boxShadow = '0 0 40px rgba(0,0,0,0.5)';
    wv.parentElement.classList.add('emulating');

    _fitDevice(tabId);

    try {
      const wcId = wv.getWebContentsId();
      await window.vortexAPI.invoke('tab:emulateDevice', wcId, {
        screenPosition: 'mobile',
        screenSize: { width: preset.width, height: preset.height },
        viewSize: { width: preset.width, height: preset.height },
        deviceScaleFactor: preset.deviceScaleFactor || 1,
        mobile: preset.mobile || false,
        fitToView: true,
      });
      wv.reload();
    } catch (_) {}
  }

  async function resetEmulation(tabId) {
    const wv = webviews[tabId];
    if (!wv) return;

    delete emulationState[tabId];
    wv.setUserAgent(''); // Reset to default
    wv.style.width = '';
    wv.style.height = '';
    wv.style.margin = '';
    wv.style.boxShadow = '';
    wv.style.transform = '';
    wv.parentElement.classList.remove('emulating');

    try {
      const wcId = wv.getWebContentsId();
      await window.vortexAPI.invoke('tab:resetEmulation', wcId);
      wv.reload();
    } catch (_) {}
  }

  function isEmulating(tabId) {
    return !!(emulationState[tabId] && emulationState[tabId].active);
  }

  // Handle window resize to keep emulation fitted
  window.addEventListener('resize', () => {
    if (activeId && isEmulating(activeId)) {
      _fitDevice(activeId);
    }
  });

  // ── Public API (same as old webview.js) ────────────────────────────────────
  return {
    init, createWebview, switchTo, destroyWebview, loadURL,
    goBack, goForward, reload, hardReload, print, savePage, openDevTools,
    findInPage, zoomIn, zoomOut, zoomReset, pip,
    setPiPEnabled, setPiPSites, setYTAdblock,
    setDevice, resetEmulation, isEmulating, DEVICE_PRESETS,
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
