/**
 * settings/sections/search/ui/searchUI.js
 * HTML for Search Engine section — pure HTML, no logic.
 */

const SearchUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'Search Engine',
        subtitle: 'Configure default search and suggestions',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="11" cy="11" r="8"/>
                 <path d="m21 21-4.35-4.35"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsSelect.render({
            id:    'set-engine',
            label: 'Default Search Engine',
            desc:  'Used in address bar searches',
            value: settings.engine || 'google',
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>`,
            options: [
              { value: 'google',     label: 'Google' },
              { value: 'bing',       label: 'Bing' },
              { value: 'duckduckgo', label: 'DuckDuckGo' },
              { value: 'brave',      label: 'Brave Search' },
              { value: 'ecosia',     label: 'Ecosia' },
            ],
          })}

          ${SettingsToggle.render({
            id:      'set-suggestions',
            label:   'Search Suggestions',
            desc:    'Show suggestions while typing in address bar',
            checked: settings.suggestions !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>`,
          })}
        `,
      })}`;
  }

  return { render };

})();
