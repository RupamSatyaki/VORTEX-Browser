/**
 * settings/sections/cookies/ui/cookiesUI.js
 * Shell container HTML for Cookie Manager — pure HTML, no logic.
 * Actual content is rendered by CookieManager.render() from cookieManager.js
 */

const CookiesUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Cookie Manager',
        subtitle: 'View, manage and block cookies from websites',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <circle cx="8"  cy="10" r="1.5" fill="currentColor" stroke="none"/>
                 <circle cx="14" cy="8"  r="1"   fill="currentColor" stroke="none"/>
                 <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/>
                 <circle cx="9"  cy="15" r="1"   fill="currentColor" stroke="none"/>
               </svg>`,
      })}

      <!-- CookieManager renders into this container -->
      <div id="cm-root" style="flex:1;min-height:0;display:flex;flex-direction:column;"></div>`;
  }

  return { render };

})();
