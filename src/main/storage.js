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

// ── Default file initialization ───────────────────────────────────────────────

const DEFAULTS = {
  settings: {
    theme: 'dark', fontsize: 'medium', tabpreview: true, bookmarksbar: false,
    startup: 'session', homepage: 'https://www.google.com',
    engine: 'google', suggestions: true,
    trackers: true, https: false, dnt: false,
    gpu: true, prefetch: true, cache: '512',
    askdl: false, opendl: false,
  },
  profile: {
    name: 'Vortex User', avatar: null, avatarType: 'emoji',
    avatarData: null, status: 'online', bio: '',
  },
  bookmarks: [],
  downloads_history: [],
  tab_history: [],
  proxy: {
    enabled: false,
    type: 'none',
    http:   { host: '', port: 8080, username: '', password: '' },
    socks5: { host: '', port: 1080, username: '', password: '' },
    tor:    { socksPort: 9050, controlPort: 9051, controlPassword: 'vortex_tor_ctrl', customBinaryPath: '', useBundled: true, autoStart: false },
    bypassList: ['localhost', '127.0.0.1', '::1'],
  },
};

function ensureDefaults() {
  ensureDir();
  Object.entries(DEFAULTS).forEach(([name, defaultVal]) => {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) {
      try {
        fs.writeFileSync(fp, JSON.stringify(defaultVal, null, 2), 'utf-8');
      } catch (_) {}
    }
  });
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

module.exports = { registerStorageHandlers, ensureDefaults, readFile, writeFile, deleteFile, STORAGE_DIR };
