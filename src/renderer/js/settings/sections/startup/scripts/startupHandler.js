/**
 * settings/sections/startup/scripts/startupHandler.js
 * Event binding for On Startup section.
 */

const StartupHandler = (() => {

  function bind(container, settings) {
    // Startup behavior select
    SettingsSelect.bind(container, 'set-startup', async (value) => {
      settings.startup = value;
      await SettingsStorage.save(settings);
    });

    // Homepage URL — save on blur (not every keystroke)
    SettingsInput.bind(container, 'set-homepage', async (value) => {
      settings.homepage = value.trim() || 'https://www.google.com';
      await SettingsStorage.save(settings);
    }, 'blur');
  }

  return { bind };

})();
