// Quick Launch Panel — opens when + (new tab) button is clicked
const QuickLaunch = (() => {
  let _visible = false;
  let _omniTimer = null;

  const POPULAR_SITES = [
    { name: 'Google',    url: 'https://www.google.com',    icon: 'https://www.google.com/favicon.ico' },
    { name: 'YouTube',   url: 'https://www.youtube.com',   icon: 'https://www.youtube.com/favicon.ico' },
    { name: 'GitHub',    url: 'https://www.github.com',    icon: 'https://github.com/favicon.ico' },
    { name: 'Reddit',    url: 'https://www.reddit.com',    icon: 'https://www.reddit.com/favicon.ico' },
    { name: 'Twitter',   url: 'https://www.twitter.com',   icon: 'https://www.twitter.com/favicon.ico' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'https://www.wikipedia.org/favicon.ico' },
    { name: 'Netflix',   url: 'https://www.netflix.com',   icon: 'https://www.netflix.com/favicon.ico' },
    { name: 'Amazon',    url: 'https://www.amazon.com',    icon: 'https://www.amazon.com/favicon.ico' },
    { name: 'Gmail',     url: 'https://mail.google.com',   icon: 'https://www.gstatic.com/marketing-cms/assets/images/66/ac/14b165e647fd85c824bfbe5d6bc5/gmail.webp=s48-fcrop64=1,00000000ffffffff-rw' },
    { name: 'Maps',      url: 'https://maps.google.com',   icon: 'https://maps.google.com/favicon.ico' },
    { name: 'Spotify',   url: 'https://open.spotify.com',  icon: 'https://open.spotify.com/favicon.ico' },
    { name: 'LinkedIn',  url: 'https://www.linkedin.com',  icon: 'https://www.linkedin.com/favicon.ico' },
  ];

  function _getEl(id) { return document.getElementById(id); }

  function open() {
    if (_visible) { close(); return; }
    _visible = true;
    const panel = _getEl('ql-panel');
    const backdrop = _getEl('ql-backdrop');
    panel.classList.add('visible');
    backdrop.classList.add('visible');
    // Focus search bar
    setTimeout(() => {
      const inp = _getEl('ql-search');
      if (inp) { inp.value = ''; inp.focus(); }
    }, 80);
    _renderBookmarks();
    _renderProfile();
    _renderPopularSites('');
  }

  function close() {
    if (!_visible) return;
    _visible = false;
    const panel = _getEl('ql-panel');
    const backdrop = _getEl('ql-backdrop');
    panel.classList.remove('visible');
    backdrop.classList.remove('visible');
    _hideOmni();
  }

  function _openURL(url) {
    close();
    if (window.Prefetch) Prefetch.prefetch(url);
    Tabs.createTab(url);
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  async function _renderProfile() {
    const el = _getEl('ql-profile-pic');
    if (!el) return;
    try {
      const p = await window.vortexAPI.invoke('storage:read', 'profile');
      if (p && p.avatarType === 'image' && p.avatarData) {
        el.innerHTML = `<img src="${p.avatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
      } else if (p && p.name) {
        el.textContent = p.name[0].toUpperCase();
      }
    } catch (_) {}
  }

  // ── Bookmarks Grid ────────────────────────────────────────────────────────
  async function _renderBookmarks() {
    const grid = _getEl('ql-bookmarks-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let bookmarks = [];
    try { bookmarks = (await BookmarkStore.load()) || []; } catch (_) {}

    bookmarks.slice(0, 11).forEach(bm => {
      const item = _makeBookmarkItem(bm.url, bm.title, bm.url);
      grid.appendChild(item);
    });

    // Add bookmark button
    const addBtn = document.createElement('div');
    addBtn.className = 'ql-bm-item ql-bm-add';
    addBtn.title = 'Add current page as bookmark';
    addBtn.innerHTML = `
      <div class="ql-bm-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="ql-bm-title">Add</span>
    `;
    addBtn.addEventListener('click', async () => {
      const tab = Tabs.getActiveTab();
      if (!tab || !tab.url || tab.url.startsWith('vortex://')) return;
      const entry = { id: Date.now().toString(), url: tab.url, title: tab.title || tab.url, addedAt: Date.now() };
      const added = await BookmarkStore.add(entry);
      if (added) _renderBookmarks();
    });
    grid.appendChild(addBtn);
  }

  function _makeBookmarkItem(url, title, fullUrl) {
    const item = document.createElement('div');
    item.className = 'ql-bm-item';
    item.title = fullUrl;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'ql-bm-icon';
    const img = document.createElement('img');
    img.width = 22; img.height = 22;
    try {
      const u = new URL(url);
      img.src = u.origin + '/favicon.ico';
    } catch (_) {
      img.src = '';
    }
    img.onerror = () => {
      img.remove();
      iconDiv.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    };
    iconDiv.appendChild(img);

    const titleEl = document.createElement('span');
    titleEl.className = 'ql-bm-title';
    titleEl.textContent = title.length > 14 ? title.slice(0, 13) + '…' : title;

    item.appendChild(iconDiv);
    item.appendChild(titleEl);
    item.addEventListener('click', () => _openURL(fullUrl));
    return item;
  }

  // ── Popular Sites Dropdown ────────────────────────────────────────────────
  function _renderPopularSites(query) {
    const list = _getEl('ql-popular-list');
    if (!list) return;
    const q = query.toLowerCase().trim();
    const filtered = q
      ? POPULAR_SITES.filter(s => s.name.toLowerCase().includes(q) || s.url.includes(q))
      : POPULAR_SITES;

    list.innerHTML = '';
    filtered.forEach(site => {
      const item = document.createElement('div');
      item.className = 'ql-pop-item';
      item.innerHTML = `
        <img src="${site.icon}" width="16" height="16" onerror="this.style.display='none'" style="border-radius:3px;flex-shrink:0"/>
        <span>${site.name}</span>
      `;
      item.addEventListener('click', () => {
        _getEl('ql-menu-dropdown').classList.remove('visible');
        _openURL(site.url);
      });
      list.appendChild(item);
    });
  }

  // ── Omnibox Suggestions ───────────────────────────────────────────────────
  function _showOmni(results) {
    const box = _getEl('ql-omni');
    if (!box) return;
    box.innerHTML = '';
    if (!results.length) { box.classList.remove('visible'); return; }
    results.forEach(r => {
      const row = document.createElement('div');
      row.className = 'ql-omni-row';
      const icon = r.type === 'url'
        ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
      const display = r.label ? `<span class="ql-omni-label">${r.label}</span><span class="ql-omni-sub">${r.text}</span>` : `<span class="ql-omni-text">${r.text}</span>`;
      row.innerHTML = `<span class="ql-omni-icon">${icon}</span><span class="ql-omni-texts">${display}</span>`;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        _getEl('ql-search').value = r.label || r.text;
        _hideOmni();
        _navigate(r.text);
      });
      box.appendChild(row);
    });
    box.classList.add('visible');
  }

  function _hideOmni() {
    const box = _getEl('ql-omni');
    if (box) box.classList.remove('visible');
  }

  async function _fetchSuggestions(query) {
    if (!query) { _hideOmni(); return; }
    const results = [];
    const q = query.toLowerCase();

    // 1. URL detection — highest priority
    if (/^https?:\/\//i.test(query) || (query.includes('.') && !query.includes(' '))) {
      results.push({ type: 'url', text: query.startsWith('http') ? query : 'https://' + query });
    }

    // 2. Local bookmarks match
    try {
      const bms = await BookmarkStore.load();
      bms.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach(b => results.push({ type: 'url', text: b.url, label: b.title }));
    } catch (_) {}

    // 3. Google suggestions (only if enabled / reachable)
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      (data[1] || []).slice(0, 4).forEach(s => results.push({ type: 'search', text: s }));
    } catch (_) {}

    _showOmni(results.slice(0, 7));
  }

  function _navigate(input) {
    let url = input.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    _openURL(url);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const backdrop = _getEl('ql-backdrop');
    if (backdrop) backdrop.addEventListener('click', close);

    const searchInput = _getEl('ql-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(_omniTimer);
        const val = e.target.value.trim();
        if (!val) { _hideOmni(); return; }
        _omniTimer = setTimeout(() => _fetchSuggestions(val), 200);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          _hideOmni();
          _navigate(searchInput.value);
        }
        if (e.key === 'Escape') close();
      });
      searchInput.addEventListener('blur', () => {
        setTimeout(_hideOmni, 150);
      });
    }

    // Menu button toggle
    const menuBtn = _getEl('ql-menu-btn');
    const menuDrop = _getEl('ql-menu-dropdown');
    if (menuBtn && menuDrop) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDrop.classList.toggle('visible');
        if (menuDrop.classList.contains('visible')) {
          const inp = _getEl('ql-pop-search');
          if (inp) { inp.value = ''; inp.focus(); _renderPopularSites(''); }
        }
      });
    }

    // Popular sites search
    const popSearch = _getEl('ql-pop-search');
    if (popSearch) {
      popSearch.addEventListener('input', (e) => _renderPopularSites(e.target.value));
      popSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = e.target.value.trim();
          if (val) {
            _getEl('ql-menu-dropdown').classList.remove('visible');
            _navigate(val);
          }
        }
        e.stopPropagation();
      });
    }

    // Profile pic click → open settings
    const profilePic = _getEl('ql-profile-pic');
    if (profilePic) {
      profilePic.addEventListener('click', () => {
        close();
        Panel.open('settings');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const drop = _getEl('ql-menu-dropdown');
      if (drop && !drop.contains(e.target) && e.target !== _getEl('ql-menu-btn')) {
        drop.classList.remove('visible');
      }
    });
  }

  return { open, close, init };
})();
