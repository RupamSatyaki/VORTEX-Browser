const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Base directory: %APPDATA%/vortex/storage/
const STORAGE_DIR = path.join(app.getPath('userData'), 'storage');

function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function filePath(name) {
  return path.join(STORAGE_DIR, name + '.json');
}

function readFile(name) {
  try {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return null;
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch {
    return null;
  }
}

function writeFile(name, data) {
  try {
    ensureDir();
    fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function deleteFile(name) {
  try {
    const fp = filePath(name);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    return true;
  } catch {
    return false;
  }
}

// ── IPC Handlers ─────────────────────────────────────────────────────────────

function registerStorageHandlers() {
  // Read a storage file: returns parsed JSON or null
  ipcMain.handle('storage:read', (_e, name) => {
    return readFile(name);
  });

  // Write data to a storage file
  ipcMain.handle('storage:write', (_e, name, data) => {
    return writeFile(name, data);
  });

  // Delete a storage file
  ipcMain.handle('storage:delete', (_e, name) => {
    return deleteFile(name);
  });

  // Get the storage directory path (for display purposes)
  ipcMain.handle('storage:dir', () => STORAGE_DIR);
}

module.exports = { registerStorageHandlers, readFile, writeFile, deleteFile, STORAGE_DIR };
