/**
 * browser/webview/scripts/ytAdblock.js
 * YouTube ad blocker — injected via wv.executeJavaScript() into page context.
 * Ads load normally then are immediately removed via MutationObserver.
 * No preload injection — runs in actual page window.
 */

const WVYTAdblock = (() => {

  let _enabled = true;
  let _speed   = 16;

  const JS = `(function() {
    // Use a randomized symbol stored on a non-enumerable property
    // to avoid fingerprinting via known global names like __vxObs
    var _key = '_vx' + Math.random().toString(36).slice(2, 7);
    if (document[_key]) return;
    Object.defineProperty(document, _key, { value: true, enumerable: false, configurable: false });

    // 1. CSS-based stealth hiding (harder to detect than JS manipulation)
    var styleId = 'vx-' + Math.random().toString(36).slice(2, 7);
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = ".ad-showing video { opacity: 0.01 !important; pointer-events: none !important; } .ytp-ad-overlay-slot, #companion-ad-container, ytd-companion-slot-renderer, .ytp-ad-message-container, .ytp-ad-survey-container, ytd-enforcement-message-view-model, yt-playability-error-supported-renderers, #ad-block-allow-ads-dialog, .ytd-action-companion-ad-renderer, ytd-ad-slot-renderer, .ytd-ad-slot-renderer, #masthead-ad, ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer, .ytd-shorts-container, #endpoint.yt-simple-endpoint[title='Shorts'] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }";
      (document.head || document.documentElement).appendChild(style);
    }

    function skipAd() {
      // 1. Click skip button — try all known selectors
      var skipSelectors = [
        '.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button',
        '.ytp-skip-ad-button',
        '.videoAdUiSkipButton',
        '[class*="skip-button"]',
        'button.ytp-ad-skip-button-container button',
        '.ytp-ad-skip-button-slot'
      ];
      for (var i = 0; i < skipSelectors.length; i++) {
        var btn = document.querySelector(skipSelectors[i]);
        if (btn && btn.offsetParent !== null) {
          try { 
            // Simulate natural click
            btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            btn.click(); 
          } catch(e){}
        }
      }

      // 2. Clear enforcement messages more aggressively
      var antiAdblockSelectors = [
        'ytd-enforcement-message-view-model',
        'yt-playability-error-supported-renderers',
        '#ad-block-allow-ads-dialog',
        'tp-yt-iron-overlay-backdrop'
      ];
      antiAdblockSelectors.forEach(function(s) {
        var el = document.querySelector(s);
        if (el) {
          try {
            if (s.includes('backdrop')) {
              el.style.display = 'none';
            } else {
              el.innerHTML = '';
              el.remove();
            }
          } catch(e){}
        }
      });

      // 3. Fast-forward and mute if an ad is playing
      var video = document.querySelector('video');
      var ad = document.querySelector('.ad-showing, .ad-interrupting');
      if (ad && video) {
        try {
          if (!video.muted) video.muted = true;
          video.playbackRate = 16;
          if (isFinite(video.duration) && video.duration > 0 && video.currentTime < video.duration - 0.5) {
            video.currentTime = video.duration - 0.1;
          }
        } catch(e){}
      }

      // 4. Auto-resume video if paused by ad/message
      if (!ad && video && video.paused && !video.ended && video.readyState > 2) {
        var playBtn = document.querySelector('.ytp-play-button');
        if (playBtn && playBtn.getAttribute('aria-label')) {
           var label = playBtn.getAttribute('aria-label');
           if (label.includes('Play') || label.includes('कें') || label.includes('चालू')) {
              try { video.play(); } catch(e){}
           }
        }
      }
    }

    // Proxy the MutationObserver to hide our presence
    if (typeof window.MutationObserver !== 'undefined' && !window.MutationObserver.isProxied) {
      var OriginalObserver = window.MutationObserver;
      window.MutationObserver = function(callback) {
        var obs = new OriginalObserver(function(mutations) {
          // Filter out our own style changes from being detected
          var filtered = mutations.filter(function(m) {
            return m.target.id !== styleId;
          });
          if (filtered.length > 0) callback(filtered, obs);
        });
        return obs;
      };
      window.MutationObserver.isProxied = true;
      window.MutationObserver.prototype = OriginalObserver.prototype;
    }

    // Use a targeted observer — only watch the player container, not entire DOM
    // This is far less suspicious than observing document.documentElement
    function attachObserver() {
      var player = document.querySelector('#movie_player, ytd-player, #player-container');
      var target = player || document.body;
      if (!target) return;

      var obs = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var n = nodes[j];
            if (n.nodeType === 1) {
              var cls = n.className || '';
              if (typeof cls === 'string' && (cls.indexOf('ytp-ad') !== -1 || cls.indexOf('ad-') !== -1)) {
                skipAd();
                return;
              }
            }
          }
        }
      });
      obs.observe(target, { childList: true, subtree: true });
    }

    // Initial run
    skipAd();

    // Attach observer once player is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      attachObserver();
    } else {
      document.addEventListener('DOMContentLoaded', attachObserver, { once: true });
    }

    // Periodic fallback — catches ads that slip through observer
    setInterval(skipAd, 1000);
  })();`;

  function setEnabled(enabled, speed) {
    _enabled = enabled !== false;
    if (speed !== undefined) _speed = parseInt(speed) || 16;
  }

  function isEnabled() { return _enabled; }

  function inject(wv) {
    try {
      const url = wv.src || '';
      if (!url.includes('youtube.com') || !_enabled) return;
      // Small delay in case page context isn't fully ready (packaged build timing)
      const _doInject = () => {
        wv.executeJavaScript(JS).catch(() => {});
      };
      // Try immediately, then retry once after 500ms as fallback for packaged builds
      _doInject();
      setTimeout(_doInject, 500);
    } catch (_) {}
  }

  function injectEarly(wv) {}

  return { inject, injectEarly, setEnabled, isEnabled };

})();
