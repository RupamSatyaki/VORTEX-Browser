/**
 * settings/sections/about/scripts/aboutHandler.js
 * Event binding for About Vortex section.
 */

const AboutHandler = (() => {

  async function bind(container, settings) {
    // Load version on render
    await _loadVersion(container);

    // GitHub button
    SettingsButton.bind(container, 'btn-github', () => {
      SettingsIPC.send('shell:openExternal',
        'https://github.com/RupamSatyaki/VORTEX-Browser');
    });

    // Reset all settings
    SettingsButton.bind(container, 'btn-reset', async () => {
      if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
      const defaults = SettingsStorage.getDefaults();
      await SettingsStorage.save(defaults);
      SettingsLiveApply.notify(defaults);
      // Reload settings page to reflect reset
      location.reload();
    });

    // Set as default browser
    SettingsButton.bind(container, 'btn-set-default', () => {
      SettingsIPC.send('browser:setDefault');
      // Re-check after delay
      setTimeout(() => _checkDefaultBrowser(container), 2000);
    });

    // Check default browser status
    await _checkDefaultBrowser(container);
  }

  async function _loadVersion(container) {
    try {
      const ver = await SettingsIPC.invoke('app:version');
      const verEl = container.querySelector('#about-ver');
      if (verEl && ver) verEl.textContent = 'Version ' + ver;

      // Try to get local SHA (installed commit)
      const sha = await SettingsIPC.invoke('updater:localSha');
      if (sha) {
        const commitEl  = container.querySelector('#about-commit');
        const shaEl     = container.querySelector('#about-commit-sha');
        const sourceEl  = container.querySelector('#about-commit-source');
        if (commitEl) commitEl.style.display = 'block';
        if (shaEl)    shaEl.textContent = sha.slice(0, 7);
        if (sourceEl) sourceEl.textContent = 'installed commit';
      }
    } catch {}
  }

  async function _checkDefaultBrowser(container) {
    const statusEl = container.querySelector('#default-browser-status');
    const setBtn   = container.querySelector('#btn-set-default');
    const badge    = container.querySelector('#default-browser-badge');
    if (!statusEl) return;

    try {
      const isDefault = await SettingsIPC.invoke('browser:isDefault');
      if (isDefault) {
        statusEl.textContent  = 'Vortex is your default browser';
        statusEl.style.color  = '#22c55e';
        if (setBtn) setBtn.style.display  = 'none';
        if (badge)  badge.style.display   = 'flex';
      } else {
        statusEl.textContent  = 'Vortex is not the default browser';
        statusEl.style.color  = '#4a8080';
        if (setBtn) setBtn.style.display  = '';
        if (badge)  badge.style.display   = 'none';
      }
    } catch {
      if (statusEl) statusEl.textContent = 'Could not check default browser status';
    }
  }

  return { bind };

})();
