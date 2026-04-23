/**
 * main/ipcHandler.js — Orchestrator only
 */

const { BrowserWindow, session, net, app, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// ── DNS pre-warm ──────────────────────────────────────────────────────────────
const DNS_PREFETCH_HOSTS = [
  'www.google.com','www.youtube.com','www.github.com',
  'www.reddit.com','www.twitter.com','www.wikipedia.org',
  'fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net',
];

function prewarmDNS() {
  DNS_PREFETCH_HOSTS.forEach(host => {
    const req = net.request({ method: 'HEAD', url: `https://${host}`, redirect: 'manual' });
    req.on('response', () => {}); req.on('error', () => {}); req.end();
  });
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function pushToRenderer(channel, data) {
  BrowserWindow.getAllWindows().forEach(win => {
    try { if (!win.isDestroyed() && !win.webContents.isDestroyed()) win.webContents.send(channel, data); } catch (_) {}
  });
}

function _getWin(e) {
  try { const w = e.sender.getOwnerBrowserWindow(); if (w && !w.isDestroyed()) return w; } catch (_) {}
  try { const w = BrowserWindow.fromWebContents(e.sender); if (w && !w.isDestroyed()) return w; } catch (_) {}
  const w = BrowserWindow.getAllWindows().find(w => { try { return !w.isDestroyed() && w.webContents.id === e.sender.id; } catch { return false; } });
  return w || BrowserWindow.getFocusedWindow();
}

// ── Register all handlers ─────────────────────────────────────────────────────
function registerHandlers() {
  prewarmDNS();

  // ── Core modules ──────────────────────────────────────────────────────────
  const storageHandlers = require('./ipc/storageHandlers');
  const dlHandlers = require('./ipc/downloadHandlers');

  storageHandlers.register();
  storageHandlers.onWrite('settings', () => dlHandlers.refreshDlSettings());

  require('./ipc/appHandlers').register(_getWin);
  require('./ipc/windowHandlers').register(_getWin);
  require('./ipc/miscHandlers').register(_getWin);

  // ── Downloads ─────────────────────────────────────────────────────────────
  dlHandlers.register(pushToRenderer);

  // ── Feature modules ───────────────────────────────────────────────────────
  require('./ipc/screenshotHandlers').register();
  require('./ipc/tabHandlers').register();
  require('./ipc/cookieHandlers').register();
  require('./ipc/permissionHandlers').register();
  require('./ipc/passwordHandlers').register();
  require('./ipc/addressHandlers').register();
  require('./ipc/browserHandlers').register();
  require('./ipc/updaterHandlers').register(pushToRenderer);

  // ── Blocklist Engine ──────────────────────────────────────────────────────
  const BlocklistEngine = require('./blocklist/engine');
  BlocklistEngine.registerHandlers();

  const { registerProxyHandlers } = require('./proxy/ipcHandlers');
  registerProxyHandlers(pushToRenderer);
}

module.exports = { registerHandlers };
