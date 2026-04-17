/**
 * main/ipc/addressHandlers.js
 * addresses:read/write
 */

const { ipcMain, app } = require('electron');
const path = require('path');

function _addrPath() { return path.join(app.getPath('userData'), 'vortex', 'storage', 'addresses.json'); }

function _readJson(filePath) {
  try { const fs = require('fs'); if (!fs.existsSync(filePath)) return null; return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function _writeJson(filePath, data) {
  try { const fs = require('fs'), dir = path.dirname(filePath); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); return true; } catch { return false; }
}

function register() {
  ipcMain.handle('addresses:read',  ()         => _readJson(_addrPath()) || []);
  ipcMain.handle('addresses:write', (_e, data) => _writeJson(_addrPath(), data));
}

module.exports = { register };
