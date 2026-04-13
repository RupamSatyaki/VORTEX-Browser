/**
 * blocklist/badge.js — Toolbar shield badge (blocked count per tab)
 */

const BlocklistBadge = (() => {

  // tabId → blocked count
  const _counts = {};
  let _injected = false;

  function init() {
    if (_injected) return;
    _injected = true;
    _injectIcon();
  }

  function _injectIcon() {
    const icons = document.querySelector('.address-bar-icons');
    if (!icons || document.getElementById('btn-blocklist-badge')) return;

    const btn = document.createElement('div');
    btn.className = 'address-icon';
    btn.id = 'btn-blocklist-badge';
    btn.title = 'Ad & Tracker Blocking';
    btn.style.opacity = '0.5';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span class="bl-badge-count" id="bl-badge-num"></span>`;

    // Inject CSS once
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

    // Insert before permission icon or bookmark
    const ref = document.getElementById('btn-permissions') || document.getElementById('btn-bookmark');
    if (ref) icons.insertBefore(btn, ref);
    else icons.prepend(btn);
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

  return { init, onBlocked, onTabChange, onNavigate };
})();
