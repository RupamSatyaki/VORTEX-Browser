/**
 * core/ipc/bookmarkStore.js
 * BookmarkStore — load, add, remove, update, clear, has.
 */

const BookmarkStore = (() => {

  const FILE = 'bookmarks';
  let _cache = null;

  async function load() {
    if (_cache) return _cache;
    _cache = (await Storage.read(FILE)) || [];
    return _cache;
  }

  async function add(entry) {
    const list = await load();
    if (list.find(b => b.url === entry.url)) return false;
    list.unshift(entry);
    _cache = list;
    await Storage.write(FILE, list);
    return true;
  }

  async function remove(id) {
    const list = await load();
    _cache = list.filter(b => b.id !== id);
    await Storage.write(FILE, _cache);
  }

  async function update(id, title, url) {
    const list = await load();
    const bm = list.find(b => b.id === id);
    if (bm) { bm.title = title; bm.url = url; }
    await Storage.write(FILE, list);
  }

  async function clear() {
    _cache = [];
    await Storage.delete(FILE);
  }

  async function has(url) {
    const list = await load();
    return !!list.find(b => b.url === url);
  }

  // Forward to bookmarks iframe
  function forwardToFrame(channel, data) {
    const frame   = document.getElementById('panel-frame');
    const titleEl = document.getElementById('panel-title');
    if (!frame?.contentWindow || titleEl?.textContent !== 'Bookmarks') return;
    try { frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*'); } catch (_) {}
  }

  async function injectToFrame(frame) {
    const list = await load();
    try { frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'bookmark:history', data: list }, '*'); } catch (_) {}
  }

  return { load, add, remove, update, clear, has, forwardToFrame, injectToFrame, get _cache() { return _cache; }, set _cache(v) { _cache = v; } };

})();
