/**
 * settings/core/liveApply.js
 * Notifies parent browser window of settings changes in real time.
 * No restart needed — changes apply instantly.
 */

const SettingsLiveApply = (() => {

  // ── Notify parent of full settings change ─────────────────────────────────
  function notify(settings) {
    if (!window.parent) return;
    window.parent.postMessage({
      __vortexAction: true,
      channel: 'settings:changed',
      payload: settings,
    }, '*');
  }

  // ── Notify parent of profile change ──────────────────────────────────────
  function notifyProfile(profile) {
    if (!window.parent) return;
    window.parent.postMessage({
      __vortexAction: true,
      channel: 'profile:changed',
      payload: profile,
    }, '*');
  }

  // ── Accent color — live update without full settings save ─────────────────
  function notifyAccent(hex) {
    if (!window.parent) return;
    window.parent.postMessage({
      __vortexAction: true,
      channel: 'accent:changed',
      payload: hex,
    }, '*');
    // Also apply to settings page itself
    _applyAccentLocally(hex);
  }

  // ── Background theme — live update ───────────────────────────────────────
  function notifyBgTheme(themeId) {
    if (!window.parent) return;
    window.parent.postMessage({
      __vortexAction: true,
      channel: 'bgTheme:changed',
      payload: themeId,
    }, '*');
  }

  // ── Apply accent color CSS vars to settings page itself ──────────────────
  function _applyAccentLocally(hex) {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const root = document.documentElement;
    root.style.setProperty('--accent',      hex);
    root.style.setProperty('--accent-dim',  `rgba(${r},${g},${b},0.15)`);
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.25)`);
    root.style.setProperty('--accent-10',   `rgba(${r},${g},${b},0.10)`);
    root.style.setProperty('--accent-20',   `rgba(${r},${g},${b},0.20)`);
  }

  // ── Apply accent locally on settings page load ────────────────────────────
  function applyAccentLocally(hex) {
    _applyAccentLocally(hex);
  }

  return {
    notify,
    notifyProfile,
    notifyAccent,
    notifyBgTheme,
    applyAccentLocally,
  };

})();
