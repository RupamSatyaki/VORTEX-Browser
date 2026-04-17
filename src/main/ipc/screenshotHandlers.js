/**
 * main/ipc/screenshotHandlers.js
 * screenshot:capture, screenshot:captureFull, screenshot:save
 */

const { ipcMain, webContents } = require('electron');

function register() {
  ipcMain.handle('screenshot:capture', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      return (await wc.capturePage()).toDataURL();
    } catch { return null; }
  });

  ipcMain.handle('screenshot:captureFull', async (_e, wcId) => {
    try {
      const wc = webContents.fromId(wcId);
      if (!wc) return null;
      const dims = await wc.executeJavaScript('({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight })');
      const fullW = Math.min(dims.w, 16384), fullH = Math.min(dims.h, 16384);
      await wc.enableDeviceEmulation({ screenPosition: 'desktop', screenSize: { width: fullW, height: fullH }, viewSize: { width: fullW, height: fullH }, viewPosition: { x: 0, y: 0 }, deviceScaleFactor: 1 });
      await new Promise(r => setTimeout(r, 300));
      const img = await wc.capturePage({ x: 0, y: 0, width: fullW, height: fullH });
      wc.disableDeviceEmulation();
      return img.toDataURL();
    } catch {
      try { return (await webContents.fromId(wcId)?.capturePage())?.toDataURL() || null; } catch { return null; }
    }
  });

  ipcMain.handle('screenshot:save', async (_e, dataURL, defaultName) => {
    const { dialog, BrowserWindow } = require('electron');
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win, { title: 'Save Screenshot', defaultPath: defaultName || `screenshot-${Date.now()}.png`, filters: [{ name: 'PNG Image', extensions: ['png'] }] });
    if (result.canceled || !result.filePath) return null;
    const fs = require('fs');
    fs.writeFileSync(result.filePath, Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ''), 'base64'));
    return result.filePath;
  });
}

module.exports = { register };
