/**
 * cookieManager.js — Cookie Manager for Vortex Settings
 * Tabs: Overview · Browse · Block · Export
 */

const CookieManager = (() => {

  let _allCookies  = [];
  let _searchQuery = '';
  let _activeTab   = 'overview';
  let _blockList   = [];
  let _container   = null;

  // ── IPC helpers ────────────────────────────────────────────────────────────
  async function _invoke(channel, ...args) {
    return new Promise(resolve => {
      const reqId = '__cm_' + Date.now() + '_' + Math.random();
      function handler(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', handler);
        resolve(ev.data.result);
      }
      window.addEventListener('message', handler);
      setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 8000);
      window.parent.postMessage({ __vortexAction: true, channel: '__invoke', payload: { reqId, channel, args } }, '*');
    });
  }

  function _send(channel, data) {
    window.parent.postMessage({ __vortexAction: true, channel, payload: data }, '*');
  }

  // ── Load block list ────────────────────────────────────────────────────────
  function _loadBlockList() {
    try { _blockList = JSON.parse(localStorage.getItem('vx_cookie_blocklist') || '[]'); }
    catch(e) { _blockList = []; }
  }

  function _saveBlockList() {
    localStorage.setItem('vx_cookie_blocklist', JSON.stringify(_blockList));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _fmtDate(ts) {
    if (!ts) return 'Session';
    const d = new Date(ts * 1000);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  function _isExpired(c) {
    return c.expirationDate && c.expirationDate < Date.now() / 1000;
  }

  function _cookieUrl(c) {
    return (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
  }

  function _groupByDomain(cookies) {
    const map = {};
    cookies.forEach(c => {
      const d = c.domain.replace(/^\./, '');
      if (!map[d]) map[d] = [];
      map[d].push(c);
    });
    return map;
  }

  function _escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _setStatus(msg, ok) {
    const el = _container.querySelector('#cm-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#22c55e' : '#ef4444';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 2500);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function render(container) {
    _container = container;
    _loadBlockList();

    container.innerHTML = `
      <div class="cm-wrap">

        <!-- Header -->
        <div class="cm-header">
          <div class="cm-header-left">
            <div class="cm-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00c8b4" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="8"  cy="10" r="1.5" fill="#00c8b4" stroke="none"/>
                <circle cx="14" cy="8"  r="1"   fill="#00c8b4" stroke="none"/>
                <circle cx="15" cy="14" r="1.5" fill="#00c8b4" stroke="none"/>
                <circle cx="9"  cy="15" r="1"   fill="#00c8b4" stroke="none"/>
              </svg>
            </div>
            <div>
              <div class="cm-title">Cookie Manager</div>
              <div class="cm-subtitle">View, manage and block cookies</div>
            </div>
          </div>
          <div class="cm-header-right">
            <span class="cm-status" id="cm-status"></span>
            <button class="cm-refresh-btn" id="cm-refresh" title="Refresh">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            </button>
          </div>
        </div>

        <!-- Stats row -->
        <div class="cm-stats-row" id="cm-stats-row">
          <div class="cm-stat-card" id="cm-stat-total">
            <div class="cm-stat-num">—</div>
            <div class="cm-stat-label">Total</div>
          </div>
          <div class="cm-stat-card" id="cm-stat-domains">
            <div class="cm-stat-num">—</div>
            <div class="cm-stat-label">Domains</div>
          </div>
          <div class="cm-stat-card cm-stat-warn" id="cm-stat-expired">
            <div class="cm-stat-num">—</div>
            <div class="cm-stat-label">Expired</div>
          </div>
          <div class="cm-stat-card" id="cm-stat-session">
            <div class="cm-stat-num">—</div>
            <div class="cm-stat-label">Session</div>
          </div>
          <div class="cm-stat-card cm-stat-secure" id="cm-stat-secure">
            <div class="cm-stat-num">—</div>
            <div class="cm-stat-label">Secure</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="cm-tabs">
          <button class="cm-tab active" data-tab="overview">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Overview
          </button>
          <button class="cm-tab" data-tab="browse">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Browse
          </button>
          <button class="cm-tab" data-tab="block">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            Block
          </button>
          <button class="cm-tab" data-tab="export">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>

        <!-- Tab contents -->
        <div class="cm-tab-content" id="cm-tab-overview" style="display:flex"></div>
        <div class="cm-tab-content" id="cm-tab-browse"   style="display:none"></div>
        <div class="cm-tab-content" id="cm-tab-block"    style="display:none"></div>
        <div class="cm-tab-content" id="cm-tab-export"   style="display:none"></div>

      </div>`;

    _bindTabs();
    _loadAll();
  }

  // ── Tab switching ──────────────────────────────────────────────────────────
  function _bindTabs() {
    _container.querySelectorAll('.cm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        _container.querySelectorAll('.cm-tab').forEach(t => t.classList.remove('active'));
        _container.querySelectorAll('.cm-tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('active');
        _activeTab = tab.dataset.tab;
        _container.querySelector('#cm-tab-' + _activeTab).style.display = 'flex';
        _renderActiveTab();
      });
    });
    _container.querySelector('#cm-refresh').addEventListener('click', _loadAll);
  }

  // ── Load all cookies ───────────────────────────────────────────────────────
  async function _loadAll() {
    const btn = _container.querySelector('#cm-refresh');
    if (btn) { btn.style.animation = 'cm-spin 0.6s linear'; setTimeout(() => btn.style.animation = '', 600); }

    // Show loading state
    const overviewEl = _container.querySelector('#cm-tab-overview');
    if (overviewEl && _activeTab === 'overview') {
      overviewEl.innerHTML = '<div class="cm-loading"><div class="cm-loading-spinner"></div><div>Loading cookies…</div></div>';
    }

    try {
      const [cookies, stats] = await Promise.all([
        _invoke('cookies:getAll'),
        _invoke('cookies:getStats'),
      ]);

      _allCookies = Array.isArray(cookies) ? cookies : [];
      _updateStats(stats || { total: _allCookies.length, domains: Object.keys(_groupByDomain(_allCookies)).length });
      _renderActiveTab();
    } catch(e) {
      _setStatus('Failed to load cookies', false);
      _allCookies = [];
      _renderActiveTab();
    }
  }

  function _updateStats(s) {
    if (!s || typeof s.total === 'undefined') {
      // Compute from _allCookies directly
      const now = Date.now() / 1000;
      s = {
        total:   _allCookies.length,
        domains: Object.keys(_groupByDomain(_allCookies)).length,
        expired: _allCookies.filter(c => c.expirationDate && c.expirationDate < now).length,
        session: _allCookies.filter(c => !c.expirationDate).length,
        secure:  _allCookies.filter(c => c.secure).length,
      };
    }
    const set = (id, val) => {
      const el = _container.querySelector('#' + id + ' .cm-stat-num');
      if (el) el.textContent = val !== undefined ? val : '0';
    };
    set('cm-stat-total',   s.total);
    set('cm-stat-domains', s.domains);
    set('cm-stat-expired', s.expired);
    set('cm-stat-session', s.session);
    set('cm-stat-secure',  s.secure);
  }

  function _renderActiveTab() {
    if (_activeTab === 'overview') _renderOverview();
    if (_activeTab === 'browse')   _renderBrowse();
    if (_activeTab === 'block')    _renderBlock();
    if (_activeTab === 'export')   _renderExport();
  }

  // ── OVERVIEW TAB ──────────────────────────────────────────────────────────
  function _renderOverview() {
    const el = _container.querySelector('#cm-tab-overview');
    const grouped = _groupByDomain(_allCookies);
    const domains = Object.keys(grouped).sort();

    el.innerHTML = `
      <div class="cm-overview-actions">
        <button class="cm-danger-btn" id="cm-del-all">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          Delete All Cookies
        </button>
        <button class="cm-warn-btn" id="cm-del-expired">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Delete Expired
        </button>
      </div>
      <div class="cm-domain-list" id="cm-domain-list">
        ${domains.length === 0 ? '<div class="cm-empty">No cookies found</div>' :
          domains.map(d => _renderDomainRow(d, grouped[d])).join('')}
      </div>`;

    _container.querySelector('#cm-del-all').addEventListener('click', async () => {
      if (!confirm('Delete ALL cookies? This will log you out of all sites.')) return;
      const n = await _invoke('cookies:deleteAll');
      _setStatus('Deleted ' + n + ' cookies', true);
      _loadAll();
    });

    _container.querySelector('#cm-del-expired').addEventListener('click', async () => {
      const n = await _invoke('cookies:deleteExpired');
      _setStatus('Deleted ' + n + ' expired cookies', true);
      _loadAll();
    });

    // Domain expand/collapse
    el.querySelectorAll('.cm-domain-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const row = hdr.closest('.cm-domain-row');
        row.classList.toggle('open');
      });
    });

    // Delete domain
    el.querySelectorAll('.cm-del-domain').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const domain = btn.dataset.domain;
        const n = await _invoke('cookies:deleteForDomain', domain);
        _setStatus('Deleted ' + n + ' cookies from ' + domain, true);
        _loadAll();
      });
    });

    // Delete single cookie
    el.querySelectorAll('.cm-del-cookie').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url  = btn.dataset.url;
        const name = btn.dataset.name;
        await _invoke('cookies:delete', url, name);
        _setStatus('Cookie deleted', true);
        _loadAll();
      });
    });
  }

  function _renderDomainRow(domain, cookies) {
    const expired = cookies.filter(_isExpired).length;
    const secure  = cookies.filter(c => c.secure).length;
    return `
      <div class="cm-domain-row">
        <div class="cm-domain-header">
          <div class="cm-domain-left">
            <svg class="cm-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            <div class="cm-domain-favicon">
              <img src="https://www.google.com/s2/favicons?domain=${_escHtml(domain)}&sz=16" width="14" height="14" onerror="this.style.display='none'" loading="lazy"/>
            </div>
            <span class="cm-domain-name">${_escHtml(domain)}</span>
            <span class="cm-domain-count">${cookies.length}</span>
            ${expired ? `<span class="cm-badge-expired">${expired} expired</span>` : ''}
            ${secure  ? `<span class="cm-badge-secure">🔒 ${secure}</span>` : ''}
          </div>
          <button class="cm-del-domain" data-domain="${_escHtml(domain)}" title="Delete all from ${_escHtml(domain)}">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
        <div class="cm-cookies-list">
          <div class="cm-cookies-scroll">
            ${cookies.map(c => _renderCookieRow(c)).join('')}
          </div>
        </div>
      </div>`;
  }

  function _renderCookieRow(c) {
    const url     = _cookieUrl(c);
    const expired = _isExpired(c);
    return `
      <div class="cm-cookie-row ${expired ? 'cm-cookie-expired' : ''}">
        <div class="cm-cookie-main">
          <div class="cm-cookie-name">${_escHtml(c.name)}</div>
          <div class="cm-cookie-value" title="${_escHtml(c.value)}">${_escHtml((c.value || '').slice(0, 40))}${(c.value || '').length > 40 ? '…' : ''}</div>
        </div>
        <div class="cm-cookie-meta">
          <span class="cm-meta-item" title="Expires">${_fmtDate(c.expirationDate)}</span>
          ${c.secure   ? '<span class="cm-flag cm-flag-secure">Secure</span>'   : ''}
          ${c.httpOnly ? '<span class="cm-flag cm-flag-http">HttpOnly</span>'   : ''}
          ${c.sameSite ? '<span class="cm-flag cm-flag-same">' + _escHtml(c.sameSite) + '</span>' : ''}
          ${expired    ? '<span class="cm-flag cm-flag-exp">Expired</span>'     : ''}
        </div>
        <button class="cm-del-cookie" data-url="${_escHtml(url)}" data-name="${_escHtml(c.name)}" title="Delete">✕</button>
      </div>`;
  }

  // ── BROWSE TAB ────────────────────────────────────────────────────────────
  function _renderBrowse() {
    const el = _container.querySelector('#cm-tab-browse');
    el.innerHTML = `
      <div class="cm-browse-search">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="cm-search-inp" id="cm-search" type="text" placeholder="Search by domain or cookie name…" value="${_escHtml(_searchQuery)}" spellcheck="false"/>
        <span class="cm-search-count" id="cm-search-count"></span>
      </div>
      <div class="cm-browse-list" id="cm-browse-list"></div>`;

    const inp = el.querySelector('#cm-search');
    inp.addEventListener('input', () => {
      _searchQuery = inp.value;
      _renderBrowseResults();
    });
    _renderBrowseResults();
  }

  function _renderBrowseResults() {
    const q    = _searchQuery.toLowerCase().trim();
    const list = _container.querySelector('#cm-browse-list');
    const cnt  = _container.querySelector('#cm-search-count');
    if (!list) return;

    const filtered = q
      ? _allCookies.filter(c =>
          c.domain.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.value || '').toLowerCase().includes(q))
      : _allCookies;

    if (cnt) cnt.textContent = filtered.length + ' cookies';

    if (!filtered.length) {
      list.innerHTML = '<div class="cm-empty">No cookies match your search</div>';
      return;
    }

    const grouped = _groupByDomain(filtered);
    const domains = Object.keys(grouped).sort();
    list.innerHTML = domains.map(d => _renderDomainRow(d, grouped[d])).join('');

    list.querySelectorAll('.cm-domain-header').forEach(hdr => {
      hdr.addEventListener('click', () => hdr.closest('.cm-domain-row').classList.toggle('open'));
    });
    list.querySelectorAll('.cm-del-domain').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await _invoke('cookies:deleteForDomain', btn.dataset.domain);
        _setStatus('Deleted cookies from ' + btn.dataset.domain, true);
        _loadAll();
      });
    });
    list.querySelectorAll('.cm-del-cookie').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await _invoke('cookies:delete', btn.dataset.url, btn.dataset.name);
        _setStatus('Cookie deleted', true);
        _loadAll();
      });
    });
  }

  // ── BLOCK TAB ─────────────────────────────────────────────────────────────
  function _renderBlock() {
    const el = _container.querySelector('#cm-tab-block');
    el.innerHTML = `
      <div class="cm-block-info">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Blocked domains will have their cookies deleted on next visit.
      </div>
      <div class="cm-block-add-row">
        <input class="cm-search-inp" id="cm-block-inp" type="text" placeholder="e.g. ads.example.com" spellcheck="false"/>
        <button class="cm-add-btn" id="cm-block-add">Block Domain</button>
      </div>
      <div class="cm-block-list" id="cm-block-list"></div>
      <div class="cm-block-quick">
        <div class="cm-block-quick-title">Quick block — known trackers</div>
        <div class="cm-block-quick-grid" id="cm-block-quick-grid"></div>
      </div>`;

    _renderBlockList();

    el.querySelector('#cm-block-add').addEventListener('click', () => {
      const inp = el.querySelector('#cm-block-inp');
      const val = inp.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!val) return;
      if (!_blockList.includes(val)) {
        _blockList.push(val);
        _saveBlockList();
        _renderBlockList();
        _setStatus('Blocked: ' + val, true);
      }
      inp.value = '';
    });

    // Quick block trackers
    const trackers = ['doubleclick.net','googlesyndication.com','facebook.com','analytics.google.com','hotjar.com','mixpanel.com','segment.io','amplitude.com','intercom.io','hubspot.com'];
    el.querySelector('#cm-block-quick-grid').innerHTML = trackers.map(t =>
      `<button class="cm-quick-btn ${_blockList.includes(t) ? 'blocked' : ''}" data-domain="${t}">${t}</button>`
    ).join('');
    el.querySelectorAll('.cm-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.domain;
        if (_blockList.includes(d)) {
          _blockList = _blockList.filter(x => x !== d);
          btn.classList.remove('blocked');
        } else {
          _blockList.push(d);
          btn.classList.add('blocked');
        }
        _saveBlockList();
        _setStatus((btn.classList.contains('blocked') ? 'Blocked: ' : 'Unblocked: ') + d, true);
      });
    });
  }

  function _renderBlockList() {
    const list = _container.querySelector('#cm-block-list');
    if (!list) return;
    if (!_blockList.length) {
      list.innerHTML = '<div class="cm-empty">No blocked domains yet</div>';
      return;
    }
    list.innerHTML = _blockList.map(d =>
      `<div class="cm-block-item">
        <div class="cm-block-domain-wrap">
          <span class="cm-block-icon">🚫</span>
          <span class="cm-block-domain">${_escHtml(d)}</span>
        </div>
        <button class="cm-unblock-btn" data-domain="${_escHtml(d)}">Unblock</button>
      </div>`
    ).join('');
    list.querySelectorAll('.cm-unblock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _blockList = _blockList.filter(x => x !== btn.dataset.domain);
        _saveBlockList();
        _renderBlockList();
        _setStatus('Unblocked: ' + btn.dataset.domain, true);
      });
    });
  }

  // ── EXPORT TAB ────────────────────────────────────────────────────────────
  function _renderExport() {
    const el = _container.querySelector('#cm-tab-export');
    el.innerHTML = `
      <div class="cm-export-section">
        <div class="cm-export-card">
          <div class="cm-export-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#00c8b4" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="cm-export-card-info">
            <div class="cm-export-card-title">Export All Cookies</div>
            <div class="cm-export-card-desc">Download all cookies as JSON backup file</div>
          </div>
          <button class="cm-export-btn" id="cm-export-all">Export JSON</button>
        </div>
        <div class="cm-export-card">
          <div class="cm-export-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#a78bfa" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="cm-export-card-info">
            <div class="cm-export-card-title">Import Cookies</div>
            <div class="cm-export-card-desc">Restore cookies from a JSON backup file</div>
          </div>
          <label class="cm-export-btn cm-import-label">
            Import JSON
            <input type="file" id="cm-import-file" accept=".json" style="display:none"/>
          </label>
        </div>
        <div class="cm-export-card">
          <div class="cm-export-card-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f59e0b" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="cm-export-card-info">
            <div class="cm-export-card-title">Export Block List</div>
            <div class="cm-export-card-desc">Save your blocked domains list</div>
          </div>
          <button class="cm-export-btn" id="cm-export-blocklist">Export</button>
        </div>
      </div>
      <div class="cm-export-preview" id="cm-export-preview"></div>`;

    el.querySelector('#cm-export-all').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(_allCookies, null, 2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'vortex-cookies-' + new Date().toISOString().slice(0,10) + '.json'; a.click();
      _setStatus('Exported ' + _allCookies.length + ' cookies', true);
    });

    el.querySelector('#cm-export-blocklist').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(_blockList, null, 2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'vortex-blocklist.json'; a.click();
      _setStatus('Block list exported', true);
    });

    el.querySelector('#cm-import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const cookies = JSON.parse(ev.target.result);
          if (!Array.isArray(cookies)) throw new Error('Invalid format');
          let imported = 0;
          for (const c of cookies) {
            const ok = await _invoke('cookies:set', c);
            if (ok) imported++;
          }
          _setStatus('Imported ' + imported + ' cookies', true);
          _loadAll();
        } catch(err) { _setStatus('Import failed: ' + err.message, false); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  return { render };
})();

// Auto-render when sec-cookies becomes active
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sec-cookies');
  if (!container) return;

  // Render when nav item clicked
  const navItem = document.querySelector('[data-section="cookies"]');
  if (navItem) {
    navItem.addEventListener('click', () => {
      if (!container._cmRendered) {
        CookieManager.render(container);
        container._cmRendered = true;
      }
    });
  }
});
