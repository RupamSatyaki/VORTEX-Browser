// Preload for guest webviews — exposes minimal IPC to page context
const { ipcRenderer } = require('electron');

window.__vortexBridge = {
  sendToHost: (channel, data) => ipcRenderer.sendToHost(channel, data),
};

// ── Override alert/confirm/prompt with custom Vortex UI ───────────────────────
(function patchDialogs() {
  const _origin = (() => { try { return location.hostname; } catch { return ''; } })();

  function _send(type, message, defaultValue) {
    // sendToHost sends ipc-message event to the host webview element
    try {
      ipcRenderer.sendToHost('dialog:show', {
        type,
        message: String(message === undefined || message === null ? '' : message),
        defaultValue: String(defaultValue === undefined || defaultValue === null ? '' : defaultValue),
        origin: _origin,
      });
    } catch(e) {
      // fallback — do nothing, just suppress native dialog
    }
  }

  window.alert = function(msg) { _send('alert', msg, ''); };
  window.confirm = function(msg) { _send('confirm', msg, ''); return false; };
  window.prompt = function(msg, def) { _send('prompt', msg, def); return null; };
})();

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


// ── YouTube Ad Blocker + Auto-Skipper (Layer 2 — DOM) ────────────────────────
(function ytAdBlock() {
  function _isYT() {
    try { return location.hostname.includes('youtube.com'); } catch { return false; }
  }

  // ── Layer 2a: CSS — hide all ad containers instantly ──────────────────────
  const AD_CSS = `
    /* Player ads */
    #masthead-ad, #player-ads, .ytp-ad-module,
    ytd-ad-slot-renderer, ytd-action-companion-ad-renderer,
    ytd-video-masthead-ad-v3-renderer, ytd-video-masthead-ad-primetime-renderer,

    /* In-feed ads */
    ytd-in-feed-ad-layout-renderer, ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer, ytd-display-ad-renderer,
    ytd-compact-promoted-video-renderer,
    ytd-promoted-sparkles-text-search-renderer,

    /* Banner ads */
    ytd-banner-promo-renderer, ytd-statement-banner-renderer,
    ytd-mealbar-promo-renderer,

    /* Overlay ads */
    .ytp-ad-overlay-container, .ytp-ad-text-overlay,
    .ytp-ad-image-overlay, .ytp-ad-player-overlay-instream-info,
    .ytp-ad-player-overlay-layout, .ytp-ad-player-overlay,

    /* Companion ads */
    #google-container-id, #companion-ad-container,
    .ytd-companion-slot-renderer,

    /* Popup ads */
    tp-yt-paper-dialog[aria-label*="ad" i],
    ytd-popup-container ytd-ad-slot-renderer,

    /* Sponsored cards */
    ytd-promoted-sparkles-text-search-renderer,
    .ytd-promoted-video-renderer,

    /* Homepage promotions */
    ytd-ad-slot-renderer[class*="masthead"],
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer)

    { display: none !important; visibility: hidden !important; }

    /* Hide ad badge on thumbnails */
    .ytd-thumbnail-overlay-bottom-panel-renderer[aria-label*="Ad" i]
    { display: none !important; }
  `;

  function _injectCSS() {
    if (document.getElementById('__vortex_adblock_css')) return;
    const s = document.createElement('style');
    s.id = '__vortex_adblock_css';
    s.textContent = AD_CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // ── Layer 2b: Skip + Speed ────────────────────────────────────────────────
  let _adSpeed = 16;
  let _lastSkipAttempt = 0;

  function _trySkipAndBlock() {
    if (!_isYT()) return;

    const now = Date.now();

    // 1. Click skip button (debounced)
    if (now - _lastSkipAttempt > 200) {
      const skipBtn = document.querySelector(
        '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, ' +
        '.videoAdUiSkipButton, [class*="skip-ad"], .ytp-ad-skip-button-slot button'
      );
      if (skipBtn && skipBtn.offsetParent !== null) {
        skipBtn.click();
        _lastSkipAttempt = now;
      }
    }

    // 2. Speed up + jump to end for unskippable ads
    const video = document.querySelector('video');
    const adShowing = document.querySelector('.ad-showing, .ytp-ad-player-overlay');
    if (adShowing && video && !video.paused) {
      if (video.playbackRate !== _adSpeed) video.playbackRate = _adSpeed;
      if (isFinite(video.duration) && video.duration > 0 && video.duration < 60) {
        video.currentTime = video.duration - 0.1;
      }
    } else if (video && video.playbackRate === _adSpeed) {
      video.playbackRate = 1; // restore normal speed
    }

    // 3. Remove lingering ad DOM nodes
    const AD_SELECTORS = [
      '#masthead-ad', '#player-ads', 'ytd-ad-slot-renderer',
      'ytd-in-feed-ad-layout-renderer', 'ytd-promoted-video-renderer',
      'ytd-display-ad-renderer', 'ytd-banner-promo-renderer',
      'ytd-statement-banner-renderer', 'ytd-action-companion-ad-renderer',
      'ytd-mealbar-promo-renderer',
    ];
    document.querySelectorAll(AD_SELECTORS.join(',')).forEach(el => {
      try { el.remove(); } catch {}
    });

    // 4. Close "Ad" info overlay if present
    const adInfoClose = document.querySelector('.ytp-ad-button-icon, .ytp-ad-overlay-close-button');
    if (adInfoClose) { try { adInfoClose.click(); } catch {} }
  }

  // ── Layer 2c: Remove sponsored cards + homepage promotions ───────────────
  function _removePromotions() {
    if (!_isYT()) return;
    // Sponsored shelf
    document.querySelectorAll(
      'ytd-shelf-renderer[is-promoted], ytd-promoted-sparkles-web-renderer, ' +
      '.ytd-promoted-video-renderer, ytd-rich-item-renderer:has(ytd-ad-slot-renderer)'
    ).forEach(el => { try { el.remove(); } catch {} });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.documentElement) _injectCSS();
  document.addEventListener('DOMContentLoaded', () => {
    _injectCSS();
    _removePromotions();
  });

  // Poll every 250ms
  setInterval(() => {
    _trySkipAndBlock();
    _removePromotions();
  }, 250);

  // MutationObserver for instant reaction
  const _obs = new MutationObserver(() => {
    if (_isYT()) {
      _injectCSS();
      _trySkipAndBlock();
    }
  });

  function _startObs() {
    _obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startObs);
  } else {
    _startObs();
  }
})();
