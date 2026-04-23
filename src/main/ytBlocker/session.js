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

  // Apply ad blocking webRequest on YouTube session only
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

      if (isAdRequest(url, referrer, type)) {
        _blockedCount++;
        callback({ cancel: true });
      } else {
        callback({});
      }
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
