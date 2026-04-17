/**
 * settings/sections/startup/ui/startupUI.js
 * HTML for On Startup section — pure HTML, no logic.
 */

const StartupUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'On Startup',
        subtitle: 'Choose what Vortex does when it launches',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <polyline points="12 6 12 12 16 14"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsSelect.render({
            id:    'set-startup',
            label: 'Startup Behavior',
            desc:  'What to open when Vortex starts',
            value: settings.startup || 'session',
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>`,
            options: [
              { value: 'session',  label: 'Restore last session' },
              { value: 'newtab',   label: 'Open new tab' },
              { value: 'homepage', label: 'Open homepage' },
            ],
          })}

          ${SettingsInput.render({
            id:          'set-homepage',
            label:       'Homepage URL',
            desc:        'Used when startup is set to homepage',
            value:       settings.homepage || 'https://www.google.com',
            placeholder: 'https://...',
            type:        'url',
            icon:        `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>`,
          })}
        `,
      })}`;
  }

  return { render };

})();
