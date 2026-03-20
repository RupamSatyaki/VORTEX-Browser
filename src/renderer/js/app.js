const DEFAULT_URL = 'https://www.google.com';
const CACHE_REFRESH_MS = 5 * 60 * 1000;

// Settings defaults (mirrored from settings.html)
const SETTINGS_DEFAULTS = {
  startup: 'session', homepage: 'https://www.google.com',
  engine: 'google', suggestions: true, prefetch: true, tabpreview: true,
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

function warmDefaultPageCache() {
  const wv = document.createElement('webview');
  wv.src = DEFAULT_URL;
  wv.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px;';
  document.body.appendChild(wv);
  wv.addEventListener('did-finish-load', () => {
    setTimeout(() => { if (wv.isConnected) wv.reload(); }, CACHE_REFRESH_MS);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  warmDefaultPageCache();

  TabPreview.init();
  ContextMenu.init();
  Navigation.render();
  await WebView.init();

  // Load settings first, then decide startup behavior
  const appSettings = await loadSettings();

  // Apply settings to modules
  Navigation.applySettings(appSettings);

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
  Navigation.initShortcuts();
  Navigation.initProfile();
  Panel.init();

  // Listen for settings changes from the settings panel
  IPC.on('settings:changed', (s) => {
    Navigation.applySettings(s);
  });
  // Also handle postMessage from settings iframe
  window.addEventListener('message', (e) => {
    if (e.data && e.data.__vortexAction && e.data.channel === 'settings:changed') {
      Navigation.applySettings(e.data.payload);
    }
  });
});
