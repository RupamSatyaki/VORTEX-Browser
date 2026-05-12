/**
 * features/videoDownloader/scripts/infoHandler.js
 * Fetch video info from URL and display in panel.
 */

const VDLInfoHandler = (() => {

  let _currentInfo = null;

  function init() {
    // Fetch button click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#vdl-fetch-btn')) return;
      const url = document.getElementById('vdl-url-input')?.value.trim();
      if (url) fetch(url);
    });

    // Enter key in URL input
    document.addEventListener('keydown', (e) => {
      if (e.target.id !== 'vdl-url-input') return;
      if (e.key === 'Enter') {
        const url = e.target.value.trim();
        if (url) fetch(url);
      }
    });

    // Clear info when URL input is cleared
    document.addEventListener('input', (e) => {
      if (e.target.id !== 'vdl-url-input') return;
      if (!e.target.value.trim()) {
        _hideInfo();
        _currentInfo = null;
      }
    });

    // Quality change — check ffmpeg warning
    document.addEventListener('change', (e) => {
      if (e.target.id !== 'vdl-quality-select') return;
      _checkFfmpegWarning(parseInt(e.target.value));
    });

    // ffmpeg settings link
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#vdl-ffmpeg-settings-btn')) return;
      // Open settings panel → videodownloader section
      window.parent?.postMessage({
        __vortexAction: true,
        channel: 'settings:navigate',
        payload: 'videodownloader',
      }, '*');
      // Also open settings panel
      if (typeof Panel !== 'undefined') Panel.open('settings');
    });
  }

  async function fetch(url) {
    const btn     = document.getElementById('vdl-fetch-btn');
    const infoSec = document.getElementById('vdl-info-section');
    const badge   = document.getElementById('vdl-auto-badge');
    _currentInfo  = null;
    _hideError();
    _hideInfo();

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="vdl-spinner"></div>';
    }

    const result = await vortexAPI.invoke('vdl:fetchInfo', url);

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Fetch`;
    }

    if (!result.success) {
      _showError(result.error);
      return;
    }

    _currentInfo = result.info;
    _render(result.info);
  }

  function _render(info) {
    const infoSec = document.getElementById('vdl-info-section');
    const thumb   = document.getElementById('vdl-thumbnail');
    const title   = document.getElementById('vdl-video-title');
    const meta    = document.getElementById('vdl-video-meta');
    const site    = document.getElementById('vdl-site-badge');
    const dlBtn   = document.getElementById('vdl-download-btn');

    if (thumb) {
      if (info.thumbnail) {
        thumb.src = info.thumbnail;
        thumb.style.display = 'block';
        thumb.onerror = () => { thumb.style.display = 'none'; };
      } else {
        thumb.style.display = 'none';
      }
    }

    if (title) title.textContent = info.title || 'Unknown';
    if (meta)  meta.textContent  = [
      info.uploader,
      info.duration ? _fmtDuration(info.duration) : null,
    ].filter(Boolean).join(' · ');

    if (site) {
      site.textContent = info.site || '';
      site.style.display = info.site ? 'inline-block' : 'none';
    }

    if (dlBtn) dlBtn.disabled = false;

    VDLFormatSelector.populate(info.qualities);

    // Check ffmpeg status for warning
    _checkFfmpegWarning();

    if (infoSec) infoSec.style.display = 'block';
  }

  // Show ffmpeg warning if high quality (needs merge) but ffmpeg missing
  async function _checkFfmpegWarning(selectedIdx) {
    const warn   = document.getElementById('vdl-ffmpeg-warn');
    const select = document.getElementById('vdl-quality-select');
    if (!warn || !_currentInfo) return;

    const idx = selectedIdx !== undefined ? selectedIdx : parseInt(select?.value || '0');
    const q   = _currentInfo.qualities[idx];
    if (!q) { warn.style.display = 'none'; return; }

    // Needs ffmpeg if formatId contains '+' (video+audio merge)
    const needsMerge = q.formatId && q.formatId.includes('+');
    if (!needsMerge) { warn.style.display = 'none'; return; }

    try {
      const status = await vortexAPI.invoke('vdl:getYtdlpStatus');
      warn.style.display = status.ffmpegInstalled ? 'none' : 'block';
    } catch {
      warn.style.display = 'none';
    }
  }

  function _hideInfo() {
    const infoSec = document.getElementById('vdl-info-section');
    const dlBtn   = document.getElementById('vdl-download-btn');
    if (infoSec) infoSec.style.display = 'none';
    if (dlBtn)   dlBtn.disabled = true;
  }

  function getInfo() { return _currentInfo; }

  function _fmtDuration(s) {
    if (!s) return '';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${m}:${String(sec).padStart(2,'0')}`;
  }

  function _showError(msg) {
    const el = document.getElementById('vdl-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function _hideError() {
    const el = document.getElementById('vdl-error');
    if (el) el.style.display = 'none';
  }

  return { init, fetch, getInfo, checkFfmpegWarning: _checkFfmpegWarning };

})();
