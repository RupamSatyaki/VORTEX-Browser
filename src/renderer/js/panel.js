// Floating panel — replaces vortex:// internal pages with a centered modal
const Panel = (() => {
  let _resolvedUrls = {};

  async function _resolve() {
    if (_resolvedUrls.settings) return;
    try {
      const s = await window.vortexAPI.invoke('app:settingsPage');
      if (s) _resolvedUrls.settings = 'file:///' + s.replace(/\\/g, '/');
    } catch (_) {}
    try {
      const d = await window.vortexAPI.invoke('app:downloadsPage');
      if (d) _resolvedUrls.downloads = 'file:///' + d.replace(/\\/g, '/');
    } catch (_) {}
    try {
      const b = await window.vortexAPI.invoke('app:bookmarksPage');
      if (b) _resolvedUrls.bookmarks = 'file:///' + b.replace(/\\/g, '/');
    } catch (_) {}
    try {
      const h = await window.vortexAPI.invoke('app:historyPage');
      if (h) _resolvedUrls.history = 'file:///' + h.replace(/\\/g, '/');
    } catch (_) {}
  }

  let _currentType = null;

  function open(type) {
    _resolve().then(() => {
      const url = _resolvedUrls[type];
      if (!url) return;
      const frame    = document.getElementById('panel-frame');
      const title    = document.getElementById('panel-title');
      const panel    = document.getElementById('floating-panel');
      const backdrop = document.getElementById('panel-backdrop');

      const titles = { settings: 'Settings', downloads: 'Downloads', bookmarks: 'Bookmarks', history: 'History' };
      title.textContent = titles[type] || type;
      _currentType = type;

      _setFrameOnload(frame, type);

      frame.src = url;
      backdrop.classList.add('visible');
      panel.classList.add('visible');
      document.body.classList.add('panel-open');
    });
  }

  function _setFrameOnload(frame, type) {
    if (type === 'downloads') {
      frame.onload = () => {
        document.dispatchEvent(new CustomEvent('vortex-downloads-ready', { detail: frame }));
        frame.onload = null;
      };
    } else if (type === 'bookmarks') {
      frame.onload = () => {
        document.dispatchEvent(new CustomEvent('vortex-bookmarks-ready', { detail: frame }));
        frame.onload = null;
      };
    } else if (type === 'history') {
      frame.onload = () => {
        document.dispatchEvent(new CustomEvent('vortex-history-ready', { detail: frame }));
        frame.onload = null;
      };
    } else {
      frame.onload = null;
    }
  }

  function close() {
    const panel    = document.getElementById('floating-panel');
    const backdrop = document.getElementById('panel-backdrop');
    const frame    = document.getElementById('panel-frame');

    panel.classList.remove('visible');
    backdrop.classList.remove('visible');
    document.body.classList.remove('panel-open');
    setTimeout(() => { frame.src = 'about:blank'; }, 300);
  }

  function init() {
    // Expose invoke bridge for iframes (used by downloads.html for file:exists)
    window.__vortexInvoke = (channel, ...args) =>
      window.vortexAPI.invoke(channel, ...args);

    document.getElementById('panel-close').addEventListener('click', close);
    document.getElementById('panel-backdrop').addEventListener('click', close);

    document.getElementById('panel-refresh').addEventListener('click', () => {
      const frame = document.getElementById('panel-frame');
      const btn   = document.getElementById('panel-refresh');
      btn.classList.add('spinning');
      if (_currentType) _setFrameOnload(frame, _currentType);
      frame.contentWindow?.location.reload();
      setTimeout(() => btn.classList.remove('spinning'), 600);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  return { open, close, init };
})();
