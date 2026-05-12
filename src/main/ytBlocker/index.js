/**
 * ytBlocker/index.js
 * Entry point — initialize YouTube ad blocker session + IPC handlers.
 */

const ytSession    = require('./session');
const ipcHandlers  = require('./ipcHandlers');

function init() {
  ytSession.init();
  ipcHandlers.register();
  console.log('[YTBlocker] Ready');
}

module.exports = { init };
