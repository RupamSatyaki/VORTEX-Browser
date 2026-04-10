// IPC renderer-side helpers
const IPC = {
  send:   (channel, data)    => window.vortexAPI.send(channel, data),
  on:     (channel, cb)      => window.vortexAPI.on(channel, cb),
  invoke: (channel, ...args) => window.vortexAPI.invoke(channel, ...args),
};

// ── Storage API (reads/writes JSON files via main process) ───────────────────
const Storage = {
  async read(name)        { return IPC.invoke('storage:read', name); },
  async write(name, data) { return IPC.invoke('storage:write', name, data); },
  async delete(name)      { return IPC.invoke('storage:delete', name); },
};

// ── Download History ─────────────────────────────────────────────────────────
const DL_FILE    = 'downloads_history';
const DL_MAX     = 500;

const DownloadHistory = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    this._cache = (await Storage.read(DL_FILE)) || [];
    return this._cache;
  },

  async add(entry) {
    const list = await this.load();
    const filtered = list.filter(d => d.id !== entry.id);
    filtered.unshift(entry);
    this._cache = filtered.slice(0, DL_MAX);
    await Storage.write(DL_FILE, this._cache);
  },

  async remove(id) {
    const list = await this.load();
    this._cache = list.filter(d => d.id !== id);
    await Storage.write(DL_FILE, this._cache);
  },

  async clear() {
    this._cache = [];
    await Storage.delete(DL_FILE);
  },
};

// ── Bookmark Store ────────────────────────────────────────────────────────────
const BM_FILE = 'bookmarks';

const BookmarkStore = {
  _cache: null,

  async load() {
    if (this._cache) return this._cache;
    this._cache = (await Storage.read(BM_FILE)) || [];
    return this._cache;
  },

  async add(entry) {
    const list = await this.load();
    if (list.find(b => b.url === entry.url)) return false; // already exists
    list.unshift(entry);
    this._cache = list;
    await Storage.write(BM_FILE, list);
    return true;
  },

  async remove(id) {
    const list = await this.load();
    this._cache = list.filter(b => b.id !== id);
    await Storage.write(BM_FILE, this._cache);
  },

  async update(id, title, url) {
    const list = await this.load();
    const bm = list.find(b => b.id === id);
    if (bm) { bm.title = title; bm.url = url; }
    await Storage.write(BM_FILE, list);
  },

  async clear() {
    this._cache = [];
    await Storage.delete(BM_FILE);
  },

  async has(url) {
    const list = await this.load();
    return !!list.find(b => b.url === url);
  },
};

// ── Forward events to bookmarks iframe ───────────────────────────────────────
function _forwardToBookmarksFrame(channel, data) {
  const frame = document.getElementById('panel-frame');
  if (!frame || !frame.contentWindow) return;
  const titleEl = document.getElementById('panel-title');
  if (!titleEl || titleEl.textContent !== 'Bookmarks') return;
  try {
    frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*');
  } catch (_) {}
}

async function _injectBookmarksToFrame(frame) {
  const list = await BookmarkStore.load();
  try {
    frame.contentWindow.postMessage(
      { __vortexIPC: true, channel: 'bookmark:history', data: list }, '*'
    );
  } catch (_) {}
}



function _forwardToDownloadsFrame(channel, data) {
  const frame = document.getElementById('panel-frame');
  if (!frame || !frame.contentWindow) return;
  // Only send if downloads panel is open
  const titleEl = document.getElementById('panel-title');
  if (!titleEl || titleEl.textContent !== 'Downloads') return;
  try {
    frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*');
  } catch (_) {}
}

async function _injectHistoryToFrame(frame) {
  const history = await DownloadHistory.load();
  try {
    frame.contentWindow.postMessage(
      { __vortexIPC: true, channel: 'download:history', data: history },
      '*'
    );
  } catch (_) {}
  // Also inject any active downloads
  _activeDownloads.forEach((dl) => {
    try {
      frame.contentWindow.postMessage(
        { __vortexIPC: true, channel: 'download:start', data: dl },
        '*'
      );
    } catch (_) {}
  });
}

// ── Active downloads (in-memory for live updates) ────────────────────────────
const _activeDownloads = new Map();

// Update address bar bookmark icon based on current URL
async function _updateBookmarkIcon() {
  const bar = document.getElementById('url-bar');
  const btn = document.getElementById('btn-bookmark');
  if (!bar || !btn) return;
  const url = bar.value;
  const saved = url && !url.startsWith('vortex://') ? await BookmarkStore.has(url) : false;
  btn.classList.toggle('bookmarked', saved);
  btn.title = saved ? 'Remove bookmark' : 'Bookmark this page';
}

// Expose so navigation.js can call it on URL change
window._updateBookmarkIcon = _updateBookmarkIcon;
// Expose forward function for navigation.js bookmark button
window._forwardToBookmarksFrame = _forwardToBookmarksFrame;

// ── Permission Request Prompt ─────────────────────────────────────────────────
function _showPermissionPrompt({ domain, permission, label, permIds }) {
  const existing = document.getElementById('perm-request-prompt');
  if (existing) existing.remove();

  // Permission-specific config
  const PERM_CONFIG = {
    'media':                { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`, color: '#3b82f6', desc: 'access your camera and microphone' },
    'notifications':        { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`, color: '#f59e0b', desc: 'send you notifications' },
    'geolocation':          { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`, color: '#22c55e', desc: 'access your location' },
    'camera':               { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`, color: '#3b82f6', desc: 'access your camera' },
    'microphone':           { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`, color: '#06b6d4', desc: 'access your microphone' },
    'clipboard-read':       { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`, color: '#8b5cf6', desc: 'read your clipboard' },
    'clipboard-write':      { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M12 9v6"/></svg>`, color: '#a78bfa', desc: 'write to your clipboard' },
    'midi':                 { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><line x1="6" y1="12" x2="6" y2="16"/><line x1="10" y1="12" x2="10" y2="14"/><line x1="14" y1="12" x2="14" y2="16"/><line x1="18" y1="12" x2="18" y2="14"/></svg>`, color: '#ec4899', desc: 'access MIDI devices' },
    'midiSysex':            { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><line x1="6" y1="12" x2="6" y2="16"/><line x1="10" y1="12" x2="10" y2="14"/><line x1="14" y1="12" x2="14" y2="16"/><line x1="18" y1="12" x2="18" y2="14"/></svg>`, color: '#f472b6', desc: 'access MIDI SysEx' },
    'bluetooth':            { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>`, color: '#60a5fa', desc: 'access Bluetooth devices' },
    'usb':                  { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v12M8 6l4-4 4 4M8 14h8a2 2 0 0 1 0 4H8a2 2 0 0 1 0-4z"/><line x1="12" y1="18" x2="12" y2="22"/></svg>`, color: '#34d399', desc: 'access USB devices' },
    'serial':               { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="10" y1="11" x2="10" y2="13"/><line x1="14" y1="11" x2="14" y2="13"/><line x1="18" y1="11" x2="18" y2="13"/></svg>`, color: '#fb923c', desc: 'access serial ports' },
    'hid':                  { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="14" y1="10" x2="20" y2="10"/><line x1="14" y1="14" x2="18" y2="14"/></svg>`, color: '#f97316', desc: 'access HID devices' },
    'screen-wake-lock':     { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`, color: '#fbbf24', desc: 'keep your screen awake' },
    'idle-detection':       { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, color: '#94a3b8', desc: 'detect when you are idle' },
    'persistent-storage':   { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`, color: '#a3e635', desc: 'use persistent storage' },
    'display-capture':      { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`, color: '#38bdf8', desc: 'capture your screen' },
    'window-management':    { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="9" height="9" rx="1"/><rect x="13" y="3" width="9" height="9" rx="1"/><rect x="2" y="14" width="9" height="7" rx="1"/><rect x="13" y="14" width="9" height="7" rx="1"/></svg>`, color: '#818cf8', desc: 'manage windows' },
    'fullscreen':           { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`, color: '#64748b', desc: 'go fullscreen' },
    'pointer-lock':         { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3l14 9-7 1-3 7z"/></svg>`, color: '#475569', desc: 'lock your pointer' },
    'keyboard-lock':        { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="8" y1="13" x2="8" y2="13"/><line x1="12" y1="13" x2="12" y2="13"/><line x1="16" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`, color: '#334155', desc: 'capture keyboard input' },
    'nfc':                  { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8.32a7.43 7.43 0 0 0 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 0 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 0 .01 15.8"/><path d="M16.37 2a20.16 20.16 0 0 0 0 20"/></svg>`, color: '#10b981', desc: 'access NFC' },
    'vr':                   { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>`, color: '#7c3aed', desc: 'access Virtual Reality' },
    'ar':                   { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`, color: '#9333ea', desc: 'access Augmented Reality' },
    'device-orientation':   { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`, color: '#0ea5e9', desc: 'access device orientation' },
    'device-motion':        { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`, color: '#0284c7', desc: 'access device motion' },
    'payment-handler':      { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`, color: '#16a34a', desc: 'handle payments' },
    'background-sync':      { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`, color: '#0891b2', desc: 'sync in background' },
    'push':                 { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>`, color: '#d97706', desc: 'send push messages' },
    'speaker-selection':    { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`, color: '#7c3aed', desc: 'select audio output' },
    'encrypted-media':      { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`, color: '#dc2626', desc: 'use encrypted media' },
    'file-system':          { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`, color: '#ca8a04', desc: 'access your file system' },
    'protocol-handler':     { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`, color: '#0369a1', desc: 'handle protocol links' },
    'webauthn':             { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`, color: '#059669', desc: 'use WebAuthn authentication' },
    'pan-tilt-zoom':        { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/><line x1="8" y1="9" x2="8" y2="15"/><line x1="5" y1="12" x2="11" y2="12"/></svg>`, color: '#2563eb', desc: 'control camera pan/tilt/zoom' },
    'popup':                { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`, color: '#b45309', desc: 'open popup windows' },
    'automatic-downloads':  { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`, color: '#b45309', desc: 'automatically download files' },
  };
  const cfg = PERM_CONFIG[permission] || { icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`, color: 'var(--accent,#00c8b4)', desc: `use ${label.toLowerCase()}` };

  // Inject styles once
  if (!document.getElementById('perm-prompt-style')) {
    const s = document.createElement('style');
    s.id = 'perm-prompt-style';
    s.textContent = `
      @keyframes permSlideDown {
        from { opacity:0; transform:translateX(-50%) translateY(-16px) scale(0.94); }
        to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
      }
      @keyframes permSlideUp {
        from { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        to   { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.96); }
      }
      #perm-request-prompt { animation: permSlideDown 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards; }
      #perm-request-prompt.dismissing { animation: permSlideUp 0.18s ease forwards; }

      #perm-request-prompt .perm-btn {
        flex:1; border:none; border-radius:9px; font-size:13px; font-weight:600;
        padding:10px 8px; cursor:pointer; transition:all 0.15s; display:flex;
        align-items:center; justify-content:center; gap:6px;
      }
      #perm-request-prompt .perm-btn:hover { filter:brightness(1.12); transform:translateY(-1px); }
      #perm-request-prompt .perm-btn:active { transform:translateY(0); filter:brightness(0.95); }
      #perm-request-prompt .perm-btn-block {
        background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.28); color:#ef4444;
      }
      #perm-request-prompt .perm-btn-allow {
        background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.32); color:#22c55e;
      }
      #perm-request-prompt .perm-remember {
        display:flex; align-items:center; gap:7px; cursor:pointer;
        font-size:11px; color:var(--text-dim,#4a8080); user-select:none;
        padding:2px 0;
      }
      #perm-request-prompt .perm-remember input { cursor:pointer; accent-color:var(--accent,#00c8b4); }
      #perm-request-prompt .perm-remember:hover { color:var(--text-muted,#7aadad); }
      #perm-request-prompt .perm-timer-bar {
        height:2px; background:var(--bg-border,#2e4a4c); border-radius:0 0 14px 14px; overflow:hidden;
      }
      #perm-request-prompt .perm-timer-fill {
        height:100%; width:100%; background:var(--accent,#00c8b4);
        transition:width 30s linear; border-radius:0 0 14px 14px;
      }
    `;
    document.head.appendChild(s);
  }

  const el = document.createElement('div');
  el.id = 'perm-request-prompt';
  el.style.cssText = `
    position:fixed; top:76px; left:50%; transform:translateX(-50%);
    z-index:999999; width:360px; max-width:calc(100vw - 24px);
    background:var(--bg-panel,#0f2222);
    border:1px solid ${cfg.color}44;
    border-radius:14px;
    box-shadow:0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px ${cfg.color}22;
    overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  `;

  el.innerHTML = `
    <!-- Colored top accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,${cfg.color}88,${cfg.color});"></div>

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 10px;border-bottom:1px solid var(--bg-border2,#1e3838);">
      <img id="perm-fav" src="https://www.google.com/s2/favicons?domain=${domain}&sz=32"
        style="width:18px;height:18px;border-radius:4px;flex-shrink:0;object-fit:contain;"
        onerror="this.style.display='none'" />
      <div style="flex:1;min-width:0;">
        <div style="font-size:11px;font-weight:700;color:var(--text-main,#c8e8e5);
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${domain}</div>
        <div style="font-size:10px;color:var(--text-dim,#4a8080);margin-top:1px;">Permission Request</div>
      </div>
      <button id="perm-dismiss-x" style="background:none;border:none;color:var(--text-dim,#4a8080);
        cursor:pointer;padding:3px;border-radius:5px;display:flex;align-items:center;
        font-size:15px;line-height:1;transition:color 0.12s;" title="Dismiss">✕</button>
    </div>

    <!-- Body -->
    <div style="padding:16px 16px 12px;display:flex;align-items:flex-start;gap:14px;">
      <!-- Icon circle -->
      <div style="width:48px;height:48px;border-radius:14px;flex-shrink:0;
        background:${cfg.color}18;border:1px solid ${cfg.color}30;
        display:flex;align-items:center;justify-content:center;color:${cfg.color};">
        ${cfg.icon}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:15px;font-weight:700;color:var(--text-main,#c8e8e5);line-height:1.3;">
          ${label}
        </div>
        <div style="font-size:12px;color:var(--text-dim,#4a8080);margin-top:5px;line-height:1.5;">
          <span style="color:${cfg.color};font-weight:600;">${domain}</span>
          wants to ${cfg.desc}.
        </div>
      </div>
    </div>

    <!-- Remember checkbox -->
    <div style="padding:0 16px 12px;">
      <label class="perm-remember">
        <input type="checkbox" id="perm-remember-chk" checked />
        Remember my decision for this site
      </label>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:8px;padding:0 14px 14px;">
      <button class="perm-btn perm-btn-block" id="perm-btn-block">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        Block
      </button>
      <button class="perm-btn perm-btn-allow" id="perm-btn-allow">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Allow
      </button>
    </div>

    <!-- Timer bar (30s auto-deny) -->
    <div class="perm-timer-bar">
      <div class="perm-timer-fill" id="perm-timer-fill"></div>
    </div>
  `;

  document.body.appendChild(el);

  // Start timer bar animation
  requestAnimationFrame(() => {
    const fill = el.querySelector('#perm-timer-fill');
    if (fill) { fill.style.width = '0%'; }
  });

  let _responded = false;

  function _respond(granted) {
    if (_responded) return;
    _responded = true;

    const remember = el.querySelector('#perm-remember-chk')?.checked !== false;

    // Animate out
    el.classList.add('dismissing');
    setTimeout(() => { if (el.parentNode) el.remove(); }, 200);

    IPC.send(`permission:response:${domain}:${permission}`, granted);

    // Update PermissionManager store if "remember" is checked
    if (remember && typeof PermissionManager !== 'undefined' && permIds?.length) {
      permIds.forEach(id => PermissionManager.setPermission(domain, id, granted ? 'granted' : 'denied'));
      if (typeof PermissionPopup !== 'undefined') PermissionPopup.updateBadge(domain);
    }
  }

  el.querySelector('#perm-btn-allow').addEventListener('click', () => _respond(true));
  el.querySelector('#perm-btn-block').addEventListener('click', () => _respond(false));
  el.querySelector('#perm-dismiss-x').addEventListener('click', () => _respond(false));

  // Hover effects on dismiss button
  const dismissX = el.querySelector('#perm-dismiss-x');
  dismissX.addEventListener('mouseenter', () => dismissX.style.color = '#c86060');
  dismissX.addEventListener('mouseleave', () => dismissX.style.color = 'var(--text-dim,#4a8080)');

  // Auto-deny after 30s
  const autoTimer = setTimeout(() => _respond(false), 30000);

  // Cancel auto-timer if user interacts
  el.addEventListener('mouseenter', () => clearTimeout(autoTimer), { once: true });
}

// ── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  IPC.on('downloads:badge', (count) => Navigation.setDownloadBadge(count));

  // ── Custom dialog from webview (alert/confirm/prompt) ─────────────────────
  IPC.on('dialog:show', (data) => {
    if (typeof VortexDialog !== 'undefined') {
      VortexDialog.show(data.type, data.message, data.origin, data.defaultValue);
    }
  });

  // ── Open URL from external app (default browser) ──────────────────────────
  // Queued URL — may arrive before or after session restore
  let _pendingExternalUrl = null;
  let _appReady = false;

  function _openExternalUrl(url) {
    if (!url) return;
    if (typeof Tabs !== 'undefined') {
      Tabs.createTab(url); // createTab already sets it as active
    } else if (typeof WebView !== 'undefined') {
      WebView.loadURL(url);
    }
  }

  IPC.on('open-url', (url) => {
    if (!url) return;
    if (_appReady) {
      _openExternalUrl(url);
    } else {
      // Queue it — will be processed after app init completes
      _pendingExternalUrl = url;
    }
  });

  // Called from app.js after session restore + tab init is done
  window._markAppReady = () => {
    _appReady = true;
    if (_pendingExternalUrl) {
      const url = _pendingExternalUrl;
      _pendingExternalUrl = null;
      // Small delay so tabs are fully rendered
      setTimeout(() => _openExternalUrl(url), 300);
    }
  };

  // ── Permission request from main process ─────────────────────────────────
  IPC.on('permission:request', (data) => {
    _showPermissionPrompt(data);
  });

  // ── Updater install progress ──────────────────────────────────────────────
  IPC.on('updater:installProgress', (data) => {
    // Forward to settings iframe if open
    const frame = document.getElementById('panel-frame');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'updater:installProgress', data }, '*');
      } catch (_) {}
    }
    // Also update directly if settings is in same window
    _applyInstallProgress(data);
  });

  function _applyInstallProgress(data) {
    const bar  = document.getElementById('upd-install-bar');
    const pct  = document.getElementById('upd-install-pct');
    const info = document.getElementById('upd-install-info');
    if (bar)  bar.style.width = data.pct + '%';
    if (pct)  pct.textContent = data.pct + '%';
    if (info) {
      if (data.done) {
        info.textContent = 'Launching installer...';
      } else if (data.totalMB && data.totalMB !== '?') {
        info.textContent = `${data.receivedMB} MB / ${data.totalMB} MB`;
      } else {
        info.textContent = `${data.receivedMB} MB downloaded...`;
      }
    }
  }

  // ── Menu accelerator events (fired from menuManager.js) ──────────────────
  IPC.on('menu:newTab',    () => QuickLaunch.open());
  IPC.on('menu:newWindow', () => window.vortexAPI.send('window:new'));
  IPC.on('menu:closeTab',  () => { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); });
  IPC.on('menu:reload',    () => WebView.reload());
  IPC.on('menu:hardReload',() => WebView.hardReload());
  IPC.on('menu:find',      () => WebView.findInPage());
  IPC.on('menu:screenshot',    () => Screenshot.capture(false));
  IPC.on('menu:screenshotFull',() => Screenshot.capture(true));
  IPC.on('menu:zoomIn',    () => WebView.zoomIn());
  IPC.on('menu:zoomOut',   () => WebView.zoomOut());
  IPC.on('menu:zoomReset', () => WebView.zoomReset());
  IPC.on('menu:downloads', () => Panel.open('downloads'));
  IPC.on('menu:history',   () => Panel.open('history'));
  IPC.on('menu:bookmarks', () => Panel.open('bookmarks'));
  IPC.on('menu:settings',  () => Panel.open('settings'));
  IPC.on('menu:nextTab',   () => Tabs.switchNext());
  IPC.on('menu:prevTab',   () => Tabs.switchPrev());
  IPC.on('menu:focusUrl',  () => { const b = document.getElementById('url-bar'); if (b) { b.focus(); b.select(); } });

  IPC.on('download:start', (data) => {
    _activeDownloads.set(data.id, { ...data, receivedFormatted: '0 B', percent: 0, speed: '' });
    _forwardToDownloadsFrame('download:start', data);
  });

  IPC.on('download:update', (data) => {
    const existing = _activeDownloads.get(data.id);
    if (existing) Object.assign(existing, data);
    _forwardToDownloadsFrame('download:update', data);
  });

  IPC.on('download:done', async (data) => {
    const existing = _activeDownloads.get(data.id) || {};
    _activeDownloads.delete(data.id);

    const entry = {
      ...existing,
      ...data,
      percent:     data.status === 'completed' ? 100 : (existing.percent || 0),
      completedAt: Date.now(),
    };

    await DownloadHistory.add(entry);
    _forwardToDownloadsFrame('download:done', entry);
  });

  IPC.on('download:removed', async (id) => {
    await DownloadHistory.remove(id);
    _forwardToDownloadsFrame('download:removed', id);
  });

  // Mark a file as deleted in history (file no longer exists on disk)
  IPC.on('download:markDeleted', async ({ id }) => {
    const history = await DownloadHistory.load();
    const entry = history.find(d => d.id === id);
    if (entry) {
      entry.status = 'deleted';
      await Storage.write('downloads_history', history);
      DownloadHistory._cache = history;
    }
  });

  // When downloads panel iframe loads — inject history + active downloads
  document.addEventListener('vortex-downloads-ready', async (e) => {
    DownloadHistory._cache = null; // force fresh read from disk
    await _injectHistoryToFrame(e.detail);
  });

  // When bookmarks panel iframe loads — inject bookmarks
  document.addEventListener('vortex-bookmarks-ready', async (e) => {
    BookmarkStore._cache = null; // force fresh read from disk
    await _injectBookmarksToFrame(e.detail);
  });

  // When history panel iframe loads — inject tab history data
  document.addEventListener('vortex-history-ready', (e) => {
    const frame = e.detail;
    if (!frame || !frame.contentWindow) return;
    try {
      const activeTabs  = window.TabHistory ? TabHistory.getActiveTabs()  : [];
      const closedTabs  = window.TabHistory ? TabHistory.getClosedTabs()  : [];
      frame.contentWindow.postMessage(
        { __vortexIPC: true, channel: 'history:data', data: { activeTabs, closedTabs } }, '*'
      );
    } catch (_) {}
  });

  // Handle postMessage actions from downloads.html and settings.html
  window.addEventListener('message', (e) => {
    if (!e.data || !e.data.__vortexAction) return;
    const { channel, payload } = e.data;

    // ── Cross-origin invoke bridge ────────────────────────────────────────────
    // Panel iframes (vortex-app://) can't access window.parent directly,
    // so they send __invoke requests via postMessage
    if (channel === '__invoke') {
      const { reqId, channel: ipcChannel, args } = payload;
      window.vortexAPI.invoke(ipcChannel, ...args).then(result => {
        try {
          const frame = document.getElementById('panel-frame');
          if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage({ __vortexInvokeReply: reqId, result }, '*');
          }
        } catch (_) {}
      }).catch(() => {
        try {
          const frame = document.getElementById('panel-frame');
          if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage({ __vortexInvokeReply: reqId, result: null }, '*');
          }
        } catch (_) {}
      });
      return;
    }
    if (channel === 'settings:changed') {
      // Live apply immediately — no roundtrip needed
      if (window.Navigation) Navigation.applySettings(payload);
      if (typeof payload.pip === 'boolean' && window.WebView) WebView.setPiPEnabled(payload.pip);
      if (payload.pipSites && window.WebView) WebView.setPiPSites(payload.pipSites);
      if (window.Navigation) Navigation.applySettings(payload);
      IPC.send('settings:changed', payload);
      return;
    }
    if (channel === 'profile:changed') {
      // Dispatch a custom event so navigation.js _initProfile listener picks it up
      window.dispatchEvent(new CustomEvent('vortex-profile-changed', { detail: payload }));
      return;
    }
    if (channel === 'bookmark:remove') {
      BookmarkStore.remove(payload).then(() => {
        _forwardToBookmarksFrame('bookmark:removed', payload);
        _updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:update') {
      BookmarkStore.update(payload.id, payload.title, payload.url).then(() => {
        _forwardToBookmarksFrame('bookmark:updated', payload);
      });
      return;
    }
    if (channel === 'bookmark:clearAll') {
      BookmarkStore.clear().then(() => {
        _forwardToBookmarksFrame('bookmark:cleared', null);
        _updateBookmarkIcon();
      });
      return;
    }
    if (channel === 'bookmark:open') {
      // Open URL in active tab
      if (window.WebView) WebView.loadURL(payload);
      else if (window.Tabs) Tabs.createTab(payload);
      return;
    }
    if (channel === 'history:restore') {
      // Restore a closed tab
      if (window.TabHistory) {
        const result = TabHistory.restoreTab(payload);
        if (result) Tabs.createTab(result.url);
      }
      return;
    }
    if (channel === 'history:openUrl') {
      if (window.Tabs) Tabs.createTab(payload);
      return;
    }
    if (channel === 'history:switchTab') {
      if (window.Tabs) Tabs.setActiveTab(payload);
      Panel.close();
      return;
    }
    if (channel === 'history:ready') {
      // History iframe is ready — inject data
      const frame = document.getElementById('panel-frame');
      if (!frame || !frame.contentWindow) return;
      try {
        const activeTabs = window.TabHistory ? TabHistory.getActiveTabs() : [];
        const closedTabs = window.TabHistory ? TabHistory.getClosedTabs() : [];
        frame.contentWindow.postMessage(
          { __vortexIPC: true, channel: 'history:data', data: { activeTabs, closedTabs } }, '*'
        );
      } catch (_) {}
      return;
    }
    if (channel === 'open-url-tab') {
      // Settings panel wants to open a URL in a new tab
      if (typeof Tabs !== 'undefined' && payload) Tabs.createTab(payload);
      return;
    }
    IPC.send(channel, payload);
  });
});
