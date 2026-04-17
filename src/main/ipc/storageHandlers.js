/**
 * main/ipc/storageHandlers.js
 * storage:read/write/delete + favicon-cache:get/set/getAll
 */

const { ipcMain, app } = require('electron');
const path = require('path');

// ── Favicon cache ─────────────────────────────────────────────────────────────
const FAV_MAX = 500;
let _favCache = null;

function _favCachePath() { return path.join(app.getPath('userData'), 'storage', 'favicon-cache.json'); }

function _loadFavCache() {
  if (_favCache) return _favCache;
  try { const fs = require('fs'), f = _favCachePath(); _favCache = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f,'utf8')) : {}; } catch { _favCache = {}; }
  return _favCache;
}

function _saveFavCache() {
  try {
    const fs = require('fs'), f = _favCachePath(), dir = path.dirname(f);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const entries = Object.entries(_favCache);
    if (entries.length > FAV_MAX) { entries.sort((a,b) => (b[1].ts||0)-(a[1].ts||0)); _favCache = Object.fromEntries(entries.slice(0, FAV_MAX)); }
    fs.writeFileSync(f, JSON.stringify(_favCache));
  } catch {}
}

// Callbacks to invoke when specific files are written
const _writeCallbacks = {};

function onWrite(name, fn) {
  _writeCallbacks[name] = fn;
}

function register() {
  const { readFile, writeFile, deleteFile, STORAGE_DIR } = require('../storage');

  ipcMain.handle('storage:read',   (_e, name)       => readFile(name));
  ipcMain.handle('storage:write',  (_e, name, data) => {
    const result = writeFile(name, data);
    if (_writeCallbacks[name]) _writeCallbacks[name](data);
    return result;
  });
  ipcMain.handle('storage:delete', (_e, name)       => deleteFile ? deleteFile(name) : false);
  ipcMain.handle('storage:dir',    ()               => STORAGE_DIR);

  ipcMain.handle('favicon-cache:get',    (_e, domain)       => { const c = _loadFavCache(); return c[domain] || null; });
  ipcMain.handle('favicon-cache:set',    (_e, domain, data) => { const c = _loadFavCache(); c[domain] = { ...data, ts: Date.now() }; _saveFavCache(); return true; });
  ipcMain.handle('favicon-cache:getAll', ()                 => _loadFavCache());
}

module.exports = { register, onWrite };
