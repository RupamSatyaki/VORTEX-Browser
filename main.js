const { app, protocol, net, BrowserWindow } = require('electron');
const path = require('path');

require('events').EventEmitter.defaultMaxListeners = 30;

// ── Single instance lock + URL handling ──────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    // Another instance tried to open — bring main window to front
    const { getMainWindow } = require('./src/main/windowManager');
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
    // Open URL from command line args in a new tab
    const url = _extractUrlFromArgs(argv);
    if (url && win) {
      // Small delay to ensure window is focused and ready
      setTimeout(() => win.webContents.send('open-url', url), 300);
    }
  });
}

// Extract URL from command line arguments
function _extractUrlFromArgs(argv) {
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('http://') || arg.startsWith('https://') || arg.startsWith('ftp://')) return arg;
    if (arg.endsWith('.html') || arg.endsWith('.htm')) return 'file:///' + arg.replace(/\\/g, '/');
  }
  return null;
}

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

// Register vortex-app:// protocol BEFORE app is ready (required by Electron)
// This allows panel iframes to load HTML files from inside the asar archive
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'vortex-app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      bypassCSP: false,
    },
  },
]);

app.whenReady().then(() => {
  // ── Apply pending updates from userData/vortex-update/ ──────────────────
  // For JS files that are require()'d directly (main.js, preload.js, src/main/*.js),
  // we copy them from the override folder into the app's resources directory.
  // renderer files (src/renderer/**) are served via vortex-app:// which checks override first.
  try {
    const fs = require('fs');
    const overrideRoot = path.join(app.getPath('userData'), 'vortex-update');
    if (fs.existsSync(overrideRoot)) {
      const appRoot = app.getAppPath(); // e.g. C:\...\resources\app.asar (or app/ in dev)
      // In packaged app, appRoot ends with app.asar — we need the resources dir
      const resourcesDir = app.isPackaged
        ? path.dirname(appRoot) // ..\resources\
        : appRoot;

      // Walk override folder and copy main-process files
      const MAIN_PATTERNS = ['main.js', 'preload.js', 'src/main/'];
      function walkAndCopy(dir, relBase) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === '.applied-sha') continue;
          const relPath = relBase ? relBase + '/' + entry.name : entry.name;
          const srcPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkAndCopy(srcPath, relPath);
          } else {
            // Only copy main-process files here; renderer files served via protocol override
            const isMainFile = MAIN_PATTERNS.some(p => relPath === p || relPath.startsWith(p));
            if (!isMainFile) continue;
            let destPath;
            if (app.isPackaged) {
              // In packaged app, main files live in resources/ next to app.asar
              destPath = path.join(resourcesDir, relPath);
            } else {
              destPath = path.join(appRoot, relPath);
            }
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            try { fs.copyFileSync(srcPath, destPath); } catch (_) {}
          }
        }
      }
      walkAndCopy(overrideRoot, '');
    }
  } catch (_) {}

  // Handle vortex-app://app/renderer/settings.html → src/renderer/settings.html
  // Also checks userData/vortex-update/ for overridden files first
  protocol.handle('vortex-app', (request) => {
    const url = new URL(request.url);
    // Strip leading /app/ prefix, map to src/
    const pathname = url.pathname.replace(/^\/app\//, '');

    // Check override folder first (applied updates)
    const fs = require('fs');
    const overridePath = path.join(app.getPath('userData'), 'vortex-update', 'src', pathname);
    if (fs.existsSync(overridePath)) {
      return net.fetch('file://' + overridePath.replace(/\\/g, '/'));
    }

    const filePath = path.join(app.getAppPath(), 'src', pathname);
    return net.fetch('file://' + filePath.replace(/\\/g, '/'));
  });

  Storage.registerStorageHandlers();
  // Ensure default storage files exist on first run
  Storage.ensureDefaults();
  WindowManager.createMainWindow();
  MenuManager.setupMenu();
  IpcHandler.registerHandlers();

  // Register as default browser protocol handler
  // This works in packaged builds — dev mode may not register properly
  if (app.isPackaged) {
    app.setAsDefaultProtocolClient('http');
    app.setAsDefaultProtocolClient('https');
    app.setAsDefaultProtocolClient('ftp');
  }

  // Handle URL passed via command line on startup (e.g. clicked link in another app)
  const startUrl = _extractUrlFromArgs(process.argv);
  if (startUrl) {
    const { getMainWindow } = require('./src/main/windowManager');
    const _sendWhenReady = () => {
      const win = getMainWindow();
      if (!win) return;
      const wc = win.webContents;
      const _send = () => setTimeout(() => wc.send('open-url', startUrl), 800);
      if (wc.isLoading()) {
        wc.once('did-finish-load', _send);
      } else {
        _send();
      }
    };
    setTimeout(_sendWhenReady, 200);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (WindowManager.getMainWindow() === null) {
    WindowManager.createMainWindow();
  }
});

// ── Intercept all new windows from webviews → open in new tab ────────────────
app.on('web-contents-created', (_e, contents) => {
  // Block new windows — open as new tab instead
  contents.setWindowOpenHandler(({ url }) => {
    if (url && url !== 'about:blank' && (url.startsWith('http') || url.startsWith('https') || url.startsWith('ftp'))) {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (win && !win.isDestroyed()) {
        win.webContents.send('open-url', url);
      }
    }
    return { action: 'deny' };
  });

  // Intercept native dialogs — show custom UI in renderer
  // This fires BEFORE the native OS dialog appears
  contents.on('dialog', (_ev, dialogType, messageText, defaultPromptText, callback) => {
    try {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (!win || win.isDestroyed()) {
        callback('', false);
        return;
      }
      const origin = (() => { try { return new URL(contents.getURL()).hostname; } catch { return ''; } })();
      win.webContents.send('dialog:show', {
        type: dialogType,
        message: messageText || '',
        defaultValue: defaultPromptText || '',
        origin,
      });
      // Respond immediately — custom UI is shown async
      if (dialogType === 'alert')   callback('');
      else if (dialogType === 'confirm') callback('', false);
      else callback(defaultPromptText || '', false);
    } catch {
      callback('', false);
    }
  });
});
