/**
 * settings/sections/performance/scripts/performanceHandler.js
 * Event binding for Performance section.
 */

const PerformanceHandler = (() => {

  function bind(container, settings) {
    // GPU toggle
    SettingsToggle.bind(container, 'set-gpu', async (checked) => {
      settings.gpu = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Prefetch toggle
    SettingsToggle.bind(container, 'set-prefetch', async (checked) => {
      settings.prefetch = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Cache size select
    SettingsSelect.bind(container, 'set-cache', async (value) => {
      settings.cache = value;
      await SettingsStorage.save(settings);
    });

    // Tab sleep toggle
    SettingsToggle.bind(container, 'set-tabsleep', async (checked) => {
      settings.tabsleep = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Tab sleep minutes select
    SettingsSelect.bind(container, 'set-tabsleep-minutes', async (value) => {
      settings.tabsleepMinutes = parseInt(value);
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // PiP toggle
    SettingsToggle.bind(container, 'set-pip', async (checked) => {
      settings.pip = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // PiP sites list — render initial
    _renderPipSites(container, settings);

    // Add PiP site button
    SettingsButton.bind(container, 'btn-pip-add', () => {
      const input = container.querySelector('#pip-add-site');
      if (!input) return;
      const site = input.value.trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .toLowerCase();
      if (!site) return;
      if (!settings.pipSites) settings.pipSites = [];
      if (!settings.pipSites.includes(site)) {
        settings.pipSites.push(site);
        SettingsStorage.save(settings);
        SettingsLiveApply.notify(settings);
        _renderPipSites(container, settings);
      }
      input.value = '';
    });

    // Enter key on pip input
    const pipInput = container.querySelector('#pip-add-site');
    if (pipInput) {
      pipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') container.querySelector('#btn-pip-add')?.click();
      });
    }
  }

  function _renderPipSites(container, settings) {
    const list = container.querySelector('#pip-sites-list');
    if (!list) return;
    list.innerHTML = PerformanceUI.renderPipSites(settings.pipSites || []);

    // Bind remove buttons
    list.querySelectorAll('[data-site]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const site = btn.dataset.site;
        settings.pipSites = (settings.pipSites || []).filter(s => s !== site);
        await SettingsStorage.save(settings);
        SettingsLiveApply.notify(settings);
        _renderPipSites(container, settings);
      });
    });
  }

  return { bind };

})();
