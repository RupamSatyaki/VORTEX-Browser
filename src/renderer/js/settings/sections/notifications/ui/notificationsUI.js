/**
 * settings/sections/notifications/ui/notificationsUI.js
 * HTML for Notifications section — pure HTML, no logic.
 */

const NotificationsUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'Notifications',
        subtitle: 'Control desktop notifications from websites',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                 <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-notifications',
            label:   'Desktop Notifications',
            desc:    'Allow websites to send notifications',
            checked: settings.notifications !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>`,
          })}

          ${SettingsToggle.render({
            id:      'set-notif-sound',
            label:   'Notification Sound',
            desc:    'Play sound when notification arrives',
            checked: settings.notifSound !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>`,
          })}
        `,
      })}

      ${SettingsCard.render({
        children: `
          <div class="card-row" style="align-items:flex-start;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;width:100%;">
              <div class="row-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="row-text">
                <div class="row-label">Per-Site Permissions</div>
                <div class="row-desc">Manage notification permissions per site</div>
              </div>
              <button class="setting-btn danger" id="btn-notif-clear-all">Clear All</button>
            </div>
            <div id="notif-sites-list"
              style="width:100%;max-height:200px;overflow-y:auto;padding:0 2px;">
            </div>
            <div style="display:flex;gap:8px;width:100%;align-items:center;">
              <input class="setting-input" id="notif-add-site"
                placeholder="example.com" style="flex:1;"
                spellcheck="false" autocomplete="off"/>
              <button class="setting-btn" id="btn-notif-allow">Allow</button>
              <button class="setting-btn danger" id="btn-notif-block">Block</button>
            </div>
          </div>
        `,
      })}`;
  }

  // Render per-site list rows (called by handler)
  function renderSiteList(sites) {
    const entries = Object.entries(sites || {});
    if (!entries.length) {
      return `<div style="font-size:12px;color:#2e6060;padding:8px 0;">No site permissions set</div>`;
    }
    return entries.map(([site, perm]) => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;
                  border-bottom:1px solid #1a3030;">
        <span style="flex:1;font-size:12px;color:#c8e8e5;font-family:monospace;">${site}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:5px;
          ${perm === 'allow'
            ? 'background:rgba(34,197,94,0.12);color:#22c55e;'
            : 'background:rgba(239,68,68,0.12);color:#ef4444;'}">
          ${perm === 'allow' ? 'Allowed' : 'Blocked'}
        </span>
        <button class="setting-btn danger" data-site="${site}"
          id="btn-notif-remove-${site.replace(/\./g,'_')}"
          style="padding:3px 8px;font-size:11px;">Remove</button>
      </div>`).join('');
  }

  return { render, renderSiteList };

})();
