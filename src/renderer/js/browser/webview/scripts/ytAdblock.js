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

    function skipAd() {
      // Click skip button — try all known selectors
      var skipSelectors = [
        '.ytp-ad-skip-button-modern',
        '.ytp-ad-skip-button',
        '.ytp-skip-ad-button',
        '.videoAdUiSkipButton',
        '[class*="skip-button"]',
        'button.ytp-ad-skip-button-container button'
      ];
      for (var i = 0; i < skipSelectors.length; i++) {
        var btn = document.querySelector(skipSelectors[i]);
        if (btn && btn.offsetParent !== null) {
          try { btn.click(); } catch(e){}
          break;
        }
      }

      // Hide overlay banner ad (bottom of video) — less detectable than hiding full module
      var overlay = document.querySelector('.ytp-ad-overlay-slot');
      if (overlay) { try { overlay.style.setProperty('display','none','important'); } catch(e){} }

      // Hide companion/sponsored card
      var companionSelectors = [
        '#companion-ad-container',
        'ytd-companion-slot-renderer',
        '#google-container-id',
        '.ytp-ad-overlay-container',
        '.ytp-image-background-gradient-vertical'
      ];
      for (var j = 0; j < companionSelectors.length; j++) {
        var el = document.querySelector(companionSelectors[j]);
        if (el) { try { el.style.setProperty('display','none','important'); } catch(e){} }
      }
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
