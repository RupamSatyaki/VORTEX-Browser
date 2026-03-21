const { app } = require('electron');

require('events').EventEmitter.defaultMaxListeners = 30;

// Suppress noisy ERR_ABORTED (-3) from webview navigations (YouTube, SPAs, etc.)
// Also suppress "Render frame was disposed" which fires on window visibility changes
process.on('uncaughtException', (err) => {
  if (!err) return;
  if (err.errno === -3) return;
  if (err.message && err.message.includes('Render frame was disposed')) return;
  if (err.message && err.message.includes('dragEvent')) return;
  console.error(err);
});

// Suppress unhandled promise rejections from webview GUEST_VIEW_MANAGER_CALL (ERR_ABORTED)
process.on('unhandledRejection', (reason) => {
  if (!reason) return;
  if (reason.errno === -3 || (reason.code && reason.code === 'ERR_ABORTED')) return;
  if (reason.message && reason.message.includes('ERR_ABORTED')) return;
  if (reason.message && reason.message.includes('Render frame was disposed')) return;
  console.error('Unhandled rejection:', reason);
});
const WindowManager = require('./src/main/windowManager');
const MenuManager = require('./src/main/menuManager');
const IpcHandler = require('./src/main/ipcHandler');
const Storage = require('./src/main/storage');

app.commandLine.appendSwitch('force-dark-mode');
app.commandLine.appendSwitch('enable-features', 'WebContentsForceDark,BackForwardCache,NetworkServiceInProcess2');
app.commandLine.appendSwitch('back-forward-cache-memory-cache-size-limit-kb', '102400'); // 100MB back/fwd cache
app.commandLine.appendSwitch('disk-cache-size', String(512 * 1024 * 1024)); // 512MB disk cache
app.commandLine.appendSwitch('memory-cache-size', String(128 * 1024 * 1024)); // 128MB memory cache
app.commandLine.appendSwitch('disable-http2-alternative-service-with-different-host'); // avoid h2 renegotiation delays
app.commandLine.appendSwitch('enable-quic'); // HTTP/3 QUIC support (faster on lossy networks)
app.commandLine.appendSwitch('quic-version', 'h3'); // force HTTP/3
app.commandLine.appendSwitch('ignore-gpu-blocklist'); // enable GPU acceleration
app.commandLine.appendSwitch('enable-gpu-rasterization'); // GPU rasterization for faster rendering
app.commandLine.appendSwitch('enable-zero-copy'); // zero-copy texture uploads
app.commandLine.appendSwitch('num-raster-threads', '4'); // parallel raster threads

app.whenReady().then(() => {
  Storage.registerStorageHandlers();
  // Ensure default storage files exist on first run
  Storage.ensureDefaults();
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
