/**
 * settings/sections/blocklists/ui/blocklistsUI.js
 * Shell container HTML for Ad & Tracker Blocklist — pure HTML, no logic.
 * Actual content rendered by BlocklistManager.render() from blocklist/index.js
 */

const BlocklistsUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Ad & Tracker Blocking',
        subtitle: 'Block ads, trackers and malware at the network level',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                 <line x1="9" y1="9" x2="15" y2="15"/>
                 <line x1="15" y1="9" x2="9" y2="15"/>
               </svg>`,
      })}

      <!-- BlocklistManager renders into this container -->
      <div id="bl-settings-body"
        style="flex:1;min-height:0;display:flex;flex-direction:column;padding:0 2px;">
      </div>`;
  }

  return { render };

})();
