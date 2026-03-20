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

  // Aggressive cache — serve from cache even if stale, revalidate in background
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const headers = details.requestHeaders;
    // Hint to servers we accept cached responses
    if (!headers['Cache-Control']) headers['Cache-Control'] = 'max-stale=3600';
    callback({ requestHeaders: headers });
  });

  // Pre-warm DNS for top sites immediately on startup
  prewarmDNS();

  ipcMain.handle('app:version', () => require('../../package.json').version);

  ipcMain.handle('app:webviewPreload', () =>
    path.join(__dirname, '../renderer/js/webviewPreload.js')
  );

  ipcMain.handle('app:downloadsPage', () =>
    path.join(__dirname, '../renderer/downloads.html')
  );

  ipcMain.handle('app:settingsPage', () =>
    path.join(__dirname, '../renderer/settings.html')
  );

  ipcMain.handle('app:bookmarksPage', () =>
    path.join(__dirname, '../renderer/bookmarks.html')
  );

  ipcMain.handle('app:historyPage', () =>
    path.join(__dirname, '../renderer/history.html')
  );

  ipcMain.on('shell:openExternal', (_e, url) => { shell.openExternal(url); });

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
    const win = BrowserWindow.fromWebContents(e.sender);
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    if (!result.canceled && result.filePaths[0]) {
      e.sender.send('settings:downloadFolder', result.filePaths[0]);
    }
  });

  ipcMain.on('window:minimize', (e) => {
    BrowserWindow.fromWebContents(e.sender).minimize();
  });

  ipcMain.on('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('window:close', (e) => {
    BrowserWindow.fromWebContents(e.sender).close();
  });

  ipcMain.on('window:fullscreen', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.on('window:new', () => {
    const { createMainWindow } = require('./windowManager');
    createMainWindow();
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

  // Set zoom factor on a webview's webContents
  ipcMain.handle('webview:setZoom', (_e, wcId, factor) => {
    try {
      const wc = webContents.fromId(wcId);
      if (wc) wc.setZoomFactor(factor);
    } catch (_) {}
  });
}

module.exports = { registerHandlers };
