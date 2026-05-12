/**
 * features/ytBlocker/index.js
 * Renderer side — detects YouTube tabs and assigns YouTube session partition.
 *
 * When a webview navigates to youtube.com, we set its partition to
 * 'persist:youtube' so the dedicated ad-blocking session is used.
 *
 * NOTE: partition must be set BEFORE webview src is set (Electron limitation).
 * So we intercept tab creation for YouTube URLs.
 */

const YTBlocker = (() => {

  let _ytPartition = 'persist:youtube'; // default, overridden by IPC
  let _enabled     = true;

  function isYouTubeUrl(url) {
    try {
      const h = new URL(url).hostname;
      return h.includes('youtube.com') || h.includes('youtu.be');
    } catch { return false; }
  }

  /**
   * Get the partition to use for a given URL.
   * Returns 'persist:youtube' for YouTube, null for others.
   */
  function getPartitionForUrl(url) {
    if (!_enabled) return null;
    return isYouTubeUrl(url) ? _ytPartition : null;
  }

  async function init() {
    try {
      // Fetch partition name from main process
      const partition = await window.vortexAPI.invoke('ytBlocker:getPartition');
      if (partition) _ytPartition = partition;
    } catch {}
  }

  function setEnabled(val) { _enabled = val; }
  function isEnabled()     { return _enabled; }

  return { init, getPartitionForUrl, isYouTubeUrl, setEnabled, isEnabled };

})();
