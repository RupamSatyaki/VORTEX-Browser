/**
 * core/ipc/index.js
 * IPC core — IPC object, Storage API, event listeners, postMessage bridge.
 * Delegates to: bookmarkStore.js, downloadHistory.js, permissionPrompt.js, indicators.js
 */

// ── IPC helpers ───────────────────────────────────────────────────────────────
const IPC = {
  send:   (channel, data)    => window.vortexAPI.send(channel, data),
  on:     (channel, cb)      => window.vortexAPI.on(channel, cb),
  invoke: (channel, ...args) => window.vortexAPI.invoke(channel, ...args),
};

// ── Storage API ───────────────────────────────────────────────────────────────
const Storage = {
  async read(name)        { return IPC.invoke('storage:read', name); },
  async write(name, data) { return IPC.invoke('storage:write', name, data); },
  async delete(name)      { return IPC.invoke('storage:delete', name); },
};

// ── Expose globals for navigation.js ─────────────────────────────────────────
window._updateBookmarkIcon      = () => IPCIndicators.updateBookmarkIcon();
window._forwardToBookmarksFrame = (ch, data) => BookmarkStore.forwardToFrame(ch, data);

// ── DOMContentLoaded — bind all IPC events ────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {

  // Download badge
  IPC.on('downloads:badge', (count) => Navigation.setDownloadBadge(count));

  // Download folder picked → forward to settings iframe
  IPC.on('settings:downloadFolder', (folder) => {
    IPCIndicators.forwardToFrame('settings:downloadFolder', folder);
  });

  // Blocklist events → forward to settings iframe + update badge
  IPC.on('blocklist:blocked', (data) => {
    IPCIndicators.forwardToFrame('blocklist:blocked', data);
    if (typeof BlocklistBadge !== 'undefined' && data) {
      const tabId = typeof Tabs !== 'undefined' ? Tabs.getActiveId() : null;
      if (tabId) BlocklistBadge.onBlocked(tabId);
    }
  });
  IPC.on('blocklist:progress', (data) => IPCIndicators.forwardToFrame('blocklist:progress', data));
  IPC.on('blocklist:done',     (data) => IPCIndicators.forwardToFrame('blocklist:done', data));

  // Custom dialog from webview
  IPC.on('dialog:show', (data) => {
    if (typeof VortexDialog !== 'undefined') VortexDialog.show(data.type, data.message, data.origin, data.defaultValue);
  });

  // External URL (default browser open-url)
  let _pendingExternalUrl = null;
  let _appReady = false;

  function _openExternalUrl(url) {
    if (!url) return;
    if (typeof Tabs !== 'undefined') Tabs.createTab(url);
    else if (typeof WebView !== 'undefined') WebView.loadURL(url);
  }

  IPC.on('open-url', (url) => {
    if (!url) return;
    if (_appReady) _openExternalUrl(url);
    else _pendingExternalUrl = url;
  });

  window._markAppReady = () => {
    _appReady = true;
    if (_pendingExternalUrl) {
      const url = _pendingExternalUrl;
      _pendingExternalUrl = null;
      setTimeout(() => _openExternalUrl(url), 300);
    }
  };

  // Permission request
  IPC.on('permission:request', (data) => PermissionPrompt.show(data));

  // Updater install progress
  IPC.on('updater:installProgress', (data) => {
    IPCIndicators.forwardToFrame('updater:installProgress', data);
    IPCIndicators.applyInstallProgress(data);
  });

  // Proxy & Tor events → forward to settings iframe
  ['proxy:statusUpdate','proxy:changed','tor:bootstrapProgress','tor:ready','tor:stopped','tor:error','tor:downloadProgress']
    .forEach(ch => IPC.on(ch, (data) => IPCIndicators.forwardToFrame(ch, data)));

  // Video downloader progress → forward to settings iframe
  IPC.on('vdl:ytdlpProgress', (data) => IPCIndicators.forwardToFrame('vdl:ytdlpProgress', data));

  // Menu accelerators
  IPC.on('menu:newTab',        () => QuickLaunch.open());
  IPC.on('menu:newWindow',     () => window.vortexAPI.send('window:new'));
  IPC.on('menu:closeTab',      () => { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); });
  IPC.on('menu:reload',        () => WebView.reload());
  IPC.on('menu:hardReload',    () => WebView.hardReload());
  IPC.on('menu:find',          () => WebView.findInPage());
  IPC.on('menu:screenshot',    () => Screenshot.capture(false));
  IPC.on('menu:screenshotFull',() => Screenshot.capture(true));
  IPC.on('menu:zoomIn',        () => WebView.zoomIn());
  IPC.on('menu:zoomOut',       () => WebView.zoomOut());
  IPC.on('menu:zoomReset',     () => WebView.zoomReset());
  IPC.on('menu:downloads',     () => Panel.open('downloads'));
  IPC.on('menu:history',       () => Panel.open('history'));
  IPC.on('menu:bookmarks',     () => Panel.open('bookmarks'));
  IPC.on('menu:settings',      () => Panel.open('settings'));
  IPC.on('menu:nextTab',       () => Tabs.switchNext());
  IPC.on('menu:prevTab',       () => Tabs.switchPrev());
  IPC.on('menu:focusUrl',      () => { const b = document.getElementById('url-bar'); if (b) { b.focus(); b.select(); } });

  // Download events
  IPC.on('download:start', (data) => {
    DownloadHistory.active.set(data.id, { ...data, receivedFormatted: '0 B', percent: 0, speed: '' });
    DownloadHistory.forwardToFrame('download:start', data);
  });

  IPC.on('download:update', (data) => {
    const ex = DownloadHistory.active.get(data.id);
    if (ex) Object.assign(ex, data);
    DownloadHistory.forwardToFrame('download:update', data);
  });

  IPC.on('download:done', async (data) => {
    const ex = DownloadHistory.active.get(data.id) || {};
    DownloadHistory.active.delete(data.id);
    const entry = { ...ex, ...data, percent: data.status === 'completed' ? 100 : (ex.percent || 0), completedAt: Date.now() };
    await DownloadHistory.add(entry);
    DownloadHistory.forwardToFrame('download:done', entry);
  });

  IPC.on('download:removed', async (id) => {
    await DownloadHistory.remove(id);
    DownloadHistory.forwardToFrame('download:removed', id);
  });

  IPC.on('download:markDeleted', async ({ id }) => {
    const history = await DownloadHistory.load();
    const entry = history.find(d => d.id === id);
    if (entry) {
      entry.status = 'deleted';
      await Storage.write('downloads_history', history);
      DownloadHistory._cache = history;
    }
  });

  // Panel ready events
  document.addEventListener('vortex-downloads-ready', async (e) => {
    DownloadHistory._cache = null;
    await DownloadHistory.injectToFrame(e.detail);
  });

  document.addEventListener('vortex-bookmarks-ready', async (e) => {
    BookmarkStore._cache = null;
    await BookmarkStore.injectToFrame(e.detail);
  });

  document.addEventListener('vortex-history-ready', (e) => {
    const frame = e.detail;
    if (!frame?.contentWindow) return;
    try {
      const activeTabs = window.TabHistory ? TabHistory.getActiveTabs() : [];
      const closedTabs = window.TabHistory ? TabHistory.getClosedTabs() : [];
      frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'history:data', data: { activeTabs, closedTabs } }, '*');
    } catch (_) {}
  });

  // ── postMessage bridge ────────────────────────────────────────────────────
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__vortexAction) return;
    const { channel, payload } = e.data;

    // Cross-origin invoke bridge
    if (channel === '__invoke') {
      const { reqId, channel: ipcChannel, args } = payload;
      window.vortexAPI.invoke(ipcChannel, ...args).then(result => {
        try {
          const frame = document.getElementById('panel-frame');
          frame?.contentWindow?.postMessage({ __vortexInvokeReply: reqId, result }, '*');
        } catch (_) {}
      }).catch(() => {
        try {
          const frame = document.getElementById('panel-frame');
          frame?.contentWindow?.postMessage({ __vortexInvokeReply: reqId, result: null }, '*');
        } catch (_) {}
      });
      return;
    }

    if (channel === 'settings:changed') {
      if (window.Navigation) Navigation.applySettings(payload);
      if (typeof payload.pip === 'boolean' && window.WebView) WebView.setPiPEnabled(payload.pip);
      if (payload.pipSites && window.WebView) WebView.setPiPSites(payload.pipSites);
      IPC.send('settings:changed', payload);
      return;
    }
    if (channel === 'profile:changed') {
      window.dispatchEvent(new CustomEvent('vortex-profile-changed', { detail: payload }));
      return;
    }
    if (channel === 'bookmark:remove') {
      BookmarkStore.remove(payload).then(() => {
        BookmarkStore.forwardToFrame('bookmark:removed', payload);
        IPCIndicators.updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:update') {
      BookmarkStore.update(payload.id, payload.title, payload.url).then(() => {
        BookmarkStore.forwardToFrame('bookmark:updated', payload);
      });
      return;
    }
    if (channel === 'bookmark:clearAll') {
      BookmarkStore.clear().then(() => {
        BookmarkStore.forwardToFrame('bookmark:cleared', null);
        IPCIndicators.updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:open') {
      if (window.WebView) WebView.loadURL(payload);
      else if (window.Tabs) Tabs.createTab(payload);
      return;
    }
    if (channel === 'history:restore') {
      if (window.TabHistory) {
        const result = TabHistory.restoreTab(payload);
        if (result) Tabs.createTab(result.url);
      }
      return;
    }
    if (channel === 'history:openUrl')   { if (window.Tabs) Tabs.createTab(payload); return; }
    if (channel === 'history:switchTab') { if (window.Tabs) Tabs.setActiveTab(payload); Panel.close(); return; }
    if (channel === 'history:ready') {
      const frame = document.getElementById('panel-frame');
      if (!frame?.contentWindow) return;
      try {
        const activeTabs = window.TabHistory ? TabHistory.getActiveTabs() : [];
        const closedTabs = window.TabHistory ? TabHistory.getClosedTabs() : [];
        frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'history:data', data: { activeTabs, closedTabs } }, '*');
      } catch (_) {}
      return;
    }
    if (channel === 'open-url-tab') {
      if (typeof Tabs !== 'undefined' && payload) Tabs.createTab(payload);
      return;
    }

    IPC.send(channel, payload);
  });

});
