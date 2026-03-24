const { BrowserWindow, nativeTheme, app } = require('electron');
const path = require('path');

let mainWindow = null;

function _preloadPath() {
  const base = app.getAppPath();
  const unpackedBase = base.replace('app.asar', 'app.asar.unpacked');
  const fs = require('fs');
  const unpacked = path.join(unpackedBase, 'preload.js');
  if (fs.existsSync(unpacked)) return unpacked;
  return path.join(base, 'preload.js');
}

function _indexHtmlPath() {
  const fs = require('fs');
  const overridePath = path.join(app.getPath('userData'), 'vortex-update', 'src', 'renderer', 'index.html');
  if (fs.existsSync(overridePath)) return overridePath;
  return path.join(__dirname, '../renderer/index.html');
}

const COMMON_WEB_PREFS = () => ({
  preload: _preloadPath(),
  contextIsolation: true,
  nodeIntegration: false,
  nodeIntegrationInSubFrames: true,   // allows webview preload to use require('electron')
  webviewTag: true,
  webSecurity: false,
  allowRunningInsecureContent: true,
  backgroundThrottling: false,
  allowFileAccessFromFiles: true,
});

function createMainWindow() {
  nativeTheme.themeSource = 'dark';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Vortex',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: COMMON_WEB_PREFS(),
  });

  mainWindow.loadFile(_indexHtmlPath());

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    const rendererDir = path.join(__dirname, '../renderer');
    const fs = require('fs');
    fs.watch(rendererDir, { recursive: true }, (_event, filename) => {
      if (filename && mainWindow) mainWindow.webContents.reloadIgnoringCache();
    });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
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
    webPreferences: COMMON_WEB_PREFS(),
  });

  win.loadFile(_indexHtmlPath(), { query: { incognito: '1' } });
  win.on('closed', () => {});
  return win;
}

function getMainWindow() { return mainWindow; }

module.exports = { createMainWindow, createIncognitoWindow, getMainWindow };
