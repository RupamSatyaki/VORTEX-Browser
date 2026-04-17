/**
 * settings/sections/profile/index.js
 * Profile section — loads profile.json, renders UI, binds scripts.
 */

const ProfileSection = (() => {

  async function render(container, _settings) {
    // Load profile separately from settings
    const profile = await SettingsStorage.loadProfile();
    container.innerHTML = ProfileUI.render(profile);
    ProfileHandler.bind(container, profile);
  }

  return { render };

})();
