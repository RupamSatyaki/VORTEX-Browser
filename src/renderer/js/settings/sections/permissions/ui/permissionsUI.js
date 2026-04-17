/**
 * settings/sections/permissions/ui/permissionsUI.js
 * Shell container HTML for Site Permissions — pure HTML, no logic.
 * Actual content rendered by PermissionManager.render() from permissions/index.js
 */

const PermissionsUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Site Permissions',
        subtitle: 'Manage camera, microphone, notifications and more per site',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
               </svg>`,
      })}

      <!-- PermissionManager renders into this container -->
      <div id="perm-settings-body"
        style="flex:1;min-height:0;display:flex;flex-direction:column;">
      </div>`;
  }

  return { render };

})();
