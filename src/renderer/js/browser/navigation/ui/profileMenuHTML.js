/**
 * browser/navigation/ui/profileMenuHTML.js
 * Profile dropdown HTML — pure HTML, no event listeners.
 */

const NavProfileHTML = (() => {

  const STATUS_MAP = {
    online:  { label: 'Online',         color: '#22c55e' },
    dnd:     { label: 'Do Not Disturb', color: '#ef4444' },
    silent:  { label: 'Silent',         color: '#eab308' },
    away:    { label: 'Away',           color: '#f97316' },
    offline: { label: 'Offline',        color: '#6b7280' },
    focus:   { label: 'Focus',          color: '#3b82f6' },
  };

  const STATUS_ICONS = {
    online:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    dnd:     `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    silent:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#eab308" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    away:    `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#f97316" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    offline: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6b7280" stroke-width="2.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    focus:   `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  function render({ name, initial, status, avatarType, avatarData, avatarIcon, bio, avatarIconsMap }) {
    const st = STATUS_MAP[status] || STATUS_MAP.online;

    let avatarHTML;
    if (avatarType === 'image' && avatarData) {
      avatarHTML = `<img src="${avatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    } else {
      avatarHTML = (avatarIconsMap && avatarIconsMap[avatarIcon]) || initial || 'V';
    }

    const statusPicker = Object.entries(STATUS_MAP).map(([k, v]) => `
      <div class="pd-status-opt${status === k ? ' active' : ''}" data-status="${k}" style="--sc:${v.color}">
        <span class="pd-status-dot"></span>${STATUS_ICONS[k]} ${v.label}
      </div>`).join('');

    return `
      <div class="pd-header">
        <div class="pd-avatar" id="pd-avatar">${avatarHTML}</div>
        <div class="pd-info">
          <div class="pd-name">${name}</div>
          <div class="pd-status-row">
            <span class="pd-status-dot" style="background:${st.color}"></span>
            <span class="pd-status-label">${STATUS_ICONS[status] || ''} ${st.label}</span>
          </div>
          ${bio ? `<div class="pd-bio">${bio}</div>` : ''}
        </div>
      </div>
      <div class="pd-sep"></div>
      <div class="pd-status-picker">${statusPicker}</div>
      <div class="pd-sep"></div>
      <div class="pd-item" data-action="profile-settings">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Profile
      </div>
      <div class="pd-item" data-action="bookmarks">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Bookmarks
      </div>
      <div class="pd-item" data-action="history">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        History
      </div>
      <div class="pd-item" data-action="downloads">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Downloads
      </div>
      <div class="pd-item" data-action="settings">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </div>
      <div class="pd-sep"></div>
      <div class="pd-stat-row">
        <div class="pd-stat" id="pd-stat-tabs"><span class="pd-stat-num">0</span><span class="pd-stat-label">Tabs</span></div>
        <div class="pd-stat" id="pd-stat-bm"><span class="pd-stat-num">0</span><span class="pd-stat-label">Bookmarks</span></div>
        <div class="pd-stat" id="pd-stat-dl"><span class="pd-stat-num">0</span><span class="pd-stat-label">Downloads</span></div>
      </div>
      <div class="pd-sep"></div>
      <div class="pd-item pd-danger" data-action="clear-data">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        Clear Browsing Data
      </div>`;
  }

  return { render, STATUS_MAP, STATUS_ICONS };

})();
