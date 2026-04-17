/**
 * settings/core/storage.js
 * Settings defaults, read, write, get, set helpers
 */

const SettingsStorage = (() => {

  // ── Defaults ────────────────────────────────────────────────────────────────
  const DEFAULTS = {
    theme:            'dark',
    fontsize:         'medium',
    tabpreview:       true,
    bookmarksbar:     false,
    whatsappBtn:      true,
    devhubBtn:        true,
    accentColor:      '#00c8b4',
    bgTheme:          'teal',
    downloadFolder:   '',
    startup:          'session',
    homepage:         'https://www.google.com',
    engine:           'google',
    suggestions:      true,
    trackers:         true,
    https:            false,
    dnt:              false,
    gpu:              true,
    prefetch:         true,
    cache:            '512',
    askdl:            false,
    opendl:           false,
    tabsleep:         true,
    tabsleepMinutes:  10,
    pip:              true,
    pipSites:         [],
    notifications:    true,
    notifSound:       true,
    notifSites:       {},
    lang:             'en',
    spellcheck:       true,
    spellcheckLang:   'en-US',
    ytAdblock:        true,
    ytAdSpeed:        16,
    ytRemoveCards:    true,
    ytRemoveHomepageAds: true,
  };

  const PROFILE_DEFAULTS = {
    name:       'Vortex User',
    avatar:     'V',
    avatarType: 'emoji',
    status:     'online',
    bio:        '',
  };

  // Current in-memory settings object
  let _settings = { ...DEFAULTS };
  let _profile   = { ...PROFILE_DEFAULTS };

  // ── Read ─────────────────────────────────────────────────────────────────────
  async function load() {
    try {
      const stored = await SettingsIPC.invoke('storage:read', 'settings');
      _settings = Object.assign({}, DEFAULTS, stored || {});
    } catch {
      try {
        _settings = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('vortex_settings') || '{}'));
      } catch {
        _settings = { ...DEFAULTS };
      }
    }
    return _settings;
  }

  async function loadProfile() {
    try {
      const stored = await SettingsIPC.invoke('storage:read', 'profile');
      _profile = Object.assign({}, PROFILE_DEFAULTS, stored || {});
    } catch {
      _profile = { ...PROFILE_DEFAULTS };
    }
    return _profile;
  }

  // ── Write ────────────────────────────────────────────────────────────────────
  async function save(s) {
    _settings = s;
    try {
      await SettingsIPC.invoke('storage:write', 'settings', s);
    } catch {
      localStorage.setItem('vortex_settings', JSON.stringify(s));
    }
    // Notify parent browser window
    SettingsLiveApply.notify(s);
  }

  async function saveProfile(p) {
    _profile = p;
    try {
      await SettingsIPC.invoke('storage:write', 'profile', p);
    } catch {}
    SettingsLiveApply.notifyProfile(p);
  }

  // ── Get / Set individual keys ─────────────────────────────────────────────
  function get(key) {
    return _settings[key] !== undefined ? _settings[key] : DEFAULTS[key];
  }

  async function set(key, value) {
    _settings[key] = value;
    await save(_settings);
  }

  function getProfile(key) {
    return _profile[key] !== undefined ? _profile[key] : PROFILE_DEFAULTS[key];
  }

  async function setProfile(key, value) {
    _profile[key] = value;
    await saveProfile(_profile);
  }

  // ── Getters for current state ─────────────────────────────────────────────
  function getAll()        { return { ..._settings }; }
  function getProfileAll() { return { ..._profile };  }
  function getDefaults()   { return { ...DEFAULTS };  }

  return {
    DEFAULTS,
    PROFILE_DEFAULTS,
    load,
    loadProfile,
    save,
    saveProfile,
    get,
    set,
    getProfile,
    setProfile,
    getAll,
    getProfileAll,
    getDefaults,
  };

})();
