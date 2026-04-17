/**
 * browser/navigation/scripts/profileMenu.js
 * Profile dropdown — build, toggle, close, status, stats, initProfile.
 */

const NavProfileMenu = (() => {

  // Profile state
  let _name       = 'Vortex User';
  let _initial    = 'V';
  let _status     = 'online';
  let _avatar     = null;
  let _avatarType = 'emoji';
  let _avatarData = null;
  let _bio        = '';

  // Avatar icons map (same as settings/profile)
  const AVATAR_ICONS = {
    fox:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6 2 3 7 3 12c0 3 1.5 5.5 4 7l1-3h8l1 3c2.5-1.5 4-4 4-7 0-5-3-10-9-10z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><path d="M3 4 L6 9M21 4 L18 9"/></svg>`,
    rocket:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    zap:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    flame:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    star:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    code:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    ghost:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>`,
    crown:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>`,
    moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    target:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    terminal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  };

  function applyData(p) {
    if (!p) return;
    _name       = p.name       || 'Vortex User';
    _initial    = _name[0].toUpperCase();
    _status     = p.status     || 'online';
    _avatar     = p.avatar     || null;
    _avatarType = p.avatarType || 'emoji';
    _avatarData = p.avatarData || null;
    _bio        = p.bio        || '';
    _syncBtn();
  }

  function _syncBtn() {
    const btn = document.getElementById('btn-user');
    if (!btn) return;
    const st = NavProfileHTML.STATUS_MAP[_status] || NavProfileHTML.STATUS_MAP.online;
    if (_avatarType === 'image' && _avatarData) {
      btn.innerHTML = `<img src="${_avatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    } else {
      btn.innerHTML = AVATAR_ICONS[_avatar] || _initial;
    }
    btn.style.setProperty('--status-color', st.color);
    btn.classList.add('has-status');
  }

  function toggle() {
    _build();
    const menu = document.getElementById('profile-dropdown');
    const btn  = document.getElementById('btn-user');
    const rect = btn.getBoundingClientRect();
    menu.style.top   = (rect.bottom + 6) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.classList.add('visible');
    _updateStats();
    setTimeout(() => document.addEventListener('click', _close, { once: true }), 0);
  }

  function _close() {
    document.getElementById('profile-dropdown')?.classList.remove('visible');
  }

  function _build() {
    document.getElementById('profile-dropdown')?.remove();
    const menu = document.createElement('div');
    menu.id = 'profile-dropdown';
    menu.innerHTML = NavProfileHTML.render({
      name: _name, initial: _initial, status: _status,
      avatarType: _avatarType, avatarData: _avatarData,
      avatarIcon: _avatar, bio: _bio, avatarIconsMap: AVATAR_ICONS,
    });
    document.body.appendChild(menu);

    // Status picker
    menu.querySelectorAll('.pd-status-opt').forEach(opt => {
      opt.addEventListener('click', async (e) => {
        e.stopPropagation();
        _status = opt.dataset.status;
        try {
          const p = await window.vortexAPI.invoke('storage:read', 'profile') || {};
          p.status = _status;
          await window.vortexAPI.invoke('storage:write', 'profile', p);
        } catch(_) {}
        _syncBtn();
        _close();
        toggle();
      });
    });

    // Item actions
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      _close();
      switch (item.dataset.action) {
        case 'profile-settings':
          Panel.open('settings');
          setTimeout(() => {
            const frame = document.getElementById('panel-frame');
            frame?.contentWindow?.postMessage({ __vortexIPC: true, channel: 'settings:navigate', data: 'profile' }, '*');
          }, 350);
          break;
        case 'bookmarks':  Panel.open('bookmarks'); break;
        case 'history':    Panel.open('history'); break;
        case 'downloads':  Panel.open('downloads'); break;
        case 'settings':   Panel.open('settings'); break;
        case 'clear-data':
          if (confirm('Clear all browsing data? This cannot be undone.')) {
            window.vortexAPI.send('browser:clearData');
            localStorage.removeItem('browser_session');
          }
          break;
      }
    });
  }

  function _updateStats() {
    const tabCount = Tabs.getAllTabs ? Tabs.getAllTabs().length : 0;
    const tabEl = document.getElementById('pd-stat-tabs');
    if (tabEl) tabEl.querySelector('.pd-stat-num').textContent = tabCount;

    if (window.BookmarkStore) {
      BookmarkStore.load().then(list => {
        const el = document.getElementById('pd-stat-bm');
        if (el) el.querySelector('.pd-stat-num').textContent = list.length;
      }).catch(() => {});
    }
    if (window.DownloadHistory) {
      DownloadHistory.load().then(list => {
        const el = document.getElementById('pd-stat-dl');
        if (el) el.querySelector('.pd-stat-num').textContent = list.length;
      }).catch(() => {});
    }
  }

  async function init() {
    try {
      const p = await window.vortexAPI.invoke('storage:read', 'profile');
      applyData(p);
    } catch(_) { _syncBtn(); }

    window.addEventListener('message', (e) => {
      if (e.data?.__vortexAction && e.data.channel === 'profile:changed') applyData(e.data.payload);
    });
    window.addEventListener('vortex-profile-changed', (e) => applyData(e.detail));
  }

  return { toggle, init, applyData };

})();
