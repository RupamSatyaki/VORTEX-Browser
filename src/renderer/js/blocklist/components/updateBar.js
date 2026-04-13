/**
 * blocklist/components/updateBar.js
 */

const UpdateBar = {
  render(container, lastChecked, onUpdateAll) {
    const ago = _timeAgo(lastChecked);
    container.innerHTML = `
      <div class="bl-update-bar">
        <div class="bl-update-bar-info">
          <div class="bl-update-bar-title">Ad & Tracker Blocking</div>
          <div class="bl-update-bar-sub" id="bl-update-sub">Last updated: ${ago}</div>
        </div>
        <button class="bl-update-all-btn" id="bl-update-all">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>
          Update All
        </button>
      </div>`;

    container.querySelector('#bl-update-all').addEventListener('click', onUpdateAll);
  },

  setStatus(text) {
    const el = document.getElementById('bl-update-sub');
    if (el) el.textContent = text;
  },

  setUpdating(updating) {
    const btn = document.querySelector('#bl-update-all');
    if (!btn) return;
    btn.disabled = updating;
    btn.innerHTML = updating
      ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.8s linear infinite"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg> Updating...`
      : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg> Update All`;
  },
};

function _timeAgo(ts) {
  if (!ts) return 'Never';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  return Math.floor(diff / 86400) + ' days ago';
}
