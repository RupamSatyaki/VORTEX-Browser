/**
 * features/videoDownloader/index.js
 * Entry point — inject panel into ast-wrapper (sidebar), init modules.
 */

const VideoDownloader = (() => {

  async function init() {
    _injectPanel();

    // Init modules
    VDLPanelController.init();
    VDLInfoHandler.init();
    VDLDownloadHandler.init();

    // Check yt-dlp status
    await _checkYtdlp();

    // yt-dlp install progress listener
    vortexAPI.on('vdl:ytdlpProgress', ({ percent }) => {
      const fill = document.getElementById('vdl-install-progress-fill');
      if (fill) fill.style.width = percent + '%';
    });

    // Install button
    document.addEventListener('click', async (e) => {
      if (!e.target.closest('#vdl-install-btn')) return;
      const btn      = document.getElementById('vdl-install-btn');
      const progress = document.getElementById('vdl-install-progress');
      const err      = document.getElementById('vdl-error');

      if (btn) { btn.disabled = true; btn.innerHTML = '<div class="vdl-spinner"></div> Installing...'; }
      if (progress) progress.style.display = 'block';
      if (err) err.style.display = 'none';

      const result = await vortexAPI.invoke('vdl:downloadYtdlp');
      if (result.success) {
        await _checkYtdlp();
      } else {
        if (btn) { btn.disabled = false; btn.textContent = 'Retry Install'; }
        if (err) { err.textContent = result.error; err.style.display = 'block'; }
      }
    });
  }

  function _injectPanel() {
    if (document.getElementById('vdl-panel')) return;

    // Inject into ast-wrapper (same as assistant) so webview shrinks
    const wrapper = document.getElementById('ast-wrapper');
    if (wrapper) {
      wrapper.insertAdjacentHTML('beforeend', VDLPanel.render());
    } else {
      // Fallback: inject into body
      document.body.insertAdjacentHTML('beforeend', VDLPanel.render());
    }
  }

  async function _checkYtdlp() {
    try {
      const status     = await vortexAPI.invoke('vdl:getYtdlpStatus');
      const installSec = document.getElementById('vdl-install-section');
      const urlSec     = document.getElementById('vdl-url-section');
      const infoSec    = document.getElementById('vdl-info-section');

      if (!status.installed) {
        if (installSec) installSec.style.display = 'flex';
        if (urlSec)     urlSec.style.display     = 'none';
        if (infoSec)    infoSec.style.display    = 'none';
      } else {
        if (installSec) installSec.style.display = 'none';
        if (urlSec)     urlSec.style.display     = 'block';
      }
    } catch {}
  }

  function toggle() { VDLPanelController.toggle(); }
  function open()   { VDLPanelController.open();   }
  function close()  { VDLPanelController.close();  }

  return { init, toggle, open, close };

})();
