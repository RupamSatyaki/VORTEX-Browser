/**
 * settings/sections/downloads/scripts/downloadsHandler.js
 * Event binding for Downloads section.
 */

const DownloadsHandler = (() => {

  function bind(container, settings) {
    // Change folder button — IPC to main process
    SettingsButton.bind(container, 'btn-dl-path', () => {
      SettingsIPC.send('settings:pickDownloadFolder');
    });

    // Listen for folder picked response from parent
    window.addEventListener('message', async (ev) => {
      if (!ev.data || ev.data.channel !== 'settings:downloadFolderPicked') return;
      const folder = ev.data.payload;
      if (!folder) return;
      settings.downloadFolder = folder;
      await SettingsStorage.save(settings);
      // Update displayed path
      const desc = container.querySelector('#dl-folder-desc');
      if (desc) desc.textContent = folder;
    });

    // Ask where to save toggle
    SettingsToggle.bind(container, 'set-askdl', async (checked) => {
      settings.askdl = checked;
      await SettingsStorage.save(settings);
    });

    // Open after download toggle
    SettingsToggle.bind(container, 'set-opendl', async (checked) => {
      settings.opendl = checked;
      await SettingsStorage.save(settings);
    });
  }

  return { bind };

})();
