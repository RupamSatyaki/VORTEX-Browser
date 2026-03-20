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

// ── Forward events to downloads iframe ───────────────────────────────────────

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
    await _injectHistoryToFrame(e.detail);
  });

  // Handle postMessage actions from downloads.html
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__vortexAction) return;
    const { channel, payload } = e.data;
    IPC.send(channel, payload);
  });
});
