const DEFAULT_URL = 'https://www.google.com';

// Settings defaults (mirrored from settings.html)
const SETTINGS_DEFAULTS = {
  startup: 'session', homepage: 'https://www.google.com',
  engine: 'google', suggestions: true, prefetch: true, tabpreview: true,
  tabsleep: true, tabsleepMinutes: 10,
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

  // Parallel: WebView init + settings load
  const [, appSettings] = await Promise.all([
    WebView.init(),
    isIncognito ? Promise.resolve({ ...SETTINGS_DEFAULTS }) : loadSettings(),
  ]);

  // Apply settings immediately
  Navigation.applySettings(appSettings);

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

  Navigation.initShortcuts();
  Navigation.initProfile();

  // Listen for settings changes from the settings panel
  IPC.on('settings:changed', (s) => {
    Navigation.applySettings(s);
  });
  window.addEventListener('message', (e) => {
    if (e.data && e.data.__vortexAction && e.data.channel === 'settings:changed') {
      Navigation.applySettings(e.data.payload);
    }
  });
});
