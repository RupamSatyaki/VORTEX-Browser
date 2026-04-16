/**
 * blocklist/badge.js — Toolbar shield badge (blocked count per tab)
 */

const BlocklistBadge = (() => {

  // tabId → blocked count
  const _counts = {};
  let _injected = false;

  function init() {
    // Inject CSS once — icons are injected by navigation.js on hover
    if (!document.getElementById('bl-badge-css')) {
      const s = document.createElement('style');
      s.id = 'bl-badge-css';
      s.textContent = `
        #btn-blocklist-badge { position:relative; }
        .bl-badge-count {
          position:absolute; top:2px; right:2px;
          min-width:14px; height:14px; padding:0 3px;
          border-radius:7px; background:var(--accent,#00c8b4);
          color:#001a18; font-size:9px; font-weight:700;
          line-height:14px; text-align:center;
          pointer-events:none; display:none;
          border:1.5px solid var(--bg-surface,#22383a);
        }
        .bl-badge-count.visible { display:block; }
      `;
      document.head.appendChild(s);
    }
  }

  function _injectIcon() {
    // No-op — icon is injected by navigation.js on address bar hover
  }

  // Called when a request is blocked — increment count for active tab
  function onBlocked(tabId) {
    if (!tabId) return;
    _counts[tabId] = (_counts[tabId] || 0) + 1;
    const activeId = typeof Tabs !== 'undefined' ? Tabs.getActiveId() : null;
    if (tabId === activeId) _updateBadge(_counts[tabId]);
  }

  // Called when tab switches — show count for new active tab
  function onTabChange(tabId) {
    _updateBadge(_counts[tabId] || 0);
  }

  // Called on page navigation — reset count for that tab
  function onNavigate(tabId) {
    _counts[tabId] = 0;
    const activeId = typeof Tabs !== 'undefined' ? Tabs.getActiveId() : null;
    if (tabId === activeId) _updateBadge(0);
    if (window.vortexAPI) window.vortexAPI.send('blocklist:resetTabStats', tabId);
  }

  function _updateBadge(count) {
    const badge = document.getElementById('bl-badge-num');
    const btn   = document.getElementById('btn-blocklist-badge');
    if (!badge || !btn) return;
    if (count > 0) {
      badge.textContent = count > 999 ? '999+' : String(count);
      badge.classList.add('visible');
      btn.style.opacity = '1';
      btn.style.color = 'var(--accent,#00c8b4)';
    } else {
      badge.classList.remove('visible');
      btn.style.opacity = '0.5';
      btn.style.color = '';
    }
  }

  // Refresh badge with current active tab count (called when icons are injected)
  function _refreshBadge() {
    const activeId = typeof Tabs !== 'undefined' ? Tabs.getActiveId() : null;
    _updateBadge(activeId ? (_counts[activeId] || 0) : 0);
  }

  return { init, onBlocked, onTabChange, onNavigate, _refreshBadge };
})();
