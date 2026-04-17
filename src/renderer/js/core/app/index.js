/**
 * core/app/index.js
 * App bootstrap — DOMContentLoaded orchestrator.
 * Delegates to: themes.js, updateBadge.js
 */

const DEFAULT_URL = 'https://www.google.com';

const SETTINGS_DEFAULTS = {
  startup: 'session', homepage: 'https://www.google.com',
  engine: 'google', suggestions: true, prefetch: true, tabpreview: true,
  tabsleep: true, tabsleepMinutes: 10,
  accentColor: '#00c8b4',
  bgTheme: 'teal',
};

async function loadSettings() {
  try {
    const stored = await Storage.read('settings');
    return Object.assign({}, SETTINGS_DEFAULTS, stored || {});
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

// Keep global aliases for backward compatibility
function applyAccent(hex)      { AppThemes.applyAccent(hex); }
function applyBgTheme(themeId) { AppThemes.applyBgTheme(themeId); }
const BG_THEMES = AppThemes.BG_THEMES;

// ── Proxy indicator ────────────────────────────────────────────────────────────
function _injectProxyStyles() {
  if (document.getElementById('proxy-indicator-style')) return;
  const s = document.createElement('style');
  s.id = 'proxy-indicator-style';
  s.textContent = `
    @keyframes proxyDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
    #proxy-indicator:hover { background:rgba(37,99,235,0.25)!important; }
    #tor-indicator:hover   { background:rgba(124,58,237,0.25)!important; }
    #tor-indicator.connecting { background:rgba(245,158,11,0.15)!important;border-color:rgba(245,158,11,0.3)!important;color:#fbbf24!important; }
    #tor-indicator.connecting #tor-dot { background:#fbbf24!important;animation-duration:0.6s!important; }
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
  if (isTor) torEl.className = s.connected ? '' : 'connecting';
}

function _bindProxyIndicators() {
  setTimeout(() => {
    const _openProxy = () => {
      Panel.open('settings');
      let tries = 0;
      const _nav = () => {
        const frame = document.getElementById('panel-frame');
        frame?.contentWindow?.postMessage({ __vortexIPC: true, channel: 'settings:navigate', data: 'proxy' }, '*');
        if (++tries < 5) setTimeout(_nav, 300);
      };
      setTimeout(_nav, 300);
    };
    document.getElementById('proxy-indicator')?.addEventListener('click', _openProxy);
    document.getElementById('tor-indicator')?.addEventListener('click', _openProxy);
  }, 1000);
}

// ── DOMContentLoaded ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  const isIncognito = new URLSearchParams(location.search).get('incognito') === '1';
  if (isIncognito) {
    document.body.classList.add('incognito-window');
    document.title = 'Vortex — Incognito';
  }

  // Non-blocking UI init
  TabPreview.init();
  ContextMenu.init();
  Navigation.render(isIncognito);
  Panel.init();
  QuickLaunch.init();
  DevHub.init();
  if (typeof PermissionManager !== 'undefined') PermissionManager.init();
  if (typeof PasswordManager   !== 'undefined') PasswordManager.initAutofill().catch(() => {});
  if (typeof AddressManager    !== 'undefined') AddressManager.load().catch(() => {});
  if (typeof BlocklistBadge    !== 'undefined') BlocklistBadge.init();

  // Update badge check (non-blocking)
  AppUpdateBadge.check();

  // Parallel: WebView init + settings load
  const [, appSettings] = await Promise.all([
    WebView.init(),
    isIncognito ? Promise.resolve({ ...SETTINGS_DEFAULTS }) : loadSettings(),
  ]);

  // Apply settings
  Navigation.applySettings(appSettings);
  AppThemes.applyAccent(appSettings.accentColor || '#00c8b4');
  AppThemes.applyBgTheme(appSettings.bgTheme || 'teal');
  if (typeof appSettings.pip === 'boolean') WebView.setPiPEnabled(appSettings.pip);
  if (appSettings.pipSites) WebView.setPiPSites(appSettings.pipSites);
  WebView.setYTAdblock(appSettings.ytAdblock !== false, appSettings.ytAdSpeed || 16);

  // Session restore / startup
  if (isIncognito) {
    Tabs.createIncognitoTab('https://www.google.com');
  } else {
    let restored = false;
    if (appSettings.startup === 'session') {
      restored = await Session.restore();
    } else if (appSettings.startup === 'homepage') {
      Tabs.createTab(appSettings.homepage || DEFAULT_URL);
      restored = true;
    }
    if (!restored) Tabs.createTab(Navigation.newTabURL());
    Session.initAutoSave();
  }

  if (window._markAppReady) window._markAppReady();

  Navigation.initShortcuts();
  Navigation.initProfile();

  // Settings changed (from settings panel IPC)
  IPC.on('settings:changed', (s) => {
    Navigation.applySettings(s);
    if (s.accentColor) AppThemes.applyAccent(s.accentColor);
    if (s.bgTheme)     AppThemes.applyBgTheme(s.bgTheme);
    WebView.setYTAdblock(s.ytAdblock !== false, s.ytAdSpeed || 16);
  });

  // Proxy indicator
  _injectProxyStyles();
  IPC.on('proxy:statusUpdate', (s) => _updateProxyIndicator(s));
  IPC.invoke('proxy:getStatus').then(s => { if (s) _updateProxyIndicator(s); }).catch(() => {});
  _bindProxyIndicators();

  // postMessage — live settings/accent/bgTheme from settings panel
  window.addEventListener('message', (e) => {
    if (!e.data?.__vortexAction) return;
    const { channel, payload } = e.data;
    if (channel === 'settings:changed') {
      Navigation.applySettings(payload);
      if (payload.accentColor) AppThemes.applyAccent(payload.accentColor);
      if (payload.bgTheme)     AppThemes.applyBgTheme(payload.bgTheme);
      if (typeof payload.pip === 'boolean') WebView.setPiPEnabled(payload.pip);
      WebView.setYTAdblock(payload.ytAdblock !== false, payload.ytAdSpeed || 16);
    }
    if (channel === 'accent:changed')  AppThemes.applyAccent(payload);
    if (channel === 'bgTheme:changed') AppThemes.applyBgTheme(payload);
    if (channel === 'proxy:statusUpdate') _updateProxyIndicator(payload);
  });

});
