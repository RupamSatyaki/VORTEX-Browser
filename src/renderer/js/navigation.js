// Navigation toolbar
const Navigation = (() => {
  let firstClick = true; // track first vs second click on url bar

  // Lock/unlock SVG icons for address bar
  const LOCK_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#00c8b4" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Secure connection">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>`;

  const UNLOCK_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7a5a20" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Not secure">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 7.5-1"/>
    </svg>`;

  const SEARCH_ICON = `
    <svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>`;

  function render() {
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
        <div class="address-bar-icons">
          <div class="address-icon" id="btn-bookmark" title="Bookmark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="address-icon" id="btn-copy-url" title="Copy URL">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
        </div>
        <div id="url-progress-bar"><div id="url-progress-fill"></div></div>
      </div>

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
        <div class="user-icon" id="btn-user" title="Profile">V</div>
      </div>
    `;

    document.getElementById('nav-back').addEventListener('click', () => WebView.goBack());
    document.getElementById('nav-forward').addEventListener('click', () => WebView.goForward());
    document.getElementById('nav-reload').addEventListener('click', () => WebView.reload());
    document.getElementById('btn-downloads').addEventListener('click', () => Panel.open('downloads'));

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
      if (firstClick) {
        setTimeout(() => urlBar.select(), 0);
        firstClick = false;
      }
    });

    urlBar.addEventListener('blur', () => {
      firstClick = true; // reset for next focus
    });

    urlBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigate();
      if (e.key === 'Escape') { urlBar.blur(); }
    });

    urlBar.addEventListener('input', (e) => {
      Prefetch.onInput(e.target.value);
      updateSecurityIcon(''); // searching — show search icon
    });

    document.getElementById('btn-copy-url').addEventListener('click', () => {
      const url = urlBar.value;
      if (url) navigator.clipboard.writeText(url);
    });

    // Bookmark button — toggle add/remove
    document.getElementById('btn-bookmark').addEventListener('click', async () => {
      const url = urlBar.value;
      if (!url || url.startsWith('vortex://')) return;
      const btn = document.getElementById('btn-bookmark');
      const isBookmarked = btn.classList.contains('bookmarked');
      if (isBookmarked) {
        // Remove — find by URL
        const list = await BookmarkStore.load();
        const bm = list.find(b => b.url === url);
        if (bm) {
          await BookmarkStore.remove(bm.id);
          window._forwardToBookmarksFrame && window._forwardToBookmarksFrame('bookmark:removed', bm.id);
        }
        btn.classList.remove('bookmarked');
        btn.title = 'Bookmark this page';
      } else {
        // Add
        const title = document.title.replace(' — Vortex', '') || url;
        const entry = { id: Date.now().toString(), url, title, addedAt: Date.now() };
        const added = await BookmarkStore.add(entry);
        if (added) {
          window._forwardToBookmarksFrame && window._forwardToBookmarksFrame('bookmark:added', entry);
        }
        btn.classList.add('bookmarked');
        btn.title = 'Remove bookmark';
      }
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
    if (!url || url.startsWith('about:') || url.startsWith('chrome:')) {
      newIcon = SEARCH_ICON;
    } else if (url.startsWith('https://')) {
      newIcon = LOCK_ICON;
    } else {
      newIcon = UNLOCK_ICON;
    }

    const tmp = document.createElement('div');
    tmp.innerHTML = newIcon;
    old.replaceWith(tmp.firstElementChild);
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
    return ENGINE_HOME[_searchEngine] || 'https://www.google.com';
  }

  let _searchEngine = 'google';

  function navigate() {
    let url = document.getElementById('url-bar').value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      const base = SEARCH_ENGINES[_searchEngine] || SEARCH_ENGINES.google;
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : base + encodeURIComponent(url);
    }
    WebView.loadURL(url);
    document.getElementById('url-bar').blur();
  }

  function applySettings(s) {
    if (s.engine) _searchEngine = s.engine;
    if (typeof s.prefetch === 'boolean') {
      Prefetch.setEnabled(s.prefetch);
    }
    if (typeof s.suggestions === 'boolean') {
      Prefetch.setSuggestionsEnabled(s.suggestions);
    }
  }

  function setURL(url) {
    const bar = document.getElementById('url-bar');
    if (bar) bar.value = url;
    updateSecurityIcon(url);
    // Update bookmark icon state
    if (window._updateBookmarkIcon) window._updateBookmarkIcon();
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
        case 'new-tab':      Tabs.createTab(_newTabURL()); break;
        case 'new-window':   window.vortexAPI.send('window:new'); break;
        case 'history':      Tabs.createTab('vortex://history'); break;
        case 'downloads':    Panel.open('downloads'); break;
        case 'bookmarks':    Panel.open('bookmarks'); break;
        case 'find':         WebView.findInPage(); break;
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

  // ── Profile Dropdown ───────────────────────────────────────────────────────

  let _profileName = 'Vortex User';
  let _profileInitial = 'V';

  function _buildProfileMenu() {
    if (document.getElementById('profile-dropdown')) return;

    const menu = document.createElement('div');
    menu.id = 'profile-dropdown';
    menu.innerHTML = `
      <div class="pd-header">
        <div class="pd-avatar" id="pd-avatar">${_profileInitial}</div>
        <div class="pd-info">
          <div class="pd-name" id="pd-name" contenteditable="false" spellcheck="false">${_profileName}</div>
          <div class="pd-edit-hint">Click name to edit</div>
        </div>
      </div>
      <div class="pd-sep"></div>
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
      <div class="pd-sep"></div>
      <div class="pd-item" data-action="settings">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </div>
      <div class="pd-sep"></div>
      <div class="pd-stat-row">
        <div class="pd-stat" id="pd-stat-tabs">
          <span class="pd-stat-num">0</span>
          <span class="pd-stat-label">Tabs</span>
        </div>
        <div class="pd-stat" id="pd-stat-bm">
          <span class="pd-stat-num">0</span>
          <span class="pd-stat-label">Bookmarks</span>
        </div>
        <div class="pd-stat" id="pd-stat-dl">
          <span class="pd-stat-num">0</span>
          <span class="pd-stat-label">Downloads</span>
        </div>
      </div>
      <div class="pd-sep"></div>
      <div class="pd-item pd-danger" data-action="clear-data">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        Clear Browsing Data
      </div>
    `;

    document.body.appendChild(menu);

    // Name edit
    const nameEl = document.getElementById('pd-name');
    nameEl.addEventListener('click', (e) => {
      e.stopPropagation();
      nameEl.contentEditable = 'true';
      nameEl.focus();
      const range = document.createRange();
      range.selectNodeContents(nameEl);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    });
    nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    });
    nameEl.addEventListener('blur', () => {
      nameEl.contentEditable = 'false';
      _profileName = nameEl.textContent.trim() || 'Vortex User';
      _profileInitial = _profileName[0].toUpperCase();
      nameEl.textContent = _profileName;
      document.getElementById('pd-avatar').textContent = _profileInitial;
      document.getElementById('btn-user').textContent = _profileInitial;
      // Persist
      try { localStorage.setItem('vortex_profile_name', _profileName); } catch(_) {}
    });

    // Item actions
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      _closeProfileMenu();
      switch (item.dataset.action) {
        case 'bookmarks':   Panel.open('bookmarks'); break;
        case 'history':     Tabs.createTab('vortex://history'); break;
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
    const tabCount = Tabs.getAllTabs ? Tabs.getAllTabs().length : 0;
    const tabEl = document.getElementById('pd-stat-tabs');
    if (tabEl) tabEl.querySelector('.pd-stat-num').textContent = tabCount;

    // Bookmarks count
    if (window.BookmarkStore) {
      BookmarkStore.load().then(list => {
        const bmEl = document.getElementById('pd-stat-bm');
        if (bmEl) bmEl.querySelector('.pd-stat-num').textContent = list.length;
      }).catch(() => {});
    }

    // Downloads count from badge
    const badge = document.getElementById('dl-badge');
    const dlEl = document.getElementById('pd-stat-dl');
    if (dlEl && badge) dlEl.querySelector('.pd-stat-num').textContent = badge.textContent || '0';
  }

  function _toggleProfileMenu() {
    _buildProfileMenu();
    const menu = document.getElementById('profile-dropdown');
    const btn  = document.getElementById('btn-user');
    if (menu.classList.contains('visible')) {
      _closeProfileMenu(); return;
    }
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

  // Restore saved profile name
  function _initProfile() {
    try {
      const saved = localStorage.getItem('vortex_profile_name');
      if (saved) {
        _profileName = saved;
        _profileInitial = saved[0].toUpperCase();
        const btn = document.getElementById('btn-user');
        if (btn) btn.textContent = _profileInitial;
      }
    } catch(_) {}
  }

  // Global keyboard shortcuts
  function _initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') { e.preventDefault(); WebView.openDevTools(); return; }
      if (e.key === 'F11') { e.preventDefault(); window.vortexAPI.send('window:fullscreen'); return; }
      if (!e.ctrlKey) return;
      switch (e.key) {
        case 't': e.preventDefault(); Tabs.createTab(_newTabURL()); break;
        case 'n': e.preventDefault(); window.vortexAPI.send('window:new'); break;
        case 'w': e.preventDefault(); { const t = Tabs.getActiveTab(); if (t) Tabs.closeTab(t.id); } break;
        case 'h': e.preventDefault(); Tabs.createTab('vortex://history'); break;
        case 'j': e.preventDefault(); Panel.open('downloads'); break;
        case 'b': e.preventDefault(); Panel.open('bookmarks'); break;
        case 'f': e.preventDefault(); WebView.findInPage(); break;
        case 'p': e.preventDefault(); WebView.print(); break;
        case 's': e.preventDefault(); WebView.savePage(); break;
        case ',': e.preventDefault(); Panel.open('settings'); break;
        case 'r':
          if (e.shiftKey) { e.preventDefault(); WebView.hardReload(); }
          break;
        case 'Tab':
          if (e.shiftKey) { e.preventDefault(); Tabs.switchPrev(); }
          else            { e.preventDefault(); Tabs.switchNext(); }
          break;
      }
    });
  }

  return { render, navigate, setURL, startProgress, endProgress, setDownloadBadge, initShortcuts: _initShortcuts, applySettings, newTabURL: _newTabURL, initProfile: _initProfile };
})();
