// Tor Panel — binary path, start/stop, bootstrap bar, circuit, new identity
const TorPanel = {
  _el: null,
  _identityCooldown: false,

  render(container, config, onSave) {
    const torCfg = config.tor || {};
    const el = document.createElement('div');
    el.id = 'px-tor-panel';
    el.innerHTML = `
      <div class="px-card-label">Tor Binary</div>
      <div class="px-tor-binary-row">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:#4a8080">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="px-tor-binary-path" id="px-tor-path">Checking...</span>
        <button class="px-btn px-btn-secondary px-btn-sm" id="px-tor-browse">Browse</button>
      </div>

      <!-- Download section — shown when tor.exe not found -->
      <div id="px-tor-dl-section" style="display:none;margin-top:10px">
        <div class="px-note" style="margin-bottom:10px">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          tor.exe not found. Click <strong style="color:var(--accent,#00c8b4)">Auto Download</strong> to install Tor automatically (~15MB from torproject.org), or browse to an existing tor.exe.
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="px-btn px-btn-tor" id="px-tor-auto-dl">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Auto Download Tor
          </button>
          <a href="#" id="px-tor-manual-link" style="font-size:11px;color:#4a8080;text-decoration:none">Manual install ↗</a>
        </div>
        <!-- Download progress bar -->
        <div id="px-dl-progress-wrap" style="display:none;margin-top:10px">
          <div class="px-bootstrap-wrap">
            <div class="px-bootstrap-header">
              <span class="px-bootstrap-pct" id="px-dl-pct" style="color:var(--accent,#00c8b4)">0%</span>
              <span class="px-bootstrap-msg" id="px-dl-msg">Starting download...</span>
            </div>
            <div class="px-bootstrap-bar">
              <div class="px-bootstrap-fill" id="px-dl-fill" style="width:0%;background:linear-gradient(90deg,var(--accent,#00c8b4),#36e8d4)"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top:8px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:#4a8080;user-select:none">
          <input type="checkbox" id="px-tor-autostart" ${torCfg.autoStart ? 'checked' : ''} style="accent-color:var(--accent,#00c8b4)" />
          Auto-start Tor when proxy is enabled
        </label>
      </div>

      <div class="px-divider"></div>

      <div class="px-card-label">Tor Status</div>
      <div class="px-bootstrap-wrap" id="px-bootstrap-wrap">
        <div class="px-bootstrap-header">
          <span class="px-bootstrap-pct" id="px-bootstrap-pct">0%</span>
          <span class="px-bootstrap-msg" id="px-bootstrap-msg">Not started</span>
        </div>
        <div class="px-bootstrap-bar">
          <div class="px-bootstrap-fill" id="px-bootstrap-fill" style="width:0%"></div>
        </div>
      </div>

      <div class="px-tor-actions" style="margin-top:10px">
        <button class="px-btn px-btn-tor" id="px-tor-start">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start Tor
        </button>
        <button class="px-btn px-btn-danger" id="px-tor-stop" disabled>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          Stop Tor
        </button>
        <div id="px-tor-status-text" style="font-size:11px;color:#4a8080;margin-left:4px"></div>
      </div>

      <div class="px-divider"></div>

      <div class="px-card-label">Circuit Info</div>
      <div class="px-circuit" id="px-circuit">
        <span style="font-size:12px;color:#2e5050">Start Tor to see circuit info</span>
      </div>
      <div style="margin-top:10px;display:flex;align-items:center;gap:10px">
        <button class="px-btn px-btn-secondary px-btn-sm" id="px-new-identity" disabled>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
          </svg>
          New Identity
        </button>
        <span id="px-identity-cooldown" style="font-size:11px;color:#4a8080"></span>
      </div>

      <div class="px-divider"></div>

      <div class="px-card-label">Ports</div>
      <div class="px-form">
        <div class="px-form-row">
          <div class="px-field">
            <label>SOCKS Port</label>
            <input class="px-input" id="px-tor-socks-port" type="number" value="${torCfg.socksPort || 9050}" min="1024" max="65535" />
          </div>
          <div class="px-field">
            <label>Control Port</label>
            <input class="px-input" id="px-tor-ctrl-port" type="number" value="${torCfg.controlPort || 9051}" min="1024" max="65535" />
          </div>
        </div>
        <div class="px-form-actions">
          <button class="px-btn px-btn-primary" id="px-tor-save">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save & Connect via Tor
          </button>
        </div>
      </div>

      <div class="px-note" style="margin-top:12px">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Tor routes traffic through 3 relays for anonymity. First connection takes 30–60 seconds. Download tor.exe from <a href="#" id="px-tor-dl-link" style="color:var(--accent,#00c8b4)">torproject.org</a>
      </div>
    `;
    container.appendChild(el);
    this._el = el;
    this._bind(config, onSave);
    this._checkBinary(torCfg);
    this._syncTorState();

    // Store unsubscribe fns to avoid duplicate listeners on re-render
    if (this._unsubs) this._unsubs.forEach(fn => fn());
    this._unsubs = [
      ProxyState.on('torProgress',       ({ percent, message }) => this._onProgress(percent, message)),
      ProxyState.on('torRunningChanged', (running) => this._onRunningChanged(running)),
    ];
  },

  async _checkBinary(torCfg) {
    const pathEl = this._el.querySelector('#px-tor-path');
    try {
      const p = await IPC.invoke('tor:getBinaryPath');
      if (p) {
        pathEl.textContent = p;
        pathEl.className = 'px-tor-binary-path found';
        // Hide download section if found
        const dlSection = this._el.querySelector('#px-tor-dl-section');
        if (dlSection) dlSection.style.display = 'none';
      } else {
        pathEl.textContent = 'Not installed — click Download below';
        pathEl.className = 'px-tor-binary-path missing';
        // Show download section
        const dlSection = this._el.querySelector('#px-tor-dl-section');
        if (dlSection) dlSection.style.display = '';
      }
    } catch {
      pathEl.textContent = 'Could not resolve path';
      pathEl.className = 'px-tor-binary-path missing';
    }
  },

  _bind(config, onSave) {
    const el = this._el;

    // Browse for tor.exe
    el.querySelector('#px-tor-browse').addEventListener('click', async () => {
      const p = await IPC.invoke('tor:pickBinary');
      if (!p) return;
      el.querySelector('#px-tor-path').textContent = p;
      el.querySelector('#px-tor-path').className = 'px-tor-binary-path found';
      // Hide download section
      const dlSection = el.querySelector('#px-tor-dl-section');
      if (dlSection) dlSection.style.display = 'none';
      const cfg = ProxyState.config || {};
      cfg.tor = cfg.tor || {};
      cfg.tor.customBinaryPath = p;
      cfg.tor.useBundled = false;
      ProxyState.setConfig(cfg);
    });

    // Auto-download Tor
    el.querySelector('#px-tor-auto-dl').addEventListener('click', async () => {
      const btn = el.querySelector('#px-tor-auto-dl');
      const progressWrap = el.querySelector('#px-dl-progress-wrap');
      btn.disabled = true;
      btn.innerHTML = `<span class="px-spinner"></span> Downloading...`;
      progressWrap.style.display = '';

      // Listen for download progress
      const _onProgress = ({ percent, message }) => {
        el.querySelector('#px-dl-pct').textContent = percent + '%';
        el.querySelector('#px-dl-msg').textContent = message;
        el.querySelector('#px-dl-fill').style.width = percent + '%';
      };
      IPC.on('tor:downloadProgress', _onProgress);

      const result = await IPC.invoke('tor:download');

      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Auto Download Tor`;

      if (result && result.success) {
        const torPath = result.path;
        el.querySelector('#px-tor-path').textContent = torPath;
        el.querySelector('#px-tor-path').className = 'px-tor-binary-path found';
        el.querySelector('#px-tor-dl-section').style.display = 'none';
        progressWrap.style.display = 'none';
        // Enable start button
        el.querySelector('#px-tor-start').disabled = false;
      } else {
        el.querySelector('#px-dl-msg').textContent = '✕ ' + (result?.error || 'Download failed');
        el.querySelector('#px-dl-pct').textContent = '';
      }
    });

    // Manual install link
    el.querySelector('#px-tor-manual-link').addEventListener('click', (e) => {
      e.preventDefault();
      IPC.send('shell:openExternal', 'https://www.torproject.org/download/tor/');
    });

    // Start Tor
    el.querySelector('#px-tor-start').addEventListener('click', async () => {
      const btn = el.querySelector('#px-tor-start');
      btn.disabled = true;
      this._setStatusText('Starting...');
      const r = await IPC.invoke('tor:start');
      if (!r || !r.success) {
        btn.disabled = false;
        this._setStatusText(r?.error || 'Failed to start');
      }
    });

    // Stop Tor
    el.querySelector('#px-tor-stop').addEventListener('click', async () => {
      await IPC.invoke('tor:stop');
    });

    // New Identity
    el.querySelector('#px-new-identity').addEventListener('click', async () => {
      if (this._identityCooldown) return;
      this._identityCooldown = true;
      const btn = el.querySelector('#px-new-identity');
      const cd  = el.querySelector('#px-identity-cooldown');
      btn.disabled = true;
      await IPC.invoke('tor:newIdentity');
      // 10s cooldown
      let secs = 10;
      cd.textContent = `Wait ${secs}s`;
      const t = setInterval(() => {
        secs--;
        if (secs <= 0) {
          clearInterval(t);
          cd.textContent = '';
          btn.disabled = false;
          this._identityCooldown = false;
          this._refreshCircuit();
        } else {
          cd.textContent = `Wait ${secs}s`;
        }
      }, 1000);
    });

    // Save Tor config
    el.querySelector('#px-tor-save').addEventListener('click', async () => {
      const btn = el.querySelector('#px-tor-save');
      btn.disabled = true;
      btn.innerHTML = `<span class="px-spinner"></span> Saving...`;

      const cfg = ProxyState.config || {};
      cfg.tor = cfg.tor || {};
      cfg.tor.socksPort   = parseInt(el.querySelector('#px-tor-socks-port').value) || 9050;
      cfg.tor.controlPort = parseInt(el.querySelector('#px-tor-ctrl-port').value) || 9051;
      cfg.tor.autoStart   = el.querySelector('#px-tor-autostart').checked;
      cfg.type    = 'tor';
      cfg.enabled = true;

      // Save config — proxy will be applied automatically when Tor bootstrap hits 100%
      const result = await IPC.invoke('proxy:setConfig', cfg);
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save & Connect via Tor`;

      if (result && (result.success || result.pending)) {
        ProxyState.setConfig(cfg);
        if (onSave) onSave(cfg);
        // Show hint if Tor not running yet
        if (result.pending) {
          this._setStatusText('Config saved — Start Tor to connect');
        }
      }
    });

    // Tor download link
    el.querySelector('#px-tor-dl-link').addEventListener('click', (e) => {
      e.preventDefault();
      IPC.send('shell:openExternal', 'https://www.torproject.org/download/tor/');
    });
  },

  _onProgress(percent, message) {
    if (!this._el) return;
    this._el.querySelector('#px-bootstrap-pct').textContent = percent + '%';
    this._el.querySelector('#px-bootstrap-msg').textContent = message;
    this._el.querySelector('#px-bootstrap-fill').style.width = percent + '%';
    if (percent >= 100) {
      this._setStatusText('Connected');
      this._refreshCircuit();
    }
  },

  _onRunningChanged(running) {
    if (!this._el) return;
    const startBtn = this._el.querySelector('#px-tor-start');
    const stopBtn  = this._el.querySelector('#px-tor-stop');
    const idBtn    = this._el.querySelector('#px-new-identity');
    startBtn.disabled = running;
    stopBtn.disabled  = !running;
    idBtn.disabled    = !running || this._identityCooldown;
    if (!running) {
      this._el.querySelector('#px-bootstrap-pct').textContent = '0%';
      this._el.querySelector('#px-bootstrap-msg').textContent = 'Stopped';
      this._el.querySelector('#px-bootstrap-fill').style.width = '0%';
      this._setStatusText('');
    }
  },

  async _syncTorState() {
    try {
      const running = await IPC.invoke('tor:isRunning');
      ProxyState.setTorRunning(running);
      this._onRunningChanged(running);
      if (running) {
        const s = await IPC.invoke('tor:getProcessStatus');
        if (s) this._onProgress(s.bootstrap || 0, s.status === 'connected' ? 'Connected' : 'Running');
        this._refreshCircuit();
      }
    } catch {}
  },

  async _refreshCircuit() {
    if (!this._el) return;
    const circuitEl = this._el.querySelector('#px-circuit');
    try {
      const r = await IPC.invoke('tor:getCircuit');
      if (r && r.success && r.nodes && r.nodes.length) {
        circuitEl.innerHTML = r.nodes.map((n, i) => {
          const isLast = i === r.nodes.length - 1;
          const role = i === 0 ? 'Guard' : (isLast ? 'Exit' : 'Relay');
          return `
            <div class="px-circuit-node">
              <div>
                <div class="px-circuit-node-label">${role}</div>
                <div style="font-size:12px;color:#7aadad">${n.name || n.fingerprint.slice(0,8)}</div>
              </div>
            </div>
            ${!isLast ? '<span class="px-circuit-arrow">→</span>' : ''}
          `;
        }).join('');
      } else {
        circuitEl.innerHTML = `<span style="font-size:12px;color:#2e5050">Circuit info unavailable</span>`;
      }
    } catch {
      circuitEl.innerHTML = `<span style="font-size:12px;color:#2e5050">Could not fetch circuit</span>`;
    }
  },

  _setStatusText(text) {
    if (!this._el) return;
    this._el.querySelector('#px-tor-status-text').textContent = text;
  },
};
