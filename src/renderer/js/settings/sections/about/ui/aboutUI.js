/**
 * settings/sections/about/ui/aboutUI.js
 * HTML for About Vortex section — pure HTML, no logic.
 */

const AboutUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title: 'About Vortex',
        subtitle: 'Version info, links and browser settings',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <line x1="12" y1="8" x2="12" y2="12"/>
                 <line x1="12" y1="16" x2="12.01" y2="16"/>
               </svg>`,
      })}

      <!-- Hero card -->
      ${SettingsCard.render({
        children: `
          <div class="about-hero">
            <div class="about-logo">V</div>
            <div class="about-name">Vortex Browser</div>
            <div class="about-ver" id="about-ver">Loading...</div>
            <div id="about-commit" style="font-size:12px;color:#2e6060;font-family:monospace;display:none;">
              <span id="about-commit-sha"
                style="background:#0d2a2a;padding:2px 8px;border-radius:4px;color:var(--accent,#00c8b4);"></span>
              <span id="about-commit-source"
                style="color:#4a8080;margin-left:6px;font-family:sans-serif;font-size:11px;"></span>
            </div>
            <div class="about-desc">
              A fast, minimal Electron-based browser built for speed and simplicity.
              Open source and privacy-focused.
            </div>
          </div>
        `,
      })}

      <!-- Links + actions card -->
      ${SettingsCard.render({
        children: `
          ${SettingsButton.render({
            id:      'btn-github',
            label:   'GitHub Repository',
            desc:    'github.com/RupamSatyaki/VORTEX-Browser',
            btnText: 'Open',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>`,
          })}

          ${SettingsButton.render({
            id:      'btn-reset',
            label:   'Reset All Settings',
            desc:    'Restore all settings to defaults',
            btnText: 'Reset',
            variant: 'danger',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                      </svg>`,
          })}
        `,
      })}

      <!-- Default browser card -->
      ${SettingsCard.render({
        children: `
          <div class="card-row">
            <div class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div class="row-text">
              <div class="row-label">Default Browser</div>
              <div class="row-desc" id="default-browser-status">Checking...</div>
            </div>
            <button class="setting-btn" id="btn-set-default" style="display:none;">
              Set as Default
            </button>
            <div id="default-browser-badge"
              style="display:none;color:#22c55e;font-size:12px;font-weight:600;
                     align-items:center;gap:5px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
                stroke="#22c55e" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Default
            </div>
          </div>
        `,
      })}`;
  }

  return { render };

})();
