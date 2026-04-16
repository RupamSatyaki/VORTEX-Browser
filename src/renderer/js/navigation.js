// Navigation toolbar
const Navigation = (() => {
  let firstClick = true;
  let _currentNavDomain = '';

  // ── Security icons ────────────────────────────────────────────────────────
  const LOCK_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2" style="cursor:pointer;flex-shrink:0;transition:opacity 0.15s" title="Secure connection">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>`;

  const UNLOCK_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Not secure — connection is not encrypted">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`;

  const LOCAL_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Local network">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`;

  const VORTEX_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2" style="flex-shrink:0" title="Vortex internal page">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`;

  const SEARCH_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>`;

  function render(isIncognito = false) {
    const container = document.getElementById('navbar-container');
    container.className = 'browser-toolbar';
    container.innerHTML = `
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
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <!-- WhatsApp logo SVG -->
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
        <div id="proxy-indicator" title="Proxy Active — Click to manage" style="display:none;align-items:center;gap:5px;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);border-radius:6px;padding:3px 9px;font-size:10px;font-weight:700;color:#60a5fa;cursor:pointer;flex-shrink:0;-webkit-app-region:no-drag;letter-spacing:0.4px">
          <span style="width:6px;height:6px;border-radius:50%;background:#60a5fa;flex-shrink:0;animation:proxyDot 2s infinite"></span>
          PROXY
        </div>
        <div id="tor-indicator" title="Tor Mode Active — Click to manage" style="display:none;align-items:center;gap:5px;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);border-radius:6px;padding:3px 9px;font-size:10px;font-weight:700;color:#a78bfa;cursor:pointer;flex-shrink:0;-webkit-app-region:no-drag;letter-spacing:0.4px">
          <span id="tor-dot" style="width:6px;height:6px;border-radius:50%;background:#a78bfa;flex-shrink:0;animation:proxyDot 2s infinite"></span>
          TOR
        </div>
        <div class="toolbar-separator"></div>
        <div class="user-icon" id="btn-user" title="Profile">V</div>
      </div>
    `;

    document.getElementById('nav-back').addEventListener('click', () => WebView.goBack());
    document.getElementById('nav-forward').addEventListener('click', () => WebView.goForward());
    document.getElementById('nav-reload').addEventListener('click', () => WebView.reload());
    document.getElementById('btn-downloads').addEventListener('click', () => Panel.open('downloads'));
    document.getElementById('nav-summarize').addEventListener('click', () => Summarizer.open());
    document.getElementById('nav-whatsapp')?.addEventListener('click', () => WhatsAppPanel.toggle());
    document.getElementById('nav-devhub')?.addEventListener('click', () => DevHub.toggle());
    if (typeof PermissionPopup !== 'undefined') {
      PermissionPopup.initShortcut();
    }
    // Autofill + blocklist init (styles only, icons inject on hover)
    if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.init();
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge.init();

    // ── Address bar icons — inject on hover, remove on leave ─────────────────
    const addrBar = document.getElementById('address-bar-wrap');
    if (addrBar) {
      let _iconsInjected = false;

      function _injectIcons() {
        if (_iconsInjected) return;
        _iconsInjected = true;
        const iconsWrap = document.getElementById('address-bar-icons');
        if (!iconsWrap) return;

        iconsWrap.innerHTML = `
          <div class="address-icon" id="btn-permissions" title="Site Permissions (Ctrl+Shift+I)" style="position:relative;color:#4a8080;display:none;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span id="perm-addr-badge" style="position:absolute;top:2px;right:2px;width:6px;height:6px;border-radius:50%;display:none;"></span>
          </div>
          <div class="address-icon" id="btn-autofill" title="Autofill Password" style="position:relative;color:#4a8080;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <span class="pm-autofill-badge" id="pm-af-badge" style="display:none;"></span>
          </div>
          <div class="address-icon" id="btn-blocklist-badge" title="Ad & Tracker Blocking" style="position:relative;color:#4a8080;opacity:0.5;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
            <span class="bl-badge-count" id="bl-badge-num" style="display:none;position:absolute;top:0;right:0;background:var(--accent,#00c8b4);color:#001a18;font-size:8px;font-weight:700;border-radius:6px;padding:0 3px;min-width:12px;text-align:center;line-height:14px;"></span>
          </div>
          <div class="address-icon" id="btn-bookmark" title="Bookmark" style="color:#4a8080;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="address-icon" id="btn-copy-url" title="Copy URL" style="color:#4a8080;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>`;

        // ── Bind all icon click listeners ──────────────────────────────────

        // Permissions icon
        const permBtn = document.getElementById('btn-permissions');
        if (permBtn && typeof PermissionPopup !== 'undefined') {
          PermissionPopup.updateBadge(_currentNavDomain);
          permBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            PermissionPopup.toggle();
          });
        }

        // Autofill icon
        const autofillBtn = document.getElementById('btn-autofill');
        if (autofillBtn && typeof PasswordAutofill !== 'undefined') {
          PasswordAutofill.updateBadge(_currentNavDomain);
          autofillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            PasswordAutofill._toggleDropdown();
          });
        }

        // Blocklist badge icon — non-clickable, just shows count
        const blBtn = document.getElementById('btn-blocklist-badge');
        if (blBtn && typeof BlocklistBadge !== 'undefined') {
          BlocklistBadge._refreshBadge();
          blBtn.style.cursor = 'default';
          blBtn.style.pointerEvents = 'none';
        }

        // Bookmark icon
        const bookmarkBtn = document.getElementById('btn-bookmark');
        if (bookmarkBtn) {
          // Apply cached bookmark state immediately (no async wait)
          if (window._bookmarkState) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.title = 'Remove bookmark';
          } else {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.title = 'Bookmark this page';
          }
          // Also trigger async check to ensure fresh state
          if (window._updateBookmarkIcon) window._updateBookmarkIcon();
          bookmarkBtn.addEventListener('click', async () => {
            const urlBar = document.getElementById('url-bar');
            const url = urlBar.dataset.fullUrl || urlBar.value;
            if (!url || url.startsWith('vortex://')) return;
            const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
            if (isBookmarked) {
              const list = await BookmarkStore.load();
              const bm = list.find(b => b.url === url);
              if (bm) {
                await BookmarkStore.remove(bm.id);
                window._forwardToBookmarksFrame && window._forwardToBookmarksFrame('bookmark:removed', bm.id);
              }
              bookmarkBtn.classList.remove('bookmarked');
              bookmarkBtn.title = 'Bookmark this page';
            } else {
              const title = document.title.replace(' — Vortex', '') || url;
              const entry = { id: Date.now().toString(), url, title, addedAt: Date.now() };
              const added = await BookmarkStore.add(entry);
              if (added) window._forwardToBookmarksFrame && window._forwardToBookmarksFrame('bookmark:added', entry);
              bookmarkBtn.classList.add('bookmarked');
              bookmarkBtn.title = 'Remove bookmark';
            }
          });
        }

        // Copy URL icon
        const copyBtn = document.getElementById('btn-copy-url');
        if (copyBtn) {
          copyBtn.addEventListener('click', () => {
            const urlBar = document.getElementById('url-bar');
            const url = urlBar.dataset.fullUrl || urlBar.value;
            if (!url) return;
            navigator.clipboard.writeText(url).then(() => {
              copyBtn.title = 'Copied!';
              setTimeout(() => { copyBtn.title = 'Copy URL'; }, 1500);
            });
          });
        }

        // Animate icons in
        requestAnimationFrame(() => {
          iconsWrap.querySelectorAll('.address-icon').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.8)';
            el.style.transition = `opacity 0.12s ease ${i * 25}ms, transform 0.12s ease ${i * 25}ms`;
            requestAnimationFrame(() => {
              el.style.opacity = el.id === 'btn-blocklist-badge' ? '0.5' : '1';
              el.style.transform = 'scale(1)';
            });
          });
        });
      }

      function _removeIcons() {
        // Don't remove if a dropdown/popup from icons is open
        if (document.getElementById('pm-autofill-dropdown')?.classList.contains('visible')) return;
        if (document.getElementById('url-security-popup')) return;
        if (document.getElementById('perm-popup')) return;

        const iconsWrap = document.getElementById('address-bar-icons');
        if (!iconsWrap || !_iconsInjected) return;

        // Animate out then clear
        iconsWrap.querySelectorAll('.address-icon').forEach(el => {
          el.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
          el.style.opacity = '0';
          el.style.transform = 'scale(0.8)';
        });
        setTimeout(() => {
          if (!addrBar.matches(':hover') && !addrBar.matches(':focus-within')) {
            iconsWrap.innerHTML = '';
            _iconsInjected = false;
          }
        }, 120);
      }

      addrBar.addEventListener('mouseenter', _injectIcons);
      addrBar.addEventListener('focusin',    _injectIcons);
      addrBar.addEventListener('mouseleave', _removeIcons);
      addrBar.addEventListener('focusout', (e) => {
        if (!addrBar.contains(e.relatedTarget)) _removeIcons();
      });
    }

    // Zoom buttons
    document.getElementById('zoom-in-btn').addEventListener('click', () => WebView.zoomIn());
    document.getElementById('zoom-out-btn').addEventListener('click', () => WebView.zoomOut());
    document.getElementById('zoom-reset-btn').addEventListener('click', () => WebView.zoomReset());

    // Menu button → dropdown
    document.getElementById('nav-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      _toggleMenu();
    });

    const urlBar = document.getElementById('url-bar');

    // First click → select all; second click → normal cursor placement
    urlBar.addEventListener('mousedown', (e) => {
      if (document.activeElement !== urlBar) {
        // Not focused yet — first click
        firstClick = true;
      } else {
        firstClick = false;
      }
    });

    urlBar.addEventListener('focus', () => {
      // Show full URL on focus
      const fullUrl = urlBar.dataset.fullUrl || urlBar.value;
      if (fullUrl && fullUrl !== urlBar.value) {
        urlBar.value = fullUrl;
      }
      if (firstClick) {
        setTimeout(() => urlBar.select(), 0);
        firstClick = false;
      }
    });

    urlBar.addEventListener('blur', () => {
      firstClick = true;
      Omnibox.onBlur();
      // Restore clean URL on blur
      const fullUrl = urlBar.dataset.fullUrl;
      if (fullUrl && !urlBar.value.startsWith('http') && !urlBar.value.startsWith('vortex://')) {
        // User didn't type a new URL — restore clean display
      } else if (fullUrl) {
        urlBar.value = _cleanDisplayUrl(fullUrl);
      }
    });

    urlBar.addEventListener('keydown', (e) => {
      if (Omnibox.onKeydown(e)) return; // omnibox handled it
      if (e.key === 'Enter') navigate();
      if (e.key === 'Escape') { urlBar.blur(); }
    });

    urlBar.addEventListener('input', (e) => {
      Prefetch.onInput(e.target.value);
      Omnibox.onInput(e.target.value);
      updateSecurityIcon(''); // searching — show search icon
    });

    // Profile button → dropdown
    document.getElementById('btn-user').addEventListener('click', (e) => {
      e.stopPropagation();
      _toggleProfileMenu();
    });
  }

  function updateSecurityIcon(url) {
    const wrap = document.getElementById('address-bar-wrap');
    if (!wrap) return;
    const old = document.getElementById('url-security-icon');
    if (!old) return;

    let newIcon;
    let borderColor = '';

    if (!url || url === '' || url.startsWith('about:')) {
      newIcon = SEARCH_ICON;
    } else if (url.startsWith('vortex://')) {
      newIcon = VORTEX_ICON;
    } else if (_isLocalAddress(url)) {
      newIcon = LOCAL_ICON;
      // Local addresses — no warning needed
    } else if (url.startsWith('https://')) {
      newIcon = LOCK_ICON;
    } else if (url.startsWith('http://')) {
      newIcon = UNLOCK_ICON;
      borderColor = 'rgba(245,158,11,0.4)';
    } else {
      newIcon = SEARCH_ICON;
    }

    const tmp = document.createElement('div');
    tmp.innerHTML = newIcon;
    const newEl = tmp.firstElementChild;

    // Click handler for security icon
    newEl.addEventListener('click', (e) => {
      e.stopPropagation();
      _showSecurityPopup(url, newEl);
    });

    old.replaceWith(newEl);

    // Address bar border tint for HTTP
    if (borderColor) {
      wrap.style.setProperty('--http-border', borderColor);
      wrap.classList.add('http-warning');
    } else {
      wrap.classList.remove('http-warning');
    }
  }

  // ── Local address detection ───────────────────────────────────────────────
  function _isLocalAddress(url) {
    try {
      const host = new URL(url).hostname;
      return /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0)/.test(host)
          || /\.(local|lan|internal|home|corp|intranet|localdomain)$/.test(host)
          || /^\d+\.\d+\.\d+\.\d+$/.test(host); // any IP
    } catch { return false; }
  }

  // ── Security popup ────────────────────────────────────────────────────────
  function _showSecurityPopup(url, anchor) {
    const existing = document.getElementById('url-security-popup');
    if (existing) { existing.remove(); return; }

    let type = 'search';
    if (url.startsWith('vortex://'))      type = 'vortex';
    else if (_isLocalAddress(url))        type = 'local';
    else if (url.startsWith('https://'))  type = 'secure';
    else if (url.startsWith('http://'))   type = 'insecure';

    const CONFIGS = {
      secure:   { icon: '🔒', color: '#22c55e', title: 'Connection is secure',       desc: 'Your connection to this site is encrypted and authenticated.' },
      insecure: { icon: '⚠️', color: '#f59e0b', title: 'Connection is not secure',   desc: 'Passwords and data you enter may be visible to others on the network.' },
      local:    { icon: '🏠', color: '#3b82f6', title: 'Local network',              desc: 'This is a local or private network address.' },
      vortex:   { icon: '🛡️', color: 'var(--accent,#00c8b4)', title: 'Vortex page', desc: 'This is a built-in Vortex browser page.' },
      search:   { icon: '🔍', color: '#4a8080', title: 'Search',                     desc: 'Enter a URL or search term.' },
    };

    const cfg = CONFIGS[type];
    let domain = '';
    try { domain = new URL(url).hostname; } catch {}

    const popup = document.createElement('div');
    popup.id = 'url-security-popup';
    popup.style.cssText = `
      position:fixed; z-index:99999;
      background:var(--bg-panel,#0f2222); border:1px solid var(--bg-border,#2e4a4c);
      border-radius:10px; width:280px; padding:14px 16px;
      box-shadow:0 12px 40px rgba(0,0,0,0.6);
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      animation:secPopIn 0.15s ease;
    `;

    if (!document.getElementById('sec-pop-style')) {
      const s = document.createElement('style');
      s.id = 'sec-pop-style';
      s.textContent = `@keyframes secPopIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }

    popup.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:18px;">${cfg.icon}</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:${cfg.color};">${cfg.title}</div>
          ${domain ? `<div style="font-size:11px;color:#4a8080;margin-top:1px;">${domain}</div>` : ''}
        </div>
      </div>
      <div style="font-size:12px;color:#7aadad;line-height:1.6;margin-bottom:${type==='insecure'?'12px':'0'};">${cfg.desc}</div>
      ${type === 'insecure' ? `
        <button id="sec-try-https" style="width:100%;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:7px;color:#f59e0b;font-size:12px;font-weight:600;padding:7px;cursor:pointer;transition:all 0.15s;">
          Try HTTPS instead →
        </button>` : ''}
    `;

    document.body.appendChild(popup);

    // Position below anchor
    const rect = anchor.getBoundingClientRect();
    popup.style.top  = (rect.bottom + 8) + 'px';
    popup.style.left = Math.max(8, rect.left - 10) + 'px';

    // Try HTTPS button
    popup.querySelector('#sec-try-https')?.addEventListener('click', () => {
      popup.remove();
      const httpsUrl = url.replace(/^http:\/\//, 'https://');
      WebView.loadURL(httpsUrl);
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', () => popup.remove(), { once: true });
    }, 0);
  }

  // Search engine URL templates
  const SEARCH_ENGINES = {
    google:     'https://www.google.com/search?q=',
    bing:       'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    brave:      'https://search.brave.com/search?q=',
    ecosia:     'https://www.ecosia.org/search?q=',
  };

  // Homepage for each engine (opened on new tab)
  const ENGINE_HOME = {
    google:     'https://www.google.com',
    bing:       'https://www.bing.com',
    duckduckgo: 'https://duckduckgo.com',
    brave:      'https://search.brave.com',
    ecosia:     'https://www.ecosia.org',
  };

  function _newTabURL() {
    return 'https://www.google.com';
  }

  let _searchEngine = 'google';

  function navigate() {
    const bar = document.getElementById('url-bar');
    // If user didn't edit — use stored full URL
    const stored = bar.dataset.fullUrl || '';
    const displayed = _cleanDisplayUrl(stored);
    let url = (stored && bar.value.trim() === displayed)
      ? stored
      : bar.value.trim();

    if (!url) return;

    if (!/^https?:\/\//i.test(url) && !url.startsWith('vortex://') && !url.startsWith('file://')) {
      const base = SEARCH_ENGINES[_searchEngine] || SEARCH_ENGINES.google;
      if (url.includes(' ') || (!url.includes('.') && !_isLocalHostname(url))) {
        url = base + encodeURIComponent(url);
      } else if (_isLocalHostname(url)) {
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }

    WebView.loadURL(url);
    bar.blur();
  }

  // Detect if hostname should use http:// by default
  function _isLocalHostname(host) {
    // Remove port if present
    const h = host.split(':')[0].toLowerCase();
    return h === 'localhost'
      || /^127\./.test(h)
      || /^192\.168\./.test(h)
      || /^10\./.test(h)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
      || /^0\.0\.0\.0/.test(h)
      || /^\d+\.\d+\.\d+\.\d+$/.test(h)   // any IPv4
      || /\.(local|lan|internal|home|corp|intranet|localdomain)$/.test(h);
  }

  function applySettings(s) {
    if (s.engine) _searchEngine = s.engine;
    if (typeof s.prefetch === 'boolean') Prefetch.setEnabled(s.prefetch);
    if (typeof s.suggestions === 'boolean') Prefetch.setSuggestionsEnabled(s.suggestions);
    if (typeof s.tabpreview === 'boolean') TabPreview.setEnabled(s.tabpreview);
    if (typeof s.tabsleep === 'boolean') Tabs.setSleepEnabled(s.tabsleep);
    if (s.tabsleepMinutes !== undefined) Tabs.setSleepTimeout(Number(s.tabsleepMinutes));
    if (typeof s.pip === 'boolean') WebView.setPiPEnabled(s.pip);
    if (s.spellcheckLang && window.vortexAPI) {
      window.vortexAPI.send('spellcheck:setLanguage', s.spellcheckLang);
    }
    // WhatsApp toolbar button visibility
    const waBtn = document.getElementById('nav-whatsapp');
    if (waBtn) waBtn.style.display = s.whatsappBtn !== false ? '' : 'none';
    // DevHub toolbar button visibility
    const dhBtn = document.getElementById('nav-devhub');
    if (dhBtn) dhBtn.style.display = s.devhubBtn !== false ? '' : 'none';
  }

  function setURL(url) {
    const bar = document.getElementById('url-bar');
    if (bar) {
      bar.dataset.fullUrl = url || '';
      bar.value = _cleanDisplayUrl(url || '');
    }
    updateSecurityIcon(url);
    if (window._updateBookmarkIcon) window._updateBookmarkIcon();
    // Track current domain for icon badge updates
    try {
      _currentNavDomain = url && url.startsWith('http') ? new URL(url).hostname.replace(/^www\./, '') : '';
    } catch { _currentNavDomain = ''; }
    // Update badges if icons are currently visible
    if (typeof PermissionPopup !== 'undefined') PermissionPopup.updateBadge(_currentNavDomain);
    if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.updateBadge(_currentNavDomain);
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge._refreshBadge && BlocklistBadge._refreshBadge();
  }

  // Clean URL for display — hide protocol + www
  function _cleanDisplayUrl(url) {
    if (!url) return '';
    if (url.startsWith('vortex://')) return url;
    if (url.startsWith('about:'))   return url;
    try {
      const u = new URL(url);
      // Show host (without www.) + path + search + hash
      const host = u.hostname.replace(/^www\./, '');
      const rest = u.pathname === '/' ? '' : u.pathname;
      const query = u.search || '';
      const hash  = u.hash   || '';
      return host + rest + query + hash;
    } catch {
      // Fallback — just strip protocol
      return url.replace(/^https?:\/\/(www\.)?/, '');
    }
  }

  let _progressTimer = null;
  let _progressVal = 0;

  function startProgress() {
    const fill = document.getElementById('url-progress-fill');
    if (!fill) return;
    clearInterval(_progressTimer);
    _progressVal = 0;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    fill.style.opacity = '1';

    // Simulate progress — fast to 70%, then slow
    _progressTimer = setInterval(() => {
      if (_progressVal < 70) _progressVal += 6;
      else if (_progressVal < 90) _progressVal += 0.8;
      fill.style.transition = 'width 0.3s ease';
      fill.style.width = _progressVal + '%';
    }, 200);
  }

  function endProgress() {
    const fill = document.getElementById('url-progress-fill');
    if (!fill) return;
    clearInterval(_progressTimer);
    fill.style.transition = 'width 0.2s ease';
    fill.style.width = '100%';
    setTimeout(() => {
      fill.style.transition = 'opacity 0.3s ease';
      fill.style.opacity = '0';
      setTimeout(() => { fill.style.width = '0%'; }, 350);
    }, 200);
  }

  function setDownloadBadge(count) {
    const badge = document.getElementById('dl-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }

  // ── Dropdown Menu ──────────────────────────────────────────────────────────

  function _buildMenu() {
    if (document.getElementById('nav-dropdown')) return;

    const menu = document.createElement('div');
    menu.id = 'nav-dropdown';
    menu.innerHTML = `
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
      </div>
    `;

    document.body.appendChild(menu);

    // Item click actions
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      _closeMenu();
      switch (item.dataset.action) {
        case 'new-tab':      QuickLaunch.open(); break;
        case 'new-window':   window.vortexAPI.send('window:new'); break;
        case 'new-incognito': _showComingSoon('Incognito Mode'); break;
        case 'history':      Panel.open('history'); break;
        case 'downloads':    Panel.open('downloads'); break;
        case 'bookmarks':    Panel.open('bookmarks'); break;
        case 'find':         WebView.findInPage(); break;
        case 'screenshot':      Screenshot.capture(false); break;
        case 'screenshot-full': Screenshot.capture(true);  break;
        case 'print':        WebView.print(); break;
        case 'save-page':    WebView.savePage(); break;
        case 'devtools':     WebView.openDevTools(); break;
        case 'reload-hard':  WebView.hardReload(); break;
        case 'settings':     Panel.open('settings'); break;
      }
    });

    // Zoom controls inside menu
    document.getElementById('nd-zoom-out').addEventListener('click', (e) => {
      e.stopPropagation(); WebView.zoomOut(); _syncMenuZoom();
    });
    document.getElementById('nd-zoom-in').addEventListener('click', (e) => {
      e.stopPropagation(); WebView.zoomIn(); _syncMenuZoom();
    });
    document.getElementById('nd-zoom-pct').addEventListener('click', (e) => {
      e.stopPropagation(); WebView.zoomReset(); _syncMenuZoom();
    });
    document.getElementById('nd-zoom-fs').addEventListener('click', (e) => {
      e.stopPropagation(); _closeMenu();
      window.vortexAPI.send('window:fullscreen');
    });
  }

  function _syncMenuZoom() {
    const pct = document.getElementById('nd-zoom-pct');
    const bar = document.getElementById('zoom-pct');
    if (pct && bar) pct.textContent = bar.textContent;
  }

  function _toggleMenu() {
    _buildMenu();
    const menu = document.getElementById('nav-dropdown');
    const btn  = document.getElementById('nav-menu');
    if (menu.classList.contains('visible')) {
      _closeMenu(); return;
    }
    // Position below the menu button
    const rect = btn.getBoundingClientRect();
    menu.style.top  = (rect.bottom + 6) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.classList.add('visible');
    _syncMenuZoom();
    setTimeout(() => document.addEventListener('click', _closeMenu, { once: true }), 0);
  }

  function _closeMenu() {
    const menu = document.getElementById('nav-dropdown');
    if (menu) menu.classList.remove('visible');
  }

  function _showComingSoon(feature) {
    const existing = document.getElementById('coming-soon-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'coming-soon-toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a855f7" stroke-width="2" style="flex-shrink:0">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span><strong>${feature}</strong> — Coming Soon</span>
    `;
    toast.style.cssText = `
      position:fixed;bottom:60px;left:50%;transform:translateX(-50%);
      background:#1a0a2e;border:1px solid #a855f7;border-radius:10px;
      padding:10px 18px;display:flex;align-items:center;gap:10px;
      color:#d8b4fe;font-size:13px;z-index:99999;
      box-shadow:0 4px 20px rgba(168,85,247,0.3);
      animation:toastIn 0.2s ease;
    `;
    if (!document.getElementById('coming-soon-style')) {
      const s = document.createElement('style');
      s.id = 'coming-soon-style';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
  }

  // ── Profile Dropdown ───────────────────────────────────────────────────────

  let _profileName    = 'Vortex User';
  let _profileInitial = 'V';
  let _profileStatus  = 'online';
  let _profileAvatar     = null; // icon id (e.g. 'rocket') or null
  let _profileAvatarType = 'emoji'; // 'emoji' | 'image'
  let _profileAvatarData = null; // base64 dataURL when avatarType === 'image'
  let _profileBio     = '';

  // SVG icons for status indicators
  const _STATUS_ICONS = {
    online:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    dnd:     `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    silent:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#eab308" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    away:    `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#f97316" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    offline: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    focus:   `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const _STATUS_MAP = {
    online:  { label: 'Online',          color: '#22c55e' },
    dnd:     { label: 'Do Not Disturb',  color: '#ef4444' },
    silent:  { label: 'Silent',          color: '#eab308' },
    away:    { label: 'Away',            color: '#f97316' },
    offline: { label: 'Offline',         color: '#6b7280' },
    focus:   { label: 'Focus',           color: '#3b82f6' },
  };

  function _applyProfileData(p) {
    if (!p) return;
    _profileName       = p.name        || 'Vortex User';
    _profileInitial    = _profileName[0].toUpperCase();
    _profileStatus     = p.status      || 'online';
    _profileAvatar     = p.avatar      || null;
    _profileAvatarType = p.avatarType  || 'emoji';
    _profileAvatarData = p.avatarData  || null;
    _profileBio        = p.bio         || '';
    _syncUserBtn();
  }

  // SVG avatar icons map (same set as settings.html)
  const _AVATAR_ICONS = {
    fox:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6 2 3 7 3 12c0 3 1.5 5.5 4 7l1-3h8l1 3c2.5-1.5 4-4 4-7 0-5-3-10-9-10z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><path d="M3 4 L6 9M21 4 L18 9"/></svg>`,
    rocket:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    zap:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    flame:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    star:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    shield:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    cpu:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    code:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    ghost:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>`,
    crown:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>`,
    diamond:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/></svg>`,
    eye:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    feather:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>`,
    globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    moon:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    music:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    target:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    wave:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
    atom:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z"/></svg>`,
  };

  function _syncUserBtn() {
    const btn = document.getElementById('btn-user');
    if (!btn) return;
    const st = _STATUS_MAP[_profileStatus] || _STATUS_MAP.online;
    if (_profileAvatarType === 'image' && _profileAvatarData) {
      btn.innerHTML = `<img src="${_profileAvatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    } else {
      const svgIcon = _AVATAR_ICONS[_profileAvatar];
      btn.innerHTML = svgIcon || _profileInitial;
    }
    btn.style.setProperty('--status-color', st.color);
    btn.classList.add('has-status');
  }

  function _buildProfileMenu() {
    // Remove old if exists (rebuild fresh to reflect latest data)
    const old = document.getElementById('profile-dropdown');
    if (old) old.remove();

    const st = _STATUS_MAP[_profileStatus] || _STATUS_MAP.online;

    const menu = document.createElement('div');
    menu.id = 'profile-dropdown';

    const avatarHTML = _profileAvatarType === 'image' && _profileAvatarData
      ? `<img src="${_profileAvatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
      : (_AVATAR_ICONS[_profileAvatar] || _profileInitial);

    menu.innerHTML = `
      <div class="pd-header">
        <div class="pd-avatar" id="pd-avatar">${avatarHTML}</div>
        <div class="pd-info">
          <div class="pd-name">${_profileName}</div>
          <div class="pd-status-row">
            <span class="pd-status-dot" style="background:${st.color}"></span>
            <span class="pd-status-label">${_STATUS_ICONS[_profileStatus] || ''} ${st.label}</span>
          </div>
          ${_profileBio ? `<div class="pd-bio">${_profileBio}</div>` : ''}
        </div>
      </div>
      <div class="pd-sep"></div>
      <div class="pd-status-picker">
        ${Object.entries(_STATUS_MAP).map(([k, v]) => `
          <div class="pd-status-opt${_profileStatus === k ? ' active' : ''}" data-status="${k}" style="--sc:${v.color}">
            <span class="pd-status-dot"></span>${_STATUS_ICONS[k]} ${v.label}
          </div>`).join('')}
      </div>
      <div class="pd-sep"></div>
      <div class="pd-item" data-action="profile-settings">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Profile
      </div>
      <div class="pd-item" data-action="bookmarks">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Bookmarks
      </div>
      <div class="pd-item" data-action="history">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        History
      </div>
      <div class="pd-item" data-action="downloads">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Downloads
      </div>
      <div class="pd-item" data-action="settings">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </div>
      <div class="pd-sep"></div>
      <div class="pd-stat-row">
        <div class="pd-stat" id="pd-stat-tabs"><span class="pd-stat-num">0</span><span class="pd-stat-label">Tabs</span></div>
        <div class="pd-stat" id="pd-stat-bm"><span class="pd-stat-num">0</span><span class="pd-stat-label">Bookmarks</span></div>
        <div class="pd-stat" id="pd-stat-dl"><span class="pd-stat-num">0</span><span class="pd-stat-label">Downloads</span></div>
      </div>
      <div class="pd-sep"></div>
      <div class="pd-item pd-danger" data-action="clear-data">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        Clear Browsing Data
      </div>
    `;

    document.body.appendChild(menu);

    // Status picker
    menu.querySelectorAll('.pd-status-opt').forEach(opt => {
      opt.addEventListener('click', async (e) => {
        e.stopPropagation();
        _profileStatus = opt.dataset.status;
        // Save to storage
        try {
          const p = await window.vortexAPI.invoke('storage:read', 'profile') || {};
          p.status = _profileStatus;
          await window.vortexAPI.invoke('storage:write', 'profile', p);
        } catch(_) {}
        _syncUserBtn();
        _closeProfileMenu();
        // Reopen to reflect new status
        _toggleProfileMenu();
      });
    });

    // Item actions
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      _closeProfileMenu();
      switch (item.dataset.action) {
        case 'profile-settings':
          Panel.open('settings');
          // Navigate to Profile tab in settings
          setTimeout(() => {
            const frame = document.getElementById('panel-frame');
            if (frame && frame.contentWindow) {
              frame.contentWindow.postMessage({ __vortexIPC: true, channel: 'settings:navigate', data: 'profile' }, '*');
            }
          }, 350);
          break;
        case 'bookmarks':   Panel.open('bookmarks'); break;
        case 'history':     Panel.open('history'); break;
        case 'downloads':   Panel.open('downloads'); break;
        case 'settings':    Panel.open('settings'); break;
        case 'clear-data':
          if (confirm('Clear all browsing data? This cannot be undone.')) {
            window.vortexAPI.send('browser:clearData');
            localStorage.removeItem('browser_session');
          }
          break;
      }
    });
  }

  function _updateProfileStats() {
    // Tabs count
    const tabCount = Tabs.getAllTabs ? Tabs.getAllTabs().length : 0;
    const tabEl = document.getElementById('pd-stat-tabs');
    if (tabEl) tabEl.querySelector('.pd-stat-num').textContent = tabCount;

    // Bookmarks count — load fresh from store
    if (window.BookmarkStore) {
      BookmarkStore.load().then(list => {
        const bmEl = document.getElementById('pd-stat-bm');
        if (bmEl) bmEl.querySelector('.pd-stat-num').textContent = list.length;
      }).catch(() => {});
    }

    // Downloads count — from DownloadHistory
    if (window.DownloadHistory) {
      DownloadHistory.load().then(list => {
        const dlEl = document.getElementById('pd-stat-dl');
        if (dlEl) dlEl.querySelector('.pd-stat-num').textContent = list.length;
      }).catch(() => {});
    } else {
      // Fallback — badge count
      const badge = document.getElementById('dl-badge');
      const dlEl  = document.getElementById('pd-stat-dl');
      if (dlEl) dlEl.querySelector('.pd-stat-num').textContent = badge?.textContent || '0';
    }
  }

  function _toggleProfileMenu() {
    _buildProfileMenu();
    const menu = document.getElementById('profile-dropdown');
    const btn  = document.getElementById('btn-user');
    const rect = btn.getBoundingClientRect();
    menu.style.top   = (rect.bottom + 6) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.classList.add('visible');
    _updateProfileStats();
    setTimeout(() => document.addEventListener('click', _closeProfileMenu, { once: true }), 0);
  }

  function _closeProfileMenu() {
    const menu = document.getElementById('profile-dropdown');
    if (menu) menu.classList.remove('visible');
  }

  // Load profile from storage on init
  async function _initProfile() {
    try {
      const p = await window.vortexAPI.invoke('storage:read', 'profile');
      _applyProfileData(p);
    } catch(_) {
      _syncUserBtn();
    }
    // Listen for profile changes from settings iframe
    window.addEventListener('message', (e) => {
      if (e.data && e.data.__vortexAction && e.data.channel === 'profile:changed') {
        _applyProfileData(e.data.payload);
      }
    });
    window.addEventListener('vortex-profile-changed', (e) => {
      _applyProfileData(e.detail);
    });
  }

  // Global keyboard shortcuts
  function _initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') { e.preventDefault(); WebView.openDevTools(); return; }
      if (e.key === 'F11') { e.preventDefault(); window.vortexAPI.send('window:fullscreen'); return; }
      if (!e.ctrlKey) return;
      switch (e.key) {
        case 't': e.preventDefault(); QuickLaunch.open(); break;
        case 'n':
          if (e.shiftKey) { e.preventDefault(); _showComingSoon('Incognito Mode'); }
          else            { e.preventDefault(); window.vortexAPI.send('window:new'); }
          break;
        case 'w': e.preventDefault(); { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); } break;
        case 'h': e.preventDefault(); Panel.open('history'); break;
        case 'j': e.preventDefault(); Panel.open('downloads'); break;
        case 'b': e.preventDefault(); Panel.open('bookmarks'); break;
        case 'f': e.preventDefault(); WebView.findInPage(); break;
        case 'p':
          e.preventDefault();
          if (e.shiftKey) WebView.pip();
          else WebView.print();
          break;
        case 's': e.preventDefault(); WebView.savePage(); break;
        case ',': e.preventDefault(); Panel.open('settings'); break;
        case 'r':
          if (e.shiftKey) { e.preventDefault(); WebView.hardReload(); }
          break;
        case 'k': e.preventDefault(); CommandPalette.open(); break;
        case 'Tab':
          if (e.shiftKey) { e.preventDefault(); Tabs.switchPrev(); }
          else            { e.preventDefault(); Tabs.switchNext(); }
          break;
      }
    });
  }

  return { render, navigate, setURL, startProgress, endProgress, setDownloadBadge, initShortcuts: _initShortcuts, applySettings, newTabURL: _newTabURL, initProfile: _initProfile, _getSearchEngine: () => _searchEngine };
})();

// ── Command Palette ────────────────────────────────────────────────────────
const CommandPalette = (() => {
  let _activeIdx = 0;
  let _filtered = [];

  const COMMANDS = [
    // Navigation
    { label: 'New Tab',            icon: '+',    shortcut: 'Ctrl+T',       section: 'Navigation', action: () => QuickLaunch.open() },
    { label: 'New Window',         icon: '⊞',    shortcut: 'Ctrl+N',       section: 'Navigation', action: () => window.vortexAPI.send('window:new') },
    { label: 'Close Tab',          icon: '✕',    shortcut: 'Ctrl+W',       section: 'Navigation', action: () => { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); } },
    { label: 'Next Tab',           icon: '→',    shortcut: 'Ctrl+Tab',     section: 'Navigation', action: () => Tabs.switchNext() },
    { label: 'Previous Tab',       icon: '←',    shortcut: 'Ctrl+Shift+Tab', section: 'Navigation', action: () => Tabs.switchPrev() },
    // Pages
    { label: 'Open Settings',      icon: '⚙',    shortcut: 'Ctrl+,',       section: 'Pages', action: () => Panel.open('settings') },
    { label: 'Open Downloads',     icon: '↓',    shortcut: 'Ctrl+J',       section: 'Pages', action: () => Panel.open('downloads') },
    { label: 'Open Bookmarks',     icon: '★',    shortcut: 'Ctrl+B',       section: 'Pages', action: () => Panel.open('bookmarks') },
    { label: 'Open History',       icon: '⏱',    shortcut: 'Ctrl+H',       section: 'Pages', action: () => Panel.open('history') },
    // Tools
    { label: 'Find in Page',       icon: '🔍',   shortcut: 'Ctrl+F',       section: 'Tools', action: () => WebView.findInPage() },
    { label: 'Zoom In',            icon: '+',    shortcut: 'Ctrl+=',       section: 'Tools', action: () => WebView.zoomIn() },
    { label: 'Zoom Out',           icon: '−',    shortcut: 'Ctrl+-',       section: 'Tools', action: () => WebView.zoomOut() },
    { label: 'Reset Zoom',         icon: '↺',    shortcut: 'Ctrl+0',       section: 'Tools', action: () => WebView.zoomReset() },
    { label: 'Take Screenshot',    icon: '📷',   shortcut: 'Ctrl+Shift+S', section: 'Tools', action: () => Screenshot.capture(false) },
    { label: 'Full Page Screenshot', icon: '📄', shortcut: 'Ctrl+Shift+F', section: 'Tools', action: () => Screenshot.capture(true) },
    { label: 'Picture in Picture', icon: '▶',   shortcut: 'Ctrl+Shift+P', section: 'Tools', action: () => WebView.pip() },
    { label: 'Mute Active Tab',    icon: '🔇',   shortcut: '',             section: 'Tools', action: () => { const t = Tabs.getActiveTab(); if (t) Tabs.toggleMute(t.id); } },
    { label: 'Print Page',         icon: '🖨',   shortcut: 'Ctrl+P',       section: 'Tools', action: () => WebView.print() },
    { label: 'Save Page',          icon: '💾',   shortcut: 'Ctrl+S',       section: 'Tools', action: () => WebView.savePage() },
    { label: 'Hard Reload',        icon: '↻',    shortcut: 'Ctrl+Shift+R', section: 'Tools', action: () => WebView.hardReload() },
    { label: 'Developer Tools',    icon: '<>',   shortcut: 'F12',          section: 'Tools', action: () => WebView.openDevTools() },
    // Data
    { label: 'Clear Browsing Data', icon: '🗑',  shortcut: '',             section: 'Data', action: () => { if (confirm('Clear all browsing data?')) window.vortexAPI.send('browser:clearData'); } },
  ];

  function _svgIcon(label) {
    // Simple text icon fallback — just show first char styled
    return `<span style="font-size:13px;line-height:1;">${label}</span>`;
  }

  function _render(query) {
    const list = document.getElementById('cmd-list');
    if (!list) return;

    const q = (query || '').toLowerCase().trim();
    _filtered = q ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q)) : COMMANDS;

    if (!_filtered.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#2a5050;font-size:13px;">No commands found</div>';
      return;
    }

    let html = '';
    let lastSection = '';
    _filtered.forEach((cmd, i) => {
      if (!q && cmd.section !== lastSection) {
        html += `<div class="cmd-section">${cmd.section}</div>`;
        lastSection = cmd.section;
      }
      html += `
        <div class="cmd-item${i === _activeIdx ? ' active' : ''}" data-idx="${i}">
          <div class="cmd-icon">${_svgIcon(cmd.icon)}</div>
          <span class="cmd-label">${cmd.label}</span>
          ${cmd.shortcut ? `<span class="cmd-shortcut">${cmd.shortcut}</span>` : ''}
        </div>`;
    });
    list.innerHTML = html;

    list.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        _activeIdx = parseInt(el.dataset.idx);
        _highlightActive();
      });
      el.addEventListener('click', () => {
        _execute(_activeIdx);
      });
    });
  }

  function _highlightActive() {
    const list = document.getElementById('cmd-list');
    if (!list) return;
    list.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.classList.toggle('active', i === _activeIdx);
    });
    // Scroll into view
    const active = list.querySelector('.cmd-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function _execute(idx) {
    const cmd = _filtered[idx];
    if (cmd) { close(); cmd.action(); }
  }

  function open() {
    const backdrop = document.getElementById('cmd-backdrop');
    const palette  = document.getElementById('cmd-palette');
    const input    = document.getElementById('cmd-input');
    if (!backdrop || !palette) return;
    _activeIdx = 0;
    backdrop.classList.add('visible');
    palette.classList.add('visible');
    input.value = '';
    _render('');
    input.focus();
  }

  function close() {
    document.getElementById('cmd-backdrop')?.classList.remove('visible');
    document.getElementById('cmd-palette')?.classList.remove('visible');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cmd-input');
    const backdrop = document.getElementById('cmd-backdrop');
    if (!input || !backdrop) return;

    input.addEventListener('input', () => {
      _activeIdx = 0;
      _render(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        _activeIdx = Math.min(_activeIdx + 1, _filtered.length - 1);
        _highlightActive();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        _activeIdx = Math.max(_activeIdx - 1, 0);
        _highlightActive();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        _execute(_activeIdx);
      }
    });

    backdrop.addEventListener('click', close);
  });

  return { open, close };
})();

// ── WhatsApp Panel ─────────────────────────────────────────────────────────
const WhatsAppPanel = (() => {
  let _visible = false;
  let _fullscreen = false;

  function toggle() {
    _visible ? close() : open();
  }

  function open() {
    const panel = document.getElementById('wa-panel');
    const btn   = document.getElementById('nav-whatsapp');
    if (!panel) return;
    _visible = true;
    panel.classList.add('visible');
    if (btn) btn.classList.add('active');
  }

  function close() {
    const panel = document.getElementById('wa-panel');
    const btn   = document.getElementById('nav-whatsapp');
    _visible = false;
    _fullscreen = false;
    if (panel) { panel.classList.remove('visible', 'fullscreen'); }
    if (btn) btn.classList.remove('active');
  }

  function toggleFullscreen() {
    const panel = document.getElementById('wa-panel');
    if (!panel) return;
    _fullscreen = !_fullscreen;
    panel.classList.toggle('fullscreen', _fullscreen);
    const fsBtn = document.getElementById('wa-fullscreen');
    if (fsBtn) {
      fsBtn.title = _fullscreen ? 'Exit Fullscreen' : 'Fullscreen';
      fsBtn.innerHTML = _fullscreen
        ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('wa-close')?.addEventListener('click', close);
    document.getElementById('wa-refresh')?.addEventListener('click', () => {
      const wv = document.getElementById('wa-webview');
      if (wv) wv.reload();
    });
    document.getElementById('wa-fullscreen')?.addEventListener('click', toggleFullscreen);
  });

  return { open, close, toggle };
})();
