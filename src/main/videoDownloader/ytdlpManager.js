/**
 * videoDownloader/ytdlpManager.js
 * Manages yt-dlp + ffmpeg binaries.
 */

const { app }  = require('electron');
const path     = require('path');
const fs       = require('fs');
const https    = require('https');

const TOOLS_DIR   = () => path.join(app.getPath('userData'), 'tools');
const YTDLP_PATH  = () => path.join(TOOLS_DIR(), 'yt-dlp.exe');
const FFMPEG_PATH = () => path.join(TOOLS_DIR(), 'ffmpeg.exe');

const YTDLP_URL  = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
// ffmpeg Windows build from GitHub (ffmpeg-master-latest-win64-gpl.zip → ffmpeg.exe)
const FFMPEG_URL = 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip';

function isInstalled()      { return fs.existsSync(YTDLP_PATH()); }
function isFfmpegInstalled(){ return fs.existsSync(FFMPEG_PATH()); }
function getPath()          { return YTDLP_PATH(); }
function getFfmpegPath()    { return isFfmpegInstalled() ? FFMPEG_PATH() : null; }
function getToolsDir()      { return TOOLS_DIR(); }

// ── Generic file downloader ───────────────────────────────────────────────────
function _downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tempDest = dest + '.tmp';
    // Remove stale temp file
    try { if (fs.existsSync(tempDest)) fs.unlinkSync(tempDest); } catch {}

    // If dest exists and is locked, rename it first
    if (fs.existsSync(dest)) {
      try {
        const bakPath = dest + '.bak';
        try { if (fs.existsSync(bakPath)) fs.unlinkSync(bakPath); } catch {}
        fs.renameSync(dest, bakPath);
      } catch {
        // File is locked — try to continue anyway
      }
    }

    const file = fs.createWriteStream(tempDest);

    function doRequest(reqUrl, redirectCount = 0) {
      if (redirectCount > 10) { reject(new Error('Too many redirects')); return; }
      https.get(reqUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          doRequest(res.headers.location, redirectCount + 1);
          return;
        }
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }

        const total = parseInt(res.headers['content-length'] || '0');
        let downloaded = 0;

        res.on('data', (chunk) => {
          downloaded += chunk.length;
          file.write(chunk);
          if (total > 0 && onProgress) onProgress(Math.round((downloaded / total) * 100));
        });
        res.on('end', () => {
          file.end(() => {
            try {
              // Try to replace dest — if locked, keep as .tmp for caller to handle
              try { if (fs.existsSync(dest)) fs.unlinkSync(dest); } catch {}
              fs.renameSync(tempDest, dest);
              resolve(dest);
            } catch (err) {
              // dest is locked — resolve with tempDest so caller can handle
              resolve(tempDest);
            }
          });
        });
        res.on('error', (err) => { file.destroy(); try { fs.unlinkSync(tempDest); } catch {} reject(err); });
      }).on('error', (err) => { file.destroy(); try { fs.unlinkSync(tempDest); } catch {} reject(err); });
    }
    doRequest(url);
  });
}

// ── Download yt-dlp ───────────────────────────────────────────────────────────
async function download(onProgress) {
  const dest     = YTDLP_PATH();
  const tempDest = dest + '.new'; // download as .new, replace on next launch if locked

  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Remove stale .new file
  try { if (fs.existsSync(tempDest)) fs.unlinkSync(tempDest); } catch {}

  // Download to .new file
  await _downloadFile(YTDLP_URL, tempDest, onProgress);

  // Try to replace existing file
  try {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.renameSync(tempDest, dest);
  } catch (err) {
    // File is locked (yt-dlp running) — keep .new file, apply on next launch
    console.warn('[YTDlpManager] yt-dlp.exe is locked, update will apply on next launch');
    // Mark for next launch
    try { fs.writeFileSync(dest + '.pending', '1'); } catch {}
  }
  return dest;
}

// Apply pending update if exists (call on app start)
function applyPendingUpdate() {
  const dest    = YTDLP_PATH();
  const newFile = dest + '.new';
  const pending = dest + '.pending';
  if (fs.existsSync(newFile)) {
    try {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      fs.renameSync(newFile, dest);
      try { fs.unlinkSync(pending); } catch {}
      console.log('[YTDlpManager] Applied pending yt-dlp update');
    } catch {}
  }
}

// ── Download ffmpeg (zip → extract ffmpeg.exe) ────────────────────────────────
async function downloadFfmpeg(onProgress) {
  const zipPath = path.join(TOOLS_DIR(), 'ffmpeg.zip');

  // Download zip
  await _downloadFile(FFMPEG_URL, zipPath, (p) => {
    if (onProgress) onProgress(Math.round(p * 0.85));
  });

  if (onProgress) onProgress(88);

  // Extract ffmpeg.exe using Node.js (no PowerShell spawn — avoids EBUSY)
  await _extractFfmpegFromZip(zipPath, FFMPEG_PATH());

  if (onProgress) onProgress(100);

  // Cleanup zip
  try { fs.unlinkSync(zipPath); } catch {}
  return FFMPEG_PATH();
}

function _extractFfmpegFromZip(zipPath, destPath) {
  return new Promise((resolve, reject) => {
    try {
      // Use Node.js built-in to read zip central directory
      // ffmpeg zip from yt-dlp/FFmpeg-Builds contains ffmpeg.exe inside a subfolder
      const buf = fs.readFileSync(zipPath);

      // Find End of Central Directory record
      let eocdOffset = -1;
      for (let i = buf.length - 22; i >= 0; i--) {
        if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
          eocdOffset = i;
          break;
        }
      }
      if (eocdOffset === -1) { reject(new Error('Invalid zip file')); return; }

      const cdOffset = buf.readUInt32LE(eocdOffset + 16);
      const cdSize   = buf.readUInt32LE(eocdOffset + 12);
      const numFiles = buf.readUInt16LE(eocdOffset + 10);

      let pos = cdOffset;
      for (let i = 0; i < numFiles; i++) {
        if (buf[pos] !== 0x50 || buf[pos+1] !== 0x4b || buf[pos+2] !== 0x01 || buf[pos+3] !== 0x02) break;

        const compMethod   = buf.readUInt16LE(pos + 10);
        const compSize     = buf.readUInt32LE(pos + 20);
        const uncompSize   = buf.readUInt32LE(pos + 24);
        const fnLen        = buf.readUInt16LE(pos + 28);
        const extraLen     = buf.readUInt16LE(pos + 30);
        const commentLen   = buf.readUInt16LE(pos + 32);
        const localOffset  = buf.readUInt32LE(pos + 42);
        const filename     = buf.slice(pos + 46, pos + 46 + fnLen).toString('utf8');

        pos += 46 + fnLen + extraLen + commentLen;

        // Find ffmpeg.exe (may be in subfolder like ffmpeg-xxx/bin/ffmpeg.exe)
        if (filename.endsWith('ffmpeg.exe') && !filename.includes('ffprobe') && !filename.includes('ffplay')) {
          // Read local file header
          const lhExtraLen = buf.readUInt16LE(localOffset + 28);
          const lhFnLen    = buf.readUInt16LE(localOffset + 26);
          const dataStart  = localOffset + 30 + lhFnLen + lhExtraLen;
          const compData   = buf.slice(dataStart, dataStart + compSize);

          if (compMethod === 0) {
            // Stored (no compression)
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.writeFileSync(destPath, compData);
            resolve(destPath);
            return;
          } else if (compMethod === 8) {
            // Deflate
            const zlib = require('zlib');
            zlib.inflateRaw(compData, (err, result) => {
              if (err) { reject(new Error('Failed to decompress ffmpeg.exe: ' + err.message)); return; }
              fs.mkdirSync(path.dirname(destPath), { recursive: true });
              fs.writeFileSync(destPath, result);
              resolve(destPath);
            });
            return;
          } else {
            reject(new Error(`Unsupported compression method: ${compMethod}`));
            return;
          }
        }
      }
      reject(new Error('ffmpeg.exe not found in zip'));
    } catch (err) {
      reject(new Error('Failed to extract ffmpeg: ' + err.message));
    }
  });
}

// ── Get yt-dlp version ────────────────────────────────────────────────────────
async function getVersion() {
  if (!isInstalled()) return null;
  const { spawn } = require('child_process');
  return new Promise((resolve) => {
    const proc = spawn(YTDLP_PATH(), ['--version'], { windowsHide: true });
    let out = '';
    proc.stdout.on('data', d => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim() || null));
    proc.on('error', () => resolve(null));
    setTimeout(() => { try { proc.kill(); } catch {} resolve(null); }, 5000);
  });
}

module.exports = {
  isInstalled, isFfmpegInstalled,
  getPath, getFfmpegPath, getToolsDir,
  download, downloadFfmpeg, getVersion,
  applyPendingUpdate,
  YTDLP_URL, FFMPEG_URL,
};
