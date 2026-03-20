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

  function show(tabEl, tabId, title) {
    if (!_enabled) return;
    clearTimeout(hideTimer);
    const img  = cache[tabId];
    const rect = tabEl.getBoundingClientRect();

    previewEl.innerHTML = `
      <div class="tp-thumb">
        ${img
          ? `<img src="${img}" alt="preview" />`
          : `<div class="tp-placeholder"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#3a7070" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg></div>`
        }
      </div>
      <div class="tp-title">${title || 'Loading...'}</div>
    `;

    previewEl.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
    previewEl.style.top  = rect.bottom + 6 + 'px';
    previewEl.classList.add('visible');
  }

  function hide() {
    hideTimer = setTimeout(() => {
      previewEl && previewEl.classList.remove('visible');
    }, 120);
  }

  return { init, setCache, getCache, removeCache, show, hide, setEnabled };
})();
