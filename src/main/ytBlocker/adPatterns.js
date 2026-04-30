/**
 * ytBlocker/adPatterns.js
 * YouTube ad URL patterns — identifies ad requests vs normal video requests.
 *
 * Strategy: Let IMA SDK load (YouTube won't detect), but block the actual
 * ad video content URLs. YouTube thinks it's a network error, not an ad blocker.
 */

// Ad video content patterns in googlevideo.com URLs
// Normal videos: no ctier param, or ctier=A/H
// Ad videos: ctier=L (ad content tier) + newer signals
const AD_VIDEO_PARAMS = [
  'ctier=L',          // Ad content tier — classic signal
  'ctier=A&',         // Some ad variants use ctier=A with oad
  'oad=1',            // Original ad flag
  'adformat=',        // Ad format parameter
  'ad_type=',         // Ad type parameter
  '&oad=',            // Alternate oad position
  'adunit=',          // Ad unit identifier
  'ad_len=',          // Ad length parameter (newer)
  'adslot=',          // Ad slot parameter
  'correlator=',      // Ad correlator (only in ad requests)
  'adsid=',           // Ad session ID
  'adtagurl=',        // Ad tag URL
  'pucrd=',           // Ad-specific param (newer YouTube)
  'rdid=',            // Rewarded ad ID
  'vad_type=',        // Video ad type
  'idpj=',            // Ad impression param
  'label=preroll',    // Preroll label
  'label=midroll',    // Midroll label
  'label=postroll',   // Postroll label
];

// YouTube ad tracking / stats endpoints
const AD_TRACKING_PATHS = [
  '/api/stats/ads',
  '/pagead/',
  '/ptracking',
  '/get_midroll_info',
  '/ad_data_204',
  '/api/stats/qoe?adformat',
  // NOTE: /api/stats/atr is used for BOTH ad stats (el=adunit) and video stats (el=detailpage)
  // We handle it separately in isAdRequest() with a query param check
  // NOTE: /youtubei/v1/log_event is NOT blocked — YouTube uses it for all events,
  // blocking it triggers adblock detection
  '/pagead/adview',
  '/pagead/conversion/',
  '/pagead/viewthroughconversion/',
];

// Ad domains — block when referrer is youtube.com OR when URL path is clearly an ad endpoint
// We do NOT block imasdk.googleapis.com — that triggers detection
const AD_DOMAINS_YT_ONLY = [
  'pagead2.googlesyndication.com',
  'tpc.googlesyndication.com',
  'ad.doubleclick.net',
  'googleads.g.doubleclick.net',
  'pubads.g.doubleclick.net',
  'securepubads.g.doubleclick.net',
  'googleadservices.com',
];

// These ad domain paths are ALWAYS blocked regardless of referrer
// because they are pure ad/tracking endpoints with no legitimate use
const AD_DOMAIN_ALWAYS_BLOCK_PATHS = [
  // NOTE: /pagead/id is intentionally NOT here — blocking it triggers detection
  // It is allowed through in session.js
  '/pagead/adview',
  '/pagead/conversion',
  '/simgad/',             // tpc.googlesyndication.com/simgad/ — image ads
  '/safeframe/',          // Safe frame ad container
  '/activeview/',         // Active view tracking
  '/xbbe',                // Ad beacon
  '/ddm/activity',        // DoubleClick activity
];

// YouTube-specific paths that are NEVER ads — whitelist to prevent false positives
const YT_SAFE_PATHS = [
  '/api/timedtext',       // Subtitles/captions
  '/api/timedtext_video', // Video captions
  '/youtubei/v1/player',  // Player init (NOT log_event)
  '/youtubei/v1/next',    // Next video suggestions
  '/youtubei/v1/search',  // Search
  '/youtubei/v1/browse',  // Browse/homepage
  '/youtubei/v1/guide',   // Sidebar guide
  '/youtubei/v1/account', // Account info
  '/watch',               // Watch page
  '/results',             // Search results
];

/**
 * Check if a URL is a YouTube ad request
 * @param {string} url - Request URL
 * @param {string} referrer - Request referrer
 * @param {string} resourceType - Request resource type
 * @returns {boolean}
 */
function isAdRequest(url, referrer = '', resourceType = '') {
  try {
    // Safety: never block safe YouTube paths
    if (url.includes('youtube.com')) {
      if (YT_SAFE_PATHS.some(p => url.includes(p))) return false;
    }

    // 1. Ad video content (googlevideo.com with ad params)
    if (url.includes('googlevideo.com')) {
      if (AD_VIDEO_PARAMS.some(p => url.includes(p))) return true;
    }

    // 2. YouTube ad tracking endpoints
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (AD_TRACKING_PATHS.some(p => url.includes(p))) return true;

      // /api/stats/atr — block only when it's an ad unit report (el=adunit or is_ad=1)
      // NOT when el=detailpage (regular video stats)
      if (url.includes('/api/stats/atr')) {
        if (url.includes('el=adunit') || url.includes('is_ad=1') || url.includes('adformat=')) return true;
        return false; // let regular video stats through
      }
    }

    // 3. Ad domain paths — always block regardless of referrer
    // These paths have no legitimate non-ad use on these domains
    const isAdDomain = AD_DOMAINS_YT_ONLY.some(d => url.includes(d));
    if (isAdDomain) {
      if (AD_DOMAIN_ALWAYS_BLOCK_PATHS.some(p => url.includes(p))) return true;
    }

    // 4. Ad domains — block when coming from YouTube (referrer check)
    const isFromYT = referrer.includes('youtube.com') || referrer.includes('youtu.be');
    if (isFromYT && isAdDomain) return true;

    return false;
  } catch {
    return false;
  }
}

module.exports = { isAdRequest, AD_VIDEO_PARAMS, AD_TRACKING_PATHS, AD_DOMAINS_YT_ONLY };
