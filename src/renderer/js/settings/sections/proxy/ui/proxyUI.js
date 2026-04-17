/**
 * settings/sections/proxy/ui/proxyUI.js
 * Shell container HTML for Proxy & Tor section — pure HTML, no logic.
 * Actual content rendered by ProxyManager.mount() from proxy/index.js
 */

const ProxyUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Proxy & Tor',
        subtitle: 'Route traffic through HTTP, SOCKS5 or Tor network',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <circle cx="12" cy="12" r="6"/>
                 <circle cx="12" cy="12" r="2"/>
               </svg>`,
      })}

      <!-- ProxyManager mounts into this container -->
      <div id="px-panel-root"
        style="flex:1;min-height:0;display:flex;flex-direction:column;">
      </div>`;
  }

  return { render };

})();
