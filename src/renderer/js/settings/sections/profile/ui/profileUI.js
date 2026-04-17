/**
 * settings/sections/profile/ui/profileUI.js
 * HTML for Profile section — pure HTML, no logic.
 */

const ProfileUI = (() => {

  const AVATAR_ICONS = [
    { id: 'fox',      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6 2 3 7 3 12c0 3 1.5 5.5 4 7l1-3h8l1 3c2.5-1.5 4-4 4-7 0-5-3-10-9-10z"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><path d="M3 4 L6 9M21 4 L18 9"/></svg>` },
    { id: 'rocket',   svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>` },
    { id: 'zap',      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` },
    { id: 'flame',    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>` },
    { id: 'star',     svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    { id: 'shield',   svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
    { id: 'cpu',      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>` },
    { id: 'code',     svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
    { id: 'ghost',    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>` },
    { id: 'crown',    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>` },
    { id: 'diamond',  svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/></svg>` },
    { id: 'eye',      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` },
    { id: 'feather',  svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>` },
    { id: 'globe',    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
    { id: 'moon',     svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
    { id: 'music',    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
    { id: 'target',   svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>` },
    { id: 'terminal', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>` },
    { id: 'wave',     svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>` },
    { id: 'atom',     svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z"/></svg>` },
  ];

  const STATUSES = [
    { key: 'online',  label: 'Online',          color: '#22c55e', dot: true },
    { key: 'dnd',     label: 'Do Not Disturb',   color: '#ef4444', dot: true },
    { key: 'silent',  label: 'Silent',           color: '#eab308', dot: true },
    { key: 'away',    label: 'Away',             color: '#f97316', dot: true },
    { key: 'offline', label: 'Offline',          color: '#6b7280', dot: true },
    { key: 'focus',   label: 'Focus',            color: '#3b82f6', dot: true },
  ];

  function render(profile) {
    const p = profile || {};
    return `
      ${SettingsSectionHeader.render({
        title:    'Profile',
        subtitle: 'Your identity in Vortex',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                 <circle cx="12" cy="7" r="4"/>
               </svg>`,
      })}

      <!-- Hero card — avatar + name -->
      ${SettingsCard.render({
        children: `
          <div class="profile-hero">
            <div class="profile-avatar-wrap" id="avatar-wrap" title="Click to change avatar">
              <div class="profile-avatar" id="prof-avatar-display">
                ${_avatarHTML(p)}
              </div>
              <div class="profile-avatar-edit">✎</div>
            </div>
            <input class="profile-name-input" id="prof-name" type="text"
              value="${_esc(p.name || 'Vortex User')}"
              maxlength="24" placeholder="Your name" spellcheck="false"/>
            <div style="font-size:11px;color:#2e6060;">
              Click avatar to pick icon or upload photo
            </div>
          </div>
        `,
      })}

      <!-- Avatar picker card — hidden by default -->
      ${SettingsCard.render({
        id: 'avatar-picker-card',
        style: 'display:none;',
        children: `
          <div class="card-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
            <div class="row-label">Choose Avatar Icon</div>
            <div class="avatar-grid" id="avatar-grid">
              ${_avatarGridHTML(p)}
            </div>
            <div style="display:flex;gap:8px;align-items:center;width:100%;">
              <div class="row-label" style="flex-shrink:0;">Or upload photo</div>
              <input type="file" id="avatar-file" accept="image/*" style="display:none;"/>
              <button class="setting-btn" id="btn-avatar-upload">Upload Image</button>
              <button class="setting-btn danger" id="btn-avatar-reset">Reset</button>
            </div>
          </div>
        `,
      })}

      <!-- Status card -->
      ${SettingsCard.render({
        children: `
          <div class="card-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
            <div class="row-label">Status</div>
            <div class="status-grid" id="status-grid">
              ${_statusGridHTML(p)}
            </div>
          </div>
        `,
      })}

      <!-- Bio card -->
      ${SettingsCard.render({
        children: `
          ${SettingsInput.render({
            id:          'prof-bio',
            label:       'Bio / Note',
            desc:        'Short personal note (optional)',
            value:       p.bio || '',
            placeholder: 'e.g. Developer, night owl...',
            icon:        `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="17" y1="10" x2="3" y2="10"/>
                            <line x1="21" y1="6" x2="3" y2="6"/>
                            <line x1="21" y1="14" x2="3" y2="14"/>
                            <line x1="17" y1="18" x2="3" y2="18"/>
                          </svg>`,
          })}
        `,
      })}`;
  }

  function _avatarHTML(p) {
    if (p.avatarType === 'image' && p.avatarData) {
      return `<img src="${p.avatarData}" style="width:100%;height:100%;object-fit:cover;"/>`;
    }
    const icon = AVATAR_ICONS.find(a => a.id === p.avatar);
    return icon ? icon.svg : (p.name ? p.name[0].toUpperCase() : 'V');
  }

  function _avatarGridHTML(p) {
    return AVATAR_ICONS.map(a => `
      <div class="avatar-opt ${p.avatar === a.id && p.avatarType !== 'image' ? 'selected' : ''}"
        data-emoji="${a.id}" title="${a.id}">
        ${a.svg}
      </div>`).join('');
  }

  function _statusGridHTML(p) {
    return STATUSES.map(s => `
      <div class="status-opt ${p.status === s.key ? 'selected' : ''}"
        data-status="${s.key}" style="--sc:${s.color};">
        <span class="status-dot" style="background:${s.color};"></span>
        ${s.label}
      </div>`).join('');
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, _avatarHTML, _avatarGridHTML, _statusGridHTML, AVATAR_ICONS, STATUSES };

})();
