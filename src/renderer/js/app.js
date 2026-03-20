const DEFAULT_URL = 'https://www.google.com';
const CACHE_REFRESH_MS = 5 * 60 * 1000;

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

  // Try to restore last session, fall back to default page
  const restored = await Session.restore();
  if (!restored) {
    Tabs.createTab(DEFAULT_URL);
  }

  Session.initAutoSave();
  Navigation.initShortcuts();
  Panel.init();
});
