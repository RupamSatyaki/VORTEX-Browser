/**
 * settings/sections/sync/scripts/syncHandler.js
 * Event binding for Sync & Backup section.
 */

const SyncHandler = (() => {

  function bind(container, settings) {
    // ── Export ──────────────────────────────────────────────────────────────

    // Export Bookmarks
    SettingsButton.bind(container, 'btn-export-bookmarks', async () => {
      try {
        const data = await SettingsIPC.invoke('storage:read', 'bookmarks') || [];
        _downloadJSON(data, `vortex-bookmarks-${Date.now()}.json`);
        _status(container, 'Bookmarks exported successfully.');
      } catch { _status(container, 'Export failed.', true); }
    });

    // Export History
    SettingsButton.bind(container, 'btn-export-history', async () => {
      try {
        const data = await SettingsIPC.invoke('storage:read', 'tab_history') || [];
        _downloadJSON(data, `vortex-history-${Date.now()}.json`);
        _status(container, 'History exported successfully.');
      } catch { _status(container, 'Export failed.', true); }
    });

    // Export Settings
    SettingsButton.bind(container, 'btn-export-settings', async () => {
      try {
        const data = await SettingsIPC.invoke('storage:read', 'settings') || settings;
        _downloadJSON(data, `vortex-settings-${Date.now()}.json`);
        _status(container, 'Settings exported successfully.');
      } catch { _status(container, 'Export failed.', true); }
    });

    // ── Import ──────────────────────────────────────────────────────────────

    // Import Bookmarks — button triggers hidden file input
    SettingsButton.bind(container, 'btn-import-bookmarks', () => {
      container.querySelector('#file-import-bookmarks')?.click();
    });

    container.querySelector('#file-import-bookmarks')
      ?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error('Invalid format');
          await SettingsIPC.invoke('storage:write', 'bookmarks', data);
          _status(container, `Imported ${data.length} bookmarks.`);
        } catch { _status(container, 'Import failed — invalid JSON.', true); }
        e.target.value = '';
      });

    // Import Settings — button triggers hidden file input
    SettingsButton.bind(container, 'btn-import-settings', () => {
      container.querySelector('#file-import-settings')?.click();
    });

    container.querySelector('#file-import-settings')
      ?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (typeof data !== 'object' || Array.isArray(data))
            throw new Error('Invalid format');
          const merged = Object.assign({}, SettingsStorage.getDefaults(), data);
          await SettingsStorage.save(merged);
          SettingsLiveApply.notify(merged);
          _status(container, 'Settings restored successfully.');
        } catch { _status(container, 'Import failed — invalid file.', true); }
        e.target.value = '';
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function _downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function _status(container, msg, isError = false) {
    const el = container.querySelector('#sync-status');
    if (!el) return;
    el.textContent   = msg;
    el.style.color   = isError ? '#ef4444' : 'var(--accent,#00c8b4)';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
  }

  return { bind };

})();
