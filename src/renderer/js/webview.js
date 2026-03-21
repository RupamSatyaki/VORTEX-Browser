// Multi-tab WebView manager
const WebView = (() => {
  const webviews = {};
  let activeId = null;
  let webviewPreloadPath = '';
  let downloadsPageUrl = '';
  let settingsPageUrl = '';
  let newtabPageUrl = '';

  // Preloaded hidden webviews for vortex:// internal pages
  const preloaded = {};

  const SCROLLBAR_CSS = `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a1a1a; }
    ::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #00c8b4; }
  `;

  const VORTEX_PAGES = {
    'vortex://downloads': { fileUrl: () => downloadsPageUrl, title: 'Downloads' },
    'vortex://settings':  { fileUrl: () => settingsPageUrl,  title: 'Settings'  },
    'vortex://newtab':    { fileUrl: () => newtabPageUrl,    title: 'New Tab'   },
  };

  // Returns favicon URL for any website using Google's favicon CDN
  function _getFavicon(url) {
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch (_) { return null; }
  }

  // ── Preloading ──────────────────────────────────────────────────────────────

  function _buildPreload(vortexUrl) {
    const fileUrl = VORTEX_PAGES[vortexUrl].fileUrl();
    if (!fileUrl || preloaded[vortexUrl]) return;

    const container = document.getElementById('webview-container');
    const wv = document.createElement('webview');
    wv.src = fileUrl;
    wv.className = 'vortex-wv'; // hidden — no .active
    wv.dataset.preloadFor = vortexUrl;
    // Newtab needs preload for sendToHost
    if (vortexUrl === 'vortex://newtab' && webviewPreloadPath) {
      wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
    }
    container.appendChild(wv);

    const entry = { wv, ready: false };
    preloaded[vortexUrl] = entry;
    wv.addEventListener('did-finish-load', () => { entry.ready = true; }, { once: true });
  }

  function _preloadAll() {
    Object.keys(VORTEX_PAGES).forEach(url => _buildPreload(url));
  }

  // ── Vortex page listeners ───────────────────────────────────────────────────

  function _attachVortexListeners(wv, tabId, vortexUrl) {
    const meta = VORTEX_PAGES[vortexUrl];
    const isNewtab = vortexUrl === 'vortex://newtab';

    Tabs.updateTab(tabId, { title: meta.title });

    wv.addEventListener('did-finish-load', () => {
      Tabs.updateTab(tabId, { title: meta.title });
      if (activeId === tabId) {
        Navigation.setURL(vortexUrl);
        document.title = meta.title + ' — Vortex';
      }

      if (!isNewtab) {
        // Force full height for panel-style vortex pages (settings, downloads, etc.)
        wv.executeJavaScript(`
          (function() {
            var h = window.innerHeight + 'px';
            var w = window.innerWidth + 'px';
            document.documentElement.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;';
            document.body.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;display:flex;flex-direction:column;position:fixed;top:0;left:0;right:0;bottom:0;';
            var page = document.querySelector('.page');
            if (page) {
              page.style.cssText = 'max-width:800px;width:100%;margin:0 auto;padding:40px 28px 20px;flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;height:' + h + ';';
            }
          })();
        `).catch(() => {});
      }

      // Only dispatch downloads-ready for downloads page
      if (vortexUrl === 'vortex://downloads') {
        document.dispatchEvent(new CustomEvent('vortex-downloads-ready', { detail: wv }));
      }
    });

    wv.addEventListener('did-navigate', () => {
      if (activeId === tabId) Navigation.setURL(vortexUrl);
      Tabs.updateTab(tabId, { url: vortexUrl });
    });

    // Newtab quick links — open URL in current tab
    if (isNewtab) {
      wv.addEventListener('ipc-message', (e) => {
        if (e.channel === 'newtab:openUrl') WebView.loadURL(e.args[0]);
      });
    }
  }

  function _attachRegularListeners(wv, tabId, opts = {}) {
    const isIncognito = !!opts.incognito;
    // Prevent MaxListenersExceeded warning
    wv.setMaxListeners && wv.setMaxListeners(30);

    function forceIframeSize() {
      try {
        const iframe = wv.shadowRoot && wv.shadowRoot.querySelector('iframe');
        if (iframe) {
          iframe.style.cssText = 'height:100%!important;width:100%!important;position:absolute!important;top:0!important;left:0!important;border:none!important;';
        }
      } catch (_) {}
    }

    wv.addEventListener('dom-ready', forceIframeSize);

    wv.addEventListener('did-start-loading', () => {
      if (activeId === tabId) Navigation.startProgress();
    });

    wv.addEventListener('did-stop-loading', () => {
      if (activeId === tabId) Navigation.endProgress();
    });

    wv.addEventListener('did-navigate', (e) => {
      if (activeId === tabId) Navigation.setURL(e.url);
      Tabs.updateTab(tabId, { url: e.url });
      const fav = _getFavicon(e.url);
      if (fav) Tabs.updateTab(tabId, { favicon: fav });
      wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
      // Track navigation — skip for incognito
      if (!isIncognito && window.TabHistory) TabHistory.onNavigate(tabId, e.url, null, fav);
      // Reset sleep timer on navigation
      if (Tabs.touchTab) Tabs.touchTab(tabId);
      // Hide translate bar on new navigation, then detect after page loads
      _hideTranslateBar();
    });

    wv.addEventListener('did-navigate-in-page', (e) => {
      if (activeId === tabId) Navigation.setURL(e.url);
      if (!isIncognito && window.TabHistory) TabHistory.onNavigate(tabId, e.url, null, null);
    });

    // Single did-finish-load handler — merged all logic here
    wv.addEventListener('did-finish-load', () => {
      forceIframeSize();
      wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
      Prefetch.prefetchPageLinks(wv);
      setTimeout(() => captureTab(tabId, wv), 800);
      // Re-apply zoom if non-default
      const zoomLevel = _getZoom(tabId);
      if (zoomLevel !== 1.0) _applyZoom(tabId, zoomLevel);
      // Detect language and show translate bar (delay so page text is ready)
      const currentUrl = wv.src;
      clearTimeout(_translateDetectTimer);
      _translateDetectTimer = setTimeout(() => _detectAndShowBar(tabId, currentUrl), 1200);
    });

    wv.addEventListener('page-title-updated', (e) => {
      Tabs.updateTab(tabId, { title: e.title });
      if (activeId === tabId) document.title = e.title + ' — Vortex';
      if (!isIncognito && window.TabHistory) TabHistory.onTitleUpdate(tabId, e.title);
    });

    // page-favicon-updated — highest priority, overrides Google CDN favicon
    wv.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length) {
        Tabs.updateTab(tabId, { favicon: e.favicons[0] });
        if (!isIncognito && window.TabHistory) TabHistory.onFaviconUpdate(tabId, e.favicons[0]);
      }
    });

    wv.addEventListener('context-menu', (e) => {
      ContextMenu.show(e.params.x, e.params.y, e.params, wv);
    });

    wv.addEventListener('ipc-message', (e) => {
      if (e.channel === 'webview:mousedown') ContextMenu.hide();
      if (e.channel === 'webview:keydown') {
        const k = e.args[0];
        // Simulate the keydown on the parent document
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: k.key, ctrlKey: k.ctrlKey, metaKey: k.metaKey,
          shiftKey: k.shiftKey, altKey: k.altKey, bubbles: true,
        }));
      }
    });

    wv.addEventListener('did-start-navigation', () => ContextMenu.hide());

    wv.addEventListener('update-target-url', (e) => {
      if (activeId !== tabId) return;
      const preview = document.getElementById('link-preview');
      if (!preview) return;
      if (e.url) {
        preview.textContent = e.url;
        preview.classList.add('visible');
      } else {
        preview.classList.remove('visible');
      }
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  function createWebview(tabId, url, opts = {}) {
    if (webviews[tabId]) return;

    // Track tab creation
    if (window.TabHistory && !opts.incognito) TabHistory.onTabCreated(tabId, url);

    const isVortexPage = !!VORTEX_PAGES[url];

    if (isVortexPage) {
      let wv;
      if (preloaded[url]) {
        wv = preloaded[url].wv;
        delete preloaded[url];
        wv.dataset.tabId = tabId;
        delete wv.dataset.preloadFor;
      } else {
        const container = document.getElementById('webview-container');
        wv = document.createElement('webview');
        wv.src = VORTEX_PAGES[url].fileUrl();
        wv.className = 'vortex-wv';
        wv.dataset.tabId = tabId;
        // Newtab needs preload for sendToHost (quick links)
        if (url === 'vortex://newtab' && webviewPreloadPath) {
          wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
        }
        container.appendChild(wv);
      }
      webviews[tabId] = wv;
      _attachVortexListeners(wv, tabId, url);
      return;
    }

    const container = document.getElementById('webview-container');
    const wv = document.createElement('webview');
    wv.src = url || 'https://www.google.com';
    wv.setAttribute('allowpopups', '');
    if (webviewPreloadPath) {
      wv.setAttribute('preload', 'file:///' + webviewPreloadPath.replace(/\\/g, '/'));
    }
    // Incognito: isolated partition, no persist
    if (opts.incognito) {
      wv.setAttribute('partition', 'incognito');
    }
    wv.className = 'vortex-wv';
    wv.dataset.tabId = tabId;
    if (opts.incognito) wv.dataset.incognito = '1';
    container.appendChild(wv);
    webviews[tabId] = wv;
    _attachRegularListeners(wv, tabId, opts);
    _attachFindListener(wv);
  }

  function switchTo(tabId) {
    activeId = tabId;
    // Close find bar when switching tabs
    _closeFindBar();
    // Hide translate bar when switching tabs
    _hideTranslateBar();
    Object.entries(webviews).forEach(([id, wv]) => {
      wv.classList.toggle('active', id === tabId);
    });
    const wv = webviews[tabId];
    if (wv) {
      const tab = Tabs.getActiveTab();
      const displayUrl = (tab && tab.url && tab.url.startsWith('vortex://')) ? tab.url : wv.src;
      Navigation.setURL(displayUrl);

      // Re-inject height for vortex pages when switching to them (skip newtab — it handles its own layout)
      if (tab && tab.url && tab.url.startsWith('vortex://') && tab.url !== 'vortex://newtab') {
        wv.executeJavaScript(`
          (function() {
            var h = window.innerHeight + 'px';
            var w = window.innerWidth + 'px';
            document.documentElement.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;';
            document.body.style.cssText = 'width:' + w + ';height:' + h + ';overflow:hidden;margin:0;padding:0;display:flex;flex-direction:column;position:fixed;top:0;left:0;right:0;bottom:0;';
            var page = document.querySelector('.page');
            if (page) page.style.cssText = 'max-width:800px;width:100%;margin:0 auto;padding:40px 28px 20px;flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;height:' + h + ';';
          })();
        `).catch(() => {});
      }

      // Show zoom bar with this tab's zoom level
      _showZoomBar(_getZoom(tabId));
    }
  }

  async function captureTab(tabId, wv) {
    try {
      const wcId = wv.getWebContentsId();
      const dataURL = await window.vortexAPI.invoke('tab:capture', wcId);
      if (dataURL) TabPreview.setCache(tabId, dataURL);
    } catch (_) {}
  }

  function destroyWebview(tabId) {
    const wv = webviews[tabId];
    if (!wv) return;
    const vortexUrl = Object.keys(VORTEX_PAGES).find(u =>
      wv.src === VORTEX_PAGES[u].fileUrl()
    );
    wv.remove();
    delete webviews[tabId];
    TabPreview.removeCache(tabId);
    if (vortexUrl) _buildPreload(vortexUrl);
  }

  async function init() {
    const [preloadPath, downloadsPath, settingsPath, newtabPath] = await Promise.all([
      window.vortexAPI.invoke('app:webviewPreload').catch(() => null),
      window.vortexAPI.invoke('app:downloadsPage').catch(() => null),
      window.vortexAPI.invoke('app:settingsPage').catch(() => null),
      window.vortexAPI.invoke('app:newtabPage').catch(() => null),
    ]);
    if (preloadPath) webviewPreloadPath = preloadPath;
    if (downloadsPath) downloadsPageUrl = 'file:///' + downloadsPath.replace(/\\/g, '/');
    if (settingsPath)  settingsPageUrl  = 'file:///' + settingsPath.replace(/\\/g, '/');
    if (newtabPath)    newtabPageUrl    = 'file:///' + newtabPath.replace(/\\/g, '/');
    _preloadAll();
  }

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

  function goBack()    { const wv = webviews[activeId]; if (wv && wv.canGoBack()) wv.goBack(); }
  function goForward() { const wv = webviews[activeId]; if (wv && wv.canGoForward()) wv.goForward(); }
  function reload()    { const wv = webviews[activeId]; if (wv) wv.reload(); }
  function hardReload(){ const wv = webviews[activeId]; if (wv) wv.reloadIgnoringCache(); }
  function print()     { const wv = webviews[activeId]; if (wv) wv.print(); }
  function savePage()  { const wv = webviews[activeId]; if (wv) wv.savePage(require('path').join(require('os').homedir(), 'Downloads', 'page.html'), 'HTMLComplete').catch(()=>{}); }
  function openDevTools() { const wv = webviews[activeId]; if (wv) wv.openDevTools(); }

  // ── Page Translation ───────────────────────────────────────────────────────
  const LANG_NAMES = {
    af:'Afrikaans',ar:'Arabic',bg:'Bulgarian',bn:'Bengali',ca:'Catalan',
    cs:'Czech',cy:'Welsh',da:'Danish',de:'German',el:'Greek',
    en:'English',es:'Spanish',et:'Estonian',fa:'Persian',fi:'Finnish',
    fr:'French',gu:'Gujarati',he:'Hebrew',hi:'Hindi',hr:'Croatian',
    hu:'Hungarian',id:'Indonesian',it:'Italian',ja:'Japanese',kn:'Kannada',
    ko:'Korean',lt:'Lithuanian',lv:'Latvian',mk:'Macedonian',ml:'Malayalam',
    mr:'Marathi',ms:'Malay',mt:'Maltese',nl:'Dutch',no:'Norwegian',
    pl:'Polish',pt:'Portuguese',ro:'Romanian',ru:'Russian',sk:'Slovak',
    sl:'Slovenian',sq:'Albanian',sr:'Serbian',sv:'Swedish',sw:'Swahili',
    ta:'Tamil',te:'Telugu',th:'Thai',tl:'Filipino',tr:'Turkish',
    uk:'Ukrainian',ur:'Urdu',vi:'Vietnamese','zh-CN':'Chinese (Simplified)',
    'zh-TW':'Chinese (Traditional)',
  };

  // Dismissed URLs — don't show bar again for same page
  const _translateDismissed = new Set();
  // Currently translated tab URLs
  const _translatedTabs = new Set();

  let _translateBar = null;
  let _translateDetectTimer = null;

  function _getTranslateBar() {
    if (!_translateBar) _translateBar = document.getElementById('translate-bar');
    return _translateBar;
  }

  function _hideTranslateBar() {
    const bar = _getTranslateBar();
    if (bar) bar.classList.remove('visible');
  }

  async function _detectAndShowBar(tabId, url) {
    // Skip vortex pages, translate.google.com itself, and dismissed URLs
    if (!url || url.startsWith('vortex://') || url.startsWith('file://')) return;
    if (url.includes('translate.google') || url.includes('translate.goog')) return;
    if (_translateDismissed.has(url)) return;
    if (tabId !== activeId) return;

    const wv = webviews[tabId];
    if (!wv) return;

    // Get page lang attribute + first 200 chars of body text for detection
    let sample = '';
    let htmlLang = '';
    try {
      const result = await wv.executeJavaScript(`
        (function() {
          var lang = document.documentElement.lang || document.querySelector('meta[http-equiv="content-language"]')?.content || '';
          var text = (document.body && document.body.innerText || '').trim().slice(0, 300);
          return { lang: lang.toLowerCase().split('-')[0], text: text };
        })()
      `);
      htmlLang = (result.lang || '').trim();
      sample = (result.text || '').trim();
    } catch (_) { return; }

    if (!sample && !htmlLang) return;

    // Get user's preferred language from settings
    let userLang = 'en';
    try {
      const s = await window.vortexAPI.invoke('storage:read', 'settings');
      userLang = (s && s.lang) || 'en';
    } catch (_) {}

    // Determine detected language
    let detectedLang = htmlLang;

    // If html lang is missing or 'en' but we want to verify, use Google Translate detect
    if (!detectedLang && sample.length > 20) {
      try {
        const encoded = encodeURIComponent(sample.slice(0, 200));
        const resp = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encoded}`
        );
        if (resp.ok) {
          const data = await resp.json();
          // Response format: [[translations], null, detectedLang, ...]
          detectedLang = (data && data[2]) ? data[2] : '';
        }
      } catch (_) {}
    }

    if (!detectedLang) return;

    // Normalize: zh → zh-CN
    if (detectedLang === 'zh') detectedLang = 'zh-CN';

    // Don't show bar if page language matches user's preferred language
    const userLangBase = userLang.split('-')[0];
    const detectedBase = detectedLang.split('-')[0];
    if (detectedBase === userLangBase) return;

    // Still active tab?
    if (tabId !== activeId) return;

    const bar = _getTranslateBar();
    if (!bar) return;

    const langNameEl = document.getElementById('translate-lang-name');
    const targetSel  = document.getElementById('translate-target');
    if (langNameEl) langNameEl.textContent = LANG_NAMES[detectedLang] || detectedLang;

    // Pre-select target to user's preferred language
    if (targetSel) {
      const opt = targetSel.querySelector(`option[value="${userLang}"]`) ||
                  targetSel.querySelector(`option[value="${userLangBase}"]`);
      if (opt) targetSel.value = opt.value;
    }

    // Store detected lang on bar for translate button
    bar.dataset.detectedLang = detectedLang;
    bar.dataset.pageUrl = url;

    bar.classList.add('visible');
  }

  // Wire translate bar buttons once DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('translate-bar');
    if (!bar) return;

    document.getElementById('translate-btn').addEventListener('click', () => {
      const url    = bar.dataset.pageUrl;
      const target = document.getElementById('translate-target').value;
      if (!url || !target) return;
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${target}&u=${encodeURIComponent(url)}`;
      WebView.loadURL(translateUrl);
      _hideTranslateBar();
      _translateDismissed.add(url);
    });

    document.getElementById('translate-close').addEventListener('click', () => {
      const url = bar.dataset.pageUrl;
      if (url) _translateDismissed.add(url);
      _hideTranslateBar();
    });
  });

  // ── Find in Page ───────────────────────────────────────────────────────────
  let _findActive = false;

  function findInPage() {
    const bar   = document.getElementById('find-bar');
    const input = document.getElementById('find-input');
    if (!bar || !input) return;

    if (!_findActive) {
      _findActive = true;
      bar.classList.add('visible');
      input.value = '';
      document.getElementById('find-count').textContent = '';
      input.classList.remove('no-match');
      input.focus();
      input.select();
    } else {
      // Already open — just focus
      input.focus();
      input.select();
    }
  }

  function _closeFindBar() {
    const bar = document.getElementById('find-bar');
    if (!bar) return;
    _findActive = false;
    bar.classList.remove('visible');
    const wv = webviews[activeId];
    if (wv) { try { wv.stopFindInPage('clearSelection'); } catch (_) {} }
    document.getElementById('find-count').textContent = '';
    document.getElementById('find-input').classList.remove('no-match');
  }

  function _doFind(forward = true) {
    const wv    = webviews[activeId];
    const input = document.getElementById('find-input');
    if (!wv || !input) return;
    const query = input.value.trim();
    if (!query) { document.getElementById('find-count').textContent = ''; return; }

    wv.findInPage(query, { forward, findNext: true, matchCase: false });
  }

  // Wire up find bar events once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('find-input');
    const wv_getter = () => webviews[activeId];

    input.addEventListener('input', () => {
      const wv = wv_getter();
      const q  = input.value.trim();
      input.classList.remove('no-match');
      if (!q) { document.getElementById('find-count').textContent = ''; if (wv) { try { wv.stopFindInPage('clearSelection'); } catch(_){} } return; }
      if (wv) wv.findInPage(q, { forward: true, findNext: false, matchCase: false });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  { e.preventDefault(); _doFind(!e.shiftKey); }
      if (e.key === 'Escape') { e.preventDefault(); _closeFindBar(); }
    });

    document.getElementById('find-next').addEventListener('click',  () => _doFind(true));
    document.getElementById('find-prev').addEventListener('click',  () => _doFind(false));
    document.getElementById('find-close').addEventListener('click', () => _closeFindBar());

    // Listen for found-in-page results to update count
    document.getElementById('webview-container').addEventListener('found-in-page', (e) => {
      // bubbles up from active webview
    });
  });

  // Attach found-in-page listener per webview
  function _attachFindListener(wv) {
    wv.addEventListener('found-in-page', (e) => {
      const count = document.getElementById('find-count');
      const input = document.getElementById('find-input');
      if (!count) return;
      const { activeMatchOrdinal, matches } = e.result;
      if (matches === 0) {
        count.textContent = 'No results';
        input.classList.add('no-match');
      } else {
        count.textContent = `${activeMatchOrdinal}/${matches}`;
        input.classList.remove('no-match');
      }
    });
  }

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const zoomLevels = {};

  function _getZoom(tabId) { return zoomLevels[tabId] ?? 1.0; }

  function _applyZoom(tabId, level) {
    const wv = webviews[tabId];
    if (!wv) return;
    level = parseFloat(Math.min(3.0, Math.max(0.25, level)).toFixed(2));
    zoomLevels[tabId] = level;

    // Set zoom via main process using the webContentsId
    try {
      const wcId = wv.getWebContentsId();
      window.vortexAPI.invoke('webview:setZoom', wcId, level).catch(() => {});
    } catch (_) {}

    if (tabId === activeId) _showZoomBar(level);
  }

  function zoomIn()    { _applyZoom(activeId, _getZoom(activeId) + 0.1); }
  function zoomOut()   { _applyZoom(activeId, _getZoom(activeId) - 0.1); }
  function zoomReset() { _applyZoom(activeId, 1.0); }

  function _showZoomBar(level) {
    const bar = document.getElementById('zoom-status-bar');
    if (!bar) return;
    const pct = Math.round(level * 100);
    bar.querySelector('#zoom-pct').textContent = pct + '%';
    bar.classList.add('visible');
    clearTimeout(bar._hideTimer);
    if (pct === 100) {
      bar._hideTimer = setTimeout(() => bar.classList.remove('visible'), 1500);
    }
  }

  // Keyboard shortcuts: Ctrl+= / Ctrl+- / Ctrl+0
  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey) return;
    if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
    else if (e.key === '-') { e.preventDefault(); zoomOut(); }
    else if (e.key === '0') { e.preventDefault(); zoomReset(); }
  });

  return { init, createWebview, switchTo, destroyWebview, loadURL, goBack, goForward, reload, hardReload, print, savePage, openDevTools, findInPage, zoomIn, zoomOut, zoomReset,
    getActiveWcId() {
      const wv = webviews[activeId];
      if (!wv) return null;
      try { return wv.getWebContentsId(); } catch (_) { return null; }
    },
    getWcId(tabId) {
      const wv = webviews[tabId];
      if (!wv) return null;
      try { return wv.getWebContentsId(); } catch (_) { return null; }
    }
  };
})();
