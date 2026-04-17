/**
 * settings/sections/appearance/scripts/toggleHandler.js
 * Event binding for appearance toggles and selects.
 */

const AppearanceToggleHandler = (() => {

  function bind(container, settings) {
    // Theme select
    SettingsSelect.bind(container, 'set-theme', async (value) => {
      settings.theme = value;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Font size select
    SettingsSelect.bind(container, 'set-fontsize', async (value) => {
      settings.fontsize = value;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Tab preview toggle
    SettingsToggle.bind(container, 'set-tabpreview', async (checked) => {
      settings.tabpreview = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Bookmarks bar toggle
    SettingsToggle.bind(container, 'set-bookmarksbar', async (checked) => {
      settings.bookmarksbar = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // WhatsApp button toggle
    SettingsToggle.bind(container, 'set-whatsapp-btn', async (checked) => {
      settings.whatsappBtn = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // DevHub button toggle
    SettingsToggle.bind(container, 'set-devhub-btn', async (checked) => {
      settings.devhubBtn = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });
  }

  return { bind };

})();
