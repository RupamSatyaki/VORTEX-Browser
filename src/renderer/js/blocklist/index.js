/**
 * blocklist/index.js — Blocklist Manager settings panel
 */

const BlocklistManager = (() => {

  let _container = null;
  let _lists = [];
  let _custom = [];
  let _stats = {};
  let _lastUpdated = null;
  let _cssInjected = false;
  let _ytSettings = { ytAdblock: true, ytAdSpeed: 16, ytRemoveCards: true, ytRemoveHomepageAds: true };

  // ── IPC bridge ────────────────────────────────────────────────────────────
  function _invoke(channel, ...args) {
    return new Promise(resolve => {
      const reqId = '__bl_' + Date.now() + '_' + Math.random();
      function handler(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', handler);
        resolve(ev.data.result);
      }
      window.addEventListener('message', handler);
      setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 30000);
      window.parent.postMessage({ __vortexAction: true, channel: '__invoke', payload: { reqId, channel, args } }, '*');
    });
  }

  function _send(channel, data) {
    window.parent.postMessage({ __vortexAction: true, channel, payload: data }, '*');
  }

  // ── CSS inject ────────────────────────────────────────────────────────────
  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const base = location.href.replace(/[^/]*$/, '');
    link.href = base + 'js/blocklist/styles.css';
    document.head.appendChild(link);
  }

  // ── Load data ─────────────────────────────────────────────────────────────
  async function _loadAll() {
    const [lists, custom, stats, settings] = await Promise.all([
      _invoke('blocklist:getLists'),
      _invoke('blocklist:getCustom'),
      _invoke('blocklist:getStats'),
      _invoke('storage:read', 'settings'),
    ]);
    _lists  = lists  || [];
    _custom = custom || [];
    _stats  = stats  || {};
    if (settings) {
      _ytSettings.ytAdblock           = settings.ytAdblock           !== false;
      _ytSettings.ytAdSpeed           = settings.ytAdSpeed           || 16;
      _ytSettings.ytRemoveCards       = settings.ytRemoveCards       !== false;
      _ytSettings.ytRemoveHomepageAds = settings.ytRemoveHomepageAds !== false;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  async function render(container) {
    _container = container;
    _injectCSS();
    await _loadAll();
    _render();
    _bindIPCListeners();
  }

  function _render() {
    if (!_container) return;

    _container.innerHTML = `
      <!-- Stats -->
      <div id="bl-stats-wrap"></div>

      <!-- Update bar -->
      <div id="bl-update-bar-wrap"></div>

      <!-- YouTube Ad Blocker section -->
      <div class="bl-section-label">YouTube</div>
      <div id="bl-yt-wrap"></div>

      <!-- Lists section -->
      <div class="bl-section-label" style="margin-top:16px;">Community Blocklists</div>
      <div id="bl-lists-wrap"></div>

      <!-- Custom rules -->
      <div class="bl-section-label" style="margin-top:16px;">Custom Rules</div>
      <div id="bl-custom-wrap"></div>
    `;

    // Stats
    StatsCard.render(_container.querySelector('#bl-stats-wrap'), _stats);

    // Update bar
    UpdateBar.render(_container.querySelector('#bl-update-bar-wrap'), _lastUpdated, _updateAll);

    // YouTube Ad Blocker card
    const ytWrap = _container.querySelector('#bl-yt-wrap');
    if (typeof YtAdBlockCard !== 'undefined') {
      YtAdBlockCard.render(ytWrap, _ytSettings, async (key, val) => {
        _ytSettings[key] = val;
        // Save to settings
        window.parent.postMessage({
          __vortexAction: true,
          channel: 'settings:changed',
          payload: { [key]: val },
        }, '*');
        // If ytAdblock toggled — also update blocklist engine
        if (key === 'ytAdblock') {
          await _invoke('blocklist:setEnabled', 'youtube-ads', val);
        }
      });
    }

    // List cards — filter out built-in (shown in YT section)
    const listsWrap = _container.querySelector('#bl-lists-wrap');
    const downloadableLists = _lists.filter(l => !l.builtin);
    listsWrap.innerHTML = downloadableLists.map(l => ListCard.render(l)).join('');

    // Bind list card events
    listsWrap.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => _downloadList(btn.dataset.id));
    });
    listsWrap.querySelectorAll('.bl-toggle').forEach(chk => {
      chk.addEventListener('change', () => _toggleList(chk.dataset.id, chk.checked));
    });

    // Custom rules
    CustomRules.render(
      _container.querySelector('#bl-custom-wrap'),
      _custom,
      _addCustom,
      _removeCustom
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function _downloadList(id) {
    const btn = _container.querySelector(`[data-action="download"][data-id="${id}"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Downloading...'; }
    ListCard.updateProgress(id, 0, 'Starting download...');

    const result = await _invoke('blocklist:download', id);

    ListCard.hideProgress(id);
    if (btn) { btn.disabled = false; btn.textContent = 'Update'; }

    if (result?.success) {
      // Refresh
      await _loadAll();
      _render();
    }
  }

  async function _updateAll() {
    UpdateBar.setUpdating(true);
    UpdateBar.setStatus('Updating all lists...');

    const enabledLists = _lists.filter(l => l.enabled);
    for (const list of enabledLists) {
      UpdateBar.setStatus(`Updating ${list.name}...`);
      await _invoke('blocklist:download', list.id);
    }

    _lastUpdated = Date.now();
    UpdateBar.setUpdating(false);
    UpdateBar.setStatus('All lists updated');
    await _loadAll();
    _render();
  }

  async function _toggleList(id, enabled) {
    await _invoke('blocklist:setEnabled', id, enabled);
    const card = _container.querySelector(`.bl-list-card[data-id="${id}"]`);
    if (card) {
      card.classList.toggle('enabled', enabled);
      const badge = card.querySelector('.bl-list-badge');
      if (badge) {
        badge.className = `bl-list-badge ${enabled ? 'enabled' : 'disabled'}`;
        badge.textContent = enabled ? 'ON' : 'OFF';
      }
    }
    // Refresh stats
    const stats = await _invoke('blocklist:getStats');
    _stats = stats || {};
    StatsCard.render(_container.querySelector('#bl-stats-wrap'), _stats);
  }

  async function _addCustom(domain) {
    await _invoke('blocklist:addCustom', domain);
    _custom = await _invoke('blocklist:getCustom') || [];
    CustomRules.render(_container.querySelector('#bl-custom-wrap'), _custom, _addCustom, _removeCustom);
    const stats = await _invoke('blocklist:getStats');
    _stats = stats || {};
    StatsCard.render(_container.querySelector('#bl-stats-wrap'), _stats);
  }

  async function _removeCustom(domain) {
    await _invoke('blocklist:removeCustom', domain);
    _custom = _custom.filter(d => d !== domain);
    CustomRules.render(_container.querySelector('#bl-custom-wrap'), _custom, _addCustom, _removeCustom);
  }

  // ── IPC listeners (progress updates from main) ────────────────────────────
  function _bindIPCListeners() {
    window.addEventListener('message', (e) => {
      if (!e.data || !e.data.__vortexIPC) return;
      const { channel, data } = e.data;
      if (channel === 'blocklist:progress') {
        ListCard.updateProgress(data.id, data.pct, `${data.receivedMB} MB / ${data.totalMB} MB`);
      }
      if (channel === 'blocklist:done') {
        ListCard.hideProgress(data.id);
      }
    });
  }

  return { render };
})();
