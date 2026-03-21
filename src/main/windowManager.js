const { BrowserWindow, nativeTheme } = require('electron');
const path = require('path');

let mainWindow = null;

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
      preload: path.join(__dirname, '../../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Dev mode: open DevTools + auto-reload
  if (process.env.NODE_ENV !== 'production') {
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
      preload: path.join(__dirname, '../../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
    },
  });

  // Pass incognito flag via query param so renderer knows
  win.loadFile(path.join(__dirname, '../renderer/index.html'), {
    query: { incognito: '1' },
  });

  win.on('closed', () => {});
  return win;
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, createIncognitoWindow, getMainWindow };
