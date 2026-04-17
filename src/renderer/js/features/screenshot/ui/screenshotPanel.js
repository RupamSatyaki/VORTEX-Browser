/**
 * features/screenshot/ui/screenshotPanel.js
 * Screenshot panel HTML — preview, meta, copy/save buttons + loading state.
 */

const ScreenshotPanelUI = (() => {

  function _escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _defaultName() {
    const ts  = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `screenshot-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.png`;
  }

  function buildPanel(dataURL, pageTitle, isFull) {
    const name  = _defaultName();
    const panel = document.createElement('div');
    panel.id = 'screenshot-panel';
    panel.innerHTML = `
      <div id="ssp-backdrop"></div>
      <div id="ssp-modal">
        <div id="ssp-header">
          <span id="ssp-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Screenshot ${isFull ? '(Full Page)' : '(Visible Area)'}
          </span>
          <button id="ssp-close" title="Close">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.8"/>
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </button>
        </div>
        <div id="ssp-preview-wrap">
          <img id="ssp-img" src="${dataURL}" alt="Screenshot preview"/>
        </div>
        <div id="ssp-meta">
          <span id="ssp-page-title">${_escHtml(pageTitle)}</span>
          <span id="ssp-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div id="ssp-actions">
          <button id="ssp-copy" class="ssp-btn ssp-btn-secondary">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
          <button id="ssp-save" class="ssp-btn ssp-btn-primary">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Save PNG
          </button>
        </div>
      </div>`;

    return { panel, name };
  }

  function buildLoading() {
    const panel = document.createElement('div');
    panel.id = 'screenshot-panel';
    panel.innerHTML = `
      <div id="ssp-backdrop"></div>
      <div id="ssp-modal" style="padding:32px;text-align:center;color:#7aadad;font-size:14px;">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#00c8b4" stroke-width="2"
          style="animation:spin 1s linear infinite;display:block;margin:0 auto 12px">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
        </svg>
        Capturing...
      </div>`;
    return panel;
  }

  return { buildPanel, buildLoading };

})();
