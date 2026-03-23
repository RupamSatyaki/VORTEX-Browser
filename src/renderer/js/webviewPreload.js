// Preload for guest webviews — exposes minimal IPC to page context
const { ipcRenderer } = require('electron');

window.__vortexBridge = {
  sendToHost: (channel, data) => ipcRenderer.sendToHost(channel, data),
};

// Forward Ctrl/Cmd shortcuts to host window so browser shortcuts work
// even when a webview has focus
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F11' && e.key !== 'F5') return;

  const shortcuts = new Set([
    't', 'w', 'n', 'h', 'j', 'b', 'f', 'p', 's', ',', '0',
    'Tab', 'F12', 'F11', 'F5',
  ]);

  const key = e.key;
  if (!shortcuts.has(key) && !(e.shiftKey && (key === 'R' || key === 'Tab'))) return;
  if (['c','v','x','a','z','y'].includes(key.toLowerCase()) && !e.shiftKey) return;

  ipcRenderer.sendToHost('webview:keydown', {
    key: e.key,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
  });
}, true);

// ── YouTube PiP patch — override disablePictureInPicture before page sets it ─
(function patchYouTubePiP() {
  const _origDescriptor = Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'disablePictureInPicture');
  Object.defineProperty(HTMLVideoElement.prototype, 'disablePictureInPicture', {
    get: function() { return false; },
    set: function() { /* ignore YouTube trying to disable PiP */ },
    configurable: true,
  });

  // Also patch setAttribute so YouTube can't set it via setAttribute
  const _origSetAttr = HTMLVideoElement.prototype.setAttribute;
  HTMLVideoElement.prototype.setAttribute = function(name, value) {
    if (name === 'disablepictureinpicture') return; // block
    return _origSetAttr.call(this, name, value);
  };
})();
(function initPiP() {
  let _pipBtn = null;
  let _currentVideo = null;
  let _hideTimer = null;

  const BTN_HTML = `
    <button id="__vortex_pip_btn" title="Picture in Picture" style="
      position:absolute;z-index:2147483647;
      background:rgba(0,0,0,0.72);border:none;border-radius:8px;
      color:#fff;cursor:pointer;padding:6px 10px;
      display:flex;align-items:center;gap:6px;
      font-size:12px;font-family:sans-serif;
      backdrop-filter:blur(4px);pointer-events:all;
      transition:opacity 0.15s;
    ">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <rect x="12" y="11" width="9" height="7" rx="1" fill="currentColor" stroke="none"/>
      </svg>
      PiP
    </button>`;

  function _createBtn() {
    if (_pipBtn) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = BTN_HTML;
    _pipBtn = wrap.firstElementChild;
    _pipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (_currentVideo) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {});
        } else {
          _currentVideo.requestPictureInPicture().catch(() => {
            // Fallback: tell host to open PiP via IPC
            ipcRenderer.sendToHost('pip:request', {});
          });
        }
      }
      _hideBtn();
    });
    document.body.appendChild(_pipBtn);
  }

  function _showBtn(video) {
    _createBtn();
    _currentVideo = video;
    clearTimeout(_hideTimer);

    const rect = video.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    _pipBtn.style.opacity = '1';
    _pipBtn.style.top  = (rect.top  + scrollY + 10) + 'px';
    _pipBtn.style.left = (rect.right + scrollX - 90) + 'px';

    _hideTimer = setTimeout(_hideBtn, 2500);
  }

  function _hideBtn() {
    if (_pipBtn) _pipBtn.style.opacity = '0';
    clearTimeout(_hideTimer);
  }

  // Attach hover listeners to all videos (including dynamically added ones)
  function _attachToVideo(video) {
    if (video.__vortexPiP) return;
    video.__vortexPiP = true;
    video.addEventListener('mouseenter', () => _showBtn(video));
    video.addEventListener('mouseleave', () => {
      _hideTimer = setTimeout(_hideBtn, 600);
    });
  }

  function _scanVideos() {
    document.querySelectorAll('video').forEach(_attachToVideo);
  }

  // Scan on load and watch for new videos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _scanVideos);
  } else {
    _scanVideos();
  }

  const _observer = new MutationObserver(() => _scanVideos());
  _observer.observe(document.documentElement, { childList: true, subtree: true });
})();
