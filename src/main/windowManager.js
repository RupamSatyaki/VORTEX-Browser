const { BrowserWindow, nativeTheme, app } = require('electron');
const path = require('path');

let mainWindow = null;

// Resolve preload path correctly in both dev and packaged app
// asarUnpack puts preload.js in app.asar.unpacked/ — must use that path
function _preloadPath() {
  const base = app.getAppPath();
  // In packaged app, getAppPath() returns .../resources/app.asar
  // asarUnpack files live in .../resources/app.asar.unpacked/
  const unpackedBase = base.replace('app.asar', 'app.asar.unpacked');
  const fs = require('fs');
  const unpacked = path.join(unpackedBase, 'preload.js');
  if (fs.existsSync(unpacked)) return unpacked;
  // Dev / non-asar fallback
  return path.join(base, 'preload.js');
}

function _indexHtmlPath() {
  // Check userData override first
  const fs = require('fs');
  const overridePath = path.join(app.getPath('userData'), 'vortex-update', 'src', 'renderer', 'index.html');
  if (fs.existsSync(overridePath)) return overridePath;
  return path.join(__dirname, '../renderer/index.html');
}

function createMainWindow() {
  // Force dark mode — all webviews will receive prefers-color-scheme: dark
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Vortex',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: _preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
      allowFileAccessFromFiles: true,
    },
  });

  mainWindow.loadFile(_indexHtmlPath());

  // Dev mode only: open DevTools + auto-reload
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    const rendererDir = path.join(__dirname, '../renderer');
    const fs = require('fs');
    fs.watch(rendererDir, { recursive: true }, (_event, filename) => {
      if (filename && mainWindow) {
        mainWindow.webContents.reloadIgnoringCache();
      }
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createIncognitoWindow() {
  nativeTheme.themeSource = 'dark';

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Vortex — Incognito',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: _preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
      allowFileAccessFromFiles: true,
    },
  });

  // Pass incognito flag via query param so renderer knows
  win.loadFile(_indexHtmlPath(), {
    query: { incognito: '1' },
  });

  win.on('closed', () => {});
  return win;
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, createIncognitoWindow, getMainWindow };
