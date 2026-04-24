/**
 * videoDownloader/index.js
 * Entry point — register IPC handlers.
 */

const ipcHandlers = require('./ipcHandlers');

function init() {
  // Apply any pending yt-dlp update from previous session
  try { require('./ytdlpManager').applyPendingUpdate(); } catch {}
  ipcHandlers.register();
  console.log('[VideoDownloader] Ready');
}

module.exports = { init };
