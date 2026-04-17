/**
 * settings/sections/appearance/scripts/accentHandler.js
 * Event binding for accent color picker — swatches + custom color input.
 */

const AccentHandler = (() => {

  function bind(container, settings) {
    const current = settings.accentColor || '#00c8b4';

    // Apply accent to settings page itself on init
    SettingsLiveApply.applyAccentLocally(current);

    // Swatch clicks
    container.querySelectorAll('.accent-swatch').forEach(sw => {
      sw.addEventListener('click', async () => {
        const color = sw.dataset.color;
        settings.accentColor = color;
        _updateSwatchActive(container, color);
        _updateCustomPreview(container, color);
        SettingsLiveApply.applyAccentLocally(color);
        SettingsLiveApply.notifyAccent(color);
        await SettingsStorage.save(settings);
      });
    });

    // Custom color input (native color picker)
    const inp = container.querySelector('#set-accent-custom');
    if (inp) {
      inp.addEventListener('input', async () => {
        const color = inp.value;
        settings.accentColor = color;
        _updateSwatchActive(container, color);
        _updateCustomPreview(container, color);
        SettingsLiveApply.applyAccentLocally(color);
        SettingsLiveApply.notifyAccent(color);
        await SettingsStorage.save(settings);
      });
    }

    // Click on preview div triggers color picker
    const preview = container.querySelector('#accent-custom-preview');
    if (preview && inp) {
      preview.addEventListener('click', () => inp.click());
    }
  }

  function _updateSwatchActive(container, color) {
    container.querySelectorAll('.accent-swatch').forEach(sw => {
      const isActive = sw.dataset.color === color;
      sw.style.borderColor = isActive ? '#fff' : 'transparent';
      sw.style.transform   = isActive ? 'scale(1.15)' : '';
      sw.style.boxShadow   = isActive ? '0 0 0 2px rgba(255,255,255,0.3)' : '';
    });
  }

  function _updateCustomPreview(container, color) {
    const preview = container.querySelector('#accent-custom-preview');
    const inp     = container.querySelector('#set-accent-custom');
    if (preview) preview.style.background = color;
    if (inp)     inp.value = color;
  }

  return { bind };

})();
