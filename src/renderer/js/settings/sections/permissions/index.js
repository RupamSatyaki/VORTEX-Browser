/**
 * settings/sections/permissions/index.js
 * Site Permissions section — shell UI + PermissionManager.render() init.
 *
 * Note: permissions/styles.css is already loaded via settings.html <link>
 * so no dynamic injection needed here.
 */

const PermissionsSection = (() => {

  function render(container, settings) {
    container.innerHTML = PermissionsUI.render();
    PermissionsHandler.bind(container, settings);
  }

  return { render };

})();
