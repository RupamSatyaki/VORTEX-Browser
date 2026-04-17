/**
 * main/ipc/permissionHandlers.js
 * permissions:getAll/saveAll + setPermissionRequestHandler/setPermissionCheckHandler
 */

const { ipcMain, session, BrowserWindow } = require('electron');
const path = require('path');
const { app } = require('electron');

function _permPath() {
  return path.join(app.getPath('userData'), 'vortex', 'storage', 'permissions.json');
}

function _read() {
  try { const fs = require('fs'), f = _permPath(); if (!fs.existsSync(f)) return {}; return JSON.parse(require('fs').readFileSync(f, 'utf8')); } catch { return {}; }
}

function _write(data) {
  try { const fs = require('fs'), f = _permPath(), dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(data, null, 2)); } catch {}
}

const PERM_LABELS = { 'media':'Camera / Microphone','notifications':'Notifications','geolocation':'Location','clipboard-read':'Clipboard Read','midi':'MIDI','midiSysex':'MIDI SysEx' };
const ELECTRON_TO_ID = { 'notifications':'notifications','geolocation':'geolocation','clipboard-read':'clipboard-read','midi':'midi','midiSysex':'midi' };
const SENSITIVE = ['media','geolocation','notifications'];

function _sendRequest(webContents, domain, permission, details, callback, permData) {
  const win = BrowserWindow.getAllWindows().find(w => { try { return !w.isDestroyed() && w.webContents.id !== webContents.id; } catch { return false; } }) || BrowserWindow.getFocusedWindow();
  if (!win || win.isDestroyed()) { callback(true); return; }

  let permIds = [];
  if (permission === 'media') {
    if (details?.mediaTypes?.includes('video')) permIds.push('camera');
    if (details?.mediaTypes?.includes('audio')) permIds.push('microphone');
  } else { const id = ELECTRON_TO_ID[permission]; if (id) permIds.push(id); }

  win.webContents.send('permission:request', { domain, permission, label: PERM_LABELS[permission] || permission, permIds });

  const ch = `permission:response:${domain}:${permission}`;
  ipcMain.once(ch, (_e, granted) => {
    if (permIds.length) {
      if (!permData[domain]) permData[domain] = {};
      permIds.forEach(id => { permData[domain][id] = granted ? 'granted' : 'denied'; });
      _write(permData);
      _apply(permData);
    }
    callback(granted);
  });
  setTimeout(() => { try { ipcMain.removeAllListeners(ch); } catch {} callback(true); }, 30000);
}

function _apply(permData) {
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => {
    try {
      const url = wc.getURL();
      if (!url || url === 'about:blank' || url.startsWith('file://') || url.startsWith('vortex-app://')) { callback(true); return; }
      let domain = ''; try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { callback(true); return; }
      const stored = permData[domain] || {};

      if (permission === 'media') {
        const wantsCam = details?.mediaTypes?.includes('video'), wantsMic = details?.mediaTypes?.includes('audio');
        const camS = wantsCam ? (stored['camera'] || 'ask') : 'ask', micS = wantsMic ? (stored['microphone'] || 'ask') : 'ask';
        if (camS === 'denied' || micS === 'denied') { callback(false); return; }
        if (camS === 'granted' && micS === 'granted') { callback(true); return; }
        if (domain) _sendRequest(wc, domain, permission, details, callback, permData); else callback(true);
        return;
      }

      const ourId = ELECTRON_TO_ID[permission] || permission, status = stored[ourId] || 'ask';
      if (status === 'denied')  { callback(false); return; }
      if (status === 'granted') { callback(true);  return; }
      if (SENSITIVE.includes(permission)) _sendRequest(wc, domain, permission, details, callback, permData);
      else callback(true);
    } catch { callback(true); }
  });

  session.defaultSession.setPermissionCheckHandler((wc, permission, requestingOrigin, details) => {
    try {
      if (!requestingOrigin) return true;
      const domain = new URL(requestingOrigin).hostname.replace(/^www\./, '');
      const stored = permData[domain] || {};
      if (permission === 'media') {
        if (details?.mediaType === 'video') return (stored['camera'] || 'ask') !== 'denied';
        if (details?.mediaType === 'audio') return (stored['microphone'] || 'ask') !== 'denied';
        return true;
      }
      const MAP = { 'notifications':'notifications','geolocation':'geolocation','clipboard-read':'clipboard-read','midi':'midi','midiSysex':'midi' };
      return (stored[MAP[permission] || permission] || 'ask') !== 'denied';
    } catch { return true; }
  });
}

function register() {
  ipcMain.handle('permissions:getAll', () => _read());
  ipcMain.handle('permissions:saveAll', (_e, data) => { _write(data); _apply(data); return true; });
  _apply(_read()); // apply on startup
}

module.exports = { register };
