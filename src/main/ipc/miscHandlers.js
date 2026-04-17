/**
 * main/ipc/miscHandlers.js
 * file:exists, settings:pickDownloadFolder, spellcheck:setLanguage
 */

const { ipcMain, session } = require('electron');

function register(_getWin) {
  ipcMain.handle('file:exists', (_e, filePath) => {
    try { return require('fs').existsSync(filePath); } catch { return false; }
  });

  ipcMain.on('settings:pickDownloadFolder', async (e) => {
    const { dialog } = require('electron');
    const win = _getWin(e);
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    if (!result.canceled && result.filePaths[0]) {
      e.sender.send('settings:downloadFolder', result.filePaths[0]);
    }
  });

  ipcMain.on('spellcheck:setLanguage', (_e, langCode) => {
    try { session.defaultSession.setSpellCheckerLanguages([langCode]); } catch (_) {}
  });
}

module.exports = { register };
