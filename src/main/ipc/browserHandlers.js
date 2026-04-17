/**
 * main/ipc/browserHandlers.js
 * browser:isDefault, browser:setDefault, browser:clearData
 */

const { ipcMain, session, shell, app } = require('electron');

function register() {
  ipcMain.handle('browser:isDefault', () => {
    try { return app.isDefaultProtocolClient('https'); } catch { return false; }
  });

  ipcMain.on('browser:setDefault', () => {
    try { shell.openExternal('ms-settings:defaultapps'); } catch {}
  });

  ipcMain.on('browser:clearData', () => {
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData({ storages: ['cookies','localstorage','indexdb','websql','serviceworkers','cachestorage'] });
  });
}

module.exports = { register };
