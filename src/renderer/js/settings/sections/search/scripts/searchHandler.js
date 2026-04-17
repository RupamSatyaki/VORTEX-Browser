/**
 * settings/sections/search/scripts/searchHandler.js
 * Event binding for Search Engine section.
 */

const SearchHandler = (() => {

  function bind(container, settings) {
    // Search engine select — save + live apply to parent
    SettingsSelect.bind(container, 'set-engine', async (value) => {
      settings.engine = value;
      await SettingsStorage.save(settings);
      // Live apply — navigation.js picks this up via settings:changed
      SettingsLiveApply.notify(settings);
    });

    // Suggestions toggle — save + live apply
    SettingsToggle.bind(container, 'set-suggestions', async (checked) => {
      settings.suggestions = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });
  }

  return { bind };

})();
