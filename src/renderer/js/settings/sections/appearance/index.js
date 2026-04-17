/**
 * settings/sections/appearance/index.js
 * Appearance section — assembles all UI parts + binds all scripts.
 *
 * Sub-components:
 *   ui/appearanceToggles.js  — theme select, font size, tab preview, WA/DevHub toggles
 *   ui/accentPicker.js       — 8 color swatches + custom color input
 *   ui/themeSelector.js      — bg theme accordion with 10 theme cards
 *
 *   scripts/toggleHandler.js — binds toggles/selects
 *   scripts/accentHandler.js — binds swatch clicks + color input
 *   scripts/themeHandler.js  — binds accordion + card clicks
 */

const AppearanceSection = (() => {

  function render(container, settings) {
    container.innerHTML = `
      ${SettingsSectionHeader.render({
        title:    'Appearance',
        subtitle: 'Customize the look and feel of Vortex',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="3"/>
                 <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
               </svg>`,
      })}

      ${AppearanceTogglesUI.render(settings)}

      ${SettingsCard.render({
        children: `
          ${AccentPickerUI.render(settings)}
          ${ThemeSelectorUI.render(settings.bgTheme || 'teal')}
        `,
      })}`;

    // Bind all event handlers
    AppearanceToggleHandler.bind(container, settings);
    AccentHandler.bind(container, settings);
    ThemeHandler.bind(container, settings);
  }

  return { render };

})();
