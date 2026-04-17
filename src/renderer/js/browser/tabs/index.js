/**
 * browser/tabs/index.js
 * Tabs module — public API, same interface as old tabs.js
 *
 * Delegates to:
 *   ui/tabRenderer.js      — tab element + new tab btn + window controls HTML
 *   ui/tabContextMenu.js   — right-click context menu
 *   scripts/tabSleep.js    — tab sleep/wake/timer
 *   scripts/tabDrag.js     — drag-and-drop reordering
 *   scripts/tabAudio.js    — mute/unmute + audible poll
 */

const Tabs = (() => {

  let _tabs       = [];
  let _activeId   = null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _notify() {
    document.dispatchEvent(new CustomEvent('vortex:tab-changed'));
  }

  function _touch(id) {
    TabSleep.touch(id);
  }

  // ── createTab ──────────────────────────────────────────────────────────────
  function createTabBackground(url) {
    const id = Date.now().toString();
    _tabs.push({ id, url, title: 'New Tab', favicon: null, _webviewReady: false, _sleeping: false, _muted: false, _audible: false });
    _touch(id);
    if (typeof FaviconCache !== 'undefined' && url?.startsWith('http')) {
      FaviconCache.getFavicon(url).then(fav => { if (fav) updateTab(id, { favicon: fav }); }).catch(() => {});
      FaviconCache.getTitle(url).then(title => { if (title) updateTab(id, { title }); }).catch(() => {});
    }
    render();
    return id;
  }

  function createTab(url = 'https://www.google.com', opts = {}) {
    if (url === 'vortex://settings')  { Panel.open('settings');  return null; }
    if (url === 'vortex://downloads') { Panel.open('downloads'); return null; }
    const id = Date.now().toString();
    _tabs.push({ id, url, title: 'New Tab', favicon: null, _webviewReady: false, _sleeping: false, _muted: false, _audible: false, incognito: !!opts.incognito });
    _activeId = id;
    _touch(id);
    if (typeof FaviconCache !== 'undefined' && url.startsWith('http')) {
      FaviconCache.getFavicon(url).then(fav => { if (fav) updateTab(id, { favicon: fav }); }).catch(() => {});
      FaviconCache.getTitle(url).then(title => { if (title) updateTab(id, { title }); }).catch(() => {});
    }
    WebView.setActiveId(id);
    WebView.createWebview(id, url, { incognito: !!opts.incognito });
    _tabs.find(t => t.id === id)._webviewReady = true;
    WebView.switchTo(id);
    render();
    _notify();
    return id;
  }

  function createIncognitoTab(url = 'https://www.google.com') {
    return createTab(url, { incognito: true });
  }

  // ── closeTab ───────────────────────────────────────────────────────────────
  function closeTab(id) {
    if (_tabs.length === 1) return;
    try { if (window.TabHistory) TabHistory.onTabClosed(id); } catch (_) {}
    const tab = _tabs.find(t => t.id === id);
    if (tab?._webviewReady) WebView.destroyWebview(id);
    _tabs = _tabs.filter(t => t.id !== id);
    if (_activeId === id) {
      _activeId = _tabs[_tabs.length - 1].id;
      const next = _tabs.find(t => t.id === _activeId);
      if (next && !next._webviewReady) { WebView.createWebview(_activeId, next.url); next._webviewReady = true; }
      WebView.switchTo(_activeId);
    }
    render();
    _notify();
  }

  // ── setActiveTab ───────────────────────────────────────────────────────────
  function setActiveTab(id) {
    _activeId = id;
    const tab = _tabs.find(t => t.id === id);
    if (tab?._sleeping) TabSleep.wake(id, _tabs);
    if (tab && !tab._webviewReady) { WebView.createWebview(id, tab.url); tab._webviewReady = true; }
    _touch(id);
    WebView.switchTo(id);
    render();
    _notify();
  }

  // ── updateTab ──────────────────────────────────────────────────────────────
  function updateTab(id, data) {
    const tab = _tabs.find(t => t.id === id);
    if (!tab) return;

    // Fast favicon update — no full re-render
    if (Object.keys(data).length === 1 && data.favicon !== undefined && tab.favicon !== data.favicon) {
      tab.favicon = data.favicon;
      const el = document.querySelector(`.tab[data-id="${id}"] .tab-icon`);
      if (el) {
        el.innerHTML = '';
        const img = document.createElement('img');
        img.width = 14; img.height = 14;
        img.style.borderRadius = '2px';
        img.src = data.favicon;
        img.onerror = async () => {
          img.remove();
          if (typeof FaviconCache !== 'undefined' && tab.url) {
            const cached = await FaviconCache.getFavicon(tab.url).catch(() => null);
            if (cached && cached !== data.favicon) {
              const img2 = document.createElement('img');
              img2.width = 14; img2.height = 14;
              img2.style.borderRadius = '2px';
              img2.src = cached;
              img2.onerror = () => { img2.remove(); el.innerHTML = TabRenderer.globeIcon(); };
              el.appendChild(img2);
              return;
            }
          }
          el.innerHTML = TabRenderer.globeIcon();
        };
        el.appendChild(img);
        return;
      }
    }
    Object.assign(tab, data);
    render();
  }

  // ── render ─────────────────────────────────────────────────────────────────
  function render() {
    const container = document.getElementById('tabbar-container');
    container.innerHTML = '';

    const callbacks = {
      onClose:       (id)  => closeTab(id),
      onMute:        (id)  => TabAudio.toggleMute(id, _tabs, render),
      onContextMenu: (x, y, id) => {
        const tab = _tabs.find(t => t.id === id);
        if (!tab) return;
        TabContextMenu.show(x, y, tab, {
          onMute:      (id) => TabAudio.toggleMute(id, _tabs, render),
          onReload:    (id) => { const wv = document.querySelector(`.vortex-wv[data-tab-id="${id}"]`); if (wv) wv.reload(); },
          onDuplicate: (url) => createTab(url),
          onClose:     (id) => closeTab(id),
        });
      },
    };

    _tabs.forEach(tab => {
      const el = TabRenderer.buildTabEl(tab, _activeId, callbacks);
      TabDrag.init(el, tab.id, _tabs, setActiveTab, render, _notify);
      container.appendChild(el);
    });

    container.appendChild(TabRenderer.buildNewTabBtn());

    const controls = TabRenderer.buildWindowControls();
    // Re-inject update badge if it exists
    const badge = document.getElementById('update-badge-btn');
    if (badge) controls.insertBefore(badge, controls.firstChild);
    container.appendChild(controls);
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  function getActiveTab() { return _tabs.find(t => t.id === _activeId) || null; }
  function getAllTabs()    { return [..._tabs]; }
  function getActiveId()  { return _activeId; }

  function switchNext() {
    const idx  = _tabs.findIndex(t => t.id === _activeId);
    const next = _tabs[(idx + 1) % _tabs.length];
    if (next) setActiveTab(next.id);
  }

  function switchPrev() {
    const idx  = _tabs.findIndex(t => t.id === _activeId);
    const prev = _tabs[(idx - 1 + _tabs.length) % _tabs.length];
    if (prev) setActiveTab(prev.id);
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  function setSleepEnabled(val) { TabSleep.setEnabled(val, _tabs, render); }
  function setSleepTimeout(min) { TabSleep.setTimeout(min); }
  function toggleMute(id)       { TabAudio.toggleMute(id, _tabs, render); }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    TabSleep.startTimer(_tabs, () => _activeId, render);
    TabAudio.startAudiblePoll(_tabs, render);
    TabDrag.bindGlobal(render, _notify);
  });

  // ── Public API (same as old tabs.js) ──────────────────────────────────────
  return {
    createTab, createTabBackground, createIncognitoTab,
    closeTab, setActiveTab, updateTab,
    getActiveTab, getAllTabs, getActiveId,
    switchNext, switchPrev, render,
    setSleepEnabled, setSleepTimeout, toggleMute,
    touchTab: _touch,
  };

})();
