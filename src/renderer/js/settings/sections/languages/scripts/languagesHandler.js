/**
 * settings/sections/languages/scripts/languagesHandler.js
 * Event binding for Languages section.
 */

const LanguagesHandler = (() => {

  function bind(container, settings) {
    // Browser language select
    SettingsSelect.bind(container, 'set-lang', async (value) => {
      settings.lang = value;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Spellcheck toggle
    SettingsToggle.bind(container, 'set-spellcheck', async (checked) => {
      settings.spellcheck = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Spellcheck language select — save + send IPC to main process
    SettingsSelect.bind(container, 'set-spellcheck-lang', async (value) => {
      settings.spellcheckLang = value;
      await SettingsStorage.save(settings);
      // Tell main process to update spellcheck language immediately
      SettingsIPC.send('spellcheck:setLanguage', value);
      SettingsLiveApply.notify(settings);
    });
  }

  return { bind };

})();
