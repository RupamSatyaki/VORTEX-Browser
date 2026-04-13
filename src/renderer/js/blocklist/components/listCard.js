/**
 * blocklist/components/listCard.js
 */

const CATEGORY_ICONS = {
  ads: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  privacy: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  mixed: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  security: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#ef4444"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
};

function _timeAgo(ts) {
  if (!ts) return 'Never downloaded';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  return Math.floor(diff / 86400) + ' days ago';
}

function _fmtRules(n) {
  if (!n) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K rules';
  return n + ' rules';
}

const ListCard = {
  render(list) {
    const icon = CATEGORY_ICONS[list.category] || CATEGORY_ICONS.mixed;
    const btnLabel = list.downloaded ? 'Update' : 'Download';

    return `
      <div class="bl-list-card ${list.enabled ? 'enabled' : ''}" data-id="${list.id}">
        <div class="bl-list-header">
          <div class="bl-list-icon ${list.category}">${icon}</div>
          <div class="bl-list-info">
            <div class="bl-list-name">
              ${list.name}
              <span class="bl-list-badge ${list.enabled ? 'enabled' : 'disabled'}">
                ${list.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div class="bl-list-meta">
              <span>${list.desc}</span>
              ${list.ruleCount ? `<span class="bl-list-rules">${_fmtRules(list.ruleCount)}</span>` : ''}
              <span>${_timeAgo(list.lastUpdated)}</span>
            </div>
          </div>
          <div class="bl-list-actions">
            <button class="bl-list-update-btn" data-action="download" data-id="${list.id}">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              ${btnLabel}
            </button>
            <label class="toggle" style="flex-shrink:0;">
              <input type="checkbox" class="bl-toggle" data-id="${list.id}" ${list.enabled ? 'checked' : ''}/>
              <div class="toggle-track"></div>
            </label>
          </div>
        </div>
        <div class="bl-list-progress" id="bl-progress-${list.id}">
          <div class="bl-list-progress-bar-bg">
            <div class="bl-list-progress-fill" id="bl-fill-${list.id}"></div>
          </div>
          <div class="bl-list-progress-text" id="bl-ptext-${list.id}">Downloading...</div>
        </div>
      </div>`;
  },

  updateProgress(id, pct, text) {
    const bar  = document.getElementById(`bl-fill-${id}`);
    const txt  = document.getElementById(`bl-ptext-${id}`);
    const wrap = document.getElementById(`bl-progress-${id}`);
    if (wrap) wrap.classList.add('visible');
    if (bar)  bar.style.width = pct + '%';
    if (txt)  txt.textContent = text || 'Downloading...';
  },

  hideProgress(id) {
    const wrap = document.getElementById(`bl-progress-${id}`);
    if (wrap) wrap.classList.remove('visible');
  },
};
