/**
 * settings/sections/notifications/scripts/notificationsHandler.js
 * Event binding for Notifications section.
 */

const NotificationsHandler = (() => {

  function bind(container, settings) {
    // Desktop notifications toggle
    SettingsToggle.bind(container, 'set-notifications', async (checked) => {
      settings.notifications = checked;
      await SettingsStorage.save(settings);
      SettingsLiveApply.notify(settings);
    });

    // Notification sound toggle
    SettingsToggle.bind(container, 'set-notif-sound', async (checked) => {
      settings.notifSound = checked;
      await SettingsStorage.save(settings);
    });

    // Render initial site list
    _renderSiteList(container, settings);

    // Allow button
    SettingsButton.bind(container, 'btn-notif-allow', () => {
      _addSite(container, settings, 'allow');
    });

    // Block button
    SettingsButton.bind(container, 'btn-notif-block', () => {
      _addSite(container, settings, 'block');
    });

    // Clear all button
    SettingsButton.bind(container, 'btn-notif-clear-all', async () => {
      if (!confirm('Clear all notification site permissions?')) return;
      settings.notifSites = {};
      await SettingsStorage.save(settings);
      _renderSiteList(container, settings);
    });

    // Enter key on input
    const input = container.querySelector('#notif-add-site');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') _addSite(container, settings, 'allow');
      });
    }
  }

  function _addSite(container, settings, perm) {
    const input = container.querySelector('#notif-add-site');
    if (!input) return;
    const site = input.value.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
    if (!site) return;
    if (!settings.notifSites) settings.notifSites = {};
    settings.notifSites[site] = perm;
    SettingsStorage.save(settings);
    _renderSiteList(container, settings);
    input.value = '';
  }

  function _renderSiteList(container, settings) {
    const list = container.querySelector('#notif-sites-list');
    if (!list) return;
    list.innerHTML = NotificationsUI.renderSiteList(settings.notifSites || {});

    // Bind remove buttons
    list.querySelectorAll('[data-site]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const site = btn.dataset.site;
        delete settings.notifSites[site];
        await SettingsStorage.save(settings);
        _renderSiteList(container, settings);
      });
    });
  }

  return { bind };

})();
