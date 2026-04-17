/**
 * settings/sections/performance/ui/performanceUI.js
 * HTML for Performance section — pure HTML, no logic.
 */

const PerformanceUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title:    'Performance',
        subtitle: 'Memory, speed and resource management',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-gpu',
            label:   'Hardware Acceleration',
            desc:    'Use GPU for faster rendering (restart required)',
            checked: settings.gpu !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>`,
          })}

          ${SettingsToggle.render({
            id:      'set-prefetch',
            label:   'Preload Pages',
            desc:    'Prefetch links on hover for faster navigation',
            checked: settings.prefetch !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 20V10"/>
                        <path d="M12 20V4"/>
                        <path d="M6 20v-6"/>
                      </svg>`,
          })}

          ${SettingsSelect.render({
            id:    'set-cache',
            label: 'Cache Size',
            desc:  'Disk cache for faster repeat visits',
            value: String(settings.cache || '512'),
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>`,
            options: [
              { value: '128',  label: '128 MB' },
              { value: '256',  label: '256 MB' },
              { value: '512',  label: '512 MB' },
              { value: '1024', label: '1 GB' },
            ],
          })}
        `,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-tabsleep',
            label:   'Tab Sleep',
            desc:    'Suspend inactive background tabs to save memory',
            checked: settings.tabsleep !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>`,
          })}

          ${SettingsSelect.render({
            id:    'set-tabsleep-minutes',
            label: 'Sleep After',
            desc:  'Suspend tab after this many minutes of inactivity',
            value: String(settings.tabsleepMinutes || 10),
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>`,
            options: [
              { value: '5',  label: '5 minutes' },
              { value: '10', label: '10 minutes' },
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '60', label: '1 hour' },
            ],
          })}
        `,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-pip',
            label:   'Picture in Picture',
            desc:    'Auto-trigger PiP when switching tabs with a playing video',
            checked: settings.pip !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <rect x="12" y="11" width="9" height="7" rx="1" fill="currentColor" stroke="none"/>
                      </svg>`,
          })}

          <div class="card-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;width:100%;">
              <div class="row-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div class="row-text">
                <div class="row-label">PiP Allowed Sites</div>
                <div class="row-desc">Only these sites trigger auto-PiP. Empty = all sites allowed.</div>
              </div>
            </div>
            <div id="pip-sites-list" style="width:100%;min-height:20px;"></div>
            <div style="display:flex;gap:8px;width:100%;align-items:center;">
              <input class="setting-input" id="pip-add-site"
                placeholder="e.g. youtube.com" style="flex:1;"
                spellcheck="false" autocomplete="off"/>
              <button class="setting-btn" id="btn-pip-add">Add</button>
            </div>
          </div>
        `,
      })}`;
  }

  function renderPipSites(sites) {
    if (!sites || !sites.length) {
      return `<div style="font-size:12px;color:#2e6060;padding:4px 0;">All sites allowed</div>`;
    }
    return sites.map(site => `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;
                  border-bottom:1px solid #1a3030;">
        <span style="flex:1;font-size:12px;color:#c8e8e5;font-family:monospace;">${site}</span>
        <button class="setting-btn danger" data-site="${site}"
          style="padding:2px 8px;font-size:11px;">Remove</button>
      </div>`).join('');
  }

  return { render, renderPipSites };

})();
