// Floating panel — replaces vortex:// internal pages with a centered modal
const Panel = (() => {
  // Pre-compute URLs at module load time using a known relative path trick
  // In Electron, index.html is at file:///...resources/app.asar/src/renderer/index.html
  // Panel files are in the same directory
  function _getBaseUrl() {
    // window.location.href = file:///C:/path/to/app.asar/src/renderer/index.html
    // We want:              file:///C:/path/to/app.asar/src/renderer/settings.html
    return window.location.href.replace(/\/index\.html.*$/, '/');
  }

  // Build panel URLs directly from current page location — no IPC needed
  function _buildUrls() {
    const base = _getBaseUrl();
    return {
      settings:  base + 'settings.html',
      downloads: base + 'downloads.html',
      bookmarks: base + 'bookmarks.html',
      history:   base + 'history.html',
    };
  }

  let _resolvedUrls = null;

  function _getUrls() {
    if (!_resolvedUrls) _resolvedUrls = _buildUrls();
    return _resolvedUrls;
  }

  let _currentType = null;

  function open(type) {
    const urls = _getUrls();
    const url = urls[type];
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
    // Expose invoke + send bridge for iframes (used by settings/downloads/bookmarks)
    window.__vortexInvoke = (channel, ...args) =>
      window.vortexAPI.invoke(channel, ...args);
    window.__vortexSend = (channel, data) =>
      window.vortexAPI.send(channel, data);

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
