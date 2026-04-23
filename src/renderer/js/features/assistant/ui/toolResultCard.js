/**
 * features/assistant/ui/toolResultCard.js
 * Collapsible MCP tool execution card.
 */

const ToolResultCard = (() => {

  function create(toolName, args = {}) {
    const card = document.createElement('div');
    card.className = 'ast-tool-card';

    const argsStr = Object.keys(args).length
      ? JSON.stringify(args, null, 2)
      : null;

    card.innerHTML = `
      <div class="ast-tool-card-header">
        <div class="ast-tool-status running"></div>
        <span class="ast-tool-badge">TOOL</span>
        <span class="ast-tool-name">${toolName}</span>
        ${argsStr ? `<span class="ast-tool-args-preview">${_argsPreview(args)}</span>` : ''}
        <svg class="ast-tool-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="ast-tool-card-body" style="display:none">
        ${argsStr ? `<div class="ast-tool-section-label">Args</div><pre>${_esc(argsStr)}</pre>` : ''}
        <div class="ast-tool-section-label">Result</div>
        <div class="ast-tool-result-text">Running...</div>
      </div>
    `;

    const header   = card.querySelector('.ast-tool-card-header');
    const body     = card.querySelector('.ast-tool-card-body');
    const statusEl = card.querySelector('.ast-tool-status');
    const resultEl = card.querySelector('.ast-tool-result-text');
    const chevron  = card.querySelector('.ast-tool-chevron');

    // Toggle collapse
    header.addEventListener('click', () => {
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      chevron.style.transform = open ? '' : 'rotate(180deg)';
    });

    card.setSuccess = (result) => {
      statusEl.className = 'ast-tool-status success';
      statusEl.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      const str = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      resultEl.textContent = str;
      // Auto-collapse after success
      body.style.display = 'none';
      chevron.style.transform = '';
    };

    card.setError = (err) => {
      statusEl.className = 'ast-tool-status error';
      statusEl.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      resultEl.textContent = `Error: ${err}`;
      // Keep open on error
      body.style.display = 'block';
      chevron.style.transform = 'rotate(180deg)';
    };

    return card;
  }

  function _argsPreview(args) {
    const keys = Object.keys(args);
    if (!keys.length) return '';
    const first = keys[0];
    const val = String(args[first]).slice(0, 20);
    return `<span style="color:var(--text-dim);font-size:10px">${first}: ${val}${val.length >= 20 ? '…' : ''}</span>`;
  }

  function _esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { create };

})();
