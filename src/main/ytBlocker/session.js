/**
 * ytBlocker/session.js
 * Dedicated YouTube session with ad blocking webRequest rules.
 *
 * Uses a separate Electron session (persist:youtube) so:
 * - YouTube cookies/login persist separately
 * - Ad blocking rules only apply to this session
 * - Main session is unaffected
 */

const { session } = require('electron');
const { isAdRequest } = require('./adPatterns');

const YT_PARTITION = 'persist:youtube';

let _ytSession   = null;
let _enabled     = true;
let _blockedCount = 0;

/**
 * Initialize the YouTube session with ad blocking
 */
function init() {
  _ytSession = session.fromPartition(YT_PARTITION);

  // Block ad requests — but use redirect for critical detection endpoints
  _ytSession.webRequest.onBeforeRequest(
    {
      urls: [
        '*://*.googlevideo.com/*',
        '*://*.youtube.com/*',
        '*://*.googlesyndication.com/*',
        '*://*.doubleclick.net/*',
        '*://*.googleadservices.com/*',
      ]
    },
    (details, callback) => {
      if (!_enabled) { callback({}); return; }

      const url      = details.url || '';
      const referrer = details.referrer || '';
      const type     = details.resourceType || '';

      // Special handling for pagead/id — allow it through
      // Blocking or redirecting this triggers ERR_UNSAFE_REDIRECT or detection
      // The actual ad video content (ctier=L) is what we block, not the ID endpoint
      if (url.includes('doubleclick.net/pagead/id')) {
        callback({});
        return;
      }

      if (isAdRequest(url, referrer, type)) {
        _blockedCount++;
        callback({ cancel: true });
      } else {
        callback({});
      }
    }
  );

  // Strip ad-detection response headers from YouTube responses
  // YouTube uses these headers to verify ad requests completed successfully
  _ytSession.webRequest.onHeadersReceived(
    { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*'] },
    (details, callback) => {
      const headers = details.responseHeaders || {};

      // Remove headers that YouTube uses to track ad delivery confirmation
      const headersToRemove = [
        'x-ad-impressions',
        'x-ad-request-id',
        'x-adblock-key',
        'x-youtube-ad-signals',
      ];
      headersToRemove.forEach(h => {
        const key = Object.keys(headers).find(k => k.toLowerCase() === h);
        if (key) delete headers[key];
      });

      callback({ responseHeaders: headers });
    }
  );

  console.log('[YTBlocker] YouTube session initialized with ad blocking');
}

function getPartition()    { return YT_PARTITION; }
function getSession()      { return _ytSession; }
function setEnabled(val)   { _enabled = val; }
function isEnabled()       { return _enabled; }
function getBlockedCount() { return _blockedCount; }
function resetCount()      { _blockedCount = 0; }

module.exports = { init, getPartition, getSession, setEnabled, isEnabled, getBlockedCount, resetCount };
