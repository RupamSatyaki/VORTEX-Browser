// Tab History — tracks per-tab navigation with enter/exit timestamps
// Closed tabs are persisted to storage/tab_history.json
window.TabHistory = (() => {
  // Map<tabId, TabRecord>
  const _tabs = new Map();

  // Closed tabs (newest first), max 200, persisted to disk
  let _closed = [];
  const MAX_CLOSED = 200;
  const STORAGE_KEY = 'tab_history';

  // URLs that should NOT count as real navigations
  const _SKIP_URLS = new Set([
    'about:blank',
    '',
  ]);

  function _isSkip(url) {
    if (!url) return true;
    if (url.startsWith('vortex://')) return true;
    return _SKIP_URLS.has(url);
  }

  // Check if a tab has any meaningful navigation (not just default new tab page)
  const _DEFAULT_ONLY = new Set([
    'https://www.google.com',
    'https://www.google.com/',
  ]);

  function _isDefaultOnly(navLog) {
    const real = navLog.filter(n => !_isSkip(n.url));
    return real.length === 0 || real.every(n => _DEFAULT_ONLY.has(n.url));
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  async function _save() {
    try {
      await window.vortexAPI.invoke('storage:write', STORAGE_KEY, _closed);
    } catch (_) {}
  }

  async function _load() {
    try {
      const data = await window.vortexAPI.invoke('storage:read', STORAGE_KEY);
      if (Array.isArray(data)) _closed = data;
    } catch (_) {}
  }

  // ── Tab lifecycle ────────────────────────────────────────────────────────────

  function onTabCreated(tabId) {
    console.log('[TabHistory] onTabCreated', tabId);
    _tabs.set(tabId, {
      id: tabId,
      createdAt: Date.now(),
      title: 'New Tab',
      favicon: null,
      navLog: [],
      _currentEntry: null,
    });
  }

  function onNavigate(tabId, url, title, favicon) {
    console.log('[TabHistory] onNavigate', tabId, url);
    const rec = _tabs.get(tabId);
    if (!rec) return;

    // Close out previous entry
    if (rec._currentEntry) {
      rec._currentEntry.exitedAt = Date.now();
      if (!_isSkip(rec._currentEntry.url)) {
        rec.navLog.push({ ...rec._currentEntry });
      }
      rec._currentEntry = null;
    }

    // Start new entry
    rec._currentEntry = {
      url,
      title: title || url,
      favicon: favicon || null,
      enteredAt: Date.now(),
      exitedAt: null,
    };

    if (title) rec.title = title;
    if (favicon) rec.favicon = favicon;
  }

  function onTitleUpdate(tabId, title) {
    const rec = _tabs.get(tabId);
    if (!rec) return;
    rec.title = title;
    if (rec._currentEntry) rec._currentEntry.title = title;
  }

  function onFaviconUpdate(tabId, favicon) {
    const rec = _tabs.get(tabId);
    if (!rec) return;
    rec.favicon = favicon;
    if (rec._currentEntry) rec._currentEntry.favicon = favicon;
  }

  function onTabClosed(tabId) {
    const rec = _tabs.get(tabId);
    if (!rec) {
      console.warn('[TabHistory] onTabClosed: no record for tabId', tabId);
      return;
    }

    // Close current entry
    if (rec._currentEntry) {
      rec._currentEntry.exitedAt = Date.now();
      if (!_isSkip(rec._currentEntry.url)) {
        rec.navLog.push({ ...rec._currentEntry });
      }
      rec._currentEntry = null;
    }

    console.log('[TabHistory] closing tab', tabId, 'navLog:', rec.navLog.map(n => n.url));

    // Skip tabs that never navigated away from default page
    if (_isDefaultOnly(rec.navLog)) {
      console.log('[TabHistory] skipping — default only');
      _tabs.delete(tabId);
      return;
    }

    _closed.unshift({
      id: rec.id,
      closedAt: Date.now(),
      createdAt: rec.createdAt,
      title: rec.title,
      favicon: rec.favicon,
      navLog: rec.navLog,
    });
    if (_closed.length > MAX_CLOSED) _closed.pop();
    console.log('[TabHistory] saved to closed, total:', _closed.length);
    _save();

    _tabs.delete(tabId);
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  function getActiveTabs() {
    const result = [];
    const activeId = window.Tabs ? Tabs.getActiveId() : null;
    _tabs.forEach((rec) => {
      const log = [...rec.navLog];
      if (rec._currentEntry) {
        log.push({ ...rec._currentEntry, exitedAt: null });
      }
      result.push({
        id: rec.id,
        createdAt: rec.createdAt,
        title: rec.title,
        favicon: rec.favicon,
        navLog: log,
        isActive: rec.id === activeId,
      });
    });
    return result;
  }

  function getClosedTabs() {
    return [..._closed];
  }

  function restoreTab(closedTabId) {
    const idx = _closed.findIndex(t => t.id === closedTabId);
    if (idx === -1) return null;
    const tab = _closed[idx];
    _closed.splice(idx, 1);
    _save();

    const realNavs = tab.navLog.filter(n => !_isSkip(n.url));
    const lastUrl = realNavs.length > 0
      ? realNavs[realNavs.length - 1].url
      : 'https://www.google.com';
    return { url: lastUrl, tab };
  }

  // Load persisted closed tabs on startup — defer until vortexAPI is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _load);
  } else {
    _load();
  }

  return {
    onTabCreated,
    onNavigate,
    onTitleUpdate,
    onFaviconUpdate,
    onTabClosed,
    getActiveTabs,
    getClosedTabs,
    restoreTab,
  };
})();
