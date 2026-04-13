/**
 * blocklist/downloader.js — Download blocklist files with progress
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

function downloadList(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    function doGet(u, redirectCount = 0) {
      if (redirectCount > 5) { reject(new Error('Too many redirects')); return; }
      const mod = u.startsWith('https') ? https : http;
      const req = mod.get(u, { headers: { 'User-Agent': 'Vortex-Browser/1.0' } }, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doGet(res.headers.location, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let received = 0;
        const file = fs.createWriteStream(destPath);

        res.on('data', chunk => {
          received += chunk.length;
          file.write(chunk);
          if (onProgress && total > 0) {
            onProgress({
              pct: Math.round((received / total) * 100),
              receivedMB: (received / 1048576).toFixed(1),
              totalMB: (total / 1048576).toFixed(1),
            });
          }
        });

        res.on('end', () => {
          file.end();
          file.once('finish', () => resolve(destPath));
        });

        res.on('error', reject);
        file.on('error', reject);
      });

      req.on('error', reject);
      req.setTimeout(30000, () => { req.destroy(); reject(new Error('Download timed out')); });
    }

    doGet(url);
  });
}

module.exports = { downloadList };
