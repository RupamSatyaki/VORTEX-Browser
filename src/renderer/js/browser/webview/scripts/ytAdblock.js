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
    if (window.__vxObs) return;

    function skipAd() {
      // Click skip button
      var btn = document.querySelector(
        '.ytp-ad-skip-button-modern, .ytp-ad-skip-button, ' +
        '.ytp-skip-ad-button, .videoAdUiSkipButton'
      );
      if (btn && btn.offsetParent !== null) { try { btn.click(); } catch(e){} }

      // Hide ad module container
      var adModule = document.querySelector('.ytp-ad-module');
      if (adModule) { try { adModule.style.display = 'none'; } catch(e){} }

      // Hide overlay banner ad (bottom of video)
      var overlay = document.querySelector('.ytp-ad-overlay-slot');
      if (overlay) { try { overlay.style.display = 'none'; } catch(e){} }

      // Hide companion/sponsored card
      var companion = document.querySelector(
        '#companion-ad-container, ytd-companion-slot-renderer, ' +
        '#google-container-id, .ytp-ad-overlay-container, ' +
        '.ytp-image-background-gradient-vertical'
      );
      if (companion) {
        var root = companion.closest(
          '.ytp-ad-overlay-container, #companion-ad-container, ' +
          'ytd-companion-slot-renderer, #google-container-id'
        ) || companion.parentElement;
        if (root) { try { root.style.display = 'none'; } catch(e){} }
        else { try { companion.style.display = 'none'; } catch(e){} }
      }
    }

    window.__vxObs = new MutationObserver(function() { skipAd(); });
    window.__vxObs.observe(document.documentElement, { childList: true, subtree: true });
    skipAd();
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
      wv.executeJavaScript(JS.replace('__SPEED__', _speed)).catch(() => {});
    } catch (_) {}
  }

  function injectEarly(wv) {}

  return { inject, injectEarly, setEnabled, isEnabled };

})();
