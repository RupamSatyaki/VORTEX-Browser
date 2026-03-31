/**
 * permissions/index.js — Site Permissions Manager
 * Full permission list from permission.site, SVG icons, settings panel
 */

const PermissionManager = (() => {

  // ── SVG icon map ──────────────────────────────────────────────────────────
  const SVG = {
    camera:       `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    microphone:   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    notifications:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    geolocation:  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    'clipboard-read':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
    'clipboard-write':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    midi:         `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="2"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/></svg>`,
    bluetooth:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>`,
    usb:          `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v12M8 6l4-4 4 4M8 14h8a2 2 0 0 1 0 4H8a2 2 0 0 1 0-4z"/></svg>`,
    serial:       `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="10" y1="11" x2="10" y2="13"/><line x1="14" y1="11" x2="14" y2="13"/><line x1="18" y1="11" x2="18" y2="13"/></svg>`,
    hid:          `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="14" x2="16" y2="14"/></svg>`,
    'screen-share':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    fullscreen:   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    'pointer-lock':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`,
    'device-orientation':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    'device-motion':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
    nfc:          `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8.5A6.5 6.5 0 0 1 12 2"/><path d="M3.5 6A10.5 10.5 0 0 1 12 1"/><path d="M18 8.5A6.5 6.5 0 0 0 12 2"/><path d="M20.5 6A10.5 10.5 0 0 0 12 1"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="10" x2="12" y2="18"/></svg>`,
    'idle-detection':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    'persistent-storage':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    popup:        `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    download:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    vr:           `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"/><circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/></svg>`,
    ar:           `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    'open-file':  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    'open-dir':   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    'protocol':   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'webauthn':   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    'keyboard-lock':`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/></svg>`,
    default:      `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  // ── Full permission definitions (from permission.site) ────────────────────
  const PERMS = [
    { id: 'camera',              label: 'Camera',              electronId: 'media' },
    { id: 'microphone',          label: 'Microphone',          electronId: 'media' },
    { id: 'notifications',       label: 'Notifications',       electronId: 'notifications' },
    { id: 'geolocation',         label: 'Location',            electronId: 'geolocation' },
    { id: 'screen-share',        label: 'Screen Share',        electronId: 'display-capture' },
    { id: 'midi',                label: 'MIDI',                electronId: 'midi' },
    { id: 'bluetooth',           label: 'Bluetooth',           electronId: 'bluetooth' },
    { id: 'usb',                 label: 'USB',                 electronId: 'usb' },
    { id: 'serial',              label: 'Serial',              electronId: 'serial' },
    { id: 'hid',                 label: 'HID',                 electronId: 'hid' },
    { id: 'nfc',                 label: 'NFC',                 electronId: 'nfc' },
    { id: 'clipboard-read',      label: 'Clipboard Read',      electronId: 'clipboard-read' },
    { id: 'clipboard-write',     label: 'Clipboard Write',     electronId: 'clipboard-sanitized-write' },
    { id: 'idle-detection',      label: 'Idle Detection',      electronId: 'idle-detection' },
    { id: 'persistent-storage',  label: 'Persistent Storage',  electronId: 'persistent-storage' },
    { id: 'fullscreen',          label: 'Fullscreen',          electronId: 'fullscreen' },
    { id: 'pointer-lock',        label: 'Pointer Lock',        electronId: 'pointerLock' },
    { id: 'keyboard-lock',       label: 'Keyboard Lock',       electronId: 'keyboardLock' },
    { id: 'device-orientation',  label: 'Device Orientation',  electronId: 'deviceOrientation' },
    { id: 'device-motion',       label: 'Device Motion',       electronId: 'deviceMotion' },
    { id: 'popup',               label: 'Popups',              electronId: 'openExternal' },
    { id: 'download',            label: 'Auto Download',       electronId: 'download' },
    { id: 'vr',                  label: 'Virtual Reality',     electronId: 'vr' },
    { id: 'ar',                  label: 'Augmented Reality',   electronId: 'ar' },
    { id: 'open-file',           label: 'Open File Picker',    electronId: 'openFile' },
    { id: 'open-dir',            label: 'Directory Picker',    electronId: 'openDirectory' },
    { id: 'protocol',            label: 'Protocol Handler',    electronId: 'registerProtocolHandler' },
    { id: 'webauthn',            label: 'WebAuthn',            electronId: 'webauthn' },
  ];

  function getIcon(id) {
    return SVG[id] || SVG.default;
  }

  // In-memory store: { domain: { permId: 'granted'|'denied' } }
  // Also tracks which perms were requested: { domain: Set<permId> }
  let _store = {};
  let _requested = {}; // domain → Set of permIds that were actually requested
  let _loaded = false;

  // ── IPC bridge ────────────────────────────────────────────────────────────
  function _invoke(channel, ...args) {
    return new Promise(resolve => {
      const reqId = '__pm_' + Date.now() + '_' + Math.random();
      function handler(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', handler);
        resolve(ev.data.result);
      }
      window.addEventListener('message', handler);
      setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 5000);
      window.parent.postMessage({ __vortexAction: true, channel: '__invoke', payload: { reqId, channel, args } }, '*');
    });
  }

  // ── Load / Save ───────────────────────────────────────────────────────────
  async function _load() {
    if (_loaded) return;
    try {
      const data = await _invoke('permissions:getAll');
      _store = (data && typeof data === 'object') ? data : {};
    } catch { _store = {}; }
    _loaded = true;
  }

  async function _save() {
    await _invoke('permissions:saveAll', _store);
  }

  // ── Track requested permissions ───────────────────────────────────────────
  function markRequested(domain, permId) {
    if (!_requested[domain]) _requested[domain] = new Set();
    _requested[domain].add(permId);
  }

  function getRequestedPerms(domain) {
    const req = _requested[domain];
    const stored = _store[domain] || {};
    // Union: requested + already stored (so stored ones always show)
    const ids = new Set([...(req || []), ...Object.keys(stored)]);
    return PERMS.filter(p => ids.has(p.id));
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function getForDomain(domain) {
    return _store[domain] || {};
  }

  function setPermission(domain, permId, status) {
    if (!_store[domain]) _store[domain] = {};
    if (status === 'ask') {
      delete _store[domain][permId];
      if (Object.keys(_store[domain]).length === 0) delete _store[domain];
    } else {
      _store[domain][permId] = status;
    }
    _save();
  }

  function resetDomain(domain) {
    delete _store[domain];
    delete _requested[domain];
    _save();
  }

  function resetAll() {
    _store = {};
    _requested = {};
    _save();
  }

  function getAllDomains() {
    return Object.keys(_store).sort();
  }

  function getStats() {
    let granted = 0, denied = 0, sites = Object.keys(_store).length;
    Object.values(_store).forEach(perms => {
      Object.values(perms).forEach(v => {
        if (v === 'granted') granted++;
        else if (v === 'denied') denied++;
      });
    });
    return { sites, granted, denied };
  }

  // ── Settings Panel Renderer ───────────────────────────────────────────────
  function render(container) {
    _load().then(() => _renderPanel(container));
  }

  function _renderPanel(container) {
    const stats = getStats();
    container.innerHTML = `
      <div style="padding:0 2px;">
        <div class="sp-stats">
          <div class="sp-stat">
            <div class="sp-stat-num">${stats.sites}</div>
            <div class="sp-stat-label">Sites</div>
          </div>
          <div class="sp-stat">
            <div class="sp-stat-num" style="color:#22c55e;">${stats.granted}</div>
            <div class="sp-stat-label">Allowed</div>
          </div>
          <div class="sp-stat">
            <div class="sp-stat-num" style="color:#ef4444;">${stats.denied}</div>
            <div class="sp-stat-label">Blocked</div>
          </div>
        </div>
        <div class="sp-actions">
          <button class="sp-reset-all" id="sp-reset-all">Reset All Permissions</button>
        </div>
        <div class="sp-search-wrap">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="sp-search" type="text" placeholder="Search by domain…" spellcheck="false" />
        </div>
        <div class="sp-site-list" id="sp-site-list"></div>
      </div>`;

    _renderList('');

    container.querySelector('#sp-search').addEventListener('input', e => {
      _renderList(e.target.value.trim().toLowerCase());
    });
    container.querySelector('#sp-reset-all').addEventListener('click', () => {
      if (!confirm('Reset ALL site permissions? This cannot be undone.')) return;
      resetAll();
      _renderPanel(container);
    });
  }

  function _renderList(query) {
    const list = document.getElementById('sp-site-list');
    if (!list) return;
    const domains = getAllDomains().filter(d => !query || d.includes(query));

    if (!domains.length) {
      list.innerHTML = `
        <div class="sp-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div>${query ? 'No sites match your search' : 'No permissions saved yet'}</div>
        </div>`;
      return;
    }

    list.innerHTML = domains.map(domain => {
      const perms = _store[domain] || {};
      const badges = Object.entries(perms).map(([pid, status]) => {
        const p = PERMS.find(x => x.id === pid);
        return p ? `<span class="sp-badge ${status}">${p.label}</span>` : '';
      }).join('');

      const permRows = PERMS.filter(p => perms[p.id]).map(p => {
        const status = perms[p.id] || 'ask';
        return `
          <div class="sp-perm-row">
            <span class="sp-perm-icon">${getIcon(p.id)}</span>
            <span class="sp-perm-name">${p.label}</span>
            <div class="sp-perm-toggle-wrap">
              <button class="sp-perm-btn ${status === 'granted' ? 'active-allow' : ''}"
                data-domain="${domain}" data-perm="${p.id}" data-val="granted">Allow</button>
              <button class="sp-perm-btn ${status === 'denied' ? 'active-block' : ''}"
                data-domain="${domain}" data-perm="${p.id}" data-val="denied">Block</button>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="sp-site-row" data-domain="${domain}">
          <div class="sp-site-header">
            <img class="sp-site-favicon"
              src="https://www.google.com/s2/favicons?domain=${domain}&sz=32"
              onerror="this.style.display='none'" loading="lazy" />
            <span class="sp-site-domain">${domain}</span>
            <div class="sp-site-badges">${badges}</div>
            <button class="sp-site-del" data-domain="${domain}" title="Remove site">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
            <svg class="sp-site-chevron" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div class="sp-site-perms">${permRows || '<div class="sp-perm-row" style="color:#4a8080;font-size:11px;padding-left:14px;">No saved permissions</div>'}</div>
        </div>`;
    }).join('');

    list.querySelectorAll('.sp-site-header').forEach(hdr => {
      hdr.addEventListener('click', e => {
        if (e.target.closest('.sp-site-del, .sp-perm-btn')) return;
        hdr.closest('.sp-site-row').classList.toggle('open');
      });
    });

    list.querySelectorAll('.sp-site-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        resetDomain(btn.dataset.domain);
        _renderList(document.getElementById('sp-search')?.value.trim().toLowerCase() || '');
      });
    });

    list.querySelectorAll('.sp-perm-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const { domain, perm, val } = btn.dataset;
        const current = (_store[domain] || {})[perm] || 'ask';
        setPermission(domain, perm, current === val ? 'ask' : val);
        const row = btn.closest('.sp-site-row');
        if (row) {
          const p2 = _store[domain] || {};
          row.querySelectorAll('.sp-perm-btn').forEach(b => {
            const active = (p2[b.dataset.perm] || 'ask') === b.dataset.val;
            b.className = 'sp-perm-btn' + (active ? (b.dataset.val === 'granted' ? ' active-allow' : ' active-block') : '');
          });
          const bw = row.querySelector('.sp-site-badges');
          if (bw) bw.innerHTML = Object.entries(p2).map(([pid, st]) => {
            const pp = PERMS.find(x => x.id === pid);
            return pp ? `<span class="sp-badge ${st}">${pp.label}</span>` : '';
          }).join('');
        }
      });
    });
  }

  async function init() {
    await _load();
  }

  return { init, render, getForDomain, setPermission, resetDomain, resetAll,
           getAllDomains, getStats, markRequested, getRequestedPerms, getIcon, PERMS };
})();
