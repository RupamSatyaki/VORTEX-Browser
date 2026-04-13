/**
 * permissions/popup.js
 * - Address bar shield icon with status badge
 * - Popup shows ONLY permissions the site has requested
 * - Auto-opens when a new permission request arrives, highlights it
 * - Shortcut: Ctrl+Shift+I
 */

const PermissionPopup = (() => {

  let _currentDomain = '';
  let _highlightPerm = null; // permId to highlight on auto-open
  let _cssInjected = false;

  function _injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const base = location.href.replace(/[^/]*$/, '');
    link.href = base + 'js/permissions/styles.css';
    document.head.appendChild(link);
  }

  // ── Address bar icon ──────────────────────────────────────────────────────
  function injectIcon() {
    _injectCSS();
    const icons = document.querySelector('.address-bar-icons');
    if (!icons || document.getElementById('btn-permissions')) return;

    const btn = document.createElement('div');
    btn.className = 'address-icon';
    btn.id = 'btn-permissions';
    btn.title = 'Site Permissions (Ctrl+Shift+I)';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/>
        <path d="M17 3l1.5 1.5L21 2" stroke-width="2.5"/>
      </svg>
      <span class="perm-badge" id="perm-addr-badge" style="display:none;"></span>`;

    const bookmark = document.getElementById('btn-bookmark');
    if (bookmark) icons.insertBefore(btn, bookmark);
    else icons.prepend(btn);

    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  function updateBadge(domain) {
    _currentDomain = domain || '';
    const badge = document.getElementById('perm-addr-badge');
    const btn   = document.getElementById('btn-permissions');
    if (!badge || !btn) return;

    if (!domain || domain.startsWith('vortex://') || domain === 'newtab') {
      badge.style.display = 'none';
      btn.style.opacity = '0.45';
      return;
    }

    btn.style.opacity = '1';
    const perms = PermissionManager.getForDomain(domain);
    const vals  = Object.values(perms);
    if (!vals.length) { badge.style.display = 'none'; return; }

    const hasGranted = vals.includes('granted');
    const hasDenied  = vals.includes('denied');
    badge.style.display = 'block';
    badge.className = 'perm-badge ' + (hasGranted && hasDenied ? 'mixed' : hasGranted ? 'granted' : 'blocked');
  }

  // ── Called from webview permission-request event ──────────────────────────
  // permId: our internal id (e.g. 'camera', 'notifications')
  function onPermissionRequested(domain, permId) {
    PermissionManager.markRequested(domain, permId);
    // Auto-open popup with this permission highlighted
    _highlightPerm = permId;
    _currentDomain = domain;
    _buildPopup();
    _renderPopup(domain);
    _positionPopup();
    const popup = document.getElementById('perm-popup');
    if (popup) popup.classList.add('visible');
    updateBadge(domain);
  }

  // ── Popup build / render ──────────────────────────────────────────────────
  function _buildPopup() {
    if (document.getElementById('perm-popup')) return;
    const el = document.createElement('div');
    el.id = 'perm-popup';
    document.body.appendChild(el);
    document.addEventListener('click', e => {
      if (!e.target.closest('#perm-popup') && !e.target.closest('#btn-permissions')) close();
    });
  }

  function _renderPopup(domain) {
    const popup = document.getElementById('perm-popup');
    if (!popup) return;

    // Only show permissions this site has requested or already has stored
    const relevantPerms = PermissionManager.getRequestedPerms(domain);
    const storedPerms   = PermissionManager.getForDomain(domain);
    const faviconUrl    = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    const rows = relevantPerms.length
      ? relevantPerms.map(p => {
          const status     = storedPerms[p.id] || 'ask';
          const iconClass  = status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'default';
          const isNew      = p.id === _highlightPerm;
          return `
            <div class="perm-row ${isNew ? 'perm-row-highlight' : ''}" data-perm-id="${p.id}">
              <div class="perm-icon ${iconClass}">${PermissionManager.getIcon(p.id)}</div>
              <div class="perm-info">
                <div class="perm-name">${p.label}${isNew ? ' <span class="perm-new-badge">New</span>' : ''}</div>
                <div class="perm-status ${iconClass}">
                  ${status === 'granted' ? 'Allowed' : status === 'denied' ? 'Blocked' : 'Waiting for decision'}
                </div>
              </div>
              <div class="perm-toggle-wrap">
                <button class="perm-toggle-btn ${status === 'granted' ? 'active-allow' : ''}"
                  data-perm="${p.id}" data-val="granted">Allow</button>
                <button class="perm-toggle-btn ${status === 'ask' ? 'active-ask' : ''}"
                  data-perm="${p.id}" data-val="ask">Ask</button>
                <button class="perm-toggle-btn ${status === 'denied' ? 'active-block' : ''}"
                  data-perm="${p.id}" data-val="denied">Block</button>
              </div>
            </div>`;
        }).join('')
      : `<div class="perm-empty">No permissions requested by this site</div>`;

    popup.innerHTML = `
      <div class="perm-popup-header">
        <img class="perm-popup-favicon" src="${faviconUrl}" onerror="this.style.display='none'" />
        <span class="perm-popup-domain">${domain}</span>
        <button class="perm-popup-close" id="perm-popup-close">
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8">
            <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
          </svg>
        </button>
      </div>
      <div class="perm-popup-body" id="perm-popup-body">${rows}</div>
      <div class="perm-popup-footer">
        <span class="perm-footer-link" id="perm-open-settings">Manage all sites →</span>
        <button class="perm-reset-btn" id="perm-reset-site">Reset site</button>
      </div>`;

    popup.querySelector('#perm-popup-close').addEventListener('click', close);

    popup.querySelector('#perm-open-settings').addEventListener('click', () => {
      close();
      if (typeof Panel !== 'undefined') Panel.open('settings');
    });

    popup.querySelector('#perm-reset-site').addEventListener('click', () => {
      PermissionManager.resetDomain(domain);
      _highlightPerm = null;
      _renderPopup(domain);
      updateBadge(domain);
    });

    popup.querySelectorAll('.perm-toggle-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const { perm, val } = btn.dataset;
        PermissionManager.setPermission(domain, perm, val);
        // Clear highlight after user acts
        if (perm === _highlightPerm) _highlightPerm = null;
        _renderPopup(domain);
        updateBadge(domain);
      });
    });

    // Scroll highlighted row into view
    if (_highlightPerm) {
      requestAnimationFrame(() => {
        const row = popup.querySelector(`[data-perm-id="${_highlightPerm}"]`);
        if (row) row.scrollIntoView({ block: 'nearest' });
      });
    }
  }

  function _positionPopup() {
    const popup = document.getElementById('perm-popup');
    const btn   = document.getElementById('btn-permissions');
    if (!popup || !btn) return;
    const rect = btn.getBoundingClientRect();
    popup.style.top  = (rect.bottom + 8) + 'px';
    let left = rect.left + rect.width / 2 - 150;
    left = Math.max(8, Math.min(left, window.innerWidth - 308));
    popup.style.left = left + 'px';
  }

  // ── Open / Close / Toggle ─────────────────────────────────────────────────
  function open() {
    if (!_currentDomain || _currentDomain.startsWith('vortex://')) return;
    _buildPopup();
    _renderPopup(_currentDomain);
    _positionPopup();
    document.getElementById('perm-popup')?.classList.add('visible');
  }

  function close() {
    document.getElementById('perm-popup')?.classList.remove('visible');
    _highlightPerm = null;
  }

  function toggle() {
    const popup = document.getElementById('perm-popup');
    if (popup?.classList.contains('visible')) close();
    else open();
  }

  function initShortcut() {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        toggle();
      }
    });
  }

  return { injectIcon, updateBadge, onPermissionRequested, open, close, toggle, initShortcut };
})();
