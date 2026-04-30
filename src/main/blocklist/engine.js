/**
 * blocklist/engine.js — webRequest interceptor + domain matching + stats
 */

const { session, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs   = require('fs');
const { app } = require('electron');
const { BLOCKLISTS } = require('./lists');
const { parseList }  = require('./parser');
const { downloadList } = require('./downloader');

// ── Paths ─────────────────────────────────────────────────────────────────────
function _storageDir() {
  return path.join(app.getPath('userData'), 'vortex', 'storage', 'blocklists');
}
function _metaPath()   { return path.join(_storageDir(), 'meta.json'); }
function _listPath(id) { return path.join(_storageDir(), id + '.txt'); }
function _customPath() { return path.join(_storageDir(), 'custom.json'); }

// ── In-memory state ───────────────────────────────────────────────────────────
let _blockedDomains = new Set();
let _blockedPatterns = [];   // URL substring patterns (for YouTube etc.)
let _customDomains  = new Set();
let _meta = {};
let _stats = { total: 0, today: 0, lastReset: Date.now() };
// Per-tab blocked count: tabId → count
const _tabStats = new Map();

// ── Meta read/write ───────────────────────────────────────────────────────────
function _readMeta() {
  try {
    if (fs.existsSync(_metaPath())) return JSON.parse(fs.readFileSync(_metaPath(), 'utf8'));
  } catch {}
  // Default meta — all lists with their defaultEnabled
  const def = {};
  BLOCKLISTS.forEach(l => {
    def[l.id] = { enabled: l.defaultEnabled, lastUpdated: l.builtin ? Date.now() : null, ruleCount: l.builtin ? ((l.builtinDomains?.length || 0) + (l.builtinPatterns?.length || 0)) : 0 };
  });
  return def;
}

function _writeMeta() {
  try {
    const dir = _storageDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(_metaPath(), JSON.stringify(_meta, null, 2));
  } catch {}
}

// ── Load domains from disk ────────────────────────────────────────────────────
function _loadDomains() {
  _blockedDomains = new Set();
  _blockedPatterns = [];
  let total = 0;

  for (const list of BLOCKLISTS) {
    const m = _meta[list.id];
    if (!m || !m.enabled) continue;

    // Built-in list (no file, domains hardcoded)
    if (list.builtin) {
      if (list.builtinDomains) {
        list.builtinDomains.forEach(d => _blockedDomains.add(d.toLowerCase()));
        total += list.builtinDomains.length;
      }
      if (list.builtinPatterns) {
        list.builtinPatterns.forEach(p => _blockedPatterns.push(p));
      }
      continue;
    }

    // File-based list
    const filePath = _listPath(list.id);
    if (!fs.existsSync(filePath)) continue;
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      const domains = parseList(text);
      domains.forEach(d => _blockedDomains.add(d));
      total += domains.size;
    } catch {}
  }

  // Add custom domains
  _customDomains.forEach(d => _blockedDomains.add(d));

  return total;
}

function _loadCustom() {
  try {
    if (fs.existsSync(_customPath())) {
      const arr = JSON.parse(fs.readFileSync(_customPath(), 'utf8'));
      _customDomains = new Set(Array.isArray(arr) ? arr : []);
    }
  } catch { _customDomains = new Set(); }
}

function _saveCustom() {
  try {
    const dir = _storageDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(_customPath(), JSON.stringify([..._customDomains], null, 2));
  } catch {}
}

// ── Domain extraction ─────────────────────────────────────────────────────────
function _extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch { return ''; }
}

// Domains that must never be blocked — fonts, CDNs, YouTube infrastructure
const _WHITELIST = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'accounts.google.com',
  'youtube.com',
  'www.youtube.com',
  'ytimg.com',
  'i.ytimg.com',
  's.ytimg.com',
  'yt3.ggpht.com',
  'googlevideo.com',
  'imasdk.googleapis.com',
]);

function _isBlocked(url) {
  const domain = _extractDomain(url);
  if (!domain) return false;

  // Never block whitelisted domains
  if (_WHITELIST.has(domain)) return false;
  // Check if domain ends with a whitelisted domain
  for (const w of _WHITELIST) {
    if (domain.endsWith('.' + w)) return false;
  }

  // Domain match
  if (_blockedDomains.has(domain)) return true;
  // Check parent domains (e.g. sub.ads.com → ads.com)
  const parts = domain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    if (_blockedDomains.has(parts.slice(i).join('.'))) return true;
  }

  // URL pattern match (for YouTube ad URLs)
  if (_blockedPatterns.length > 0) {
    for (const pattern of _blockedPatterns) {
      if (url.includes(pattern)) return true;
    }
  }

  return false;
}

// ── Reset daily stats ─────────────────────────────────────────────────────────
function _checkDailyReset() {
  const now = Date.now();
  const dayMs = 86400000;
  if (now - _stats.lastReset > dayMs) {
    _stats.today = 0;
    _stats.lastReset = now;
  }
}

// ── Apply webRequest handler ──────────────────────────────────────────────────
// ── Apply webRequest handler ──────────────────────────────────────────────────
function _applyWebRequest() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url || '';

    if (_isBlocked(url)) {
      _stats.total++;
      _stats.today++;
      _checkDailyReset();

      const wcId = details.webContentsId;
      if (wcId) {
        _tabStats.set(wcId, (_tabStats.get(wcId) || 0) + 1);
        BrowserWindow.getAllWindows().forEach(win => {
          try {
            if (!win.isDestroyed()) {
              win.webContents.send('blocklist:blocked', {
                url,
                domain: _extractDomain(url),
                wcId,
                count: _tabStats.get(wcId),
              });
            }
          } catch {}
        });
      }
      callback({ cancel: true });
    } else {
      callback({});
    }
  });
}

// ── IPC Handlers ─────────────────────────────────────────────────────────────
function registerHandlers() {
  _meta = _readMeta();
  _loadCustom();

  // Sync youtube-ads list with ytAdblock setting from settings.json
  try {
    const { app } = require('electron');
    const fs = require('fs');
    const settingsPath = require('path').join(app.getPath('userData'), 'vortex', 'storage', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const s = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (typeof s.ytAdblock === 'boolean') {
        if (!_meta['youtube-ads']) _meta['youtube-ads'] = { enabled: s.ytAdblock, lastUpdated: Date.now(), ruleCount: 0 };
        else _meta['youtube-ads'].enabled = s.ytAdblock;
        _writeMeta();
      }
    }
  } catch {}

  _loadDomains();
  _applyWebRequest();

  // Sync youtube-ads blocklist with ytAdblock setting
  ipcMain.on('settings:changed', (_e, s) => {
    if (typeof s.ytAdblock === 'boolean') {
      if (!_meta['youtube-ads']) _meta['youtube-ads'] = { enabled: s.ytAdblock, lastUpdated: Date.now(), ruleCount: 0 };
      else _meta['youtube-ads'].enabled = s.ytAdblock;
      _writeMeta();
      _loadDomains(); // reload with updated enabled state
    }
  });

  // Get all lists with meta
  ipcMain.handle('blocklist:getLists', () => {
    return BLOCKLISTS.map(l => ({
      ...l,
      enabled:     _meta[l.id]?.enabled ?? l.defaultEnabled,
      lastUpdated: _meta[l.id]?.lastUpdated ?? null,
      ruleCount:   l.builtin
        ? (l.builtinDomains?.length || 0) + (l.builtinPatterns?.length || 0)
        : (_meta[l.id]?.ruleCount ?? 0),
      downloaded:  l.builtin ? true : fs.existsSync(_listPath(l.id)),
    }));
  });

  // Toggle list enabled/disabled
  ipcMain.handle('blocklist:setEnabled', (_e, id, enabled) => {
    if (!_meta[id]) _meta[id] = { enabled, lastUpdated: null, ruleCount: 0 };
    _meta[id].enabled = enabled;
    _writeMeta();
    _loadDomains();
    return true;
  });

  // Download a single list
  ipcMain.handle('blocklist:download', async (_e, id) => {
    const list = BLOCKLISTS.find(l => l.id === id);
    if (!list) return { success: false, error: 'Unknown list' };

    // Built-in list — no download needed, just enable
    if (list.builtin) {
      if (!_meta[id]) _meta[id] = { enabled: list.defaultEnabled, lastUpdated: Date.now(), ruleCount: (list.builtinDomains?.length || 0) + (list.builtinPatterns?.length || 0) };
      _meta[id].lastUpdated = Date.now();
      _writeMeta();
      _loadDomains();
      const ruleCount = (list.builtinDomains?.length || 0) + (list.builtinPatterns?.length || 0);
      BrowserWindow.getAllWindows().forEach(win => {
        try { if (!win.isDestroyed()) win.webContents.send('blocklist:done', { id, ruleCount }); } catch {}
      });
      return { success: true, ruleCount };
    }

    try {
      const destPath = _listPath(id);
      await downloadList(list.url, destPath, (progress) => {
        BrowserWindow.getAllWindows().forEach(win => {
          try { if (!win.isDestroyed()) win.webContents.send('blocklist:progress', { id, ...progress }); }
          catch {}
        });
      });

      // Parse and count
      const text = fs.readFileSync(destPath, 'utf8');
      const domains = parseList(text);
      if (!_meta[id]) _meta[id] = { enabled: list.defaultEnabled, lastUpdated: null, ruleCount: 0 };
      _meta[id].lastUpdated = Date.now();
      _meta[id].ruleCount   = domains.size;
      _writeMeta();
      _loadDomains();

      BrowserWindow.getAllWindows().forEach(win => {
        try { if (!win.isDestroyed()) win.webContents.send('blocklist:done', { id, ruleCount: domains.size }); }
        catch {}
      });

      return { success: true, ruleCount: domains.size };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Download all enabled lists
  ipcMain.handle('blocklist:downloadAll', async () => {
    const results = [];
    for (const list of BLOCKLISTS) {
      if (!(_meta[list.id]?.enabled ?? list.defaultEnabled)) continue;
      try {
        const destPath = _listPath(list.id);
        await downloadList(list.url, destPath, (progress) => {
          BrowserWindow.getAllWindows().forEach(win => {
            try { if (!win.isDestroyed()) win.webContents.send('blocklist:progress', { id: list.id, ...progress }); }
            catch {}
          });
        });
        const text = fs.readFileSync(destPath, 'utf8');
        const domains = parseList(text);
        if (!_meta[list.id]) _meta[list.id] = { enabled: list.defaultEnabled, lastUpdated: null, ruleCount: 0 };
        _meta[list.id].lastUpdated = Date.now();
        _meta[list.id].ruleCount   = domains.size;
        _writeMeta();
        BrowserWindow.getAllWindows().forEach(win => {
          try { if (!win.isDestroyed()) win.webContents.send('blocklist:done', { id: list.id, ruleCount: domains.size }); }
          catch {}
        });
        results.push({ id: list.id, success: true, ruleCount: domains.size });
      } catch (err) {
        results.push({ id: list.id, success: false, error: err.message });
      }
    }
    _loadDomains();
    return results;
  });

  // Get stats
  ipcMain.handle('blocklist:getStats', () => ({
    total:         _stats.total,
    today:         _stats.today,
    domainsLoaded: _blockedDomains.size,
  }));

  // Reset tab stats
  ipcMain.on('blocklist:resetTabStats', (_e, wcId) => {
    _tabStats.delete(wcId);
  });

  // Custom rules
  ipcMain.handle('blocklist:getCustom', () => [..._customDomains]);

  ipcMain.handle('blocklist:addCustom', (_e, domain) => {
    const d = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!d) return false;
    _customDomains.add(d);
    _saveCustom();
    _blockedDomains.add(d);
    return true;
  });

  ipcMain.handle('blocklist:removeCustom', (_e, domain) => {
    _customDomains.delete(domain);
    _saveCustom();
    _loadDomains(); // reload to remove from blocked set
    return true;
  });

  ipcMain.handle('blocklist:resetStats', () => {
    _stats = { total: 0, today: 0, lastReset: Date.now() };
    return true;
  });
}

module.exports = { registerHandlers };
