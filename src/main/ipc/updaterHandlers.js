/**
 * main/ipc/updaterHandlers.js
 * updater:fetchAllReleases, updater:downloadExe, updater:installRelease,
 * updater:deleteApplied, updater:fetchCommits, updater:applyCommit, updater:localSha
 */

const { ipcMain, BrowserWindow, shell, app } = require('electron');
const path = require('path');

const GITHUB_REPO   = 'RupamSatyaki/VORTEX-Browser';
const GITHUB_BRANCH = 'main';

function _ghFetch(urlPath) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const req = https.get({ hostname: 'api.github.com', path: urlPath, headers: { 'User-Agent': 'Vortex-Browser-Updater', 'Accept': 'application/vnd.github.v3+json' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(new Error('JSON parse error')); } });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

function register(pushToRenderer) {
  ipcMain.handle('updater:fetchAllReleases', async () => {
    try {
      const data = await _ghFetch(`/repos/${GITHUB_REPO}/releases?per_page=20`);
      if (!Array.isArray(data)) return { error: data.message || 'API error' };
      return data.map(r => ({
        tag: r.tag_name || '', name: r.name || r.tag_name || '', body: r.body || '',
        publishedAt: r.published_at || '', htmlUrl: r.html_url || '', prerelease: r.prerelease || false,
        asset: (() => { const a = (r.assets||[]).find(a => a.name.toLowerCase().endsWith('.exe') || a.name.toLowerCase().includes('setup') || a.name.toLowerCase().includes('install')); return a ? { name: a.name, downloadUrl: a.browser_download_url, size: a.size } : null; })(),
      }));
    } catch(err) { return { error: err.message }; }
  });

  ipcMain.handle('updater:downloadExe', (_e, downloadUrl) => {
    try { const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]; if (!win || win.isDestroyed()) return false; win.webContents.downloadURL(downloadUrl); return true; } catch { return false; }
  });

  ipcMain.handle('updater:installRelease', async (_e, downloadUrl, tag) => {
    try {
      const fs = require('fs'), os = require('os');
      const safeName = `Vortex-Setup-${tag.replace(/^v/,'')}-${Date.now()}.exe`;
      const destPath = path.join(os.tmpdir(), safeName);
      try { fs.readdirSync(os.tmpdir()).filter(f => f.startsWith('Vortex-Setup-') && f.endsWith('.exe')).forEach(f => { try { fs.unlinkSync(path.join(os.tmpdir(), f)); } catch {} }); } catch {}

      function downloadFile(url, dest) {
        return new Promise((resolve, reject) => {
          function doGet(u) {
            const mod = u.startsWith('https') ? require('https') : require('http');
            const req = mod.get(u, { headers: { 'User-Agent': 'Vortex-Browser-Updater' } }, (res) => {
              if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return doGet(res.headers.location);
              if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
              const total = parseInt(res.headers['content-length'] || '0', 10); let received = 0;
              const file = fs.createWriteStream(dest);
              res.on('data', chunk => { received += chunk.length; file.write(chunk); const pct = total > 0 ? Math.round((received/total)*100) : 0; pushToRenderer('updater:installProgress', { received, total, pct, receivedMB: (received/1048576).toFixed(1), totalMB: (total/1048576).toFixed(1) }); });
              res.on('end', () => { file.end(); file.once('finish', () => resolve({ received, total })); });
              res.on('error', reject); file.on('error', reject);
            });
            req.on('error', reject); req.setTimeout(60000, () => { req.destroy(); reject(new Error('Download timed out')); });
          }
          doGet(url);
        });
      }

      pushToRenderer('updater:installProgress', { received: 0, total: 0, pct: 0, receivedMB: '0', totalMB: '?' });
      await downloadFile(downloadUrl, destPath);
      pushToRenderer('updater:installProgress', { pct: 100, done: true });
      await new Promise(r => setTimeout(r, 1000));
      const openErr = await shell.openPath(destPath);
      if (openErr) return { success: false, error: 'Could not launch installer: ' + openErr };
      setTimeout(() => app.exit(0), 2500);
      return { success: true };
    } catch(err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('updater:deleteApplied', async () => {
    try {
      const fs = require('fs'), overrideRoot = path.join(app.getPath('userData'), 'vortex-update');
      if (fs.existsSync(overrideRoot)) { fs.rmSync(overrideRoot, { recursive: true, force: true }); return { success: true }; }
      return { success: true, note: 'No applied commits found' };
    } catch(err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('updater:fetchCommits', async () => {
    try {
      const data = await new Promise((resolve, reject) => {
        const https = require('https');
        const req = https.get({ hostname: 'api.github.com', path: `/repos/${GITHUB_REPO}/commits?per_page=30&sha=${GITHUB_BRANCH}`, headers: { 'User-Agent': 'Vortex-Browser-Updater' } }, (res) => {
          let body = ''; res.on('data', c => body += c); res.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
        });
        req.on('error', reject); req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      if (!Array.isArray(data)) return { error: data.message || 'API error' };
      return data.map(c => ({ sha: c.sha, shortSha: c.sha.slice(0,7), message: c.commit.message.split('\n')[0], author: c.commit.author.name, date: c.commit.author.date }));
    } catch(err) { return { error: err.message }; }
  });

  ipcMain.handle('updater:applyCommit', async (_e, sha) => {
    try {
      const fs = require('fs'), https = require('https');
      const overrideRoot = path.join(app.getPath('userData'), 'vortex-update');
      if (!fs.existsSync(overrideRoot)) fs.mkdirSync(overrideRoot, { recursive: true });

      function fetchUrl(hostname, urlPath) {
        return new Promise((resolve, reject) => {
          const req = https.get({ hostname, path: urlPath, headers: { 'User-Agent': 'Vortex-Browser-Updater' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { const loc = new URL(res.headers.location); return resolve(fetchUrl(loc.hostname, loc.pathname + (loc.search||''))); }
            const chunks = []; res.on('data', c => chunks.push(c)); res.on('end', () => resolve(Buffer.concat(chunks)));
          });
          req.on('error', reject); req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
        });
      }

      const treeData = JSON.parse((await fetchUrl('api.github.com', `/repos/${GITHUB_REPO}/git/trees/${sha}?recursive=1`)).toString());
      if (!treeData.tree) return { success: false, error: treeData.message || 'Could not get file tree' };

      const files = treeData.tree.filter(item => item.type === 'blob' && !item.path.includes('node_modules/') && !item.path.includes('dist/') && item.path !== 'package-lock.json');
      const updated = [];
      for (const item of files) {
        const content = await fetchUrl('raw.githubusercontent.com', `/${GITHUB_REPO}/${sha}/${item.path}`);
        const destPath = path.join(overrideRoot, item.path), destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(destPath, content);
        updated.push(item.path);
      }
      fs.writeFileSync(path.join(overrideRoot, '.applied-sha'), sha);
      return { success: true, updated, skipped: [] };
    } catch(err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('updater:localSha', async () => {
    try {
      const fs = require('fs');
      const appliedShaPath = path.join(app.getPath('userData'), 'vortex-update', '.applied-sha');
      if (fs.existsSync(appliedShaPath)) return { sha: fs.readFileSync(appliedShaPath, 'utf8').trim(), source: 'update' };
      try { const pkg = require('../../../package.json'); if (pkg.buildSha) return { sha: pkg.buildSha, source: 'build' }; } catch {}
      const appRoot = app.getAppPath(), gitHead = path.join(appRoot, '.git', 'HEAD');
      if (!fs.existsSync(gitHead)) return null;
      const head = fs.readFileSync(gitHead, 'utf8').trim();
      if (head.startsWith('ref: ')) { const refPath = path.join(appRoot, '.git', head.replace('ref: ','')); if (fs.existsSync(refPath)) return { sha: fs.readFileSync(refPath,'utf8').trim(), source: 'git' }; }
      return { sha: head, source: 'git' };
    } catch { return null; }
  });
}

module.exports = { register };
