// Preload for guest webviews — exposes minimal IPC to page context
const { ipcRenderer } = require('electron');

window.__vortexBridge = {
  sendToHost: (channel, data) => ipcRenderer.sendToHost(channel, data),
};

// Forward Ctrl/Cmd shortcuts to host window so browser shortcuts work
// even when a webview has focus
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F11' && e.key !== 'F5') return;

  const shortcuts = new Set([
    't', 'w', 'n', 'h', 'j', 'b', 'f', 'p', 's', ',', '0',
    'Tab', 'F12', 'F11', 'F5',
  ]);

  // Ctrl+Shift+R, Ctrl+Shift+Tab
  const key = e.key;
  if (!shortcuts.has(key) && !(e.shiftKey && (key === 'R' || key === 'Tab'))) return;

  // Let the webview handle its own Ctrl+C/V/X/A/Z natively
  if (['c','v','x','a','z','y'].includes(key.toLowerCase()) && !e.shiftKey) return;

  ipcRenderer.sendToHost('webview:keydown', {
    key: e.key,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
  });
}, true); // capture phase
