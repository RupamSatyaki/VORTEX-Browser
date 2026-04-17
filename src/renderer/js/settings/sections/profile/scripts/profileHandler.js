/**
 * settings/sections/profile/scripts/profileHandler.js
 * Event binding for Profile section — avatar, name, status, bio.
 */

const ProfileHandler = (() => {

  function bind(container, profile) {
    // Avatar wrap click — toggle picker card
    const avatarWrap   = container.querySelector('#avatar-wrap');
    const pickerCard   = container.querySelector('#avatar-picker-card');
    if (avatarWrap && pickerCard) {
      avatarWrap.addEventListener('click', () => {
        const isOpen = pickerCard.style.display !== 'none';
        pickerCard.style.display = isOpen ? 'none' : '';
      });
    }

    // Avatar icon grid clicks
    container.querySelector('#avatar-grid')
      ?.addEventListener('click', async (e) => {
        const opt = e.target.closest('.avatar-opt');
        if (!opt) return;
        profile.avatar     = opt.dataset.emoji;
        profile.avatarType = 'emoji';
        profile.avatarData = null;
        _refreshAvatar(container, profile);
        _refreshAvatarGrid(container, profile);
        await SettingsStorage.saveProfile(profile);
        SettingsLiveApply.notifyProfile(profile);
      });

    // Upload image button
    container.querySelector('#btn-avatar-upload')
      ?.addEventListener('click', () => {
        container.querySelector('#avatar-file')?.click();
      });

    container.querySelector('#avatar-file')
      ?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          profile.avatarType = 'image';
          profile.avatarData = ev.target.result;
          _refreshAvatar(container, profile);
          await SettingsStorage.saveProfile(profile);
          SettingsLiveApply.notifyProfile(profile);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });

    // Reset avatar button
    container.querySelector('#btn-avatar-reset')
      ?.addEventListener('click', async () => {
        profile.avatarType = 'emoji';
        profile.avatarData = null;
        profile.avatar     = profile.name ? profile.name[0].toUpperCase() : 'V';
        _refreshAvatar(container, profile);
        _refreshAvatarGrid(container, profile);
        await SettingsStorage.saveProfile(profile);
        SettingsLiveApply.notifyProfile(profile);
      });

    // Name input — save on blur
    SettingsInput.bind(container, 'prof-name', async (value) => {
      profile.name = value.trim() || 'Vortex User';
      // Update avatar letter if using text initial
      if (profile.avatarType !== 'image' &&
          !ProfileUI.AVATAR_ICONS.find(a => a.id === profile.avatar)) {
        profile.avatar = profile.name[0].toUpperCase();
        _refreshAvatar(container, profile);
      }
      await SettingsStorage.saveProfile(profile);
      SettingsLiveApply.notifyProfile(profile);
    }, 'blur');

    // Status grid clicks
    container.querySelector('#status-grid')
      ?.addEventListener('click', async (e) => {
        const opt = e.target.closest('.status-opt');
        if (!opt) return;
        profile.status = opt.dataset.status;
        _refreshStatusGrid(container, profile);
        await SettingsStorage.saveProfile(profile);
        SettingsLiveApply.notifyProfile(profile);
      });

    // Bio input — save on blur
    SettingsInput.bind(container, 'prof-bio', async (value) => {
      profile.bio = value.trim();
      await SettingsStorage.saveProfile(profile);
      SettingsLiveApply.notifyProfile(profile);
    }, 'blur');
  }

  // ── DOM refresh helpers ────────────────────────────────────────────────────

  function _refreshAvatar(container, profile) {
    const el = container.querySelector('#prof-avatar-display');
    if (el) el.innerHTML = ProfileUI._avatarHTML(profile);
  }

  function _refreshAvatarGrid(container, profile) {
    const grid = container.querySelector('#avatar-grid');
    if (grid) grid.innerHTML = ProfileUI._avatarGridHTML(profile);
  }

  function _refreshStatusGrid(container, profile) {
    const grid = container.querySelector('#status-grid');
    if (grid) grid.innerHTML = ProfileUI._statusGridHTML(profile);
  }

  return { bind };

})();
