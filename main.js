const { app } = require('electron');

// Suppress noisy ERR_ABORTED (-3) from webview navigations (YouTube, SPAs, etc.)
process.on('uncaughtException', (err) => {
  if (err && err.errno === -3) return;
  console.error(err);
});
const WindowManager = require('./src/main/windowManager');
const MenuManager = require('./src/main/menuManager');
const IpcHandler = require('./src/main/ipcHandler');
const Storage = require('./src/main/storage');

app.commandLine.appendSwitch('force-dark-mode');
app.commandLine.appendSwitch('enable-features', 'WebContentsForceDark,BackForwardCache');
app.commandLine.appendSwitch('back-forward-cache-memory-cache-size-limit-kb', '51200');

app.whenReady().then(() => {
  Storage.registerStorageHandlers();
  WindowManager.createMainWindow();
  MenuManager.setupMenu();
  IpcHandler.registerHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (WindowManager.getMainWindow() === null) {
    WindowManager.createMainWindow();
  }
});
