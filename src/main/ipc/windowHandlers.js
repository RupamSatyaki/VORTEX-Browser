/**
 * main/ipc/windowHandlers.js
 * window:minimize/maximize/close/fullscreen/new/incognito
 */

const { ipcMain } = require('electron');

function register(_getWin) {
  ipcMain.on('window:minimize',  (e) => { _getWin(e)?.minimize(); });
  ipcMain.on('window:maximize',  (e) => { const w = _getWin(e); if (w) w.isMaximized() ? w.unmaximize() : w.maximize(); });
  ipcMain.on('window:close',     (e) => { _getWin(e)?.close(); });
  ipcMain.on('window:fullscreen',(e) => { const w = _getWin(e); if (w) w.setFullScreen(!w.isFullScreen()); });
  ipcMain.on('window:new',       ()  => { require('../windowManager').createMainWindow(); });
  ipcMain.on('window:incognito', ()  => { require('../windowManager').createIncognitoWindow(); });
}

module.exports = { register };
