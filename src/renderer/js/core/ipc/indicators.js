/**
 * core/ipc/indicators.js
 * _updateBookmarkIcon, proxy/tor/update badge indicators.
 */

const IPCIndicators = (() => {

  // ── Bookmark icon ──────────────────────────────────────────────────────────
  async function updateBookmarkIcon() {
    const bar = document.getElementById('url-bar');
    if (!bar) return;
    const url   = bar.dataset.fullUrl || bar.value;
    const saved = url && !url.startsWith('vortex://') ? await BookmarkStore.has(url) : false;
    window._bookmarkState = saved;
    const btn = document.getElementById('btn-bookmark');
    if (btn) {
      btn.classList.toggle('bookmarked', saved);
      btn.title = saved ? 'Remove bookmark' : 'Bookmark this page';
    }
  }

  // ── Forward to panel iframe ────────────────────────────────────────────────
  function forwardToFrame(channel, data) {
    const frame = document.getElementById('panel-frame');
    if (!frame?.contentWindow) return;
    try { frame.contentWindow.postMessage({ __vortexIPC: true, channel, data }, '*'); } catch (_) {}
  }

  // ── Install progress (direct DOM update) ──────────────────────────────────
  function applyInstallProgress(data) {
    const bar  = document.getElementById('upd-install-bar');
    const pct  = document.getElementById('upd-install-pct');
    const info = document.getElementById('upd-install-info');
    if (bar)  bar.style.width = (data.pct || 0) + '%';
    if (pct)  pct.textContent = (data.pct || 0) + '%';
    if (info) {
      info.textContent = data.done
        ? 'Launching installer...'
        : data.totalMB && data.totalMB !== '?'
          ? `${data.receivedMB} MB / ${data.totalMB} MB`
          : `${data.receivedMB || 0} MB downloaded...`;
    }
  }

  return { updateBookmarkIcon, forwardToFrame, applyInstallProgress };

})();
