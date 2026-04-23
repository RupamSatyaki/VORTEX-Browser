/**
 * ytBlocker/ipcHandlers.js
 * IPC handlers for YouTube blocker — enable/disable, stats, partition info.
 */

const { ipcMain } = require('electron');
const ytSession   = require('./session');

function register() {
  // Renderer asks: "what partition should I use for YouTube webview?"
  ipcMain.handle('ytBlocker:getPartition', () => ytSession.getPartition());

  // Stats
  ipcMain.handle('ytBlocker:getBlockedCount', () => ytSession.getBlockedCount());
  ipcMain.handle('ytBlocker:resetCount',      () => { ytSession.resetCount(); return true; });

  // Toggle
  ipcMain.handle('ytBlocker:setEnabled', (_e, enabled) => {
    ytSession.setEnabled(enabled);
    return ytSession.isEnabled();
  });
  ipcMain.handle('ytBlocker:isEnabled', () => ytSession.isEnabled());
}

module.exports = { register };
