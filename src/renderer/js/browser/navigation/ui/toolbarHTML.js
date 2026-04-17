/**
 * browser/navigation/ui/toolbarHTML.js
 * Toolbar HTML string — pure HTML, no event listeners.
 */

const NavToolbarHTML = (() => {

  const SEARCH_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>`;

  function render(isIncognito = false) {
    return `
      <button class="toolbar-btn" id="nav-back" title="Back">
        <svg viewBox="0 0 24 24" width="18" height="18"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <button class="toolbar-btn" id="nav-forward" title="Forward">
        <svg viewBox="0 0 24 24" width="18" height="18"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
      <button class="toolbar-btn" id="nav-reload" title="Reload">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
        </svg>
      </button>
      <button class="toolbar-btn" id="nav-mic" title="Voice search">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" stroke="none"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>

      <div class="address-bar" id="address-bar-wrap">
        ${SEARCH_ICON}
        <input id="url-bar" type="text" placeholder="Search or enter URL..." spellcheck="false" />
        <div class="address-bar-icons" id="address-bar-icons"></div>
        <div id="url-progress-bar"><div id="url-progress-fill"></div></div>
      </div>

      ${isIncognito ? `
      <div id="incognito-badge" title="Incognito Window — browsing not saved">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a855f7" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke="#a855f7"/>
        </svg>
        <span>Incognito</span>
      </div>` : ''}

      <button class="toolbar-btn" id="btn-downloads" title="Downloads" style="position:relative">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span id="dl-badge"></span>
      </button>

      <button class="toolbar-btn" id="nav-menu" title="Menu">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </button>

      <div class="toolbar-right">
        <button class="toolbar-btn" id="nav-summarize" title="Summarize Page (AI)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
            <path d="M12 6v6l4 2"/>
            <path d="M8 14h8M8 17h5"/>
          </svg>
        </button>
        <button class="toolbar-btn" id="nav-whatsapp" title="WhatsApp Web" style="display:none;color:#25D366;">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2.05 22l5.43-1.43c1.36.74 2.9 1.16 4.56 1.16 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.16c-1.49 0-2.9-.4-4.12-1.1l-.29-.17-3.04.8.81-2.97-.19-.31a8.23 8.23 0 0 1-1.26-4.41c0-4.54 3.7-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.16-8.38 8.16zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z"/>
          </svg>
        </button>
        <button class="toolbar-btn" id="nav-devhub" title="DevHub — Developer Tools" style="display:none">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </button>
        <button class="toolbar-btn" id="nav-sound" title="Sound">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
        <div class="assistant-text" id="btn-assistant">
          <span>Assistant</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="toolbar-separator"></div>
        <div id="proxy-indicator" title="Proxy Active — Click to manage"
          style="display:none;align-items:center;gap:5px;background:rgba(37,99,235,0.15);
                 border:1px solid rgba(37,99,235,0.3);border-radius:6px;padding:3px 9px;
                 font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer;
                 flex-shrink:0;-webkit-app-region:no-drag;letter-spacing:0.4px">
          <span style="width:6px;height:6px;border-radius:50%;background:#60a5fa;flex-shrink:0;animation:proxyDot 2s infinite"></span>
          PROXY
        </div>
        <div id="tor-indicator" title="Tor Mode Active — Click to manage"
          style="display:none;align-items:center;gap:5px;background:rgba(124,58,237,0.15);
                 border:1px solid rgba(124,58,237,0.3);border-radius:6px;padding:3px 9px;
                 font-size:10px;font-weight:700;color:#a78bfa;cursor:pointer;
                 flex-shrink:0;-webkit-app-region:no-drag;letter-spacing:0.4px">
          <span id="tor-dot" style="width:6px;height:6px;border-radius:50%;background:#a78bfa;flex-shrink:0;animation:proxyDot 2s infinite"></span>
          TOR
        </div>
        <div class="toolbar-separator"></div>
        <div class="user-icon" id="btn-user" title="Profile">V</div>
      </div>`;
  }

  return { render, SEARCH_ICON };

})();
