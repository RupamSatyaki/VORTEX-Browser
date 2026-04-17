/**
 * settings/sections/appearance/scripts/themeHandler.js
 * Event binding for background theme accordion + card selection.
 */

const ThemeHandler = (() => {

  function bind(container, settings) {
    const accordion = container.querySelector('#bg-theme-accordion');
    const header    = container.querySelector('#bg-theme-header');
    if (!accordion || !header) return;

    // Toggle accordion open/close
    header.addEventListener('click', () => {
      accordion.classList.toggle('open');
    });

    // Theme card clicks
    container.querySelectorAll('.bg-theme-card').forEach(card => {
      card.addEventListener('click', async () => {
        const id = card.dataset.theme;
        settings.bgTheme = id;

        // Update active state on cards
        container.querySelectorAll('.bg-theme-card').forEach(c => {
          c.classList.toggle('active', c.dataset.theme === id);
        });

        // Apply CSS vars to settings page
        ThemeSelectorUI.applyThemeVars(id);

        // Update accordion header preview
        ThemeSelectorUI.updateHeader(container, id);

        // Notify parent browser window — live apply
        SettingsLiveApply.notifyBgTheme(id);

        // Save
        await SettingsStorage.save(settings);
      });
    });
  }

  return { bind };

})();
