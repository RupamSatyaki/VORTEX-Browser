/**
 * videoDownloader/infoFetcher.js
 * Fetch video info (title, formats, thumbnail) using yt-dlp --dump-json
 */

const { spawn } = require('child_process');

/**
 * Fetch video info from URL
 * @param {string} ytdlpPath - path to yt-dlp binary
 * @param {string} url - video URL
 * @returns {Promise<object>} video info
 */
function fetchInfo(ytdlpPath, url) {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      url,
    ];

    const proc = spawn(ytdlpPath, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
        return;
      }
      try {
        const raw = JSON.parse(stdout.trim());
        resolve(_parseInfo(raw));
      } catch (e) {
        reject(new Error('Failed to parse video info'));
      }
    });

    proc.on('error', (err) => {
      const msg = err.code === 'EBUSY'
        ? 'yt-dlp is busy. Please wait a moment and try again.'
        : err.message;
      reject(new Error(msg));
    });

    // Timeout after 30s
    setTimeout(() => {
      try { proc.kill(); } catch {}
      reject(new Error('Timeout fetching video info'));
    }, 30000);
  });
}

function _parseInfo(raw) {
  const formats = (raw.formats || []).filter(f => f.vcodec !== 'none' || f.acodec !== 'none');

  // Separate audio-only formats, pick best
  const audioFormats = formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');
  const bestAudio    = audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

  const qualities = [];
  const seenHeights = new Set();

  // All video formats (combined OR video-only), sorted best quality first
  const videoFormats = formats
    .filter(f => f.vcodec !== 'none' && f.height)
    .sort((a, b) => (b.height - a.height) || ((b.tbr || 0) - (a.tbr || 0)));

  videoFormats.forEach(f => {
    if (seenHeights.has(f.height)) return;
    seenHeights.add(f.height);

    const hasCombinedAudio = f.acodec !== 'none';
    const formatId = hasCombinedAudio
      ? f.format_id                                          // already has audio
      : bestAudio ? `${f.format_id}+${bestAudio.format_id}` // merge with best audio
      : f.format_id;

    const fps = f.fps && f.fps !== 30 ? ` ${Math.round(f.fps)}fps` : '';
    qualities.push({
      label:    `${f.height}p${fps}`,
      height:   f.height,
      formatId,
      ext:      'mp4',
      filesize: (f.filesize || 0) + (hasCombinedAudio ? 0 : (bestAudio?.filesize || 0)),
      vcodec:   f.vcodec,
      fps:      f.fps,
    });
  });

  // Audio only
  if (bestAudio) {
    qualities.push({
      label:     `Audio only (${bestAudio.abr || '?'}kbps)`,
      height:    0,
      formatId:  bestAudio.format_id,
      ext:       'mp3',
      filesize:  bestAudio.filesize || 0,
      audioOnly: true,
    });
  }

  return {
    title:     raw.title          || 'Unknown',
    uploader:  raw.uploader       || raw.channel || '',
    duration:  raw.duration       || 0,
    thumbnail: raw.thumbnail      || '',
    url:       raw.webpage_url    || raw.url || '',
    site:      raw.extractor_key  || raw.extractor || '',
    qualities: qualities.slice(0, 10),
  };
}

module.exports = { fetchInfo };
