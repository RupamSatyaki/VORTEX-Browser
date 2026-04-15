// Proxy & Tor Settings Panel — main entry point

const ProxyManager = (() => {
  let _mounted = false;
  let _ipcBound = false; // IPC events bind sirf ek baar

  function _injectCSS() {
    if (document.getElementById('px-styles')) return;
    const link = document.createElement('link');
    link.id  = 'px-styles';
    link.rel = 'stylesheet';
    link.href = 'js/proxy/styles.css';
    document.head.appendChild(link);
  }

  // ── Mount ───────────────────────────────────────────────────────────────────
  async function mount(container) {
    if (_mounted) {
      // Already mounted — just re-render with fresh data
      _remount(container);
      return;
    }
    _mounted = true;
    _injectCSS();

    // Clear stale listeners from previous mount
    ProxyState.clearAll();

    let config = {}, status = {};
    try {
      [config, status] = await Promise.all([
        IPC.invoke('proxy:getConfig'),
        IPC.invoke('proxy:getStatus'),
      ]);
    } catch {}

    config = config || {};
    status = status || {};

    // Set state without triggering listeners yet (no components mounted)
    ProxyState.config = config;
    ProxyState.status = Object.assign(ProxyState.status, status);

    _render(container, config);

    // Bind IPC events only once per page load
    if (!_ipcBound) {
      _ipcBound = true;
      _bindIpcEvents();
    }
  }

  async function _remount(container) {
    // Clear listeners so old component callbacks don't fire
    ProxyState.clearAll();

    let config = {}, status = {};
    try {
      [config, status] = await Promise.all([
        IPC.invoke('proxy:getConfig'),
        IPC.invoke('proxy:getStatus'),
      ]);
    } catch {}

    config = config || {};
    ProxyState.config = config;
    if (status) ProxyState.status = Object.assign(ProxyState.status, status);

    _render(container, config);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  function _render(container, config) {
    container.innerHTML = '';

    // 1. Status Card
    ProxyStatusCard.render(container);

    // 2. Divider
    container.appendChild(_divider());

    // 3. Type Selector
    const typeWrap = document.createElement('div');
    const formsWrap = document.createElement('div');
    formsWrap.id = 'px-forms-wrap';

    ProxyTypeSelector.render(typeWrap, config.type || 'none', (newType) => {
      // Update config type in state
      const cfg = ProxyState.config || {};
      cfg.type = newType;
      ProxyState.config = cfg;
      _showFormForType(newType, formsWrap, cfg);
    });
    container.appendChild(typeWrap);
    container.appendChild(formsWrap);
    _showFormForType(config.type || 'none', formsWrap, config);

    // 4. Divider
    container.appendChild(_divider());

    // 5. Bypass List
    ProxyBypassList.render(container, config.bypassList, (newList) => {
      const cfg = ProxyState.config || {};
      cfg.bypassList = newList;
      ProxyState.config = cfg;
    });

    // 6. Disable button
    const disableWrap = document.createElement('div');
    disableWrap.style.marginTop = '16px';
    const disBtn = document.createElement('button');
    disBtn.className = 'px-btn px-btn-danger';
    disBtn.id = 'px-disable-all';
    disBtn.style.display = config.enabled ? '' : 'none';
    disBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
      Disable Proxy`;
    disBtn.addEventListener('click', async () => {
      disBtn.disabled = true;
      await IPC.invoke('proxy:disable');
      const cfg = ProxyState.config || {};
      cfg.enabled = false;
      ProxyState.setConfig(cfg);
      disBtn.style.display = 'none';
      disBtn.disabled = false;
    });
    disableWrap.appendChild(disBtn);
    container.appendChild(disableWrap);

    // Update disable btn visibility on status change
    ProxyState.on('statusChanged', (s) => {
      disBtn.style.display = s.enabled ? '' : 'none';
    });

    // 7. Manual guide link
    if (typeof ProxyQuickPanel !== 'undefined') {
      container.appendChild(ProxyQuickPanel.createTriggerLink());
    }
  }

  function _divider() {
    const d = document.createElement('div');
    d.className = 'px-divider';
    return d;
  }

  // ── Show form for type ──────────────────────────────────────────────────────
  function _showFormForType(type, wrap, config) {
    wrap.innerHTML = '';

    if (type === 'none') {
      wrap.innerHTML = `
        <div class="px-note" style="margin-top:8px">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          No proxy — browser connects directly to the internet.
        </div>`;
      // Only disable if currently enabled
      if (ProxyState.status.enabled) {
        IPC.invoke('proxy:disable').catch(() => {});
      }
    } else if (type === 'http' || type === 'socks5') {
      ProxyForm.render(wrap, type, config, (cfg) => {
        ProxyState.setConfig(cfg);
        const btn = document.getElementById('px-disable-all');
        if (btn) btn.style.display = '';
      });
    } else if (type === 'tor') {
      TorPanel.render(wrap, config, (cfg) => {
        ProxyState.setConfig(cfg);
        const btn = document.getElementById('px-disable-all');
        if (btn) btn.style.display = '';
      });
    }
  }

  // ── IPC events — bind once ──────────────────────────────────────────────────
  function _bindIpcEvents() {
    IPC.on('proxy:statusUpdate', (s) => {
      if (!s) return;
      ProxyState.setStatus(s);
      _updateToolbarIndicator(s);
    });

    IPC.on('proxy:changed', (cfg) => {
      if (!cfg) return;
      ProxyState.setConfig(cfg);
    });

    IPC.on('tor:bootstrapProgress', (data) => {
      if (!data) return;
      ProxyState.setTorBootstrap(data.percent, data.message);
    });

    IPC.on('tor:downloadProgress', (data) => {
      if (!data) return;
      ProxyState.emit('torDownloadProgress', data);
    });

    IPC.on('tor:ready', () => {
      ProxyState.setTorRunning(true);
      ProxyState.setTorBootstrap(100, 'Connected');
    });

    IPC.on('tor:stopped', () => {
      ProxyState.setTorRunning(false);
      ProxyState.setTorBootstrap(0, 'Stopped');
    });

    IPC.on('tor:error', (data) => {
      ProxyState.setTorRunning(false);
      if (data?.message) console.warn('[Tor]', data.message);
    });
  }

  function _updateToolbarIndicator(s) {
    try {
      window.parent.postMessage({ __vortexAction: true, channel: 'proxy:statusUpdate', payload: s }, '*');
    } catch {}
  }

  return { mount };
})();
