/**
 * settings/sections/changelog/ui/changelogUI.js
 * Shell + loading state HTML for Changelog section — pure HTML.
 * Actual content rendered by renderChangelog() from changelog/index.js
 */

const ChangelogUI = (() => {

  function renderShell() {
    return `
      ${SettingsSectionHeader.render({
        title:    "What's New",
        subtitle: 'Every feature, fix and improvement — version by version',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                 <polyline points="14 2 14 8 20 8"/>
                 <line x1="16" y1="13" x2="8" y2="13"/>
                 <line x1="16" y1="17" x2="8" y2="17"/>
                 <polyline points="10 9 9 9 8 9"/>
               </svg>`,
      })}

      <!-- changelog/index.js renders into this container -->
      <div id="cl-root" style="flex:1;min-height:0;display:flex;flex-direction:column;"></div>`;
  }

  function renderLoading() {
    return `
      <div style="padding:32px;text-align:center;color:#4a8080;font-size:12px;
                  display:flex;flex-direction:column;align-items:center;gap:10px;">
        <div style="width:20px;height:20px;border:2px solid #1e3838;
                    border-top-color:var(--accent,#00c8b4);border-radius:50%;
                    animation:cm-spin 0.7s linear infinite;"></div>
        Loading changelog…
      </div>`;
  }

  function renderError(msg) {
    return `
      <div style="padding:20px;color:#ef4444;font-size:12px;">
        Failed to load changelog: ${msg}
      </div>`;
  }

  return { renderShell, renderLoading, renderError };

})();
