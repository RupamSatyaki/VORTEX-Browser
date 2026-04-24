/**
 * features/videoDownloader/scripts/downloadHandler.js
 * Start/cancel/queue downloads + IPC event listeners.
 */

const VDLDownloadHandler = (() => {

  function init() {
    // Download button click
    document.addEventListener('click', async (e) => {
      if (!e.target.closest('#vdl-download-btn')) return;

      const info = VDLInfoHandler.getInfo();
      if (!info) return;

      const quality = VDLFormatSelector.getSelected(info.qualities);
      if (!quality) return;

      const btn = document.getElementById('vdl-download-btn');
      if (btn) btn.disabled = true;

      const result = await vortexAPI.invoke('vdl:startDownload', {
        url:      info.url,
        formatId: quality.formatId,
        ext:      quality.ext,
        title:    info.title,
      });

      if (btn) btn.disabled = false;

      if (!result.success) {
        const err = document.getElementById('vdl-error');
        if (err) { err.textContent = result.error; err.style.display = 'block'; }
        return;
      }

      _addCard(result.id, info.title);
    });

    // Cancel / Open file buttons (delegated)
    document.addEventListener('click', (e) => {
      const cancelBtn = e.target.closest('.vdl-dl-btn.cancel');
      if (cancelBtn) {
        const id = parseInt(cancelBtn.dataset.id);
        vortexAPI.send('vdl:cancelDownload', id);
        VDLProgressCard.remove(id);
        _checkEmpty();
      }

      const openBtn = e.target.closest('.vdl-dl-btn.open');
      if (openBtn) {
        vortexAPI.send('vdl:openFile', openBtn.dataset.path);
      }
    });

    // IPC: progress updates
    vortexAPI.on('vdl:progress', ({ id, percent, speed, eta }) => {
      VDLProgressCard.update(id, { percent, speed, eta, status: 'downloading' });
    });

    vortexAPI.on('vdl:done', ({ id, filePath }) => {
      VDLProgressCard.update(id, { percent: 100, status: 'done', filePath });
    });

    vortexAPI.on('vdl:error', ({ id, error }) => {
      VDLProgressCard.update(id, { status: 'error', error });
    });
  }

  function _addCard(id, title) {
    const list  = document.getElementById('vdl-downloads-list');
    const empty = document.getElementById('vdl-downloads-empty');
    if (!list) return;
    if (empty) empty.style.display = 'none';
    const card = VDLProgressCard.create(id, title);
    list.appendChild(card);
  }

  function _checkEmpty() {
    VDLPanelController._checkEmpty();
  }

  return { init };

})();
