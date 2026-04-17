/**
 * features/quickLaunch/ui/addBookmarkUI.js
 * Add Bookmark panel HTML + DOM creation.
 */

const QLAddBookmarkUI = (() => {

  function _esc(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function create(prefillUrl, prefillTitle) {
    const faviconUrl = prefillUrl
      ? (() => { try { return new URL(prefillUrl).origin + '/favicon.ico'; } catch(_) { return ''; } })()
      : '';

    const panel = document.createElement('div');
    panel.id = 'ql-add-bm-panel';
    panel.innerHTML = `
      <div id="ql-abm-backdrop"></div>
      <div id="ql-abm-modal">
        <div id="ql-abm-header">
          <span>Add Bookmark</span>
          <button id="ql-abm-close">
            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>
        <div id="ql-abm-icon-row">
          <div id="ql-abm-icon-preview">
            ${faviconUrl
              ? `<img id="ql-abm-favicon" src="${faviconUrl}" width="28" height="28"
                   style="border-radius:6px"
                   onerror="this.style.display='none';document.getElementById('ql-abm-icon-fallback').style.display='flex'"/>`
              : ''}
            <div id="ql-abm-icon-fallback" style="display:${faviconUrl ? 'none' : 'flex'}">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#4a9090" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
          </div>
          <span id="ql-abm-icon-hint">Icon auto-fetched from site</span>
        </div>
        <div class="ql-abm-field">
          <label>Title</label>
          <input id="ql-abm-title" type="text" placeholder="Page title"
            value="${_esc(prefillTitle)}" spellcheck="false"/>
        </div>
        <div class="ql-abm-field">
          <label>URL</label>
          <input id="ql-abm-url" type="text" placeholder="https://..."
            value="${_esc(prefillUrl)}" spellcheck="false"/>
        </div>
        <div id="ql-abm-actions">
          <button id="ql-abm-cancel">Cancel</button>
          <button id="ql-abm-save">Save Bookmark</button>
        </div>
      </div>`;

    return panel;
  }

  return { create };

})();
