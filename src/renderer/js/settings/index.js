/**
 * settings/index.js — Master Settings Controller
 *
 * Responsibilities:
 *   1. Load settings from storage on DOMContentLoaded
 *   2. Render ALL sections at startup (all in DOM, no lazy render for nav)
 *   3. Nav switching — show/hide only (no re-render)
 *   4. postMessage handler — parent can navigate to any section
 *   5. sessionStorage persist — restore last active section on reload
 *   6. URL hash navigation — vortex://settings#proxy etc.
 *
 * Load order in settings.html (LAST script):
 *   core/ → components/ → sections ui/ → sections scripts/ → sections index/ → THIS FILE
 */

const SettingsApp = (() => {

  // ── Section registry ───────────────────────────────────────────────────────
  // Maps data-section → { module, rendered }
  const SECTIONS = {
    // General
    appearance:   { module: () => AppearanceSection   },
    startup:      { module: () => StartupSection      },
    search:       { module: () => SearchSection       },
    languages:    { module: () => LanguagesSection    },
    downloads:    { module: () => DownloadsSection    },
    notifications:{ module: () => NotificationsSection},
    // Privacy & Performance
    privacy:      { module: () => PrivacySection      },
    cookies:      { module: () => CookiesSection      },
    permissions:  { module: () => PermissionsSection  },
    passwords:    { module: () => PasswordsSection    },
    blocklists:   { module: () => BlocklistsSection   },
    proxy:        { module: () => ProxySection        },
    performance:  { module: () => PerformanceSection  },
    youtube:      { module: () => YoutubeSection      },
    // Tools
    videodownloader: { module: () => VideoDownloaderSection },
    // Account
    profile:      { module: () => ProfileSection      },
    sync:         { module: () => SyncSection         },
    // System
    shortcuts:    { module: () => ShortcutsSection    },
    updates:      { module: () => UpdatesSection      },
    about:        { module: () => AboutSection        },
    // Info
    changelog:    { module: () => ChangelogSection    },
    faq:          { module: () => FaqSection          },
  };

  let _currentSection = 'appearance';
  let _settings       = null;

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  async function init() {
    // 1. Load settings
    _settings = await SettingsStorage.load();

    // 2. Apply accent color to settings page itself
    SettingsLiveApply.applyAccentLocally(_settings.accentColor || '#00c8b4');

    // 3. Render ALL sections into their containers
    await _renderAllSections();

    // 4. Bind nav items
    _bindNav();

    // 5. Restore last section (sessionStorage → hash → default)
    const initial = _resolveInitialSection();
    _navigateTo(initial, false); // false = no sessionStorage write on init

    // 6. Listen for postMessage from parent (e.g. proxy indicator click)
    _bindPostMessage();

    // 7. Hash navigation
    _bindHashNav();
  }

  // ── Render all sections ────────────────────────────────────────────────────
  async function _renderAllSections() {
    const promises = Object.entries(SECTIONS).map(async ([id, entry]) => {
      const container = document.getElementById('sec-' + id);
      if (!container) return;

      const mod = entry.module();
      if (!mod || typeof mod.render !== 'function') return;

      try {
        // render() may be async (e.g. ProfileSection loads profile.json)
        await mod.render(container, _settings);
        entry.rendered = true;
      } catch (e) {
        console.warn(`[Settings] Failed to render section "${id}":`, e);
        container.innerHTML = `
          <div style="padding:32px;text-align:center;color:#ef4444;font-size:12px;">
            Failed to load section: ${e.message}
          </div>`;
      }
    });

    await Promise.all(promises);
  }

  // ── Nav switching ──────────────────────────────────────────────────────────
  function _bindNav() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
      item.addEventListener('click', () => {
        _navigateTo(item.dataset.section);
      });
    });
  }

  function _navigateTo(sectionId, persist = true) {
    const navItem  = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    const secEl    = document.getElementById('sec-' + sectionId);

    if (!navItem || !secEl) return;
    _currentSection = sectionId;
    if (persist) sessionStorage.setItem('settings-section', sectionId);

    navItem.classList.add('active');
    document.querySelectorAll('.nav-item[data-section]').forEach(n => {
      if (n !== navItem) n.classList.remove('active');
    });

    // Show/hide sections — CSS class toggle only, no re-render
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    secEl.classList.add('active');

    // Refresh dynamic sections on every navigate
    if (sectionId === 'videodownloader' && typeof VideoDownloaderSection !== 'undefined') {
      try { VideoDownloaderSection.refresh(); } catch {}
    }    if (!navItem || !secEl) return;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    navItem.classList.add('active');

    // Show/hide sections — CSS class toggle only, no re-render
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    secEl.classList.add('active');

    _currentSection = sectionId;

    // Persist to sessionStorage
    if (persist) {
      try { sessionStorage.setItem('vx_settings_section', sectionId); } catch {}
    }
  }

  // ── Resolve initial section ────────────────────────────────────────────────
  function _resolveInitialSection() {
    // 1. URL hash (#proxy, #updates etc.)
    const hash = location.hash.replace('#', '').trim();
    if (hash && SECTIONS[hash]) return hash;

    // 2. sessionStorage
    try {
      const saved = sessionStorage.getItem('vx_settings_section');
      if (saved && SECTIONS[saved]) return saved;
    } catch {}

    // 3. Default
    return 'appearance';
  }

  // ── postMessage handler ────────────────────────────────────────────────────
  function _bindPostMessage() {
    window.addEventListener('message', (e) => {
      if (!e.data) return;

      // Navigate to section — from parent window (e.g. proxy indicator, update badge)
      if (e.data.__vortexIPC && e.data.channel === 'settings:navigate') {
        const target = e.data.data;
        if (target && SECTIONS[target]) _navigateTo(target);
        return;
      }

      // Also handle direct __vortexAction format
      if (e.data.__vortexAction && e.data.channel === 'settings:navigate') {
        const target = e.data.payload;
        if (target && SECTIONS[target]) _navigateTo(target);
      }
    });
  }

  // ── Hash navigation ────────────────────────────────────────────────────────
  function _bindHashNav() {
    window.addEventListener('hashchange', () => {
      const hash = location.hash.replace('#', '').trim();
      if (hash && SECTIONS[hash]) _navigateTo(hash);
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  function navigateTo(sectionId) {
    _navigateTo(sectionId);
  }

  function getSettings() {
    return _settings;
  }

  function getCurrentSection() {
    return _currentSection;
  }

  return { init, navigateTo, getSettings, getCurrentSection };

})();

// ── Auto-init on DOMContentLoaded ─────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SettingsApp.init());
} else {
  SettingsApp.init();
}
