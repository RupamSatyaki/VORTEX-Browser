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
    document.getElementById('btn-downloads').addEventListener('click', () => Tabs.createTab('vortex://downloads'));

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

  function navigate() {
    let url = document.getElementById('url-bar').value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    WebView.loadURL(url);
    document.getElementById('url-bar').blur();
  }

  function setURL(url) {
    const bar = document.getElementById('url-bar');
    if (bar) bar.value = url;
    updateSecurityIcon(url);
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

  return { render, navigate, setURL, startProgress, endProgress, setDownloadBadge };
})();
