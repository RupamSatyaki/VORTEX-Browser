/**
 * main/ipc/downloadHandlers.js
 * will-download session event + download:cancel/remove/openFile/openFolder
 */

const { ipcMain, session, BrowserWindow, shell } = require('electron');

const activeDownloads = new Map();
let dlIdCounter = 0;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

let _dlSettings = { downloadFolder: '', askdl: false, opendl: false };

function refreshDlSettings() {
  try {
    const { readFile } = require('../storage');
    const s = readFile('settings') || {};
    _dlSettings = { downloadFolder: s.downloadFolder || '', askdl: s.askdl === true, opendl: s.opendl === true };
  } catch {}
}

function register(pushToRenderer) {
  refreshDlSettings();

  ipcMain.on('settings:changed', (_e, s) => {
    if (s && (s.downloadFolder !== undefined || s.askdl !== undefined || s.opendl !== undefined)) refreshDlSettings();
  });

  ipcMain.on('download:cancel',     (_e, id)       => { activeDownloads.get(id)?.item.cancel(); });
  ipcMain.on('download:openFile',   (_e, filePath) => { shell.openPath(filePath); });
  ipcMain.on('download:openFolder', (_e, filePath) => { shell.showItemInFolder(filePath); });
  ipcMain.on('download:remove',     (_e, id)       => { activeDownloads.delete(id); pushToRenderer('download:removed', id); });

  session.defaultSession.on('will-download', async (_e, item) => {
    const id = ++dlIdCounter;
    let lastBytes = 0, lastTime = Date.now(), speedHistory = [];
    const { downloadFolder: dlFolder, askdl: askDl, opendl: openDl } = _dlSettings;
    const filename = item.getFilename();

    if (askDl) {
      const { dialog } = require('electron');
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      const defaultPath = dlFolder
        ? require('path').join(dlFolder, filename)
        : require('path').join(require('os').homedir(), 'Downloads', filename);
      const result = await dialog.showSaveDialog(win, { title: 'Save File', defaultPath, buttonLabel: 'Download' });
      if (result.canceled || !result.filePath) { item.cancel(); return; }
      item.setSavePath(result.filePath);
    } else if (dlFolder) {
      const fs = require('fs');
      if (!fs.existsSync(dlFolder)) { try { fs.mkdirSync(dlFolder, { recursive: true }); } catch {} }
      item.setSavePath(require('path').join(dlFolder, filename));
    }

    activeDownloads.set(id, { item, startTime: Date.now(), lastBytes, lastTime });
    pushToRenderer('download:start', { id, filename, totalBytes: item.getTotalBytes(), totalFormatted: formatBytes(item.getTotalBytes()), status: 'progressing' });
    pushToRenderer('downloads:badge', activeDownloads.size);

    item.on('updated', (_e, state) => {
      const now = Date.now(), received = item.getReceivedBytes(), total = item.getTotalBytes();
      const elapsed = (now - lastTime) / 1000;
      let speed = 0;
      if (elapsed > 0) { speed = (received - lastBytes) / elapsed; speedHistory.push(speed); if (speedHistory.length > 5) speedHistory.shift(); speed = speedHistory.reduce((a,b)=>a+b,0)/speedHistory.length; }
      lastBytes = received; lastTime = now;
      pushToRenderer('download:update', { id, status: state === 'interrupted' ? 'waiting' : 'progressing', receivedBytes: received, receivedFormatted: formatBytes(received), totalBytes: total, totalFormatted: formatBytes(total), speed: formatBytes(Math.round(speed)) + '/s', percent: total > 0 ? Math.round((received/total)*100) : 0 });
    });

    item.once('done', (_e, state) => {
      const savePath = item.getSavePath();
      activeDownloads.delete(id);
      pushToRenderer('download:done', { id, status: state, savePath, filename: item.getFilename() });
      if (state === 'completed' && openDl && savePath) shell.openPath(savePath).catch(() => {});
      pushToRenderer('downloads:badge', [...activeDownloads.values()].length);
    });
  });
}

module.exports = { register, activeDownloads, refreshDlSettings };
