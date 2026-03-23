// Tab management — each tab has its own webview
const Tabs = (() => {
  let tabs = [];
  let activeTabId = null;

  function createTabBackground(url) {
    const id = Date.now().toString();
    tabs.push({ id, url, title: 'New Tab', favicon: null, _webviewReady: false, _sleeping: false, _muted: false, _audible: false });
    _touchTab(id);
    // Lazy: don't create webview until tab becomes active
    render();
    return id;
  }

  function createTab(url = 'https://www.google.com', opts = {}) {
    // Settings and Downloads open as floating panel, not a tab
    if (url === 'vortex://settings')  { Panel.open('settings');  return null; }
    if (url === 'vortex://downloads') { Panel.open('downloads'); return null; }
    const id = Date.now().toString();
    tabs.push({ id, url, title: 'New Tab', favicon: null, _webviewReady: false, _sleeping: false, _muted: false, _audible: false, incognito: !!opts.incognito });
    activeTabId = id;
    _touchTab(id);
    // Create webview immediately only for the active tab
    WebView.createWebview(id, url, { incognito: !!opts.incognito });
    tabs.find(t => t.id === id)._webviewReady = true;
    WebView.switchTo(id);
    render();
    _notifyChanged();
    return id;
  }

  function closeTab(id) {
    if (tabs.length === 1) return;
    try { if (window.TabHistory) TabHistory.onTabClosed(id); } catch (_) {}
    const tab = tabs.find(t => t.id === id);
    if (tab && tab._webviewReady) WebView.destroyWebview(id);
    tabs = tabs.filter(t => t.id !== id);
    if (activeTabId === id) {
      activeTabId = tabs[tabs.length - 1].id;
      // Ensure the new active tab has its webview
      const nextTab = tabs.find(t => t.id === activeTabId);
      if (nextTab && !nextTab._webviewReady) {
        WebView.createWebview(activeTabId, nextTab.url);
        nextTab._webviewReady = true;
      }
      WebView.switchTo(activeTabId);
    }
    render();
    _notifyChanged();
  }

  function setActiveTab(id) {
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    // Wake sleeping tab
    if (tab && tab._sleeping) _wakeTab(id);
    // Lazy: create webview on first activation or after wake
    if (tab && !tab._webviewReady) {
      WebView.createWebview(id, tab.url);
      tab._webviewReady = true;
    }
    _touchTab(id);
    WebView.switchTo(id);
    render();
    _notifyChanged();
  }

  function updateTab(id, data) {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;

    // If only favicon changed, update the img in-place without full re-render
    if (Object.keys(data).length === 1 && data.favicon !== undefined && tab.favicon !== data.favicon) {
      tab.favicon = data.favicon;
      const el = document.querySelector(`.tab[data-id="${id}"] .tab-icon`);
      if (el) {
        el.innerHTML = '';
        const img = document.createElement('img');
        img.width = 14; img.height = 14;
        img.style.borderRadius = '2px';
        img.src = data.favicon;
        img.onerror = () => {
          img.remove();
          el.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        };
        el.appendChild(img);
        return; // skip full render
      }
    }

    Object.assign(tab, data);
    render();
  }

  function getActiveTab() {
    return tabs.find(t => t.id === activeTabId) || null;
  }

  function getAllTabs() { return [...tabs]; }

  function getActiveId() { return activeTabId; }

  function switchNext() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    const next = tabs[(idx + 1) % tabs.length];
    if (next) setActiveTab(next.id);
  }

  function switchPrev() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
    if (prev) setActiveTab(prev.id);
  }

  function _notifyChanged() {
    document.dispatchEvent(new CustomEvent('vortex:tab-changed'));
  }

  // ── Tab Sleep ─────────────────────────────────────────────────────────────
  let _sleepEnabled  = true;
  let _sleepTimeout  = 10 * 60 * 1000; // 10 minutes default
  let _sleepTimer    = null;
  const _lastActive  = new Map(); // tabId → timestamp

  function _touchTab(id) {
    _lastActive.set(id, Date.now());
  }

  function _sleepTab(id) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || tab._sleeping || id === activeTabId) return;
    if (!tab._webviewReady) return;

    // Save current URL before destroying
    const wv = document.querySelector(`.vortex-wv[data-tab-id="${id}"]`);
    if (wv && wv.src && wv.src !== 'about:blank') tab.url = wv.src;

    WebView.destroyWebview(id);
    tab._webviewReady = false;
    tab._sleeping = true;
    render();
    console.log('[TabSleep] suspended tab', id, tab.title);
  }

  function _wakeTab(id) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab._sleeping) return;
    tab._sleeping = false;
    _touchTab(id);
  }

  function _runSleepCheck() {
    if (!_sleepEnabled) return;
    const now = Date.now();
    tabs.forEach(tab => {
      if (tab.id === activeTabId || tab._sleeping) return;
      const last = _lastActive.get(tab.id) || 0;
      if (now - last >= _sleepTimeout) {
        _sleepTab(tab.id);
      }
    });
  }

  function _startSleepTimer() {
    clearInterval(_sleepTimer);
    _sleepTimer = setInterval(_runSleepCheck, 60 * 1000); // check every minute
  }

  function setSleepEnabled(val) {
    _sleepEnabled = val;
    if (!val) {
      // Wake all sleeping tabs
      tabs.forEach(t => { if (t._sleeping) t._sleeping = false; });
      render();
    }
  }

  function setSleepTimeout(minutes) {
    _sleepTimeout = minutes * 60 * 1000;
  }

  // ── Tab Mute ──────────────────────────────────────────────────────────────
  async function toggleMute(id) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab._webviewReady) return;
    const wv = document.querySelector(`.vortex-wv[data-tab-id="${id}"]`);
    if (!wv) return;
    try {
      const wcId = wv.getWebContentsId();
      tab._muted = !tab._muted;
      await window.vortexAPI.invoke('tab:setMuted', wcId, tab._muted);
      render();
    } catch (_) {}
  }

  // Poll audible state every 2s to show speaker icon
  function _startAudiblePoll() {
    setInterval(async () => {
      let changed = false;
      for (const tab of tabs) {
        if (!tab._webviewReady) continue;
        const wv = document.querySelector(`.vortex-wv[data-tab-id="${tab.id}"]`);
        if (!wv) continue;
        try {
          const wcId = wv.getWebContentsId();
          const audible = await window.vortexAPI.invoke('tab:isAudible', wcId);
          if (tab._audible !== audible) { tab._audible = audible; changed = true; }
        } catch (_) {}
      }
      if (changed) render();
    }, 2000);
  }

  // ── Tab Context Menu ──────────────────────────────────────────────────────
  let _tabCtxMenu = null;

  function _showTabContextMenu(x, y, tabId) {
    _removeTabCtxMenu();
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const menu = document.createElement('div');
    menu.id = 'tab-ctx-menu';
    menu.style.cssText = `position:fixed;z-index:99999;background:#122222;border:1px solid #1e3838;border-radius:10px;padding:4px;min-width:180px;box-shadow:0 8px 28px rgba(0,0,0,0.5);`;
    menu.innerHTML = `
      <div class="tctx-item" data-action="mute">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">${tab._muted ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>' : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>'}</svg>
        ${tab._muted ? 'Unmute Tab' : 'Mute Tab'}
      </div>
      <div class="tctx-item" data-action="reload">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>
        Reload Tab
      </div>
      <div class="tctx-item" data-action="duplicate">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Duplicate Tab
      </div>
      <div style="height:1px;background:#1e3838;margin:4px 0;"></div>
      <div class="tctx-item tctx-danger" data-action="close">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Close Tab
      </div>
    `;

    // Style items
    const style = document.createElement('style');
    style.textContent = `.tctx-item{display:flex;align-items:center;gap:8px;padding:7px 12px;font-size:12px;color:#c8e8e5;cursor:pointer;border-radius:6px;transition:background 0.1s;}.tctx-item:hover{background:#1a3838;}.tctx-danger{color:#c86060;}.tctx-danger:hover{background:rgba(200,60,60,0.12);}`;
    menu.appendChild(style);

    // Position
    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top  = Math.min(y, window.innerHeight - 160) + 'px';
    document.body.appendChild(menu);
    _tabCtxMenu = menu;

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      _removeTabCtxMenu();
      switch (item.dataset.action) {
        case 'mute':      toggleMute(tabId); break;
        case 'reload':    { const wv = document.querySelector(`.vortex-wv[data-tab-id="${tabId}"]`); if (wv) wv.reload(); } break;
        case 'duplicate': createTab(tab.url); break;
        case 'close':     closeTab(tabId); break;
      }
    });

    menu.addEventListener('mouseenter', () => clearTimeout(menu._autoClose));
    menu.addEventListener('mouseleave', () => {
      menu._autoClose = setTimeout(_removeTabCtxMenu, 1500);
    });

    // Auto-close after 1.5s if no interaction
    menu._autoClose = setTimeout(_removeTabCtxMenu, 1500);
    setTimeout(() => document.addEventListener('click', _removeTabCtxMenu, { once: true }), 0);
  }

  function _removeTabCtxMenu() {
    if (_tabCtxMenu) { clearTimeout(_tabCtxMenu._autoClose); _tabCtxMenu.remove(); _tabCtxMenu = null; }
  }
  let _drag = null;

  function _initDrag(el, tabId) {
    let _holdTimer = null;
    let _dragActive = false;
    let _downEvent = null;
    let _pointerId = null;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.tab-close')) return;
      _downEvent = e;
      _dragActive = false;
      _pointerId = e.pointerId;

      _holdTimer = setTimeout(() => {
        _dragActive = true;
        _startDrag(el, tabId, _downEvent);
        try { el.setPointerCapture(_pointerId); } catch(_) {}
      }, 300);
    });

    el.addEventListener('pointermove', (e) => {
      if (!_dragActive || !_drag || _drag.tabId !== tabId) return;
      _moveDrag(e);
    });

    // pointerup on element
    el.addEventListener('pointerup', (e) => {
      clearTimeout(_holdTimer);
      if (e.target.closest('.tab-close')) {
        // Let the click event on close button handle it
        _dragActive = false;
        _pointerId = null;
        return;
      }
      if (_dragActive && _drag && _drag.tabId === tabId) {
        _endDrag();
      } else if (!_dragActive) {
        setActiveTab(tabId);
      }
      _dragActive = false;
      _pointerId = null;
    });

    el.addEventListener('pointercancel', () => {
      clearTimeout(_holdTimer);
      if (_drag && _drag.tabId === tabId) _endDrag(true);
      _dragActive = false;
      _pointerId = null;
    });
  }

  // Global safety net — catches pointerup that fires outside the tab element
  document.addEventListener('pointerup', () => {
    if (_drag) _endDrag();
  });
  document.addEventListener('pointercancel', () => {
    if (_drag) _endDrag(true);
  });

  function _startDrag(el, tabId, e) {
    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.id = 'tab-drag-ghost';
    ghost.style.cssText = `
      position:fixed;top:${rect.top}px;left:${rect.left}px;
      width:${rect.width}px;height:${rect.height}px;
      pointer-events:none;z-index:99999;
      opacity:0.88;transform:scale(1.05);
      box-shadow:0 8px 28px rgba(0,0,0,0.55);
      border-radius:8px;transition:transform 0.08s ease;
    `;
    document.body.appendChild(ghost);
    el.classList.add('tab-dragging');

    _drag = {
      tabId, ghost, el,
      offsetX: e.clientX - rect.left,
      originIndex: tabs.findIndex(t => t.id === tabId),
      lastIndex:   tabs.findIndex(t => t.id === tabId),
    };
  }

  function _moveDrag(e) {
    const { ghost } = _drag;
    const container = document.getElementById('tabbar-container');
    const cr = container.getBoundingClientRect();

    ghost.style.left = Math.max(cr.left, Math.min(cr.right - ghost.offsetWidth, e.clientX - _drag.offsetX)) + 'px';

    const tabEls = [...container.querySelectorAll('.tab:not(.tab-dragging)')];
    let targetIndex = tabEls.length;
    for (let i = 0; i < tabEls.length; i++) {
      const mid = tabEls[i].getBoundingClientRect().left + tabEls[i].offsetWidth / 2;
      if (e.clientX < mid) { targetIndex = i; break; }
    }

    if (targetIndex !== _drag.lastIndex) {
      const arr = [...tabs];
      const [moved] = arr.splice(_drag.originIndex, 1);
      arr.splice(targetIndex, 0, moved);
      tabs = arr;
      _drag.originIndex = targetIndex;
      _drag.lastIndex   = targetIndex;
      _renderDragging();
    }
  }

  function _endDrag(cancel = false) {
    if (!_drag) return;
    // Remove ghost — by reference and by ID as safety net
    try { _drag.ghost.remove(); } catch(_) {}
    document.getElementById('tab-drag-ghost')?.remove();
    document.querySelector('.tab-dragging')?.classList.remove('tab-dragging');
    _drag = null;
    render();
    if (!cancel) _notifyChanged();
  }

  // Lightweight re-render during drag — only reorders DOM, no full rebuild
  function _renderDragging() {
    const container = document.getElementById('tabbar-container');
    const tabEls = [...container.querySelectorAll('.tab')];
    const newBtn = container.querySelector('.tab-add');
    const controls = container.querySelector('.window-controls');

    // Reorder existing tab elements to match tabs array order
    tabs.forEach((tab, i) => {
      const el = tabEls.find(e => e.dataset.id === tab.id);
      if (el) {
        // Insert before newBtn to keep order
        container.insertBefore(el, newBtn);
      }
    });
  }

  function render() {
    const container = document.getElementById('tabbar-container');
    container.innerHTML = '';

    tabs.forEach(tab => {
      const el = document.createElement('div');
      el.className = 'tab' + (tab.id === activeTabId ? ' active' : '') + (tab._sleeping ? ' tab-sleeping' : '') + (tab.incognito ? ' tab-incognito' : '');
      el.dataset.id = tab.id;

      // favicon / sleep icon
      const iconEl = document.createElement('div');
      iconEl.className = 'tab-icon';

      if (tab._sleeping) {
        // Moon icon for sleeping tabs
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a7a8a" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      } else if (tab.favicon) {
        const img = document.createElement('img');
        img.width = 14;
        img.height = 14;
        img.style.borderRadius = '2px';
        img.src = tab.favicon;
        img.onerror = () => {
          img.remove();
          iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        };
        iconEl.appendChild(img);
      } else {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      }

      const titleEl = document.createElement('span');
      titleEl.className = 'tab-title';
      titleEl.textContent = tab.title;
      if (tab._sleeping) titleEl.title = 'Sleeping — click to wake';

      // Speaker / mute icon — show if audible or muted
      if (tab._audible || tab._muted) {
        const audioBtn = document.createElement('div');
        audioBtn.className = 'tab-audio' + (tab._muted ? ' tab-muted' : '');
        audioBtn.title = tab._muted ? 'Unmute tab' : 'Mute tab';
        audioBtn.innerHTML = tab._muted
          ? `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
          : `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
        audioBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(tab.id); });
        el.appendChild(iconEl);
        el.appendChild(titleEl);
        el.appendChild(audioBtn);
      } else {
        el.appendChild(iconEl);
        el.appendChild(titleEl);
      }

      const closeBtn = document.createElement('div');
      closeBtn.className = 'tab-close';
      closeBtn.title = 'Close tab';
      closeBtn.innerHTML = `<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>`;
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeTab(tab.id); });

      el.appendChild(closeBtn);
      el.addEventListener('mouseenter', () => TabPreview.show(el, tab.id, tab.title));
      el.addEventListener('mouseleave', () => TabPreview.hide());

      // Right-click context menu for tab
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _showTabContextMenu(e.clientX, e.clientY, tab.id);
      });

      _initDrag(el, tab.id);
      container.appendChild(el);
    });

    // New tab button
    const newBtn = document.createElement('button');
    newBtn.className = 'tab-add';
    newBtn.title = 'New Tab';
    newBtn.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
    newBtn.addEventListener('click', () => QuickLaunch.open());
    container.appendChild(newBtn);

    // Window controls — right side of tabbar
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    controls.innerHTML = `
      <button class="wc-btn wc-minimize" title="Minimize">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="wc-btn wc-maximize" title="Maximize">
        <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
      </button>
      <button class="wc-btn wc-close" title="Close">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
    `;
    controls.querySelector('.wc-minimize').addEventListener('click', () => window.vortexAPI.send('window:minimize'));
    controls.querySelector('.wc-maximize').addEventListener('click', () => window.vortexAPI.send('window:maximize'));
    controls.querySelector('.wc-close').addEventListener('click',    () => window.vortexAPI.send('window:close'));
    container.appendChild(controls);
  }

  function createIncognitoTab(url = 'https://www.google.com') {
    return createTab(url, { incognito: true });
  }

  // Start sleep timer and audible poll on load
  document.addEventListener('DOMContentLoaded', () => { _startSleepTimer(); _startAudiblePoll(); });

  return { createTab, createTabBackground, createIncognitoTab, closeTab, setActiveTab, updateTab, getActiveTab, getAllTabs, getActiveId, switchNext, switchPrev, render, setSleepEnabled, setSleepTimeout, toggleMute, touchTab: _touchTab };
})();
