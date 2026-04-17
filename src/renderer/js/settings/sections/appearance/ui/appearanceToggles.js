/**
 * settings/sections/appearance/ui/appearanceToggles.js
 * HTML for appearance toggles + selects card — pure HTML, no logic.
 */

const AppearanceTogglesUI = (() => {

  function render(settings) {
    return SettingsCard.render({
      children: `
        ${SettingsSelect.render({
          id:    'set-theme',
          label: 'Theme',
          desc:  'Choose browser color theme',
          value: settings.theme || 'dark',
          icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>`,
          options: [
            { value: 'dark',   label: 'Dark' },
            { value: 'darker', label: 'Darker' },
            { value: 'teal',   label: 'Teal Accent' },
          ],
        })}

        ${SettingsSelect.render({
          id:    'set-fontsize',
          label: 'Font Size',
          desc:  'Default page font size',
          value: settings.fontsize || 'medium',
          icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"/>
                    <polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/>
                    <line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>`,
          options: [
            { value: 'small',  label: 'Small (14px)' },
            { value: 'medium', label: 'Medium (16px)' },
            { value: 'large',  label: 'Large (18px)' },
            { value: 'xlarge', label: 'X-Large (20px)' },
          ],
        })}

        ${SettingsToggle.render({
          id:      'set-tabpreview',
          label:   'Show Tab Previews',
          desc:    'Thumbnail preview on tab hover',
          checked: settings.tabpreview !== false,
          icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>`,
        })}

        ${SettingsToggle.render({
          id:      'set-bookmarksbar',
          label:   'Show Bookmarks Bar',
          desc:    'Display bookmarks below toolbar',
          checked: settings.bookmarksbar === true,
          icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>`,
        })}

        ${SettingsToggle.render({
          id:      'set-whatsapp-btn',
          label:   'Show WhatsApp Button',
          desc:    'WhatsApp Web shortcut in toolbar',
          checked: settings.whatsappBtn !== false,
          icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>`,
        })}

        ${SettingsToggle.render({
          id:      'set-devhub-btn',
          label:   'Show DevHub Button',
          desc:    'Developer tools panel in toolbar',
          checked: settings.devhubBtn !== false,
          icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>`,
        })}
      `,
    });
  }

  return { render };

})();
