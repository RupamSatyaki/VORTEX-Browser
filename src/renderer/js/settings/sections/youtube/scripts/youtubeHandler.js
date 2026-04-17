/**
 * settings/sections/youtube/scripts/youtubeHandler.js
 * Event binding for YouTube section.
 */

const YoutubeHandler = (() => {

  function bind(container, settings) {
    // Master adblock toggle
    SettingsToggle.bind(container, 'yt-adblock-enabled', async (checked) => {
      settings.ytAdblock = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Ad skip speed select
    SettingsSelect.bind(container, 'yt-ad-speed', async (value) => {
      settings.ytAdSpeed = parseInt(value);
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Remove sponsored cards toggle
    SettingsToggle.bind(container, 'yt-remove-cards', async (checked) => {
      settings.ytRemoveCards = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Remove homepage promotions toggle
    SettingsToggle.bind(container, 'yt-remove-homepage', async (checked) => {
      settings.ytRemoveHomepageAds = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });
  }

  return { bind };

})();
