/**
 * settings/sections/sync/ui/syncUI.js
 * HTML for Sync & Backup section — pure HTML, no logic.
 */

const SyncUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title: 'Sync & Backup',
        subtitle: 'Export and import your browser data',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <polyline points="1 4 1 10 7 10"/>
                 <polyline points="23 20 23 14 17 14"/>
                 <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
               </svg>`,
      })}

      <!-- Bookmarks -->
      ${SettingsCard.render({
        title: 'Bookmarks',
        children: `
          ${SettingsButton.render({
            id:      'btn-export-bookmarks',
            label:   'Export Bookmarks',
            desc:    'Download all bookmarks as JSON',
            btnText: 'Export',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>`,
          })}

          <div class="card-row">
            <div class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div class="row-text">
              <div class="row-label">Import Bookmarks</div>
              <div class="row-desc">Restore bookmarks from JSON file</div>
            </div>
            <button class="setting-btn" id="btn-import-bookmarks">Import</button>
            <input type="file" id="file-import-bookmarks" accept=".json" style="display:none"/>
          </div>
        `,
      })}

      <!-- History -->
      ${SettingsCard.render({
        title: 'History',
        children: `
          ${SettingsButton.render({
            id:      'btn-export-history',
            label:   'Export History',
            desc:    'Download browsing history as JSON',
            btnText: 'Export',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>`,
          })}
        `,
      })}

      <!-- Settings -->
      ${SettingsCard.render({
        title: 'Settings',
        children: `
          ${SettingsButton.render({
            id:      'btn-export-settings',
            label:   'Export Settings',
            desc:    'Backup all settings to JSON file',
            btnText: 'Export',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>`,
          })}

          <div class="card-row">
            <div class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div class="row-text">
              <div class="row-label">Import Settings</div>
              <div class="row-desc">Restore settings from backup file</div>
            </div>
            <button class="setting-btn" id="btn-import-settings">Import</button>
            <input type="file" id="file-import-settings" accept=".json" style="display:none"/>
          </div>
        `,
      })}

      <!-- Status message -->
      <div id="sync-status"
        style="font-size:12px;color:var(--accent,#00c8b4);
               padding:6px 4px;min-height:20px;transition:opacity 0.3s;">
      </div>`;
  }

  return { render };

})();
