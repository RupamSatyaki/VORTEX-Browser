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
      var btn = document.querySelector('.ytp-skip-ad-button,.ytp-ad-skip-button,.ytp-ad-skip-button-modern,.videoAdUiSkipButton');
      if (btn && btn.offsetParent !== null) { try { btn.click(); } catch(e){} }
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
    // DISABLED FOR TESTING
  }

  function injectEarly(wv) {}

  return { inject, injectEarly, setEnabled, isEnabled };

})();
