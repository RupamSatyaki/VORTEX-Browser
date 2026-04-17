/**
 * settings/sections/permissions/scripts/permissionsHandler.js
 * Initializes PermissionManager settings panel inside the permissions section.
 *
 * PermissionManager is defined in js/permissions/index.js.
 * It handles its own IPC, storage and rendering internally.
 */

const PermissionsHandler = (() => {

  let _rendered = false;

  function bind(container, _settings) {
    if (_rendered) return;

    const body = container.querySelector('#perm-settings-body');
    if (!body) return;

    if (typeof PermissionManager !== 'undefined') {
      // PermissionManager.render() loads data + builds full settings UI
      PermissionManager.render(body);
      _rendered = true;
    } else {
      body.innerHTML = `
        <div style="padding:32px;text-align:center;color:#4a8080;font-size:13px;">
          Site Permissions Manager is not available.
        </div>`;
    }
  }

  // Reset flag so it re-renders if section is re-mounted
  function reset() { _rendered = false; }

  return { bind, reset };

})();
