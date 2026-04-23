/**
 * ytBlocker/adPatterns.js
 * YouTube ad URL patterns — identifies ad requests vs normal video requests.
 *
 * Strategy: Let IMA SDK load (YouTube won't detect), but block the actual
 * ad video content URLs. YouTube thinks it's a network error, not an ad blocker.
 */

// Ad video content patterns in googlevideo.com URLs
// Normal videos: no ctier param, or ctier=A/H
// Ad videos: ctier=L (ad content tier)
const AD_VIDEO_PARAMS = [
  'ctier=L',          // Ad content tier — most reliable signal
  'oad=1',            // Original ad flag
  'adformat=',        // Ad format parameter
  'ad_type=',         // Ad type parameter
];

// YouTube ad tracking / stats endpoints
const AD_TRACKING_PATHS = [
  '/api/stats/ads',
  '/pagead/',
  '/ptracking',
  '/get_midroll_info',
  '/ad_data_204',
  '/api/stats/qoe?adformat',
];

// Ad domains — only block when referrer is youtube.com
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

/**
 * Check if a URL is a YouTube ad request
 * @param {string} url - Request URL
 * @param {string} referrer - Request referrer
 * @param {string} resourceType - Request resource type
 * @returns {boolean}
 */
function isAdRequest(url, referrer = '', resourceType = '') {
  try {
    // 1. Ad video content (googlevideo.com with ad params)
    if (url.includes('googlevideo.com')) {
      if (AD_VIDEO_PARAMS.some(p => url.includes(p))) return true;
    }

    // 2. YouTube ad tracking endpoints
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (AD_TRACKING_PATHS.some(p => url.includes(p))) return true;
    }

    // 3. Ad domains — only when coming from YouTube
    const isFromYT = referrer.includes('youtube.com') || referrer.includes('youtu.be');
    if (isFromYT) {
      if (AD_DOMAINS_YT_ONLY.some(d => url.includes(d))) return true;
    }

    return false;
  } catch {
    return false;
  }
}

module.exports = { isAdRequest, AD_VIDEO_PARAMS, AD_TRACKING_PATHS, AD_DOMAINS_YT_ONLY };
