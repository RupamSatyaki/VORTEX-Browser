/**
 * core/ipc/downloadHistory.js
 * DownloadHistory — load, add, remove, clear + active downloads map.
 */

const DownloadHistory = (() => {

  const FILE    = 'downloads_history';
  const MAX     = 500;
  let _cache    = null;

  // In-memory active downloads (live progress)
  const _active = new Map();

  async function load() {
    if (_cache) return _cache;
    _cache = (await Storage.read(FILE)) || [];
    return _cache;
  }

  async function add(entry) {
    const list     = await load();
    const filtered = list.filter(d => d.id !== entry.id);
    filtered.unshift(entry);
    _cache = filtered.slice(0, MAX);
    await Storage.write(FILE, _cache);
  }

  async function remove(id) {
    const list = await load();
    _cache = list.filter(d => d.id !== id);
    await Storage.write(FILE, _cache);
  }

  async function clear() {
    _cache = [];
    await Storage.delete(FILE);
  }

  // Forward to downloads iframe
  function forwardToFrame(channel, data) {
    const frame   = document.getElementById('panel-frame');
    const titleEl = document.getElementById('panel-title');
    if (!frame?.contentWindow || titleEl?.textContent !== 'Downloads') return;
    try { frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*'); } catch (_) {}
  }

  async function injectToFrame(frame) {
    const history = await load();
    try { frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'download:history', data: history }, '*'); } catch (_) {}
    _active.forEach(dl => {
      try { frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'download:start', data: dl }, '*'); } catch (_) {}
    });
  }

  return {
    load, add, remove, clear,
    forwardToFrame, injectToFrame,
    active: _active,
    get _cache() { return _cache; },
    set _cache(v) { _cache = v; },
  };

})();
