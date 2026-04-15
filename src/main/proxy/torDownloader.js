/**
 * torDownloader.js
 * Downloads Tor Expert Bundle from torproject.org into userData/tor/
 * No bundling needed — downloads on first use, caches permanently.
 */

const { app, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const zlib = require('zlib');

// Tor Expert Bundle — Windows x64 (no installer, just binaries)
// Official dist URL pattern: https://archive.torproject.org/tor-package-archive/torbrowser/
// We use the "tor-expert-bundle" which is a .tar.gz with tor.exe + geoip files
const TOR_VERSION   = '13.5.3';
const TOR_BUNDLE_URL = `https://archive.torproject.org/tor-package-archive/torbrowser/${TOR_VERSION}/tor-expert-bundle-windows-x86_64-${TOR_VERSION}.tar.gz`;
const TOR_FALLBACK_URL = `https://dist.torproject.org/torbrowser/${TOR_VERSION}/tor-expert-bundle-windows-x86_64-${TOR_VERSION}.tar.gz`;

let _pushFn = null;
function setPushFn(fn) { _pushFn = fn; }
function _push(ch, d) { if (_pushFn) _pushFn(ch, d); }

// ── Paths ─────────────────────────────────────────────────────────────────────

function getTorDir() {
  return path.join(app.getPath('userData'), 'tor');
}

function getTorExePath() {
  return path.join(getTorDir(), 'tor', 'tor.exe');
}

function getGeoipPath() {
  return path.join(getTorDir(), 'data', 'tor', 'geoip');
}

function isInstalled() {
  return fs.existsSync(getTorExePath());
}

// ── HTTP download via Electron net module ─────────────────────────────────────

function _downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const req = net.request({ method: 'GET', url });
    let totalBytes = 0;
    let receivedBytes = 0;

    req.on('response', (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }

      totalBytes = parseInt(res.headers['content-length'] || '0');
      const out = fs.createWriteStream(destPath);
      let lastPct = -1;

      res.on('data', (chunk) => {
        receivedBytes += chunk.length;
        out.write(chunk);
        if (totalBytes > 0) {
          const pct = Math.floor((receivedBytes / totalBytes) * 100);
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            _push('tor:downloadProgress', {
              percent: pct,
              received: receivedBytes,
              total: totalBytes,
              message: `Downloading Tor... ${pct}%`,
            });
          }
        }
      });

      res.on('end', () => {
        out.end();
        out.on('finish', () => resolve(destPath));
        out.on('error', reject);
      });

      res.on('error', (err) => {
        out.destroy();
        reject(err);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// ── Extract .tar.gz using Node built-ins (no external deps) ──────────────────

function _extractTarGz(tarGzPath, destDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const input = fs.createReadStream(tarGzPath);
    const gunzip = zlib.createGunzip();

    // Manual tar parser — handles ustar format
    let buf = Buffer.alloc(0);
    let currentFile = null;
    let currentSize = 0;
    let currentWritten = 0;
    let currentStream = null;
    let extractedCount = 0;

    const _processBuffer = () => {
      while (true) {
        if (currentFile) {
          // Writing file data
          const remaining = currentSize - currentWritten;
          if (buf.length === 0) break;

          const toWrite = Math.min(remaining, buf.length);
          if (currentStream) currentStream.write(buf.slice(0, toWrite));
          currentWritten += toWrite;
          buf = buf.slice(toWrite);

          if (currentWritten >= currentSize) {
            if (currentStream) {
              currentStream.end();
              currentStream = null;
            }
            // Skip padding to 512-byte boundary
            const padded = Math.ceil(currentSize / 512) * 512;
            const skip = padded - currentSize;
            buf = buf.slice(skip);
            currentFile = null;
            currentSize = 0;
            currentWritten = 0;
          }
        } else {
          // Read 512-byte header
          if (buf.length < 512) break;

          const header = buf.slice(0, 512);
          buf = buf.slice(512);

          // Check for end-of-archive (two zero blocks)
          if (header.every(b => b === 0)) continue;

          const name = header.slice(0, 100).toString('utf8').replace(/\0/g, '').trim();
          const sizeOctal = header.slice(124, 136).toString('utf8').replace(/\0/g, '').trim();
          const typeFlag = header[156];

          if (!name) continue;

          const size = parseInt(sizeOctal, 8) || 0;
          const fullPath = path.join(destDir, name);

          if (typeFlag === 53 || name.endsWith('/')) {
            // Directory
            if (!fs.existsSync(fullPath)) {
              try { fs.mkdirSync(fullPath, { recursive: true }); } catch {}
            }
          } else if (typeFlag === 0 || typeFlag === 48 || typeFlag === undefined) {
            // Regular file
            const fileDir = path.dirname(fullPath);
            if (!fs.existsSync(fileDir)) {
              try { fs.mkdirSync(fileDir, { recursive: true }); } catch {}
            }
            currentFile = fullPath;
            currentSize = size;
            currentWritten = 0;
            if (size > 0) {
              try {
                currentStream = fs.createWriteStream(fullPath);
                extractedCount++;
              } catch (e) {
                currentFile = null;
                currentSize = 0;
              }
            } else {
              // Empty file
              try { fs.writeFileSync(fullPath, ''); } catch {}
              currentFile = null;
            }
          }
        }
      }
    };

    gunzip.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      _processBuffer();
    });

    gunzip.on('end', () => {
      _processBuffer();
      resolve(extractedCount);
    });

    gunzip.on('error', reject);
    input.on('error', reject);
    input.pipe(gunzip);
  });
}

// ── Main download + install flow ──────────────────────────────────────────────

async function downloadAndInstall() {
  if (isInstalled()) {
    return { success: true, path: getTorExePath(), cached: true };
  }

  const torDir = getTorDir();
  const tmpFile = path.join(torDir, 'tor-bundle.tar.gz');

  if (!fs.existsSync(torDir)) fs.mkdirSync(torDir, { recursive: true });

  _push('tor:downloadProgress', { percent: 0, message: 'Starting Tor download...' });

  // Try primary URL, fallback to secondary
  let downloaded = false;
  for (const url of [TOR_BUNDLE_URL, TOR_FALLBACK_URL]) {
    try {
      _push('tor:downloadProgress', { percent: 0, message: `Connecting to ${new URL(url).hostname}...` });
      await _downloadFile(url, tmpFile);
      downloaded = true;
      break;
    } catch (err) {
      _push('tor:downloadProgress', { percent: 0, message: `Trying fallback URL...` });
    }
  }

  if (!downloaded) {
    return { success: false, error: 'Could not download Tor. Check your internet connection.' };
  }

  // Extract
  _push('tor:downloadProgress', { percent: 95, message: 'Extracting Tor files...' });
  try {
    await _extractTarGz(tmpFile, torDir);
  } catch (err) {
    return { success: false, error: `Extraction failed: ${err.message}` };
  }

  // Cleanup tar.gz
  try { fs.unlinkSync(tmpFile); } catch {}

  // Verify tor.exe exists after extraction
  if (!isInstalled()) {
    // Try to find tor.exe anywhere in torDir
    const found = _findFile(torDir, 'tor.exe');
    if (found) {
      _push('tor:downloadProgress', { percent: 100, message: 'Tor ready!' });
      return { success: true, path: found };
    }
    return { success: false, error: 'tor.exe not found after extraction. Try manual install.' };
  }

  _push('tor:downloadProgress', { percent: 100, message: 'Tor installed successfully!' });
  return { success: true, path: getTorExePath() };
}

// Recursively find a file by name
function _findFile(dir, name) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        const found = _findFile(full, name);
        if (found) return found;
      } else if (e.name === name) {
        return full;
      }
    }
  } catch {}
  return null;
}

// Find tor.exe anywhere in userData/tor/
function findInstalledTorExe() {
  const torDir = getTorDir();
  if (!fs.existsSync(torDir)) return null;
  return _findFile(torDir, 'tor.exe');
}

// Find geoip file anywhere in userData/tor/
function findGeoip() {
  const torDir = getTorDir();
  if (!fs.existsSync(torDir)) return null;
  return _findFile(torDir, 'geoip');
}

module.exports = {
  downloadAndInstall,
  isInstalled,
  getTorExePath,
  getTorDir,
  findInstalledTorExe,
  findGeoip,
  setPushFn,
};
