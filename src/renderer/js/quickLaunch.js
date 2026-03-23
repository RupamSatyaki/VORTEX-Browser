// Quick Launch Panel
const QuickLaunch = (() => {
  let _visible = false;
  let _omniTimer = null;
  let _activeCategory = 'all';

  const SITES = [
    // Social
    { name: 'Instagram',    url: 'https://www.instagram.com',      icon: 'https://www.instagram.com/favicon.ico',      cat: 'social' },
    { name: 'Facebook',     url: 'https://www.facebook.com',       icon: 'https://www.facebook.com/favicon.ico',       cat: 'social' },
    { name: 'Twitter',      url: 'https://www.twitter.com',        icon: 'https://www.twitter.com/favicon.ico',        cat: 'social' },
    { name: 'WhatsApp',     url: 'https://web.whatsapp.com',       icon: 'https://web.whatsapp.com/favicon.ico',       cat: 'social' },
    { name: 'LinkedIn',     url: 'https://www.linkedin.com',       icon: 'https://www.linkedin.com/favicon.ico',       cat: 'social' },
    { name: 'Reddit',       url: 'https://www.reddit.com',         icon: 'https://www.reddit.com/favicon.ico',         cat: 'social' },
    { name: 'Telegram',     url: 'https://web.telegram.org',       icon: 'https://web.telegram.org/favicon.ico',       cat: 'social' },
    { name: 'Pinterest',    url: 'https://www.pinterest.com',      icon: 'https://www.pinterest.com/favicon.ico',      cat: 'social' },
    // Search & Productivity
    { name: 'Google',       url: 'https://www.google.com',         icon: 'https://www.google.com/favicon.ico',         cat: 'search' },
    { name: 'Gmail',        url: 'https://mail.google.com',        icon: 'https://mail.google.com/favicon.ico',        cat: 'search' },
    { name: 'Drive',        url: 'https://drive.google.com',       icon: 'https://drive.google.com/favicon.ico',       cat: 'search' },
    { name: 'Maps',         url: 'https://maps.google.com',        icon: 'https://maps.google.com/favicon.ico',        cat: 'search' },
    { name: 'Wikipedia',    url: 'https://www.wikipedia.org',      icon: 'https://www.wikipedia.org/favicon.ico',      cat: 'search' },
    { name: 'Translate',    url: 'https://translate.google.com',   icon: 'https://translate.google.com/favicon.ico',   cat: 'search' },
    // Entertainment
    { name: 'YouTube',      url: 'https://www.youtube.com',        icon: 'https://www.youtube.com/favicon.ico',        cat: 'entertainment' },
    { name: 'Netflix',      url: 'https://www.netflix.com',        icon: 'https://www.netflix.com/favicon.ico',        cat: 'entertainment' },
    { name: 'Spotify',      url: 'https://open.spotify.com',       icon: 'https://open.spotify.com/favicon.ico',       cat: 'entertainment' },
    { name: 'HDHub4u',      url: 'https://hdhub4u.tv',            icon: 'https://hdhub4u.mov/favicon.ico',            cat: 'entertainment' },
    { name: 'Hotstar',      url: 'https://www.hotstar.com',        icon: 'https://www.hotstar.com/favicon.ico',        cat: 'entertainment' },
    { name: 'Prime Video',  url: 'https://www.primevideo.com',     icon: 'https://www.primevideo.com/favicon.ico',     cat: 'entertainment' },
    // Shopping
    { name: 'Amazon',       url: 'https://www.amazon.in',          icon: 'https://www.amazon.in/favicon.ico',          cat: 'shopping' },
    { name: 'Flipkart',     url: 'https://www.flipkart.com',       icon: 'https://www.flipkart.com/favicon.ico',       cat: 'shopping' },
    { name: 'Meesho',       url: 'https://www.meesho.com',         icon: 'https://www.meesho.com/favicon.ico',         cat: 'shopping' },
    { name: 'Myntra',       url: 'https://www.myntra.com',         icon: 'https://www.myntra.com/favicon.ico',         cat: 'shopping' },
    { name: 'Snapdeal',     url: 'https://www.snapdeal.com',       icon: 'https://www.snapdeal.com/favicon.ico',       cat: 'shopping' },
    { name: 'Nykaa',        url: 'https://www.nykaa.com',          icon: 'https://www.nykaa.com/favicon.ico',          cat: 'shopping' },
    // Dev & Tech
    { name: 'GitHub',       url: 'https://www.github.com',         icon: 'https://github.com/favicon.ico',             cat: 'dev' },
    { name: 'Stack Overflow',url:'https://stackoverflow.com',      icon: 'https://stackoverflow.com/favicon.ico',      cat: 'dev' },
    { name: 'CodePen',      url: 'https://codepen.io',             icon: 'https://codepen.io/favicon.ico',             cat: 'dev' },
    { name: 'MDN',          url: 'https://developer.mozilla.org',  icon: 'https://developer.mozilla.org/favicon.ico',  cat: 'dev' },
    { name: 'npm',          url: 'https://www.npmjs.com',          icon: 'https://www.npmjs.com/favicon.ico',          cat: 'dev' },
    { name: 'Vercel',       url: 'https://vercel.com',             icon: 'https://vercel.com/favicon.ico',             cat: 'dev' },
    // News & Finance
    { name: 'Times of India',url:'https://timesofindia.indiatimes.com', icon:'https://timesofindia.indiatimes.com/favicon.ico', cat:'news' },
    { name: 'NDTV',         url: 'https://www.ndtv.com',           icon: 'https://www.ndtv.com/favicon.ico',           cat: 'news' },
    { name: 'Zerodha',      url: 'https://kite.zerodha.com',       icon: 'https://kite.zerodha.com/favicon.ico',       cat: 'news' },
    { name: 'Groww',        url: 'https://groww.in',               icon: 'https://groww.in/favicon.ico',               cat: 'news' },
  ];

  const CATEGORIES = [
    { id: 'all',           label: 'All' },
    { id: 'social',        label: 'Social' },
    { id: 'search',        label: 'Productivity' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'shopping',      label: 'Shopping' },
    { id: 'dev',           label: 'Dev' },
    { id: 'news',          label: 'News' },
  ];

  function _getEl(id) { return document.getElementById(id); }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open() {
    if (_visible) { close(); return; }
    _visible = true;
    _getEl('ql-panel').classList.add('visible');
    _getEl('ql-backdrop').classList.add('visible');
    setTimeout(() => {
      const inp = _getEl('ql-search');
      if (inp) { inp.value = ''; inp.focus(); }
    }, 80);
    _renderBookmarks();
    _renderProfile();
    _renderPopularSites('', 'all');
  }

  function close() {
    if (!_visible) return;
    _visible = false;
    _getEl('ql-panel').classList.remove('visible');
    _getEl('ql-backdrop').classList.remove('visible');
    _hideOmni();
    const drop = _getEl('ql-menu-dropdown');
    if (drop) drop.classList.remove('visible');
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
      grid.appendChild(_makeBookmarkItem(bm.url, bm.title));
    });

    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'ql-bm-item ql-bm-add';
    addBtn.title = 'Add bookmark';
    addBtn.innerHTML = `
      <div class="ql-bm-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="ql-bm-title">Add</span>`;
    addBtn.addEventListener('click', () => _openAddBookmarkPanel());
    grid.appendChild(addBtn);
  }

  function _makeBookmarkItem(url, title) {
    const item = document.createElement('div');
    item.className = 'ql-bm-item';
    item.title = url;
    const iconDiv = document.createElement('div');
    iconDiv.className = 'ql-bm-icon';
    const img = document.createElement('img');
    img.width = 22; img.height = 22;
    try { img.src = new URL(url).origin + '/favicon.ico'; } catch (_) { img.src = ''; }
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
    item.addEventListener('click', () => _openURL(url));
    return item;
  }

  // ── Add Bookmark Panel ────────────────────────────────────────────────────
  function _openAddBookmarkPanel(prefillUrl = '', prefillTitle = '') {
    // Remove old if exists
    const old = document.getElementById('ql-add-bm-panel');
    if (old) old.remove();

    // Try to prefill from active tab
    if (!prefillUrl) {
      const tab = Tabs.getActiveTab();
      if (tab) { prefillUrl = tab.url || ''; prefillTitle = tab.title || ''; }
    }

    const panel = document.createElement('div');
    panel.id = 'ql-add-bm-panel';

    const faviconUrl = prefillUrl ? (() => { try { return new URL(prefillUrl).origin + '/favicon.ico'; } catch(_) { return ''; } })() : '';

    panel.innerHTML = `
      <div id="ql-abm-backdrop"></div>
      <div id="ql-abm-modal">
        <div id="ql-abm-header">
          <span>Add Bookmark</span>
          <button id="ql-abm-close">
            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
          </button>
        </div>
        <div id="ql-abm-icon-row">
          <div id="ql-abm-icon-preview">
            ${faviconUrl ? `<img id="ql-abm-favicon" src="${faviconUrl}" width="28" height="28" style="border-radius:6px" onerror="this.style.display='none';document.getElementById('ql-abm-icon-fallback').style.display='flex'"/>` : ''}
            <div id="ql-abm-icon-fallback" style="display:${faviconUrl ? 'none' : 'flex'}">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
          </div>
          <span id="ql-abm-icon-hint">Icon auto-fetched from site</span>
        </div>
        <div class="ql-abm-field">
          <label>Title</label>
          <input id="ql-abm-title" type="text" placeholder="Page title" value="${_esc(prefillTitle)}" spellcheck="false"/>
        </div>
        <div class="ql-abm-field">
          <label>URL</label>
          <input id="ql-abm-url" type="text" placeholder="https://..." value="${_esc(prefillUrl)}" spellcheck="false"/>
        </div>
        <div id="ql-abm-actions">
          <button id="ql-abm-cancel">Cancel</button>
          <button id="ql-abm-save">Save Bookmark</button>
        </div>
      </div>`;

    document.body.appendChild(panel);

    // Auto-fetch icon when URL changes
    const urlInput = panel.querySelector('#ql-abm-url');
    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      try {
        const origin = new URL(val.startsWith('http') ? val : 'https://' + val).origin;
        const img = panel.querySelector('#ql-abm-favicon');
        const fallback = panel.querySelector('#ql-abm-icon-fallback');
        if (img) {
          img.src = origin + '/favicon.ico';
          img.style.display = '';
          if (fallback) fallback.style.display = 'none';
          img.onerror = () => { img.style.display = 'none'; if (fallback) fallback.style.display = 'flex'; };
        } else {
          // Create img
          const newImg = document.createElement('img');
          newImg.id = 'ql-abm-favicon';
          newImg.width = 28; newImg.height = 28;
          newImg.style.borderRadius = '6px';
          newImg.src = origin + '/favicon.ico';
          newImg.onerror = () => { newImg.style.display = 'none'; if (fallback) fallback.style.display = 'flex'; };
          const preview = panel.querySelector('#ql-abm-icon-preview');
          if (preview) preview.insertBefore(newImg, preview.firstChild);
          if (fallback) fallback.style.display = 'none';
        }
      } catch (_) {}
    });

    const _closePanel = () => panel.remove();
    panel.querySelector('#ql-abm-close').addEventListener('click', _closePanel);
    panel.querySelector('#ql-abm-cancel').addEventListener('click', _closePanel);
    panel.querySelector('#ql-abm-backdrop').addEventListener('click', _closePanel);

    panel.querySelector('#ql-abm-save').addEventListener('click', async () => {
      let url = urlInput.value.trim();
      const title = panel.querySelector('#ql-abm-title').value.trim() || url;
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      const entry = { id: Date.now().toString(), url, title, addedAt: Date.now() };
      await BookmarkStore.add(entry);
      _closePanel();
      _renderBookmarks();
    });

    // Animate in
    requestAnimationFrame(() => panel.classList.add('visible'));
  }

  function _esc(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  // ── Popular Sites with categories ─────────────────────────────────────────
  function _renderPopularSites(query, category) {
    _activeCategory = category || 'all';
    const list = _getEl('ql-popular-list');
    const catBtns = document.querySelectorAll('.ql-cat-btn');
    catBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === _activeCategory));
    if (!list) return;

    const q = query.toLowerCase().trim();
    let filtered = SITES;
    if (_activeCategory !== 'all') filtered = filtered.filter(s => s.cat === _activeCategory);
    if (q) filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.url.includes(q));

    list.innerHTML = '';
    filtered.forEach(site => {
      const item = document.createElement('div');
      item.className = 'ql-pop-item';
      item.innerHTML = `
        <img src="${site.icon}" width="16" height="16" onerror="this.style.display='none'" style="border-radius:3px;flex-shrink:0"/>
        <span>${site.name}</span>`;
      item.addEventListener('click', () => {
        _getEl('ql-menu-dropdown').classList.remove('visible');
        _openURL(site.url);
      });
      list.appendChild(item);
    });

    if (!filtered.length) {
      list.innerHTML = `<div style="padding:14px;text-align:center;font-size:12px;color:#2e6060">No results</div>`;
    }
  }

  // ── Omnibox ───────────────────────────────────────────────────────────────
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
      const display = r.label
        ? `<span class="ql-omni-label">${r.label}</span><span class="ql-omni-sub">${r.text}</span>`
        : `<span class="ql-omni-text">${r.text}</span>`;
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
    if (/^https?:\/\//i.test(query) || (query.includes('.') && !query.includes(' '))) {
      results.push({ type: 'url', text: query.startsWith('http') ? query : 'https://' + query });
    }
    try {
      const bms = await BookmarkStore.load();
      bms.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q))
        .slice(0, 3).forEach(b => results.push({ type: 'url', text: b.url, label: b.title }));
    } catch (_) {}
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
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
    _getEl('ql-backdrop')?.addEventListener('click', close);

    const searchInput = _getEl('ql-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(_omniTimer);
        const val = e.target.value.trim();
        if (!val) { _hideOmni(); return; }
        _omniTimer = setTimeout(() => _fetchSuggestions(val), 200);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); _hideOmni(); _navigate(searchInput.value); }
        if (e.key === 'Escape') close();
      });
      searchInput.addEventListener('blur', () => setTimeout(_hideOmni, 150));
    }

    // Menu button
    const menuBtn = _getEl('ql-menu-btn');
    const menuDrop = _getEl('ql-menu-dropdown');
    if (menuBtn && menuDrop) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menuDrop.classList.toggle('visible');
        if (isOpen) {
          const inp = _getEl('ql-pop-search');
          if (inp) { inp.value = ''; inp.focus(); }
          _renderPopularSites('', _activeCategory);
        }
      });
    }

    // Category filter buttons
    document.querySelectorAll('.ql-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const q = _getEl('ql-pop-search')?.value || '';
        _renderPopularSites(q, btn.dataset.cat);
      });
    });

    // Popular sites search
    const popSearch = _getEl('ql-pop-search');
    if (popSearch) {
      popSearch.addEventListener('input', (e) => _renderPopularSites(e.target.value, _activeCategory));
      popSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = e.target.value.trim();
          if (val) { menuDrop.classList.remove('visible'); _navigate(val); }
        }
        e.stopPropagation();
      });
    }

    // Profile pic → settings
    _getEl('ql-profile-pic')?.addEventListener('click', () => { close(); Panel.open('settings'); });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      const drop = _getEl('ql-menu-dropdown');
      if (drop && !drop.contains(e.target) && e.target !== _getEl('ql-menu-btn')) {
        drop.classList.remove('visible');
      }
    });
  }

  return { open, close, init };
})();
