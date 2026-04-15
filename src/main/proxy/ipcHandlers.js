const { ipcMain } = require('electron');
const ProxyManager = require('./proxyManager');
const TorProcess   = require('./torProcess');

function registerProxyHandlers(pushToRenderer) {
  // Wire push function
  ProxyManager.setPushFn(pushToRenderer);
  TorProcess.setPushFn(pushToRenderer);

  // ── Get current proxy config ──────────────────────────────────────────────
  ipcMain.handle('proxy:getConfig', () => {
    return ProxyManager.getConfig();
  });

  // ── Save + apply proxy config ─────────────────────────────────────────────
  ipcMain.handle('proxy:setConfig', async (_e, cfg) => {
    ProxyManager.saveConfig(cfg);
    const result = await ProxyManager.applyProxy(cfg);
    pushToRenderer('proxy:changed', cfg);

    // For Tor: don't fetch IP — proxy not active yet until bootstrap
    // For HTTP/SOCKS5: fetch new IP after applying
    if (cfg.enabled && cfg.type !== 'none' && cfg.type !== 'tor') {
      ProxyManager.fetchIpInfo().then(info => {
        if (info) {
          const status = ProxyManager.getStatus();
          status.ip = info.ip;
          status.country = info.country;
          status.city = info.city;
          status.org = info.org;
          pushToRenderer('proxy:statusUpdate', status);
        }
      }).catch(() => {});
    }
    return result;
  });

  // ── Get live status ───────────────────────────────────────────────────────
  ipcMain.handle('proxy:getStatus', () => {
    return ProxyManager.getStatus();
  });

  // ── Test connection (returns IP + latency) ────────────────────────────────
  ipcMain.handle('proxy:testConnection', async () => {
    return ProxyManager.testConnection();
  });

  // ── Get original (real) IP ────────────────────────────────────────────────
  ipcMain.handle('proxy:getOriginalIp', async () => {
    return ProxyManager.getOriginalIp();
  });

  // ── Get original IP full details ──────────────────────────────────────────
  ipcMain.handle('proxy:getOriginalIpFull', async () => {
    return ProxyManager.getOriginalIpFull();
  });

  // ── Fetch current proxied IP info ─────────────────────────────────────────
  ipcMain.handle('proxy:fetchIpInfo', async () => {
    return ProxyManager.fetchIpInfo();
  });

  // ── Disable proxy (go direct) ─────────────────────────────────────────────
  ipcMain.handle('proxy:disable', async () => {
    const cfg = ProxyManager.getConfig();
    cfg.enabled = false;
    ProxyManager.saveConfig(cfg);
    return ProxyManager.applyProxy(cfg);
  });

  // ── Tor: start ────────────────────────────────────────────────────────────
  ipcMain.handle('tor:start', async () => {
    const cfg = ProxyManager.getConfig();
    return TorProcess.start(cfg.tor);
  });

  // ── Tor: stop ─────────────────────────────────────────────────────────────
  ipcMain.handle('tor:stop', () => {
    return TorProcess.stop();
  });

  // ── Tor: new identity ─────────────────────────────────────────────────────
  ipcMain.handle('tor:newIdentity', async () => {
    const cfg = ProxyManager.getConfig();
    const result = await TorProcess.newIdentity(cfg.tor);
    if (result.success) {
      // Fetch new IP after identity change
      setTimeout(() => {
        ProxyManager.fetchIpInfo().then(info => {
          if (info) pushToRenderer('proxy:statusUpdate', { ...ProxyManager.getStatus(), ip: info.ip, country: info.country, city: info.city });
        }).catch(() => {});
      }, 2000);
    }
    return result;
  });

  // ── Tor: get circuit info ─────────────────────────────────────────────────
  ipcMain.handle('tor:getCircuit', async () => {
    const cfg = ProxyManager.getConfig();
    return TorProcess.getCircuit(cfg.tor);
  });

  // ── Tor: get binary path ──────────────────────────────────────────────────
  ipcMain.handle('tor:getBinaryPath', () => {
    const cfg = ProxyManager.getConfig();
    return TorProcess.getBinaryPath(cfg.tor);
  });

  // ── Tor: is running ───────────────────────────────────────────────────────
  ipcMain.handle('tor:isRunning', () => {
    return TorProcess.isRunning();
  });

  // ── Tor: get process status ───────────────────────────────────────────────
  ipcMain.handle('tor:getProcessStatus', () => {
    return TorProcess.getStatus();
  });

  // ── Pick tor binary via file dialog ──────────────────────────────────────
  ipcMain.handle('tor:pickBinary', async (e) => {
    const { dialog, BrowserWindow } = require('electron');
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
      title: 'Select tor.exe',
      filters: [{ name: 'Executable', extensions: ['exe'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return result.filePaths[0];
  });

  // ── Download Tor automatically ────────────────────────────────────────────
  ipcMain.handle('tor:download', async () => {
    const TorDownloader = require('./torDownloader');
    TorDownloader.setPushFn(pushToRenderer);
    return TorDownloader.downloadAndInstall();
  });

  // ── Check if Tor is downloaded ────────────────────────────────────────────
  ipcMain.handle('tor:isDownloaded', () => {
    const TorDownloader = require('./torDownloader');
    return TorDownloader.isInstalled();
  });

  // ── Get Tor install dir ───────────────────────────────────────────────────
  ipcMain.handle('tor:getInstallDir', () => {
    const TorDownloader = require('./torDownloader');
    return TorDownloader.getTorDir();
  });
}

module.exports = { registerProxyHandlers };
