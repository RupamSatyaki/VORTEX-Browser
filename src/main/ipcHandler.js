const { ipcMain, BrowserWindow, webContents, session, shell } = require('electron');
const path = require('path');

// Active downloads map: id -> { item, startTime, lastBytes, lastTime }
const activeDownloads = new Map();
let dlIdCounter = 0;

function pushToRenderer(channel, data) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(channel, data);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function registerHandlers() {
  ipcMain.handle('app:version', () => require('../../package.json').version);

  ipcMain.handle('app:webviewPreload', () =>
    path.join(__dirname, '../renderer/js/webviewPreload.js')
  );

  ipcMain.handle('app:downloadsPage', () =>
    path.join(__dirname, '../renderer/downloads.html')
  );

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
}

module.exports = { registerHandlers };
