const { ipcMain, BrowserWindow, webContents, session, shell, net } = require('electron');
const path = require('path');

// Top sites to pre-resolve DNS on startup for instant first load
const DNS_PREFETCH_HOSTS = [
  'www.google.com', 'www.youtube.com', 'www.github.com',
  'www.reddit.com', 'www.twitter.com', 'www.wikipedia.org',
  'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net',
];

function prewarmDNS() {
  // Fire dummy HEAD requests to force DNS resolution + TCP preconnect
  DNS_PREFETCH_HOSTS.forEach(host => {
    const req = net.request({ method: 'HEAD', url: `https://${host}`, redirect: 'manual' });
    req.on('response', () => {});
    req.on('error', () => {});
    req.end();
  });
}

// Active downloads map: id -> { item, startTime, lastBytes, lastTime }
const activeDownloads = new Map();
let dlIdCounter = 0;

function pushToRenderer(channel, data) {
  BrowserWindow.getAllWindows().forEach(win => {
    try {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    } catch (_) {}
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function registerHandlers() {
  // ── Session optimizations ──────────────────────────────────────────────────
  const ses = session.defaultSession;

  // Helper: get BrowserWindow from IPC event sender (works in packaged app + Electron 28)
  function _getWin(e) {
    // Method 1: getOwnerBrowserWindow (most reliable in Electron 28+)
    try {
      const win = e.sender.getOwnerBrowserWindow();
      if (win && !win.isDestroyed()) return win;
    } catch (_) {}
    // Method 2: fromWebContents
    try {
      const win = BrowserWindow.fromWebContents(e.sender);
      if (win && !win.isDestroyed()) return win;
    } catch (_) {}
    // Method 3: match by webContents id
    const win = BrowserWindow.getAllWindows().find(w => {
      try { return !w.isDestroyed() && w.webContents.id === e.sender.id; } catch { return false; }
    });
    if (win) return win;
    // Fallback: focused window
    return BrowserWindow.getFocusedWindow();
  }

  // Aggressive cache — serve from cache even if stale, revalidate in background
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = details.requestHeaders;
    // Hint to servers we accept cached responses
    if (!headers['Cache-Control']) headers['Cache-Control'] = 'max-stale=3600';
    callback({ requestHeaders: headers });
  });

  // Pre-warm DNS for top sites immediately on startup
  prewarmDNS();

  ipcMain.handle('app:version', () => {
    const { app } = require('electron');
    try {
      // app.getVersion() always works — reads from package.json at build time
      const v = app.getVersion();
      if (v && v !== '0.0.0') return v;
    } catch (_) {}
    try {
      return require('../../package.json').version;
    } catch {
      return '1.0.1';
    }
  });

  ipcMain.handle('app:webviewPreload', () => {
    const { app } = require('electron');
    const appPath = app.getAppPath();
    // In packaged app, try asar.unpacked first (preload must be a real file, not inside asar)
    const unpackedPath = path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'src/renderer/js/webviewPreload.js');
    const normalPath = path.join(__dirname, '../renderer/js/webviewPreload.js');
    const fs = require('fs');
    return fs.existsSync(unpackedPath) ? unpackedPath : normalPath;
  });

  ipcMain.handle('app:downloadsPage', () => path.join(__dirname, '../renderer/downloads.html'));
  ipcMain.handle('app:settingsPage',  () => path.join(__dirname, '../renderer/settings.html'));
  ipcMain.handle('app:bookmarksPage', () => path.join(__dirname, '../renderer/bookmarks.html'));
  ipcMain.handle('app:historyPage',   () => path.join(__dirname, '../renderer/history.html'));
  ipcMain.handle('app:newtabPage',    () => path.join(__dirname, '../renderer/newtab.html'));

  ipcMain.on('shell:openExternal', (_e, url) => { shell.openExternal(url); });

  // ── DevHub: trigger a data-URI download through the normal download pipeline ──
  ipcMain.on('devhub:download', (e, { dataUrl, filename }) => {
    const win = _getWin(e);
    if (!win) return;
    const fs   = require('fs');
    const os   = require('os');
    const path = require('path');
    try {
      const base64  = dataUrl.split(',')[1];
      const buf     = Buffer.from(base64, 'base64');
      // Use a safe temp filename (no spaces, no special chars)
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const tmpPath  = path.join(os.tmpdir(), safeName);
      fs.writeFileSync(tmpPath, buf);
      // Windows needs forward slashes and triple-slash for file:// URLs
      const fileUrl = 'file:///' + tmpPath.replace(/\\/g, '/');
      win.webContents.downloadURL(fileUrl);
    } catch(err) {
      console.error('devhub:download error:', err.message);
    }
  });

  ipcMain.on('app:relaunch', () => {
    const { app } = require('electron');
    app.relaunch();
    app.exit(0);
  });

  ipcMain.on('browser:clearData', (_e) => {
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData({ storages: ['cookies','localstorage','indexdb','websql','serviceworkers','cachestorage'] });
  });

  ipcMain.handle('file:exists', (_e, filePath) => {
    try {
      const fs = require('fs');
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  });

  ipcMain.on('settings:pickDownloadFolder', async (e) => {
    const { dialog } = require('electron');
    const win = _getWin(e);
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    if (!result.canceled && result.filePaths[0]) {
      e.sender.send('settings:downloadFolder', result.filePaths[0]);
    }
  });

  ipcMain.on('window:minimize', (e) => {
    const win = _getWin(e);
    if (win) win.minimize();
  });

  ipcMain.on('window:maximize', (e) => {
    const win = _getWin(e);
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('window:close', (e) => {
    const win = _getWin(e);
    if (win) win.close();
  });

  ipcMain.on('window:fullscreen', (e) => {
    const win = _getWin(e);
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.on('window:new', () => {
    const { createMainWindow } = require('./windowManager');
    createMainWindow();
  });

  ipcMain.on('window:incognito', () => {
    const { createIncognitoWindow } = require('./windowManager');
    createIncognitoWindow();
  });

  // Cancel a download
  ipcMain.on('download:cancel', (_e, id) => {
    const dl = activeDownloads.get(id);
    if (dl) dl.item.cancel();
  });

  // Open downloaded file
  ipcMain.on('download:openFile', (_e, filePath) => {
    shell.openPath(filePath);
  });

  // Show file in folder
  ipcMain.on('download:openFolder', (_e, filePath) => {
    shell.showItemInFolder(filePath);
  });

  // Remove a completed/cancelled download from the list
  ipcMain.on('download:remove', (_e, id) => {
    activeDownloads.delete(id);
    pushToRenderer('download:removed', id);
  });

  // ── Download tracking ──────────────────────────────────────────────────────
  // ── Download settings cache (updated when settings change) ──────────────
  let _dlSettings = { downloadFolder: '', askdl: false, opendl: false };

  function _refreshDlSettings() {
    try {
      const { readFile } = require('./storage');
      const s = readFile('settings') || {};
      _dlSettings = {
        downloadFolder: s.downloadFolder || '',
        askdl:  s.askdl  === true,
        opendl: s.opendl === true,
      };
    } catch {}
  }

  // Load on startup
  _refreshDlSettings();

  // Refresh when settings change (via settings:changed IPC or storage:write)
  ipcMain.on('settings:changed', (_e, s) => {
    if (s && (s.downloadFolder !== undefined || s.askdl !== undefined || s.opendl !== undefined)) {
      _refreshDlSettings();
    }
  });

  // Override storage:write to refresh dl settings when settings.json is saved
  ipcMain.removeHandler('storage:write');
  ipcMain.handle('storage:write', (_e, name, data) => {
    const { writeFile } = require('./storage');
    const result = writeFile(name, data);
    if (name === 'settings') _refreshDlSettings();
    return result;
  });

  session.defaultSession.on('will-download', async (_e, item) => {
    const id = ++dlIdCounter;
    const startTime = Date.now();
    let lastBytes = 0;
    let lastTime = startTime;
    let speedHistory = [];

    // Use cached settings
    const { downloadFolder: dlFolder, askdl: askDl, opendl: openDl } = _dlSettings;

    const filename = item.getFilename();

    if (askDl) {
      // Show save dialog
      const { dialog } = require('electron');
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      const defaultPath = dlFolder
        ? require('path').join(dlFolder, filename)
        : require('path').join(require('os').homedir(), 'Downloads', filename);

      const result = await dialog.showSaveDialog(win, {
        title: 'Save File',
        defaultPath,
        buttonLabel: 'Download',
      });

      if (result.canceled || !result.filePath) {
        item.cancel();
        return;
      }
      item.setSavePath(result.filePath);
    } else if (dlFolder) {
      // Save directly to selected folder
      const path = require('path');
      const fs   = require('fs');
      if (!fs.existsSync(dlFolder)) {
        try { fs.mkdirSync(dlFolder, { recursive: true }); } catch {}
      }
      item.setSavePath(path.join(dlFolder, filename));
    }
    // else — Electron uses default Downloads folder

    const dl = {
      id,
      filename,
      savePath: '',
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      speed: 0,
      percent: 0,
      status: 'progressing',
      startTime,
      item,
    };

    activeDownloads.set(id, { item, startTime, lastBytes, lastTime });

    // Notify renderer: new download started
    pushToRenderer('download:start', {
      id,
      filename: dl.filename,
      totalBytes: dl.totalBytes,
      totalFormatted: formatBytes(dl.totalBytes),
      status: 'progressing',
    });

    // Update badge count
    pushToRenderer('downloads:badge', activeDownloads.size);

    item.on('updated', (_e, state) => {
      const now = Date.now();
      const received = item.getReceivedBytes();
      const total = item.getTotalBytes();
      const elapsed = (now - lastTime) / 1000;

      let speed = 0;
      if (elapsed > 0) {
        speed = (received - lastBytes) / elapsed;
        speedHistory.push(speed);
        if (speedHistory.length > 5) speedHistory.shift();
        speed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
      }

      lastBytes = received;
      lastTime = now;

      const percent = total > 0 ? Math.round((received / total) * 100) : 0;

      pushToRenderer('download:update', {
        id,
        status: state === 'interrupted' ? 'waiting' : 'progressing',
        receivedBytes: received,
        receivedFormatted: formatBytes(received),
        totalBytes: total,
        totalFormatted: formatBytes(total),
        speed: formatBytes(Math.round(speed)) + '/s',
        percent,
      });
    });

    item.once('done', (_e, state) => {
      const savePath = item.getSavePath();
      activeDownloads.delete(id);

      pushToRenderer('download:done', {
        id,
        status: state,
        savePath,
        filename: item.getFilename(),
      });

      // Auto-open file if setting enabled
      if (state === 'completed' && openDl && savePath) {
        const { shell } = require('electron');
        shell.openPath(savePath).catch(() => {});
      }

      const inProgress = [...activeDownloads.values()].length;
      pushToRenderer('downloads:badge', inProgress);
    });
  });

  // Capture screenshot of a webview by its webContentsId
  ipcMain.handle('tab:capture', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      const img = await wc.capturePage();
      const resized = img.resize({ width: 320, height: 200 });
      return resized.toDataURL();
    } catch {
      return null;
    }
  });

  // Full screenshot — returns full-res dataURL (visible area)
  ipcMain.handle('screenshot:capture', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      const img = await wc.capturePage();
      return img.toDataURL();
    } catch {
      return null;
    }
  });

  // Full page screenshot — scrolls and stitches (uses executeJavaScript to get full height)
  ipcMain.handle('screenshot:captureFull', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;

      // Get full page dimensions
      const dims = await wc.executeJavaScript(
        '({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight })'
      );

      // Clamp to reasonable max (16384px) to avoid memory issues
      const fullW = Math.min(dims.w, 16384);
      const fullH = Math.min(dims.h, 16384);

      // Temporarily resize webContents to full page height
      const origSize = wc.getOwnerBrowserWindow()?.getContentSize() || [1280, 800];
      await wc.enableDeviceEmulation({
        screenPosition: 'desktop',
        screenSize: { width: fullW, height: fullH },
        viewSize: { width: fullW, height: fullH },
        viewPosition: { x: 0, y: 0 },
        deviceScaleFactor: 1,
      });

      // Small delay for reflow
      await new Promise(r => setTimeout(r, 300));

      const img = await wc.capturePage({ x: 0, y: 0, width: fullW, height: fullH });
      wc.disableDeviceEmulation();

      return img.toDataURL();
    } catch (err) {
      // Fallback to visible area
      try {
        const wc = webContents.fromId(wcId);
        if (!wc) return null;
        const img = await wc.capturePage();
        return img.toDataURL();
      } catch { return null; }
    }
  });

  // Save screenshot to disk via save dialog
  ipcMain.handle('screenshot:save', async (_e, dataURL, defaultName) => {
    const { dialog } = require('electron');
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win, {
      title: 'Save Screenshot',
      defaultPath: defaultName || `screenshot-${Date.now()}.png`,
      filters: [{ name: 'PNG Image', extensions: ['png'] }],
    });
    if (result.canceled || !result.filePath) return null;
    const fs = require('fs');
    const base64 = dataURL.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(result.filePath, Buffer.from(base64, 'base64'));
    return result.filePath;
  });

  // Set zoom factor on a webview's webContents
  ipcMain.handle('webview:setZoom', (_e, wcId, factor) => {
    try {
      const wc = webContents.fromId(wcId);
      if (wc) wc.setZoomFactor(factor);
    } catch (_) {}
  });

  // Set spellcheck languages on default session
  ipcMain.on('spellcheck:setLanguage', (_e, langCode) => {
    try {
      session.defaultSession.setSpellCheckerLanguages([langCode]);
    } catch (_) {}
  });

  // ── Cookie Manager ────────────────────────────────────────────────────────
  ipcMain.handle('cookies:getAll', async () => {
    try { return await session.defaultSession.cookies.get({}); }
    catch(e) { return []; }
  });

  ipcMain.handle('cookies:getForDomain', async (_e, domain) => {
    try { return await session.defaultSession.cookies.get({ domain }); }
    catch(e) { return []; }
  });

  ipcMain.handle('cookies:delete', async (_e, url, name) => {
    try { await session.defaultSession.cookies.remove(url, name); return true; }
    catch(e) { return false; }
  });

  ipcMain.handle('cookies:deleteAll', async () => {
    try {
      const all = await session.defaultSession.cookies.get({});
      for (const c of all) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return all.length;
    } catch(e) { return 0; }
  });

  ipcMain.handle('cookies:deleteForDomain', async (_e, domain) => {
    try {
      const all = await session.defaultSession.cookies.get({ domain });
      for (const c of all) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return all.length;
    } catch(e) { return 0; }
  });

  ipcMain.handle('cookies:deleteExpired', async () => {
    try {
      const now  = Date.now() / 1000;
      const all  = await session.defaultSession.cookies.get({});
      const exp  = all.filter(c => c.expirationDate && c.expirationDate < now);
      for (const c of exp) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return exp.length;
    } catch(e) { return 0; }
  });

  ipcMain.handle('cookies:set', async (_e, cookieDetails) => {
    try { await session.defaultSession.cookies.set(cookieDetails); return true; }
    catch(e) { return false; }
  });

  ipcMain.handle('cookies:getStats', async () => {
    try {
      const all = await session.defaultSession.cookies.get({});
      const now = Date.now() / 1000;
      const domains = [...new Set(all.map(c => c.domain.replace(/^\./, '')))];
      const expired = all.filter(c => c.expirationDate && c.expirationDate < now);
      const session_ = all.filter(c => !c.expirationDate);
      const secure   = all.filter(c => c.secure);
      const httpOnly = all.filter(c => c.httpOnly);
      return { total: all.length, domains: domains.length, expired: expired.length, session: session_.length, secure: secure.length, httpOnly: httpOnly.length };
    } catch(e) { return {}; }
  });

  // Mute/unmute a webview's audio by webContentsId
  ipcMain.handle('tab:setMuted', (_e, wcId, muted) => {
    try {
      const wc = webContents.fromId(wcId);
      if (wc) wc.setAudioMuted(muted);
      return true;
    } catch (_) { return false; }
  });

  // Check if a webview is currently playing audio
  ipcMain.handle('tab:isAudible', (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      return wc ? wc.isCurrentlyAudible() : false;
    } catch (_) { return false; }
  });

  // Trigger PiP via main process with userGesture:true (renderer can't do this)
  ipcMain.handle('pip:trigger', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return false;
      const script = `
        (function() {
          // Find playing video
          var v = Array.from(document.querySelectorAll('video')).find(function(v) {
            return !v.paused && !v.ended && v.readyState > 2;
          }) || document.querySelector('video');
          if (!v) return false;
          if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(function(){});
            return true;
          }
          // Remove YouTube's PiP block
          v.removeAttribute('disablePictureInPicture');
          try {
            Object.defineProperty(v, 'disablePictureInPicture', {
              get: function() { return false; }, configurable: true
            });
          } catch(_) {}
          return v.requestPictureInPicture().then(function() { return true; }).catch(function() {
            // YouTube fallback: click their native PiP button
            var ytBtn = document.querySelector('.ytp-pip-button');
            if (ytBtn) { ytBtn.click(); return true; }
            return false;
          });
        })();
      `;
      return await wc.executeJavaScript(script, true); // true = userGesture
    } catch (_) { return false; }
  });

  // Get memory usage for a webContents by id
  ipcMain.handle('tab:memoryUsage', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      const info = await wc.getProcessMemoryInfo();
      // privateBytes = private memory in KB, convert to MB
      return info.privateBytes || info.workingSetSize || 0;
    } catch (_) { return null; }
  });

  // ── Blocklist Engine ──────────────────────────────────────────────────────
  const BlocklistEngine = require('./blocklist/engine');
  BlocklistEngine.registerHandlers();

  // ── Proxy + Tor ───────────────────────────────────────────────────────────
  const { registerProxyHandlers } = require('./proxy/ipcHandlers');
  registerProxyHandlers(pushToRenderer);

  // ── Default Browser ───────────────────────────────────────────────────────
  ipcMain.handle('browser:isDefault', () => {
    try {
      return app.isDefaultProtocolClient('https');
    } catch { return false; }
  });

  ipcMain.on('browser:setDefault', () => {
    try {
      // Open Windows Default Apps settings
      const { shell } = require('electron');
      shell.openExternal('ms-settings:defaultapps');
    } catch {}
  });

  // ── Favicon Cache ─────────────────────────────────────────────────────────
  const _favCachePath = () => {
    const { app } = require('electron');
    return require('path').join(app.getPath('userData'), 'vortex', 'storage', 'favicon-cache.json');
  };

  let _favCache = null;
  const FAV_MAX = 500;

  function _loadFavCache() {
    if (_favCache) return _favCache;
    try {
      const fs = require('fs');
      const f = _favCachePath();
      if (fs.existsSync(f)) _favCache = JSON.parse(fs.readFileSync(f, 'utf8'));
      else _favCache = {};
    } catch { _favCache = {}; }
    return _favCache;
  }

  function _saveFavCache() {
    try {
      const fs = require('fs');
      const f = _favCachePath();
      const dir = require('path').dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      // Trim to max entries (keep newest)
      const entries = Object.entries(_favCache);
      if (entries.length > FAV_MAX) {
        entries.sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
        _favCache = Object.fromEntries(entries.slice(0, FAV_MAX));
      }
      fs.writeFileSync(f, JSON.stringify(_favCache));
    } catch {}
  }

  ipcMain.handle('favicon-cache:get', (_e, domain) => {
    const cache = _loadFavCache();
    return cache[domain] || null;
  });

  ipcMain.handle('favicon-cache:set', (_e, domain, data) => {
    const cache = _loadFavCache();
    cache[domain] = { ...data, ts: Date.now() };
    _saveFavCache();
    return true;
  });

  ipcMain.handle('favicon-cache:getAll', () => _loadFavCache());

  // ── Password Manager ──────────────────────────────────────────────────────
  const _pwPath = () => {
    const { app } = require('electron');
    return require('path').join(app.getPath('userData'), 'vortex', 'storage', 'passwords.json');
  };

  const _pwImportedPath = () => {
    const { app } = require('electron');
    return require('path').join(app.getPath('userData'), 'vortex', 'storage', 'passwords_imported.json');
  };

  function _readJson(filePath) {
    try {
      const fs = require('fs');
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch { return null; }
  }

  function _writeJson(filePath, data) {
    try {
      const fs = require('fs');
      const dir = require('path').dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch { return false; }
  }

  ipcMain.handle('passwords:read', () => _readJson(_pwPath()));
  ipcMain.handle('passwords:write', (_e, data) => _writeJson(_pwPath(), data));

  // Imported passwords — plain JSON array (not encrypted)
  ipcMain.handle('passwords:readImported', () => _readJson(_pwImportedPath()) || []);
  ipcMain.handle('passwords:writeImported', (_e, data) => _writeJson(_pwImportedPath(), data));


  // Addresses
  const _addrPath = () => {
    const { app } = require('electron');
    return require('path').join(app.getPath('userData'), 'vortex', 'storage', 'addresses.json');
  };
  ipcMain.handle('addresses:read',  () => _readJson(_addrPath()) || []);
  ipcMain.handle('addresses:write', (_e, data) => _writeJson(_addrPath(), data));

  // ── Site Permissions ──────────────────────────────────────────────────────
  const _permPath = () => {
    const { app } = require('electron');
    return require('path').join(app.getPath('userData'), 'vortex', 'storage', 'permissions.json');
  };

  function _readPermFile() {
    try {
      const fs = require('fs');
      const f = _permPath();
      if (!fs.existsSync(f)) return {};
      return JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch { return {}; }
  }

  function _writePermFile(data) {
    try {
      const fs = require('fs');
      const f = _permPath();
      const dir = require('path').dirname(f);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(f, JSON.stringify(data, null, 2));
    } catch {}
  }

  ipcMain.handle('permissions:getAll', () => _readPermFile());

  ipcMain.handle('permissions:saveAll', (_e, data) => {
    _writePermFile(data);
    _applyPermissions(data);
    return true;
  });

  function _applyPermissions(permData) {
    const ELECTRON_TO_ID = {
      'media': null, 'notifications': 'notifications',
      'geolocation': 'geolocation', 'clipboard-read': 'clipboard-read',
      'midi': 'midi', 'midiSysex': 'midi',
    };

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
      try {
        const url = webContents.getURL();
        if (!url || url === 'about:blank' || url.startsWith('file://') || url.startsWith('vortex-app://')) {
          callback(true); return;
        }

        let domain = '';
        try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { callback(true); return; }

        const stored = permData[domain] || {};

        if (permission === 'media') {
          const wantsCam = details?.mediaTypes?.includes('video');
          const wantsMic = details?.mediaTypes?.includes('audio');
          const camStatus = wantsCam ? (stored['camera'] || 'ask') : 'ask';
          const micStatus = wantsMic ? (stored['microphone'] || 'ask') : 'ask';
          if (camStatus === 'denied' || micStatus === 'denied') { callback(false); return; }
          if (camStatus === 'granted' && micStatus === 'granted') { callback(true); return; }
          // ask → show prompt only if domain is known, else allow
          if (domain) {
            _sendPermissionRequest(webContents, domain, permission, details, callback, permData);
          } else {
            callback(true);
          }
          return;
        }

        const ourId = ELECTRON_TO_ID[permission] || permission;
        const status = stored[ourId] || 'ask';
        if (status === 'denied')  { callback(false); return; }
        if (status === 'granted') { callback(true);  return; }
        // ask → show prompt only for sensitive permissions, allow rest
        const SENSITIVE = ['media', 'geolocation', 'notifications'];
        if (SENSITIVE.includes(permission)) {
          _sendPermissionRequest(webContents, domain, permission, details, callback, permData);
        } else {
          callback(true); // non-sensitive — allow by default
        }
      } catch { callback(true); } // on any error — allow, don't block
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
      try {
        if (!requestingOrigin) return true;
        const domain = new URL(requestingOrigin).hostname.replace(/^www\./, '');
        const stored = permData[domain] || {};
        if (permission === 'media') {
          const wantsCam = details?.mediaType === 'video';
          const wantsMic = details?.mediaType === 'audio';
          if (wantsCam) return (stored['camera'] || 'ask') !== 'denied';
          if (wantsMic) return (stored['microphone'] || 'ask') !== 'denied';
          return true;
        }
        const MAP = { 'notifications':'notifications','geolocation':'geolocation','clipboard-read':'clipboard-read','midi':'midi','midiSysex':'midi' };
        const ourId = MAP[permission] || permission;
        // Only block if explicitly denied — allow everything else
        return (stored[ourId] || 'ask') !== 'denied';
      } catch { return true; } // on parse error, allow
    });
  }

  function _sendPermissionRequest(webContents, domain, permission, details, callback, permData) {
    const PERM_LABELS = {
      'media':'Camera / Microphone','notifications':'Notifications',
      'geolocation':'Location','clipboard-read':'Clipboard Read',
      'midi':'MIDI','midiSysex':'MIDI SysEx',
    };
    const win = BrowserWindow.getAllWindows().find(w => {
      try { return !w.isDestroyed() && w.webContents.id !== webContents.id; } catch { return false; }
    }) || BrowserWindow.getFocusedWindow();
    if (!win || win.isDestroyed()) { callback(true); return; } // allow if no window found

    let permIds = [];
    if (permission === 'media') {
      if (details?.mediaTypes?.includes('video')) permIds.push('camera');
      if (details?.mediaTypes?.includes('audio')) permIds.push('microphone');
    } else {
      const MAP = {'notifications':'notifications','geolocation':'geolocation','clipboard-read':'clipboard-read','midi':'midi','midiSysex':'midi'};
      if (MAP[permission]) permIds.push(MAP[permission]);
    }

    win.webContents.send('permission:request', {
      domain, permission, label: PERM_LABELS[permission] || permission, permIds,
    });

    const responseChannel = `permission:response:${domain}:${permission}`;
    ipcMain.once(responseChannel, (_e, granted) => {
      if (permIds.length) {
        if (!permData[domain]) permData[domain] = {};
        permIds.forEach(id => { permData[domain][id] = granted ? 'granted' : 'denied'; });
        _writePermFile(permData);
        _applyPermissions(permData);
      }
      callback(granted);
    });
    // Timeout — allow by default so page doesn't hang
    setTimeout(() => { try { ipcMain.removeAllListeners(responseChannel); } catch {} callback(true); }, 30000);
  }

  // Apply on startup
  _applyPermissions(_readPermFile());

  // ── GitHub Updater ────────────────────────────────────────────────────────
  const GITHUB_REPO = 'RupamSatyaki/VORTEX-Browser';
  const GITHUB_BRANCH = 'main';

  // Shared HTTPS fetch helper for GitHub API
  function _ghFetch(urlPath) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const options = {
        hostname: 'api.github.com',
        path: urlPath,
        headers: {
          'User-Agent': 'Vortex-Browser-Updater',
          'Accept': 'application/vnd.github.v3+json',
        },
      };
      const req = https.get(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
        });
      });
      req.on('error', reject);
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timed out')); });
    });
  }

  // Fetch all releases from GitHub
  ipcMain.handle('updater:fetchAllReleases', async () => {
    try {
      const data = await _ghFetch(`/repos/${GITHUB_REPO}/releases?per_page=20`);
      if (!Array.isArray(data)) return { error: data.message || 'API error' };
      return data.map(r => ({
        tag:         r.tag_name || '',
        name:        r.name || r.tag_name || '',
        body:        r.body || '',
        publishedAt: r.published_at || '',
        htmlUrl:     r.html_url || '',
        prerelease:  r.prerelease || false,
        asset: (() => {
          const a = (r.assets || []).find(a =>
            a.name.toLowerCase().endsWith('.exe') ||
            a.name.toLowerCase().includes('setup') ||
            a.name.toLowerCase().includes('install')
          );
          return a ? { name: a.name, downloadUrl: a.browser_download_url, size: a.size } : null;
        })(),
      }));
    } catch (err) {
      return { error: err.message };
    }
  });

  // Trigger .exe download through the normal download pipeline
  ipcMain.handle('updater:downloadExe', (_e, downloadUrl) => {
    try {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (!win || win.isDestroyed()) return false;
      win.webContents.downloadURL(downloadUrl);
      return true;
    } catch { return false; }
  });

  // Download .exe to temp folder, run installer, quit app
  ipcMain.handle('updater:installRelease', async (_e, downloadUrl, tag) => {
    try {
      const https  = require('https');
      const fs     = require('fs');
      const os     = require('os');
      const path   = require('path');
      const { app, shell } = require('electron');

      const safeName = `Vortex-Setup-${tag.replace(/^v/, '')}-${Date.now()}.exe`;
      const destPath = path.join(os.tmpdir(), safeName);

      // Delete any old setup files to avoid conflicts
      try {
        const tmpFiles = fs.readdirSync(os.tmpdir());
        tmpFiles.filter(f => f.startsWith('Vortex-Setup-') && f.endsWith('.exe')).forEach(f => {
          try { fs.unlinkSync(path.join(os.tmpdir(), f)); } catch (_) {}
        });
      } catch (_) {}

      // Helper: follow redirects and download
      function downloadFile(url, dest) {
        return new Promise((resolve, reject) => {
          function doGet(u) {
            const mod = u.startsWith('https') ? require('https') : require('http');
            const req = mod.get(u, { headers: { 'User-Agent': 'Vortex-Browser-Updater' } }, (res) => {
              // Follow redirects (GitHub releases redirect to CDN)
              if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return doGet(res.headers.location);
              }
              if (res.statusCode !== 200) {
                return reject(new Error('HTTP ' + res.statusCode));
              }
              const total = parseInt(res.headers['content-length'] || '0', 10);
              let received = 0;
              const file = fs.createWriteStream(dest);
              res.on('data', chunk => {
                received += chunk.length;
                file.write(chunk);
                // Send progress to renderer
                const pct = total > 0 ? Math.round((received / total) * 100) : 0;
                pushToRenderer('updater:installProgress', {
                  received, total, pct,
                  receivedMB: (received / 1048576).toFixed(1),
                  totalMB:    (total    / 1048576).toFixed(1),
                });
              });
              res.on('end', () => {
                file.end();
                file.once('finish', () => resolve({ received, total }));
              });
              res.on('error', reject);
              file.on('error', reject);
            });
            req.on('error', reject);
            req.setTimeout(60000, () => { req.destroy(); reject(new Error('Download timed out')); });
          }
          doGet(url);
        });
      }

      // Start download
      pushToRenderer('updater:installProgress', { received: 0, total: 0, pct: 0, receivedMB: '0', totalMB: '?' });
      await downloadFile(downloadUrl, destPath);

      // Run installer
      pushToRenderer('updater:installProgress', { pct: 100, done: true });
      await new Promise(r => setTimeout(r, 1000));
      const openErr = await shell.openPath(destPath);
      if (openErr) return { success: false, error: 'Could not launch installer: ' + openErr };

      // Give installer time to start, then force exit
      setTimeout(() => {
        app.exit(0);
      }, 2500);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Delete applied commits folder (reset to bundled version)
  ipcMain.handle('updater:deleteApplied', async () => {
    try {
      const fs = require('fs');
      const { app } = require('electron');
      const overrideRoot = require('path').join(app.getPath('userData'), 'vortex-update');
      if (fs.existsSync(overrideRoot)) {
        fs.rmSync(overrideRoot, { recursive: true, force: true });
        return { success: true };
      }
      return { success: true, note: 'No applied commits found' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Fetch commits list from GitHub API
  ipcMain.handle('updater:fetchCommits', async () => {
    try {
      const https = require('https');
      const data = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.github.com',
          path: `/repos/${GITHUB_REPO}/commits?per_page=30&sha=${GITHUB_BRANCH}`,
          headers: { 'User-Agent': 'Vortex-Browser-Updater' },
        };
        const req = https.get(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(e); }
          });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (!Array.isArray(data)) return { error: data.message || 'API error' };
      return data.map(c => ({
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author.name,
        date: c.commit.author.date,
      }));
    } catch (err) {
      return { error: err.message };
    }
  });

  // Apply a specific commit — download ALL renderer+main files from that commit snapshot
  ipcMain.handle('updater:applyCommit', async (_e, sha) => {
    try {
      const https = require('https');
      const fs = require('fs');
      const path = require('path');
      const { app } = require('electron');

      // Override folder: userData/vortex-update/
      const overrideRoot = path.join(app.getPath('userData'), 'vortex-update');
      if (!fs.existsSync(overrideRoot)) fs.mkdirSync(overrideRoot, { recursive: true });

      // Helper: fetch a URL and return Buffer
      function fetchUrl(hostname, urlPath) {
        return new Promise((resolve, reject) => {
          const options = { hostname, path: urlPath, headers: { 'User-Agent': 'Vortex-Browser-Updater' } };
          const req = https.get(options, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              const loc = new URL(res.headers.location);
              return resolve(fetchUrl(loc.hostname, loc.pathname + (loc.search || '')));
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
          });
          req.on('error', reject);
          req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
        });
      }

      // Get tree of all files at this commit
      const treeData = JSON.parse((await fetchUrl(
        'api.github.com',
        `/repos/${GITHUB_REPO}/git/trees/${sha}?recursive=1`
      )).toString());

      if (!treeData.tree) return { success: false, error: treeData.message || 'Could not get file tree' };

      // Filter only source files (exclude node_modules, dist, package-lock)
      const filesToDownload = treeData.tree.filter(item =>
        item.type === 'blob' &&
        !item.path.includes('node_modules/') &&
        !item.path.includes('dist/') &&
        item.path !== 'package-lock.json'
      );

      const updated = [];

      for (const item of filesToDownload) {
        const rawContent = await fetchUrl(
          'raw.githubusercontent.com',
          `/${GITHUB_REPO}/${sha}/${item.path}`
        );

        // Repo root = app root (no vortex/ prefix in repo)
        const relPath = item.path;
        const destPath = path.join(overrideRoot, relPath);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destPath, rawContent);
        updated.push(item.path);
      }

      // Save applied sha
      fs.writeFileSync(path.join(overrideRoot, '.applied-sha'), sha);

      return { success: true, updated, skipped: [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Get current sha — check override folder first, then .git (dev mode)
  ipcMain.handle('updater:localSha', async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const { app } = require('electron');

      // 1. Check userData override folder for applied sha
      const appliedShaPath = path.join(app.getPath('userData'), 'vortex-update', '.applied-sha');
      if (fs.existsSync(appliedShaPath)) {
        return { sha: fs.readFileSync(appliedShaPath, 'utf8').trim(), source: 'update' };
      }

      // 2. Check package.json buildSha (set at build time)
      try {
        const pkg = require('../../package.json');
        if (pkg.buildSha) return { sha: pkg.buildSha, source: 'build' };
      } catch (_) {}

      // 3. Dev mode — read from .git
      const appRoot = app.getAppPath();
      const gitHead = path.join(appRoot, '.git', 'HEAD');
      if (!fs.existsSync(gitHead)) return null;
      const head = fs.readFileSync(gitHead, 'utf8').trim();
      if (head.startsWith('ref: ')) {
        const refPath = path.join(appRoot, '.git', head.replace('ref: ', ''));
        if (fs.existsSync(refPath)) return { sha: fs.readFileSync(refPath, 'utf8').trim(), source: 'git' };
      }
      return { sha: head, source: 'git' };
    } catch { return null; }
  });
}

module.exports = { registerHandlers };
