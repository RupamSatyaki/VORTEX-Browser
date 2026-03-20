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

// ── Forward events to downloads webview ──────────────────────────────────────

function _forwardToDownloadsWV(channel, data) {
  document.querySelectorAll('webview.vortex-wv').forEach(wv => {
    if ((wv.src || '').includes('downloads.html')) {
      const payload = JSON.stringify({ channel, data });
      wv.executeJavaScript(
        `window.dispatchEvent(new CustomEvent('vortex-ipc',{detail:${JSON.stringify(payload)}}))`
      ).catch(() => {});
    }
  });
}

async function _injectHistory(wv) {
  const history = await DownloadHistory.load();
  if (!history.length) return;
  const payload = JSON.stringify({ channel: 'download:history', data: history });
  wv.executeJavaScript(
    `window.dispatchEvent(new CustomEvent('vortex-ipc',{detail:${JSON.stringify(payload)}}))`
  ).catch(() => {});
}

// ── Active downloads (in-memory for live updates) ────────────────────────────
const _activeDownloads = new Map();

// ── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  IPC.on('downloads:badge', (count) => Navigation.setDownloadBadge(count));

  IPC.on('download:start', (data) => {
    _activeDownloads.set(data.id, { ...data, receivedFormatted: '0 B', percent: 0, speed: '' });
    _forwardToDownloadsWV('download:start', data);
  });

  IPC.on('download:update', (data) => {
    const existing = _activeDownloads.get(data.id);
    if (existing) Object.assign(existing, data);
    _forwardToDownloadsWV('download:update', data);
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
    _forwardToDownloadsWV('download:done', entry);
  });

  IPC.on('download:removed', async (id) => {
    await DownloadHistory.remove(id);
    _forwardToDownloadsWV('download:removed', id);
  });

  // When downloads page loads — inject history + active downloads
  document.addEventListener('vortex-downloads-ready', async (e) => {
    const wv = e.detail;
    await _injectHistory(wv);
    _activeDownloads.forEach((dl) => {
      const payload = JSON.stringify({ channel: 'download:start', data: dl });
      wv.executeJavaScript(
        `window.dispatchEvent(new CustomEvent('vortex-ipc',{detail:${JSON.stringify(payload)}}))`
      ).catch(() => {});
    });
  });

  // Handle postMessage actions from downloads.html
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__vortexAction) return;
    const { channel, payload } = e.data;
    IPC.send(channel, payload);
  });
});
