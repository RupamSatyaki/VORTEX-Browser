/**
 * browser/webview/scripts/ytAdblock.js
 * YouTube ad blocker — CSS + JS injection into YouTube webviews.
 */

const WVYTAdblock = (() => {

  let _enabled = true;
  let _speed   = 16;

  const CSS = `
    #masthead-ad, #player-ads, ytd-ad-slot-renderer,
    ytd-banner-promo-renderer, ytd-statement-banner-renderer,
    ytd-in-feed-ad-layout-renderer, ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer, ytd-display-ad-renderer,
    ytd-compact-promoted-video-renderer, ytd-action-companion-ad-renderer,
    ytd-video-masthead-ad-v3-renderer, ytd-promoted-sparkles-text-search-renderer,
    .ytp-ad-overlay-container, .ytp-ad-text-overlay, .ytp-ad-image-overlay,
    .ytp-ad-player-overlay-instream-info, .ytp-ad-player-overlay-layout,
    #google-container-id, #companion-ad-container,
    ytd-popup-container ytd-ad-slot-renderer
    { display: none !important; }
  `;

  const JS_TEMPLATE = `
    (function() {
      if (window.__vortexAdBlock) return;
      window.__vortexAdBlock = true;
      var _wasAd = false;
      function trySkip() {
        var btn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
        if (btn && btn.offsetParent !== null) { btn.click(); return; }
        var video = document.querySelector('video');
        var adShowing = document.querySelector('.ad-showing');
        if (adShowing && video) {
          _wasAd = true;
          if (!video.muted) video.muted = true;
          if (video.playbackRate !== __AD_SPEED__) video.playbackRate = __AD_SPEED__;
        } else if (video && _wasAd) {
          _wasAd = false;
          video.muted = false;
          video.playbackRate = 1;
          if (video.paused) { setTimeout(function() { try { video.play(); } catch(e) {} }, 200); }
        }
      }
      function removeAds() {
        document.querySelectorAll('#masthead-ad, #player-ads, ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, ytd-promoted-video-renderer, ytd-display-ad-renderer, ytd-banner-promo-renderer, ytd-statement-banner-renderer, ytd-action-companion-ad-renderer')
          .forEach(function(el) { try { el.remove(); } catch(e) {} });
      }
      setInterval(function() { trySkip(); removeAds(); }, 300);
      new MutationObserver(function() { removeAds(); }).observe(document.documentElement, { childList: true, subtree: true });
    })();
  `;

  function setEnabled(enabled, speed) {
    _enabled = enabled !== false;
    _speed   = parseInt(speed) || 16;
  }

  function inject(wv) {
    try {
      const url = wv.src || '';
      if (!url.includes('youtube.com') || !_enabled) return;
      wv.insertCSS(CSS).catch(() => {});
      wv.executeJavaScript(JS_TEMPLATE.replaceAll('__AD_SPEED__', _speed)).catch(() => {});
    } catch (_) {}
  }

  return { inject, setEnabled };

})();
