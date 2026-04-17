/**
 * main/ipc/appHandlers.js
 * app:version, app:*Page, app:relaunch, shell:openExternal, devhub:download
 */

const { ipcMain, shell, BrowserWindow } = require('electron');
const path = require('path');

function register(_getWin) {
  ipcMain.handle('app:version', () => {
    const { app } = require('electron');
    try { const v = app.getVersion(); if (v && v !== '0.0.0') return v; } catch (_) {}
    try { return require('../../../package.json').version; } catch { return '1.0.1'; }
  });

  ipcMain.handle('app:webviewPreload', () => {
    const { app } = require('electron');
    const appPath = app.getAppPath();
    const fs = require('fs');
    const unpackedPath = path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'src/renderer/js/webviewPreload.js');
    const normalPath   = path.join(__dirname, '../../renderer/js/webviewPreload.js');
    return fs.existsSync(unpackedPath) ? unpackedPath : normalPath;
  });

  ipcMain.handle('app:downloadsPage', () => path.join(__dirname, '../../renderer/downloads.html'));
  ipcMain.handle('app:settingsPage',  () => path.join(__dirname, '../../renderer/settings.html'));
  ipcMain.handle('app:bookmarksPage', () => path.join(__dirname, '../../renderer/bookmarks.html'));
  ipcMain.handle('app:historyPage',   () => path.join(__dirname, '../../renderer/history.html'));
  ipcMain.handle('app:newtabPage',    () => path.join(__dirname, '../../renderer/newtab.html'));

  ipcMain.on('shell:openExternal', (_e, url) => { shell.openExternal(url); });

  ipcMain.on('app:relaunch', () => {
    const { app } = require('electron');
    app.relaunch();
    app.exit(0);
  });

  ipcMain.on('devhub:download', (e, { dataUrl, filename }) => {
    const win = _getWin(e);
    if (!win) return;
    const fs   = require('fs');
    const os   = require('os');
    try {
      const base64   = dataUrl.split(',')[1];
      const buf      = Buffer.from(base64, 'base64');
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const tmpPath  = path.join(os.tmpdir(), safeName);
      fs.writeFileSync(tmpPath, buf);
      win.webContents.downloadURL('file:///' + tmpPath.replace(/\\/g, '/'));
    } catch(err) { console.error('devhub:download error:', err.message); }
  });
}

module.exports = { register };
