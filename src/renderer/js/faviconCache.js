/**
 * faviconCache.js — Domain-based favicon + title cache
 * Stores base64 favicons locally for offline use
 */

const FaviconCache = (() => {

  // In-memory cache (loaded once from disk)
  let _mem = null;

  // ── IPC ───────────────────────────────────────────────────────────────────
  async function _getAll() {
    if (_mem) return _mem;
    try { _mem = await IPC.invoke('favicon-cache:getAll') || {}; }
    catch { _mem = {}; }
    return _mem;
  }

  async function _set(domain, data) {
    if (!_mem) _mem = {};
    _mem[domain] = { ...data, ts: Date.now() };
    try { await IPC.invoke('favicon-cache:set', domain, data); } catch {}
  }

  // ── Domain key ────────────────────────────────────────────────────────────
  function _domainKey(url) {
    try {
      const u = new URL(url.startsWith('http') ? url : 'https://' + url);
      return u.hostname + (u.port ? ':' + u.port : '');
    } catch { return url; }
  }

  // ── Get cached favicon ────────────────────────────────────────────────────
  async function getFavicon(url) {
    const key = _domainKey(url);
    const cache = await _getAll();
    return cache[key]?.favicon || null;
  }

  // ── Get cached title ──────────────────────────────────────────────────────
  async function getTitle(url) {
    const key = _domainKey(url);
    const cache = await _getAll();
    return cache[key]?.title || null;
  }

  // ── Save favicon (fetch + convert to base64) ──────────────────────────────
  async function saveFavicon(url, faviconUrl) {
    if (!faviconUrl) return;
    const key = _domainKey(url);
    try {
      const res = await fetch(faviconUrl);
      if (!res.ok) return;
      const blob = await res.blob();
      const base64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      if (!base64 || base64 === 'data:') return;
      const cache = await _getAll();
      const existing = cache[key] || {};
      await _set(key, { ...existing, favicon: base64 });
    } catch {}
  }

  // ── Save base64 favicon directly ──────────────────────────────────────────
  async function saveBase64(url, base64) {
    if (!base64 || !base64.startsWith('data:')) return;
    const key = _domainKey(url);
    const cache = await _getAll();
    const existing = cache[key] || {};
    await _set(key, { ...existing, favicon: base64 });
  }

  // ── Save title ────────────────────────────────────────────────────────────
  async function saveTitle(url, title) {
    if (!title || title === 'New Tab') return;
    const key = _domainKey(url);
    const cache = await _getAll();
    const existing = cache[key] || {};
    await _set(key, { ...existing, title });
  }

  // ── Get all for omnibox ───────────────────────────────────────────────────
  async function getAll() {
    return await _getAll();
  }

  return { getFavicon, getTitle, saveFavicon, saveBase64, saveTitle, getAll, domainKey: _domainKey };
})();
