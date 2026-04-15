// HTTP / SOCKS5 Proxy Form
const ProxyForm = {
  _el: null,
  _type: 'http',

  render(container, type, config, onSave) {
    this._type = type;
    const cfg = config[type] || {};
    const el = document.createElement('div');
    el.id = 'px-proxy-form';
    el.innerHTML = `
      <div class="px-card-label">${type === 'http' ? 'HTTP Proxy' : 'SOCKS5 Proxy'} Settings</div>
      <div class="px-form">
        <div class="px-form-row">
          <div class="px-field" style="flex:3">
            <label>Host / IP</label>
            <input class="px-input" id="px-host" type="text" placeholder="proxy.example.com or 192.168.1.1" value="${cfg.host || ''}" spellcheck="false" autocomplete="off" />
          </div>
          <div class="px-field" style="flex:1">
            <label>Port</label>
            <input class="px-input" id="px-port" type="number" placeholder="${type === 'http' ? '8080' : '1080'}" value="${cfg.port || ''}" min="1" max="65535" />
          </div>
        </div>
        <div class="px-form-row">
          <div class="px-field">
            <label>Username <span style="color:#2e5050;font-weight:400">(optional)</span></label>
            <input class="px-input" id="px-user" type="text" placeholder="Leave blank if no auth" value="${cfg.username || ''}" autocomplete="off" />
          </div>
          <div class="px-field">
            <label>Password <span style="color:#2e5050;font-weight:400">(optional)</span></label>
            <div class="px-input-wrap">
              <input class="px-input" id="px-pass" type="password" placeholder="Leave blank if no auth" value="${cfg.password || ''}" autocomplete="off" />
              <button class="px-eye-btn" id="px-eye" type="button" title="Show/hide password">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="px-form-actions">
          <button class="px-btn px-btn-primary" id="px-save-btn">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Save & Connect
          </button>
          <button class="px-btn px-btn-secondary" id="px-test-proxy-btn">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Test
          </button>
          <div id="px-form-result" style="flex:1"></div>
        </div>
      </div>
    `;
    container.appendChild(el);
    this._el = el;

    // Eye toggle
    el.querySelector('#px-eye').addEventListener('click', () => {
      const inp = el.querySelector('#px-pass');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    // Save
    el.querySelector('#px-save-btn').addEventListener('click', async () => {
      const host = el.querySelector('#px-host').value.trim();
      const port = parseInt(el.querySelector('#px-port').value) || 0;
      if (!host) { el.querySelector('#px-host').classList.add('error'); return; }
      el.querySelector('#px-host').classList.remove('error');

      const btn = el.querySelector('#px-save-btn');
      btn.disabled = true;
      btn.innerHTML = `<span class="px-spinner"></span> Connecting...`;

      // Always read fresh config from ProxyState
      const cfg = Object.assign({}, ProxyState.config || {});
      cfg[type] = {
        host,
        port: port || (type === 'http' ? 8080 : 1080),
        username: el.querySelector('#px-user').value.trim(),
        password: el.querySelector('#px-pass').value,
      };
      cfg.type    = type;
      cfg.enabled = true;

      const result = await IPC.invoke('proxy:setConfig', cfg);
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save & Connect`;

      const res = el.querySelector('#px-form-result');
      if (result && result.success) {
        ProxyState.setConfig(cfg);
        res.innerHTML = `<div class="px-test-result success" style="margin:0">✓ Connected</div>`;
        if (onSave) onSave(cfg);
        // Refresh current IP card
        setTimeout(() => {
          IPC.invoke('proxy:fetchIpInfo').then(info => {
            if (info) ProxyState.setStatus({ ...ProxyState.status, ip: info.ip, country: info.country, city: info.city, org: info.org });
          }).catch(() => {});
        }, 800);
      } else {
        res.innerHTML = `<div class="px-test-result error" style="margin:0">✕ ${result?.error || 'Failed'}</div>`;
      }
      setTimeout(() => { res.innerHTML = ''; }, 4000);
    });

    // Test
    el.querySelector('#px-test-proxy-btn').addEventListener('click', async () => {
      const btn = el.querySelector('#px-test-proxy-btn');
      const res = el.querySelector('#px-form-result');
      btn.disabled = true;
      res.innerHTML = `<span class="px-spinner"></span>`;
      const r = await IPC.invoke('proxy:testConnection');
      btn.disabled = false;
      if (r && r.success) {
        res.innerHTML = `<div class="px-test-result success" style="margin:0">✓ ${r.ip} · ${r.latency}ms</div>`;
      } else {
        res.innerHTML = `<div class="px-test-result error" style="margin:0">✕ ${r?.error || 'No connection'}</div>`;
      }
      setTimeout(() => { res.innerHTML = ''; }, 5000);
    });
  },
};
