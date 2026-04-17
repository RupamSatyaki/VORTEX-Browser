/**
 * settings/sections/notifications/index.js
 * Notifications section — assembles UI + binds scripts.
 */

const NotificationsSection = (() => {

  function render(container, settings) {
    container.innerHTML = NotificationsUI.render(settings);
    NotificationsHandler.bind(container, settings);
  }

  return { render };

})();
