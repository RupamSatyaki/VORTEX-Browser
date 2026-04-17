/**
 * settings/sections/privacy/ui/privacyUI.js
 * HTML for Privacy & Security section — pure HTML, no logic.
 */

const PrivacyUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'Privacy & Security',
        subtitle: 'Control tracking, security and browsing data',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-trackers',
            label:   'Block Trackers',
            desc:    'Block known tracking scripts and pixels',
            checked: settings.trackers !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>`,
          })}

          ${SettingsToggle.render({
            id:      'set-https',
            label:   'HTTPS Only Mode',
            desc:    'Warn before loading HTTP sites',
            checked: settings.https === true,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>`,
          })}

          ${SettingsToggle.render({
            id:      'set-dnt',
            label:   'Do Not Track',
            desc:    'Send DNT header to websites',
            checked: settings.dnt === true,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>`,
          })}
        `,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsButton.render({
            id:      'btn-clear-data',
            label:   'Clear Browsing Data',
            desc:    'Delete history, cache and cookies',
            btnText: 'Clear Now',
            variant: 'danger',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>`,
          })}
        `,
      })}

      ${SettingsCard.renderNotice(
        '⚠️ Clearing browsing data will remove all history, cached files and cookies. You will be logged out of all websites.',
        'warn'
      )}`;
  }

  return { render };

})();
