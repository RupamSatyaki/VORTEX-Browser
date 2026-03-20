// IPC renderer-side helpers
const IPC = {
  send:   (channel, data)    => window.vortexAPI.send(channel, data),
  on:     (channel, cb)      => window.vortexAPI.on(channel, cb),
  invoke: (channel, ...args) => window.vortexAPI.invoke(channel, ...args),
};

// ── Storage API (reads/writes JSON files via main process) ───────────────────
const Storage = {
  async read(name)        { return IPC.invoke('storage:read', name); },
  async write(name, data) { return IPC.invoke('storage:write', name, data); },
  async delete(name)      { return IPC.invoke('storage:delete', name); },
};

// ── Download History ─────────────────────────────────────────────────────────
const DL_FILE    = 'downloads_history';
const DL_MAX     = 500;

const DownloadHistory = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    this._cache = (await Storage.read(DL_FILE)) || [];
    return this._cache;
  },

  async add(entry) {
    const list = await this.load();
    const filtered = list.filter(d => d.id !== entry.id);
    filtered.unshift(entry);
    this._cache = filtered.slice(0, DL_MAX);
    await Storage.write(DL_FILE, this._cache);
  },

  async remove(id) {
    const list = await this.load();
    this._cache = list.filter(d => d.id !== id);
    await Storage.write(DL_FILE, this._cache);
  },

  async clear() {
    this._cache = [];
    await Storage.delete(DL_FILE);
  },
};

// ── Bookmark Store ────────────────────────────────────────────────────────────
const BM_FILE = 'bookmarks';

const BookmarkStore = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    this._cache = (await Storage.read(BM_FILE)) || [];
    return this._cache;
  },

  async add(entry) {
    const list = await this.load();
    if (list.find(b => b.url === entry.url)) return false; // already exists
    list.unshift(entry);
    this._cache = list;
    await Storage.write(BM_FILE, list);
    return true;
  },

  async remove(id) {
    const list = await this.load();
    this._cache = list.filter(b => b.id !== id);
    await Storage.write(BM_FILE, this._cache);
  },

  async update(id, title, url) {
    const list = await this.load();
    const bm = list.find(b => b.id === id);
    if (bm) { bm.title = title; bm.url = url; }
    await Storage.write(BM_FILE, list);
  },

  async clear() {
    this._cache = [];
    await Storage.delete(BM_FILE);
  },

  async has(url) {
    const list = await this.load();
    return !!list.find(b => b.url === url);
  },
};

// ── Forward events to bookmarks iframe ───────────────────────────────────────
function _forwardToBookmarksFrame(channel, data) {
  const frame = document.getElementById('panel-frame');
  if (!frame || !frame.contentWindow) return;
  const titleEl = document.getElementById('panel-title');
  if (!titleEl || titleEl.textContent !== 'Bookmarks') return;
  try {
    frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*');
  } catch (_) {}
}

async function _injectBookmarksToFrame(frame) {
  const list = await BookmarkStore.load();
  try {
    frame.contentWindow.postMessage(
      { __vortexIPC: true, channel: 'bookmark:history', data: list }, '*'
    );
  } catch (_) {}
}



function _forwardToDownloadsFrame(channel, data) {
  const frame = document.getElementById('panel-frame');
  if (!frame || !frame.contentWindow) return;
  // Only send if downloads panel is open
  const titleEl = document.getElementById('panel-title');
  if (!titleEl || titleEl.textContent !== 'Downloads') return;
  try {
    frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*');
  } catch (_) {}
}

async function _injectHistoryToFrame(frame) {
  const history = await DownloadHistory.load();
  try {
    frame.contentWindow.postMessage(
      { __vortexIPC: true, channel: 'download:history', data: history },
      '*'
    );
  } catch (_) {}
  // Also inject any active downloads
  _activeDownloads.forEach((dl) => {
    try {
      frame.contentWindow.postMessage(
        { __vortexIPC: true, channel: 'download:start', data: dl },
        '*'
      );
    } catch (_) {}
  });
}

// ── Active downloads (in-memory for live updates) ────────────────────────────
const _activeDownloads = new Map();

// Update address bar bookmark icon based on current URL
async function _updateBookmarkIcon() {
  const bar = document.getElementById('url-bar');
  const btn = document.getElementById('btn-bookmark');
  if (!bar || !btn) return;
  const url = bar.value;
  const saved = url && !url.startsWith('vortex://') ? await BookmarkStore.has(url) : false;
  btn.classList.toggle('bookmarked', saved);
  btn.title = saved ? 'Remove bookmark' : 'Bookmark this page';
}

// Expose so navigation.js can call it on URL change
window._updateBookmarkIcon = _updateBookmarkIcon;
// Expose forward function for navigation.js bookmark button
window._forwardToBookmarksFrame = _forwardToBookmarksFrame;

// ── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  IPC.on('downloads:badge', (count) => Navigation.setDownloadBadge(count));

  IPC.on('download:start', (data) => {
    _activeDownloads.set(data.id, { ...data, receivedFormatted: '0 B', percent: 0, speed: '' });
    _forwardToDownloadsFrame('download:start', data);
  });

  IPC.on('download:update', (data) => {
    const existing = _activeDownloads.get(data.id);
    if (existing) Object.assign(existing, data);
    _forwardToDownloadsFrame('download:update', data);
  });

  IPC.on('download:done', async (data) => {
    const existing = _activeDownloads.get(data.id) || {};
    _activeDownloads.delete(data.id);

    const entry = {
      ...existing,
      ...data,
      percent:     data.status === 'completed' ? 100 : (existing.percent || 0),
      completedAt: Date.now(),
    };

    await DownloadHistory.add(entry);
    _forwardToDownloadsFrame('download:done', entry);
  });

  IPC.on('download:removed', async (id) => {
    await DownloadHistory.remove(id);
    _forwardToDownloadsFrame('download:removed', id);
  });

  // Mark a file as deleted in history (file no longer exists on disk)
  IPC.on('download:markDeleted', async ({ id }) => {
    const history = await DownloadHistory.load();
    const entry = history.find(d => d.id === id);
    if (entry) {
      entry.status = 'deleted';
      await Storage.write('downloads_history', history);
      DownloadHistory._cache = history;
    }
  });

  // When downloads panel iframe loads — inject history + active downloads
  document.addEventListener('vortex-downloads-ready', async (e) => {
    DownloadHistory._cache = null; // force fresh read from disk
    await _injectHistoryToFrame(e.detail);
  });

  // When bookmarks panel iframe loads — inject bookmarks
  document.addEventListener('vortex-bookmarks-ready', async (e) => {
    BookmarkStore._cache = null; // force fresh read from disk
    await _injectBookmarksToFrame(e.detail);
  });

  // Handle postMessage actions from downloads.html and settings.html
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__vortexAction) return;
    const { channel, payload } = e.data;
    if (channel === 'settings:changed') {
      IPC.send('settings:changed', payload);
      return;
    }
    if (channel === 'profile:changed') {
      // Dispatch a custom event so navigation.js _initProfile listener picks it up
      window.dispatchEvent(new CustomEvent('vortex-profile-changed', { detail: payload }));
      return;
    }
    if (channel === 'bookmark:remove') {
      BookmarkStore.remove(payload).then(() => {
        _forwardToBookmarksFrame('bookmark:removed', payload);
        _updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:update') {
      BookmarkStore.update(payload.id, payload.title, payload.url).then(() => {
        _forwardToBookmarksFrame('bookmark:updated', payload);
      });
      return;
    }
    if (channel === 'bookmark:clearAll') {
      BookmarkStore.clear().then(() => {
        _forwardToBookmarksFrame('bookmark:cleared', null);
        _updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:open') {
      // Open URL in active tab
      if (window.WebView) WebView.loadURL(payload);
      else if (window.Tabs) Tabs.createTab(payload);
      return;
    }
    IPC.send(channel, payload);
  });
});
