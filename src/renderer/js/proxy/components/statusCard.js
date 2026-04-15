// Status Card — full IP details: IPv4, IPv6, ISP, location, timezone, etc.
const ProxyStatusCard = {
  _el: null,
  _refreshing: false,
  _origDetails: null,
  _currDetails: null,
  _lastRenderedIp: null,

  render(container) {
    const el = document.createElement('div');
    el.className = 'px-status-card';
    el.id = 'px-status-card';
    el.innerHTML = this._html();
    container.appendChild(el);
    this._el = el;
    this._origDetails = null;
    this._currDetails = null;
    this._lastRenderedIp = null;
    this._bind();
    this._update(ProxyState.status);
    ProxyState.on('statusChanged', (s) => this._update(s));
    this._loadAll();
  },

  async _loadAll() {
    // Parallel fetch — original (direct) + current (through proxy)
    const [origRes, currRes] = await Promise.allSettled([
      IPC.invoke('proxy:getOriginalIpFull'),
      IPC.invoke('proxy:fetchIpInfo'),
    ]);

    if (origRes.status === 'fulfilled' && origRes.value) {
      this._origDetails = origRes.value;
      this._renderOrigCard(origRes.value);
      ProxyState.setStatus({ ...ProxyState.status, originalIp: origRes.value.ip });
    }
    if (currRes.status === 'fulfilled' && currRes.value) {
      this._currDetails = currRes.value;
      this._renderCurrCard(currRes.value);
      ProxyState.setStatus({
        ...ProxyState.status,
        ip: currRes.value.ip, country: currRes.value.country,
        city: currRes.value.city, org: currRes.value.org,
      });
    }
  },

  _html() {
    return `
      <!-- Connection status bar -->
      <div class="px-status-top">
        <div class="px-status-dot" id="px-dot"></div>
        <div class="px-status-info">
          <div class="px-status-label" id="px-status-label">No Proxy</div>
          <div class="px-status-sub"   id="px-status-sub">Direct connection</div>
        </div>
        <span class="px-status-badge none" id="px-status-badge">NONE</span>
      </div>

      <!-- Tab switcher: Real IP / Current IP -->
      <div id="px-ip-tabs" style="display:flex;gap:2px;margin:12px 0 10px;border-bottom:1px solid #1a3030">
        <div class="px-ip-tab px-ip-tab-active" data-tab="real" style="--tc:#ef4444">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          Real IP
        </div>
        <div class="px-ip-tab" data-tab="current" style="--tc:#22c55e">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Current IP
        </div>
      </div>

      <!-- Real IP panel -->
      <div id="px-panel-real" class="px-ip-panel">
        <div class="px-ip-loading" id="px-orig-loading">
          <span class="px-spinner"></span> Fetching real IP...
        </div>
        <div id="px-orig-details" style="display:none"></div>
      </div>

      <!-- Current IP panel -->
      <div id="px-panel-current" class="px-ip-panel" style="display:none">
        <div class="px-ip-loading" id="px-curr-loading">
          <span class="px-spinner"></span> Fetching current IP...
        </div>
        <div id="px-curr-details" style="display:none"></div>
      </div>

      <!-- Actions -->
      <div class="px-status-actions" style="margin-top:12px">
        <button class="px-btn px-btn-secondary px-btn-sm" id="px-refresh-btn">
          <svg id="px-refresh-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
          </svg>
          Refresh
        </button>
        <button class="px-btn px-btn-secondary px-btn-sm" id="px-test-btn">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Test Connection
        </button>
        <div id="px-test-result" style="flex:1"></div>
      </div>
    `;
  },

  _bind() {
    const el = this._el;

    // Tab switching
    el.querySelectorAll('.px-ip-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('.px-ip-tab').forEach(t => t.classList.remove('px-ip-tab-active'));
        tab.classList.add('px-ip-tab-active');
        const which = tab.dataset.tab;
        el.querySelector('#px-panel-real').style.display    = which === 'real'    ? '' : 'none';
        el.querySelector('#px-panel-current').style.display = which === 'current' ? '' : 'none';
      });
    });

    el.querySelector('#px-refresh-btn').addEventListener('click', () => this._refreshIp());
    el.querySelector('#px-test-btn').addEventListener('click',    () => this._testConn());
  },

  // ── Render detail grid for one IP ──────────────────────────────────────────

  _renderIpGrid(info, isReal) {
    if (!info) return '<div style="font-size:12px;color:#2e5050;padding:8px 0">No data available</div>';

    const accentColor = isReal ? '#ef4444' : (ProxyState.status.type === 'tor' ? '#a78bfa' : '#22c55e');
    const flag = info.countryCode
      ? String.fromCodePoint(...[...info.countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
      : '';

    const rows = [
      { label: 'IPv4',      value: info.ipv4 || '—',     mono: true,  color: accentColor, full: true },
      { label: 'IPv6',      value: info.ipv6 || 'Not available', mono: true, color: info.ipv6 ? '#7aadad' : '#2e5050', full: true },
      { label: 'Country',   value: `${flag} ${info.country || '—'}`.trim() },
      { label: 'Region',    value: info.region || '—' },
      { label: 'City',      value: info.city || '—' },
      { label: 'ZIP',       value: info.zip || '—' },
      { label: 'Timezone',  value: info.timezone || '—' },
      { label: 'ISP',       value: info.isp || '—',       full: true },
      { label: 'Org / AS',  value: info.as || info.org || '—', full: true },
      { label: 'Lat / Lon', value: (info.lat && info.lon) ? `${info.lat}, ${info.lon}` : '—', full: true },
      { label: 'Type',      value: info.type || 'ISP' },
      { label: 'Mobile',    value: info.mobile ? 'Yes' : 'No' },
      { label: 'Proxy/VPN', value: info.proxy ? '⚠ Detected' : 'No', color: info.proxy ? '#f59e0b' : '' },
    ];

    return `
      <div class="px-detail-grid">
        ${rows.map(r => `
          <div class="px-detail-row ${r.full ? 'px-detail-full' : ''}">
            <div class="px-detail-label">${r.label}</div>
            <div class="px-detail-value ${r.mono ? 'px-detail-mono' : ''}"
                 style="${r.color ? `color:${r.color}` : ''}">${r.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderOrigCard(info) {
    if (!this._el) return;
    const loading = this._el.querySelector('#px-orig-loading');
    const details = this._el.querySelector('#px-orig-details');
    if (loading) loading.style.display = 'none';
    if (details) {
      details.innerHTML = this._renderIpGrid(info, true);
      details.style.display = '';
    }
  },

  _renderCurrCard(info) {
    if (!this._el) return;
    const loading = this._el.querySelector('#px-curr-loading');
    const details = this._el.querySelector('#px-curr-details');
    if (loading) loading.style.display = 'none';
    if (details) {
      details.innerHTML = this._renderIpGrid(info, false);
      details.style.display = '';
    }
  },

  // ── Refresh both IPs ───────────────────────────────────────────────────────

  async _refreshIp() {
    if (this._refreshing) return;
    this._refreshing = true;
    const icon = this._el.querySelector('#px-refresh-icon');
    icon.classList.add('px-spin');

    // Show loading state
    const origDetails = this._el.querySelector('#px-orig-details');
    const currDetails = this._el.querySelector('#px-curr-details');
    const origLoading = this._el.querySelector('#px-orig-loading');
    const currLoading = this._el.querySelector('#px-curr-loading');
    if (origDetails) origDetails.style.display = 'none';
    if (currDetails) currDetails.style.display = 'none';
    if (origLoading) origLoading.style.display = '';
    if (currLoading) currLoading.style.display = '';

    const [origRes, currRes] = await Promise.allSettled([
      IPC.invoke('proxy:getOriginalIpFull'),
      IPC.invoke('proxy:fetchIpInfo'),
    ]);

    if (origRes.status === 'fulfilled' && origRes.value) {
      this._origDetails = origRes.value;
      this._renderOrigCard(origRes.value);
      ProxyState.setStatus({ ...ProxyState.status, originalIp: origRes.value.ip });
    } else {
      if (origLoading) origLoading.innerHTML = '<span style="color:#ef4444;font-size:12px">Failed to fetch real IP</span>';
    }

    if (currRes.status === 'fulfilled' && currRes.value) {
      this._currDetails = currRes.value;
      this._renderCurrCard(currRes.value);
      ProxyState.setStatus({
        ...ProxyState.status,
        ip: currRes.value.ip, country: currRes.value.country,
        city: currRes.value.city, org: currRes.value.org,
      });
    } else {
      if (currLoading) currLoading.innerHTML = '<span style="color:#ef4444;font-size:12px">Failed to fetch current IP</span>';
    }

    icon.classList.remove('px-spin');
    this._refreshing = false;
  },

  // ── Test connection ────────────────────────────────────────────────────────

  async _testConn() {
    const btn = this._el.querySelector('#px-test-btn');
    const res = this._el.querySelector('#px-test-result');
    btn.disabled = true;
    res.innerHTML = `<span class="px-spinner"></span>`;

    try {
      const r = await IPC.invoke('proxy:testConnection');
      if (r && r.success) {
        res.innerHTML = `
          <div class="px-test-result success">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ${r.ip} · ${r.latency}ms${r.country ? ' · ' + r.country : ''}
          </div>`;
      } else {
        res.innerHTML = `<div class="px-test-result error">✕ ${r?.error || 'Failed'}</div>`;
      }
    } catch (e) {
      res.innerHTML = `<div class="px-test-result error">✕ ${e.message}</div>`;
    }

    btn.disabled = false;
    setTimeout(() => { res.innerHTML = ''; }, 6000);
  },

  // ── Update connection status bar ───────────────────────────────────────────

  _update(s) {
    if (!this._el) return;
    const dot   = this._el.querySelector('#px-dot');
    const label = this._el.querySelector('#px-status-label');
    const sub   = this._el.querySelector('#px-status-sub');
    const badge = this._el.querySelector('#px-status-badge');

    dot.className = 'px-status-dot';
    if (s.type === 'tor' && s.connected)    dot.classList.add('tor');
    else if (s.connected)                   dot.classList.add('active');
    else if (s.type !== 'none' && s.enabled) dot.classList.add('connecting');

    const TYPE_LABELS = { none: 'No Proxy', http: 'HTTP Proxy', socks5: 'SOCKS5 Proxy', tor: 'Tor Network' };
    label.textContent = TYPE_LABELS[s.type] || 'No Proxy';
    sub.textContent   = s.connected
      ? (s.ip ? `Connected · ${s.ip}` : 'Connected')
      : (s.enabled && s.type !== 'none' ? 'Connecting...' : 'Direct connection');

    badge.className   = `px-status-badge ${s.type || 'none'}`;
    badge.textContent = (s.type || 'none').toUpperCase();

    // Re-render current IP card only when IP actually changes AND we're connected
    const newIp = s.ip;
    if (newIp && newIp !== this._lastRenderedIp && s.connected) {
      this._lastRenderedIp = newIp;
      IPC.invoke('proxy:fetchIpInfo').then(info => {
        if (info) { this._currDetails = info; this._renderCurrCard(info); }
      }).catch(() => {});
    }
  },
};
