// Tab Preview — shows live thumbnail on tab hover
const TabPreview = (() => {
  const cache = {};
  let previewEl = null;
  let hideTimer = null;
  let _enabled = true;

  function setEnabled(val) { _enabled = val; }

  function init() {
    previewEl = document.createElement('div');
    previewEl.id = 'tab-preview-popup';
    document.body.appendChild(previewEl);
  }

  function setCache(tabId, dataURL) { cache[tabId] = dataURL; }
  function getCache(tabId)          { return cache[tabId] || null; }
  function removeCache(tabId)       { delete cache[tabId]; }

  function _formatMem(kb) {
    if (!kb) return null;
    if (kb < 1024) return kb + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  }

  async function show(tabEl, tabId, title) {
    if (!_enabled) return;
    clearTimeout(hideTimer);
    const img  = cache[tabId];
    const rect = tabEl.getBoundingClientRect();

    // Render immediately with placeholder memory
    previewEl.innerHTML = `
      <div class="tp-thumb">
        ${img
          ? `<img src="${img}" alt="preview" />`
          : `<div class="tp-placeholder"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#3a7070" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg></div>`
        }
      </div>
      <div class="tp-title">${title || 'Loading...'}</div>
      <div class="tp-mem" id="tp-mem-${tabId}">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        <span>—</span>
      </div>
    `;

    previewEl.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
    previewEl.style.top  = rect.bottom + 6 + 'px';
    previewEl.classList.add('visible');

    // Fetch memory async — update in place
    try {
      const wcId = WebView.getWcId(tabId);
      if (wcId) {
        const kb = await window.vortexAPI.invoke('tab:memoryUsage', wcId);
        const memEl = document.getElementById(`tp-mem-${tabId}`);
        if (memEl && previewEl.classList.contains('visible')) {
          const formatted = _formatMem(kb);
          const color = !kb ? '#4a8080'
            : kb > 300 * 1024 ? '#ef4444'   // >300MB red
            : kb > 150 * 1024 ? '#f97316'   // >150MB orange
            : '#22c55e';                     // green
          memEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="${color}" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            <span style="color:${color}">${formatted || '—'}</span>
          `;
        }
      }
    } catch (_) {}
  }

  function hide() {
    hideTimer = setTimeout(() => {
      previewEl && previewEl.classList.remove('visible');
    }, 120);
  }

  return { init, setCache, getCache, removeCache, show, hide, setEnabled };
})();
