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

  // In packaged builds, session may not be fully initialized immediately.
  // Use setImmediate to ensure the session is ready before registering handlers.
  setImmediate(() => {
    _registerWebRequest();
  });

  console.log('[YTBlocker] YouTube session initialized with ad blocking');
}

function _registerWebRequest() {
  if (!_ytSession) {
    console.warn('[YTBlocker] Session not ready, retrying...');
    setTimeout(_registerWebRequest, 500);
    return;
  }

  // Block ad requests — but allow critical detection endpoints
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

      // Allow pagead/id — blocking triggers ERR_BLOCKED_BY_CLIENT detection
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
  _ytSession.webRequest.onHeadersReceived(
    { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*'] },
    (details, callback) => {
      const headers = details.responseHeaders || {};

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

  console.log('[YTBlocker] webRequest handlers registered on persist:youtube session');
}

function getPartition()    { return YT_PARTITION; }
function getSession()      { return _ytSession; }
function setEnabled(val)   { _enabled = val; }
function isEnabled()       { return _enabled; }
function getBlockedCount() { return _blockedCount; }
function resetCount()      { _blockedCount = 0; }

module.exports = { init, getPartition, getSession, setEnabled, isEnabled, getBlockedCount, resetCount };
