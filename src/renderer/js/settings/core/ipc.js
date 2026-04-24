/**
 * settings/core/ipc.js
 * IPC bridge — postMessage to parent window (main browser renderer)
 * Mirrors the pattern from settings.html inline _invoke / _send
 */

const SettingsIPC = (() => {

  // Channels that need extended timeout (slow operations)
  const LONG_CHANNELS = [
    'updater:applyCommit',
    'updater:fetchCommits',
    'updater:fetchLatestRelease',
    'updater:fetchAllReleases',
    'vdl:getYtdlpStatus',
    'vdl:fetchInfo',
  ];

  // Channels with no timeout (downloads can take minutes)
  const NO_TIMEOUT_CHANNELS = [
    'updater:installRelease',
    'tor:download',
    'vdl:downloadYtdlp',
    'vdl:downloadFfmpeg',
  ];

  // ── invoke — request/response via postMessage ─────────────────────────────
  function invoke(channel, ...args) {
    const timeout = NO_TIMEOUT_CHANNELS.includes(channel)
      ? 600000
      : LONG_CHANNELS.includes(channel)
        ? 120000
        : 5000;

    return new Promise((resolve) => {
      const reqId = '__inv_' + Date.now() + '_' + Math.random();

      function handler(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', handler);
        resolve(ev.data.result);
      }

      window.addEventListener('message', handler);
      setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve(null);
      }, timeout);

      window.parent.postMessage({
        __vortexAction: true,
        channel: '__invoke',
        payload: { reqId, channel, args },
      }, '*');
    });
  }

  // ── send — fire and forget ────────────────────────────────────────────────
  function send(channel, data) {
    window.parent.postMessage({
      __vortexAction: true,
      channel,
      payload: data,
    }, '*');
  }

  // ── on — listen for messages from parent ──────────────────────────────────
  function on(channel, callback) {
    window.addEventListener('message', (ev) => {
      if (!ev.data) return;
      // Direct channel match
      if (ev.data.__vortexAction && ev.data.channel === channel) {
        callback(ev.data.payload);
      }
      // IPC-style message
      if (ev.data.__vortexIPC && ev.data.channel === channel) {
        callback(ev.data.data);
      }
    });
  }

  return { invoke, send, on };

})();
