/**
 * videoDownloader/downloader.js
 * Spawn yt-dlp, parse progress, manage download queue.
 */

const { spawn } = require('child_process');
const path      = require('path');
const fs        = require('fs');

// Active downloads: id → { proc, url, title, status }
const _queue = new Map();
let _idCounter = 0;

/**
 * Start a download
 * @param {object} opts
 * @param {string} opts.ytdlpPath
 * @param {string} opts.url
 * @param {string} opts.formatId
 * @param {string} opts.ext
 * @param {string} opts.title
 * @param {string} opts.outputDir
 * @param {function} opts.onProgress  - ({ id, percent, speed, eta, size })
 * @param {function} opts.onDone      - ({ id, filePath })
 * @param {function} opts.onError     - ({ id, error })
 */
function startDownload({ ytdlpPath, ffmpegPath, url, formatId, ext, title, outputDir, onProgress, onDone, onError }) {
  const id       = ++_idCounter;
  const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 80);
  const outTemplate = path.join(outputDir, `${safeTitle}.%(ext)s`);

  const args = [
    '--format', formatId,
    '--output', outTemplate,
    '--no-playlist',
    '--no-warnings',
    '--progress',
    '--newline',
  ];

  // Add ffmpeg path if available (needed for merging video+audio)
  if (ffmpegPath && require('fs').existsSync(ffmpegPath)) {
    args.push('--ffmpeg-location', require('path').dirname(ffmpegPath));
  }

  if (ext === 'mp3') {
    args.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push('--merge-output-format', 'mp4');
    args.push('--prefer-free-formats');
  }

  args.push(url);

  const proc = spawn(ytdlpPath, args, { windowsHide: true });
  _queue.set(id, { proc, url, title, status: 'downloading', filePath: null });

  let lastFilePath = null;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      // Parse progress: [download]  67.3% of 45.23MiB at 12.34MiB/s ETA 00:03
      const progressMatch = line.match(/\[download\]\s+(\d+\.?\d*)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+(\S+)/);
      if (progressMatch) {
        onProgress && onProgress({
          id,
          percent: parseFloat(progressMatch[1]),
          size:    progressMatch[2],
          speed:   progressMatch[3],
          eta:     progressMatch[4],
        });
        return;
      }

      // Parse destination file
      const destMatch = line.match(/\[(?:download|Merger|ExtractAudio)\]\s+Destination:\s+(.+)/);
      if (destMatch) {
        lastFilePath = destMatch[1].trim();
        const entry = _queue.get(id);
        if (entry) entry.filePath = lastFilePath;
      }

      // Merge complete
      const mergeMatch = line.match(/\[Merger\]\s+Merging formats into "(.+)"/);
      if (mergeMatch) {
        lastFilePath = mergeMatch[1].trim();
        const entry = _queue.get(id);
        if (entry) entry.filePath = lastFilePath;
      }
    });
  });

  proc.stderr.on('data', (data) => {
    // yt-dlp sometimes writes progress to stderr too
    const line = data.toString();
    if (line.includes('ERROR')) {
      console.error('[VideoDownloader]', line.trim());
    }
  });

  proc.on('close', (code) => {
    const entry = _queue.get(id);
    if (code === 0) {
      const fp = entry?.filePath || lastFilePath || '';
      _queue.delete(id);
      onDone && onDone({ id, filePath: fp });
    } else {
      _queue.delete(id);
      onError && onError({ id, error: `yt-dlp exited with code ${code}` });
    }
  });

  proc.on('error', (err) => {
    _queue.delete(id);
    const msg = err.code === 'EBUSY'
      ? 'yt-dlp is busy or locked. Try again in a moment.'
      : err.message;
    onError && onError({ id, error: msg });
  });

  return id;
}

function cancelDownload(id) {
  const entry = _queue.get(id);
  if (entry) {
    try { entry.proc.kill('SIGTERM'); } catch {}
    _queue.delete(id);
    return true;
  }
  return false;
}

function getQueue() {
  return [..._queue.entries()].map(([id, e]) => ({
    id,
    url:    e.url,
    title:  e.title,
    status: e.status,
  }));
}

module.exports = { startDownload, cancelDownload, getQueue };
