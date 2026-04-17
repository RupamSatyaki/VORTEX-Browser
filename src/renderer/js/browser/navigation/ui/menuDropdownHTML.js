/**
 * browser/navigation/ui/menuDropdownHTML.js
 * Nav dropdown menu HTML — pure HTML, no event listeners.
 */

const NavMenuHTML = (() => {

  function render() {
    return `
      <div class="nd-item" data-action="new-tab">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
        <span class="nd-label">New Tab</span>
        <span class="nd-shortcut">Ctrl+T</span>
      </div>
      <div class="nd-item" data-action="new-window">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg></span>
        <span class="nd-label">New Window</span>
        <span class="nd-shortcut">Ctrl+N</span>
      </div>
      <div class="nd-item" data-action="new-incognito">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="1" y1="1" x2="23" y2="23" stroke="#a855f7"/></svg></span>
        <span class="nd-label" style="color:#a855f7">New Incognito Tab</span>
        <span class="nd-shortcut">Ctrl+Shift+N</span>
      </div>
      <div class="nd-sep"></div>
      <div class="nd-item" data-action="history">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
        <span class="nd-label">History</span>
        <span class="nd-shortcut">Ctrl+H</span>
      </div>
      <div class="nd-item" data-action="downloads">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
        <span class="nd-label">Downloads</span>
        <span class="nd-shortcut">Ctrl+J</span>
      </div>
      <div class="nd-item" data-action="bookmarks">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></span>
        <span class="nd-label">Bookmarks</span>
        <span class="nd-shortcut">Ctrl+B</span>
      </div>
      <div class="nd-sep"></div>
      <div class="nd-zoom-row">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></span>
        <span class="nd-label">Zoom</span>
        <div class="nd-zoom-controls">
          <button id="nd-zoom-out" title="Zoom out (Ctrl+-)">−</button>
          <span id="nd-zoom-pct">100%</span>
          <button id="nd-zoom-in" title="Zoom in (Ctrl+=)">+</button>
          <button id="nd-zoom-fs" title="Fullscreen (F11)">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
      <div class="nd-sep"></div>
      <div class="nd-item" data-action="find">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
        <span class="nd-label">Find in Page</span>
        <span class="nd-shortcut">Ctrl+F</span>
      </div>
      <div class="nd-item" data-action="screenshot">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
        <span class="nd-label">Screenshot</span>
        <span class="nd-shortcut">Ctrl+Shift+S</span>
      </div>
      <div class="nd-item" data-action="screenshot-full">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg></span>
        <span class="nd-label">Full Page Screenshot</span>
        <span class="nd-shortcut">Ctrl+Shift+F</span>
      </div>
      <div class="nd-item" data-action="print">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></span>
        <span class="nd-label">Print</span>
        <span class="nd-shortcut">Ctrl+P</span>
      </div>
      <div class="nd-item" data-action="save-page">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span>
        <span class="nd-label">Save Page</span>
        <span class="nd-shortcut">Ctrl+S</span>
      </div>
      <div class="nd-sep"></div>
      <div class="nd-item" data-action="devtools">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
        <span class="nd-label">Developer Tools</span>
        <span class="nd-shortcut">F12</span>
      </div>
      <div class="nd-item" data-action="reload-hard">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span>
        <span class="nd-label">Hard Reload</span>
        <span class="nd-shortcut">Ctrl+Shift+R</span>
      </div>
      <div class="nd-sep"></div>
      <div class="nd-item" data-action="settings">
        <span class="nd-icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
        <span class="nd-label">Settings</span>
        <span class="nd-shortcut">Ctrl+,</span>
      </div>`;
  }

  return { render };

})();
