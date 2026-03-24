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
  session.defaultSession.on('will-download', (_e, item) => {
    const id = ++dlIdCounter;
    const startTime = Date.now();
    let lastBytes = 0;
    let lastTime = startTime;
    let speedHistory = [];

    const dl = {
      id,
      filename: item.getFilename(),
      savePath: '',
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      speed: 0,
      percent: 0,
      status: 'progressing', // progressing | completed | cancelled | interrupted | waiting
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
        status: state, // 'completed' | 'cancelled' | 'interrupted'
        savePath,
        filename: item.getFilename(),
      });

      // Update badge
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

  // ── GitHub Updater ────────────────────────────────────────────────────────
  const GITHUB_REPO = 'RupamSatyaki/VORTEX-Browser';
  const GITHUB_BRANCH = 'main';

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
