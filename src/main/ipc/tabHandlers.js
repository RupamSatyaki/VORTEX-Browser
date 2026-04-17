/**
 * main/ipc/tabHandlers.js
 * tab:capture, tab:setMuted, tab:isAudible, tab:memoryUsage, webview:setZoom, pip:trigger
 */

const { ipcMain, webContents } = require('electron');

function register() {
  ipcMain.handle('tab:capture', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      const img = await wc.capturePage();
      return img.resize({ width: 320, height: 200 }).toDataURL();
    } catch { return null; }
  });

  ipcMain.handle('tab:setMuted', (_e, wcId, muted) => {
    try { const wc = webContents.fromId(wcId); if (wc) wc.setAudioMuted(muted); return true; } catch { return false; }
  });

  ipcMain.handle('tab:isAudible', (_e, wcId) => {
    try { const wc = webContents.fromId(wcId); return wc ? wc.isCurrentlyAudible() : false; } catch { return false; }
  });

  ipcMain.handle('tab:memoryUsage', async (_e, wcId) => {
    try { const wc = webContents.fromId(wcId); if (!wc) return null; const info = await wc.getProcessMemoryInfo(); return info.privateBytes || info.workingSetSize || 0; } catch { return null; }
  });

  ipcMain.handle('webview:setZoom', (_e, wcId, factor) => {
    try { const wc = webContents.fromId(wcId); if (wc) wc.setZoomFactor(factor); } catch (_) {}
  });

  ipcMain.handle('pip:trigger', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return false;
      return await wc.executeJavaScript(`
        (function() {
          var v = Array.from(document.querySelectorAll('video')).find(function(v) { return !v.paused && !v.ended && v.readyState > 2; }) || document.querySelector('video');
          if (!v) return false;
          if (document.pictureInPictureElement) { document.exitPictureInPicture().catch(function(){}); return true; }
          v.removeAttribute('disablePictureInPicture');
          try { Object.defineProperty(v, 'disablePictureInPicture', { get: function() { return false; }, configurable: true }); } catch(_) {}
          return v.requestPictureInPicture().then(function() { return true; }).catch(function() { var ytBtn = document.querySelector('.ytp-pip-button'); if (ytBtn) { ytBtn.click(); return true; } return false; });
        })();
      `, true);
    } catch { return false; }
  });
}

module.exports = { register };
