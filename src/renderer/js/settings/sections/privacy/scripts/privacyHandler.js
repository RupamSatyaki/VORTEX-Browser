/**
 * settings/sections/privacy/scripts/privacyHandler.js
 * Event binding for Privacy & Security section.
 */

const PrivacyHandler = (() => {

  function bind(container, settings) {
    // Block trackers toggle
    SettingsToggle.bind(container, 'set-trackers', async (checked) => {
      settings.trackers = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // HTTPS only toggle
    SettingsToggle.bind(container, 'set-https', async (checked) => {
      settings.https = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Do Not Track toggle
    SettingsToggle.bind(container, 'set-dnt', async (checked) => {
      settings.dnt = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Clear browsing data button
    SettingsButton.bind(container, 'btn-clear-data', async () => {
      if (!confirm('Clear all browsing data? This cannot be undone.')) return;

      const btn = container.querySelector('#btn-clear-data');
      if (btn) { btn.disabled = true; btn.textContent = 'Clearing...'; }

      // Send to main process
      SettingsIPC.send('browser:clearData');

      // Clear local session storage
      try {
        localStorage.removeItem('browser_session');
        localStorage.removeItem('vortex_session_sync');
      } catch {}

      if (btn) {
        btn.textContent = 'Cleared ✓';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'Clear Now';
        }, 2000);
      }
    });
  }

  return { bind };

})();
