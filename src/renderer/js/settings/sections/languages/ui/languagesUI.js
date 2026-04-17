/**
 * settings/sections/languages/ui/languagesUI.js
 * HTML for Languages section — pure HTML, no logic.
 */

const LanguagesUI = (() => {

  const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'de', label: 'German (Deutsch)' },
    { value: 'ja', label: 'Japanese (日本語)' },
    { value: 'zh', label: 'Chinese (中文)' },
    { value: 'ar', label: 'Arabic (العربية)' },
    { value: 'pt', label: 'Portuguese (Português)' },
    { value: 'ru', label: 'Russian (Русский)' },
    { value: 'ko', label: 'Korean (한국어)' },
    { value: 'it', label: 'Italian (Italiano)' },
  ];

  const SPELLCHECK_LANGS = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'hi',    label: 'Hindi' },
    { value: 'es',    label: 'Spanish' },
    { value: 'fr',    label: 'French' },
    { value: 'de',    label: 'German' },
    { value: 'ja',    label: 'Japanese' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ru',    label: 'Russian' },
    { value: 'ko',    label: 'Korean' },
    { value: 'it',    label: 'Italian' },
    { value: 'ar',    label: 'Arabic' },
  ];

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'Languages',
        subtitle: 'Browser language and spell check settings',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <line x1="2" y1="12" x2="22" y2="12"/>
                 <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsSelect.render({
            id:      'set-lang',
            label:   'Browser Language',
            desc:    'Language used for browser UI',
            value:   settings.lang || 'en',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>`,
            options: LANGUAGES,
          })}
        `,
      })}

      ${SettingsCard.render({
        children: `
          ${SettingsToggle.render({
            id:      'set-spellcheck',
            label:   'Spell Check',
            desc:    'Check spelling while typing in web forms',
            checked: settings.spellcheck !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="4 7 4 4 20 4 20 7"/>
                        <line x1="9" y1="20" x2="15" y2="20"/>
                        <line x1="12" y1="4" x2="12" y2="20"/>
                      </svg>`,
          })}

          ${SettingsSelect.render({
            id:      'set-spellcheck-lang',
            label:   'Spell Check Language',
            desc:    'Language used for spell checking',
            value:   settings.spellcheckLang || 'en-US',
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 7V4h16v3"/>
                        <path d="M9 20h6"/>
                        <path d="M12 4v16"/>
                      </svg>`,
            options: SPELLCHECK_LANGS,
          })}
        `,
      })}`;
  }

  return { render };

})();
