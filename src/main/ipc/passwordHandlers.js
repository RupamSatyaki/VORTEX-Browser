/**
 * main/ipc/passwordHandlers.js
 * passwords:read/write, passwords:readImported/writeImported
 */

const { ipcMain, app } = require('electron');
const path = require('path');

function _pwPath()         { return path.join(app.getPath('userData'), 'vortex', 'storage', 'passwords.json'); }
function _pwImportedPath() { return path.join(app.getPath('userData'), 'vortex', 'storage', 'passwords_imported.json'); }

function _readJson(filePath) {
  try { const fs = require('fs'); if (!fs.existsSync(filePath)) return null; return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function _writeJson(filePath, data) {
  try { const fs = require('fs'), dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); return true; } catch { return false; }
}

function register() {
  ipcMain.handle('passwords:read',          ()        => _readJson(_pwPath()));
  ipcMain.handle('passwords:write',         (_e, data) => _writeJson(_pwPath(), data));
  ipcMain.handle('passwords:readImported',  ()        => _readJson(_pwImportedPath()) || []);
  ipcMain.handle('passwords:writeImported', (_e, data) => _writeJson(_pwImportedPath(), data));
}

module.exports = { register };
