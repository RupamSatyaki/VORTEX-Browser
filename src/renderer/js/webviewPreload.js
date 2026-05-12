// Preload for guest webviews — exposes minimal IPC to page context
const { ipcRenderer } = require('electron');

window.__vortexBridge = {
  sendToHost: (channel, data) => ipcRenderer.sendToHost(channel, data),
};

// ── Override alert/confirm/prompt with custom Vortex UI ───────────────────────
(function patchDialogs() {
  const _origin = (() => { try { return location.hostname; } catch { return ''; } })();
  function _send(type, message, defaultValue) {
    try {
      ipcRenderer.sendToHost('dialog:show', {
        type,
        message: String(message === undefined || message === null ? '' : message),
        defaultValue: String(defaultValue === undefined || defaultValue === null ? '' : defaultValue),
        origin: _origin,
      });
    } catch(e) {}
  }
  window.alert   = function(msg)      { _send('alert',   msg, '');  };
  window.confirm = function(msg)      { _send('confirm', msg, '');  return false; };
  window.prompt  = function(msg, def) { _send('prompt',  msg, def); return null;  };
})();

// ── Forward Ctrl/Cmd shortcuts to host window ─────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey && e.key !== 'F12' && e.key !== 'F11' && e.key !== 'F5') return;
  const shortcuts = new Set(['t','w','n','h','j','b','f','p','s',',','0','Tab','F12','F11','F5']);
  const key = e.key;
  if (!shortcuts.has(key) && !(e.shiftKey && (key === 'R' || key === 'Tab'))) return;
  if (['c','v','x','a','z','y'].includes(key.toLowerCase()) && !e.shiftKey) return;
  ipcRenderer.sendToHost('webview:keydown', {
    key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey,
    shiftKey: e.shiftKey, altKey: e.altKey,
  });
}, true);

// ── YouTube PiP patch ─────────────────────────────────────────────────────────
(function patchYouTubePiP() {
  Object.defineProperty(HTMLVideoElement.prototype, 'disablePictureInPicture', {
    get: function() { return false; },
    set: function() {},
    configurable: true,
  });
  const _origSetAttr = HTMLVideoElement.prototype.setAttribute;
  HTMLVideoElement.prototype.setAttribute = function(name, value) {
    if (name === 'disablepictureinpicture') return;
    return _origSetAttr.call(this, name, value);
  };
})();

// ── PiP Button ────────────────────────────────────────────────────────────────
(function initPiP() {
  let _pipBtn = null, _currentVideo = null, _hideTimer = null;

  function _createBtn() {
    if (_pipBtn) return;

    // Build button using DOM methods — avoids TrustedHTML policy on YouTube
    const btn = document.createElement('button');
    btn.id = '__vortex_pip_btn';
    btn.title = 'Picture in Picture';
    btn.setAttribute('style',
      'position:absolute;z-index:2147483647;background:rgba(0,0,0,0.72);' +
      'border:none;border-radius:8px;color:#fff;cursor:pointer;padding:6px 10px;' +
      'display:flex;align-items:center;gap:6px;font-size:12px;font-family:sans-serif;' +
      'backdrop-filter:blur(4px);pointer-events:all;transition:opacity 0.15s;'
    );

    // SVG icon via DOM
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect1.setAttribute('x', '2'); rect1.setAttribute('y', '4');
    rect1.setAttribute('width', '20'); rect1.setAttribute('height', '16');
    rect1.setAttribute('rx', '2');
    const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect2.setAttribute('x', '12'); rect2.setAttribute('y', '11');
    rect2.setAttribute('width', '9'); rect2.setAttribute('height', '7');
    rect2.setAttribute('rx', '1');
    rect2.setAttribute('fill', 'currentColor');
    rect2.setAttribute('stroke', 'none');
    svg.appendChild(rect1);
    svg.appendChild(rect2);

    const label = document.createTextNode('PiP');
    btn.appendChild(svg);
    btn.appendChild(label);

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      if (_currentVideo) {
        if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
        else _currentVideo.requestPictureInPicture().catch(() => { ipcRenderer.sendToHost('pip:request', {}); });
      }
      _hideBtn();
    });

    document.body.appendChild(btn);
    _pipBtn = btn;
  }
  function _showBtn(video) {
    _createBtn(); _currentVideo = video; clearTimeout(_hideTimer);
    const rect = video.getBoundingClientRect();
    _pipBtn.style.opacity = '1';
    _pipBtn.style.top  = (rect.top  + window.scrollY + 10) + 'px';
    _pipBtn.style.left = (rect.right + window.scrollX - 90) + 'px';
    _hideTimer = setTimeout(_hideBtn, 2500);
  }
  function _hideBtn() { if (_pipBtn) _pipBtn.style.opacity = '0'; clearTimeout(_hideTimer); }
  function _attachToVideo(v) {
    if (v.__vortexPiP) return;
    v.__vortexPiP = true;
    v.addEventListener('mouseenter', () => _showBtn(v));
    v.addEventListener('mouseleave', () => { _hideTimer = setTimeout(_hideBtn, 600); });
  }
  function _scan() { document.querySelectorAll('video').forEach(_attachToVideo); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _scan);
  else _scan();
  // Guard: document.documentElement may not exist yet in some webview contexts
  function _startObserver() {
    const target = document.documentElement || document.body;
    if (!target) { setTimeout(_startObserver, 50); return; }
    new MutationObserver(_scan).observe(target, { childList: true, subtree: true });
  }
  _startObserver();
})();

// YouTube ad blocking handled by ytAdblock.js via wv.executeJavaScript()
