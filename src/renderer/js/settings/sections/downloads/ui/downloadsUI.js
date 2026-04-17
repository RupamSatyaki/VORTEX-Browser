/**
 * settings/sections/downloads/ui/downloadsUI.js
 * HTML for Downloads section — pure HTML, no logic.
 */

const DownloadsUI = (() => {

  function render(settings) {
    const folderDesc = settings.downloadFolder || 'Default system downloads folder';

    return `
      ${SettingsSectionHeader.render({
        title: 'Downloads',
        subtitle: 'Configure where and how files are downloaded',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                 <polyline points="7 10 12 15 17 10"/>
                 <line x1="12" y1="15" x2="12" y2="3"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          <div class="card-row">
            <div class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="row-text">
              <div class="row-label">Download Location</div>
              <div class="row-desc" id="dl-folder-desc">${folderDesc}</div>
            </div>
            <button class="setting-btn" id="btn-dl-path">Change Folder</button>
          </div>

          ${SettingsToggle.render({
            id:      'set-askdl',
            label:   'Ask Where to Save',
            desc:    'Prompt for location before each download',
            checked: settings.askdl === true,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>`,
          })}

          ${SettingsToggle.render({
            id:      'set-opendl',
            label:   'Open After Download',
            desc:    'Automatically open completed downloads',
            checked: settings.opendl === true,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>`,
          })}
        `,
      })}`;
  }

  return { render };

})();
