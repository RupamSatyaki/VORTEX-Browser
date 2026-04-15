const DEFAULT_URL = 'https://www.google.com';

// Settings defaults (mirrored from settings.html)
const SETTINGS_DEFAULTS = {
  startup: 'session', homepage: 'https://www.google.com',
  engine: 'google', suggestions: true, prefetch: true, tabpreview: true,
  tabsleep: true, tabsleepMinutes: 10,
  accentColor: '#00c8b4',
  bgTheme: 'teal',
};

// Load settings from storage/settings.json
async function loadSettings() {
  try {
    const stored = await Storage.read('settings');
    return Object.assign({}, SETTINGS_DEFAULTS, stored || {});
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

// ── Accent Color ──────────────────────────────────────────────────────────────
function _hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyAccent(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-dim', _hexToRgba(hex, 0.15));
  root.style.setProperty('--accent-glow', _hexToRgba(hex, 0.25));
  root.style.setProperty('--accent-10', _hexToRgba(hex, 0.10));
  root.style.setProperty('--accent-20', _hexToRgba(hex, 0.20));
}

// ── Background Themes ─────────────────────────────────────────────────────────
const BG_THEMES = {
  teal: {
    '--bg-base':'#1a2e2e','--bg-surface':'#22383a','--bg-tab':'#1c2f30',
    '--bg-tab-active':'#36676c','--bg-hover':'#253f40','--bg-panel':'#0f2222',
    '--bg-deep':'#0d1f1f','--bg-input':'#22383a','--bg-border':'#2e4a4c',
    '--bg-border2':'#1e3838','--text-main':'#c8e8e5','--text-muted':'#7aadad','--text-dim':'#4a8080',
  },
  'teal-blur': {
    '--bg-base':'#162828','--bg-surface':'#1e3434','--bg-tab':'#182c2c',
    '--bg-tab-active':'#2e5a5e','--bg-hover':'#203838','--bg-panel':'#0e1e1e',
    '--bg-deep':'#0b1a1a','--bg-input':'#1e3434','--bg-border':'#264444',
    '--bg-border2':'#1a3030','--text-main':'#b8dede','--text-muted':'#6a9e9e','--text-dim':'#3e7070',
  },
  midnight: {
    '--bg-base':'#0f1117','--bg-surface':'#1a1d27','--bg-tab':'#13161f',
    '--bg-tab-active':'#2a3050','--bg-hover':'#1e2235','--bg-panel':'#0a0c14',
    '--bg-deep':'#080a10','--bg-input':'#1a1d27','--bg-border':'#252840',
    '--bg-border2':'#181b2e','--text-main':'#d0d4f0','--text-muted':'#7880b0','--text-dim':'#454870',
  },
  slate: {
    '--bg-base':'#141820','--bg-surface':'#1c2130','--bg-tab':'#161b28',
    '--bg-tab-active':'#2c3a5a','--bg-hover':'#202840','--bg-panel':'#0e1118',
    '--bg-deep':'#0b0e15','--bg-input':'#1c2130','--bg-border':'#28304a',
    '--bg-border2':'#1a2038','--text-main':'#c8d0e8','--text-muted':'#7080a8','--text-dim':'#404870',
  },
  forest: {
    '--bg-base':'#141e14','--bg-surface':'#1c2a1c','--bg-tab':'#162018',
    '--bg-tab-active':'#2a4a2e','--bg-hover':'#1e3020','--bg-panel':'#0e160e',
    '--bg-deep':'#0a1208','--bg-input':'#1c2a1c','--bg-border':'#264028',
    '--bg-border2':'#1a2e1c','--text-main':'#c0dcc0','--text-muted':'#6a9a6a','--text-dim':'#3e6040',
  },
  crimson: {
    '--bg-base':'#1e1214','--bg-surface':'#2a1a1e','--bg-tab':'#201416',
    '--bg-tab-active':'#4a2030','--bg-hover':'#2e1820','--bg-panel':'#160e10',
    '--bg-deep':'#120a0c','--bg-input':'#2a1a1e','--bg-border':'#3a2028',
    '--bg-border2':'#281418','--text-main':'#e8c8cc','--text-muted':'#a07080','--text-dim':'#6a4050',
  },
  ocean: {
    '--bg-base':'#0d1e2e','--bg-surface':'#142436','--bg-tab':'#101c2a',
    '--bg-tab-active':'#1e4060','--bg-hover':'#182a40','--bg-panel':'#091420',
    '--bg-deep':'#060e18','--bg-input':'#142436','--bg-border':'#1e3450',
    '--bg-border2':'#122038','--text-main':'#c0d8f0','--text-muted':'#6090b8','--text-dim':'#385878',
  },
  aurora: {
    '--bg-base':'#141020','--bg-surface':'#1e1830','--bg-tab':'#181428',
    '--bg-tab-active':'#342858','--bg-hover':'#221e38','--bg-panel':'#0e0c18',
    '--bg-deep':'#0a0810','--bg-input':'#1e1830','--bg-border':'#2e2448',
    '--bg-border2':'#1e1a34','--text-main':'#d4c8f0','--text-muted':'#8878b8','--text-dim':'#504878',
  },
  amber: {
    '--bg-base':'#1e1a0e','--bg-surface':'#2a2414','--bg-tab':'#201e10',
    '--bg-tab-active':'#4a3c18','--bg-hover':'#2e2818','--bg-panel':'#141008',
    '--bg-deep':'#100c06','--bg-input':'#2a2414','--bg-border':'#3a3020',
    '--bg-border2':'#282010','--text-main':'#f0e0b0','--text-muted':'#b09060','--text-dim':'#706040',
  },
  obsidian: {
    '--bg-base':'#0e0e10','--bg-surface':'#161618','--bg-tab':'#121214',
    '--bg-tab-active':'#242430','--bg-hover':'#1a1a20','--bg-panel':'#080810',
    '--bg-deep':'#050508','--bg-input':'#161618','--bg-border':'#222228',
    '--bg-border2':'#181820','--text-main':'#d8d8e8','--text-muted':'#7878a0','--text-dim':'#484860',
  },
};

function applyBgTheme(themeId) {
  const vars = BG_THEMES[themeId] || BG_THEMES.teal;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}


document.addEventListener('DOMContentLoaded', async () => {
  // Check if this is an incognito window (passed via URL query param)
  const isIncognito = new URLSearchParams(location.search).get('incognito') === '1';
  if (isIncognito) {
    document.body.classList.add('incognito-window');
    document.title = 'Vortex — Incognito';
  }

  // Non-blocking UI init first
  TabPreview.init();
  ContextMenu.init();
  Navigation.render(isIncognito);
  Panel.init();
  QuickLaunch.init();
  DevHub.init();
  if (typeof PermissionManager !== 'undefined') PermissionManager.init();
  // Init password autofill (loads imported + tries cached vault session)
  if (typeof PasswordManager !== 'undefined') {
    PasswordManager.initAutofill().catch(() => {});
  }
  // Load addresses for autofill
  if (typeof AddressManager !== 'undefined') {
    AddressManager.load().catch(() => {});
  }
  // Init blocklist badge
  if (typeof BlocklistBadge !== 'undefined') {
    BlocklistBadge.init();
  }

  // Check for updates in background (non-blocking)
  _checkUpdateBadge();

  // Parallel: WebView init + settings load
  const [, appSettings] = await Promise.all([
    WebView.init(),
    isIncognito ? Promise.resolve({ ...SETTINGS_DEFAULTS }) : loadSettings(),
  ]);

  // Apply settings immediately
  Navigation.applySettings(appSettings);
  applyAccent(appSettings.accentColor || '#00c8b4');
  applyBgTheme(appSettings.bgTheme || 'teal');
  if (typeof appSettings.pip === 'boolean') WebView.setPiPEnabled(appSettings.pip);
  if (appSettings.pipSites) WebView.setPiPSites(appSettings.pipSites);
  WebView.setYTAdblock(appSettings.ytAdblock !== false, appSettings.ytAdSpeed || 16);

  // Incognito window — always open fresh tab, no session restore
  if (isIncognito) {
    Tabs.createIncognitoTab('https://www.google.com');
  } else {
    // Session restore / startup tab — after settings known
    let restored = false;
    if (appSettings.startup === 'session') {
      restored = await Session.restore();
    } else if (appSettings.startup === 'homepage') {
      Tabs.createTab(appSettings.homepage || DEFAULT_URL);
      restored = true;
    }
    if (!restored) {
      Tabs.createTab(Navigation.newTabURL());
    }
    Session.initAutoSave();
  }

  // Signal that app is fully ready — process any queued external URL
  if (window._markAppReady) window._markAppReady();

  Navigation.initShortcuts();
  Navigation.initProfile();
  // Listen for settings changes from the settings panel
  IPC.on('settings:changed', (s) => {
    Navigation.applySettings(s);
    if (s.accentColor) applyAccent(s.accentColor);
    if (s.bgTheme) applyBgTheme(s.bgTheme);
    WebView.setYTAdblock(s.ytAdblock !== false, s.ytAdSpeed || 16);
  });

  // ── Proxy toolbar indicator ───────────────────────────────────────────────
  // Inject animation CSS once
  if (!document.getElementById('proxy-indicator-style')) {
    const s = document.createElement('style');
    s.id = 'proxy-indicator-style';
    s.textContent = `
      @keyframes proxyDot {
        0%,100% { opacity:1; }
        50%      { opacity:0.4; }
      }
      #proxy-indicator:hover { background:rgba(37,99,235,0.25) !important; }
      #tor-indicator:hover   { background:rgba(124,58,237,0.25) !important; }
      #tor-indicator.connecting { background:rgba(245,158,11,0.15) !important; border-color:rgba(245,158,11,0.3) !important; color:#fbbf24 !important; }
      #tor-indicator.connecting #tor-dot { background:#fbbf24 !important; animation-duration:0.6s !important; }
    `;
    document.head.appendChild(s);
  }

  function _updateProxyIndicator(s) {
    const proxyEl = document.getElementById('proxy-indicator');
    const torEl   = document.getElementById('tor-indicator');
    if (!proxyEl || !torEl) return;

    const isProxy = s.enabled && (s.type === 'http' || s.type === 'socks5');
    const isTor   = s.enabled && s.type === 'tor';

    proxyEl.style.display = isProxy ? 'flex' : 'none';
    torEl.style.display   = isTor   ? 'flex' : 'none';

    if (isTor) {
      torEl.className = s.connected ? '' : 'connecting';
    }
  }

  // Listen for proxy status updates (from settings panel via postMessage)
  window.addEventListener('message', (e) => {
    if (e.data && e.data.__vortexAction && e.data.channel === 'proxy:statusUpdate') {
      _updateProxyIndicator(e.data.payload);
    }
  });

  // Also listen directly from main process
  IPC.on('proxy:statusUpdate', (s) => _updateProxyIndicator(s));

  // Load initial proxy status
  IPC.invoke('proxy:getStatus').then(s => { if (s) _updateProxyIndicator(s); }).catch(() => {});

  // Click indicators → open settings on proxy section
  setTimeout(() => {
    const proxyEl = document.getElementById('proxy-indicator');
    const torEl   = document.getElementById('tor-indicator');
    const _openProxy = () => {
      Panel.open('settings');
      let tries = 0;
      const _nav = () => {
        const frame = document.getElementById('panel-frame');
        if (frame && frame.contentWindow) {
          frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'settings:navigate', data: 'proxy' }, '*');
        }
        if (++tries < 5) setTimeout(_nav, 300);
      };
      setTimeout(_nav, 300);
    };
    if (proxyEl) proxyEl.addEventListener('click', _openProxy);
    if (torEl)   torEl.addEventListener('click', _openProxy);
  }, 1000);
  window.addEventListener('message', (e) => {
    if (e.data && e.data.__vortexAction && e.data.channel === 'settings:changed') {
      Navigation.applySettings(e.data.payload);
      if (e.data.payload.accentColor) applyAccent(e.data.payload.accentColor);
      if (e.data.payload.bgTheme) applyBgTheme(e.data.payload.bgTheme);
      if (typeof e.data.payload.pip === 'boolean') WebView.setPiPEnabled(e.data.payload.pip);
      WebView.setYTAdblock(e.data.payload.ytAdblock !== false, e.data.payload.ytAdSpeed || 16);
    }
    // Live accent update
    if (e.data && e.data.__vortexAction && e.data.channel === 'accent:changed') {
      applyAccent(e.data.payload);
    }
    // Live bg theme update
    if (e.data && e.data.__vortexAction && e.data.channel === 'bgTheme:changed') {
      applyBgTheme(e.data.payload);
    }
  });
});

// ── Update badge check ────────────────────────────────────────────────────────
async function _checkUpdateBadge() {
  try {
    const currentVer = await IPC.invoke('app:version');
    if (!currentVer) return;

    const releases = await IPC.invoke('updater:fetchAllReleases');
    if (!releases || releases.error || !releases.length) return;

    const latest = releases[0];
    if (!latest || !latest.tag) return;

    // Compare versions
    function _cmp(a, b) {
      const pa = a.replace(/^v/, '').split('.').map(Number);
      const pb = b.replace(/^v/, '').split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if ((pa[i]||0) > (pb[i]||0)) return 1;
        if ((pa[i]||0) < (pb[i]||0)) return -1;
      }
      return 0;
    }

    if (_cmp(currentVer, latest.tag) < 0) {
      // Update available — show badge button
      _showUpdateBadge(latest.tag, latest.name);
    }
  } catch {}
}

function _showUpdateBadge(tag, name) {
  // Don't show if already exists
  if (document.getElementById('update-badge-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'update-badge-btn';
  btn.title = `Update available: ${tag} — Click to update`;
  btn.style.cssText = `
    display:flex; align-items:center; gap:5px;
    background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3);
    border-radius:6px; color:#22c55e; font-size:11px; font-weight:700;
    padding:4px 10px; cursor:pointer; transition:all 0.15s;
    white-space:nowrap; flex-shrink:0;
    -webkit-app-region: no-drag;
    animation:updatePulse 2s ease-in-out infinite;
    margin-right:6px;
  `;

  // Inject animation
  if (!document.getElementById('update-badge-style')) {
    const s = document.createElement('style');
    s.id = 'update-badge-style';
    s.textContent = `
      @keyframes updatePulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
        50%      { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
      }
      #update-badge-btn:hover {
        background: rgba(34,197,94,0.22) !important;
        border-color: rgba(34,197,94,0.5) !important;
        transform: translateY(-1px);
      }
    `;
    document.head.appendChild(s);
  }

  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    ${tag}
  `;

  // Insert inside window-controls div, before minimize button
  const controls = document.querySelector('.window-controls');
  if (controls) {
    controls.insertBefore(btn, controls.firstChild);
  }

  // Click → open settings on Updates tab
  btn.addEventListener('click', () => {
    Panel.open('settings');
    // Wait for settings iframe to load then navigate to updates
    let attempts = 0;
    const _tryNavigate = () => {
      const frame = document.getElementById('panel-frame');
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({
          __vortexIPC: true,
          channel: 'settings:navigate',
          data: 'updates'
        }, '*');
      }
      // Retry a few times to ensure iframe is ready
      if (++attempts < 5) setTimeout(_tryNavigate, 300);
    };
    setTimeout(_tryNavigate, 300);
  });
}
