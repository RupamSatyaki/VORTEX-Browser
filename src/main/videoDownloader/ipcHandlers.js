/**
 * videoDownloader/ipcHandlers.js
 * All IPC handlers for video downloader.
 */

const { ipcMain, BrowserWindow, shell, app } = require('electron');
const path        = require('path');
const ytdlpMgr    = require('./ytdlpManager');
const infoFetcher = require('./infoFetcher');
const downloader  = require('./downloader');
const { readFile } = require('../storage');

function _pushToRenderer(channel, data) {
  BrowserWindow.getAllWindows().forEach(win => {
    try { if (!win.isDestroyed()) win.webContents.send(channel, data); } catch {}
  });
}

function _getDownloadDir() {
  try {
    const settings = readFile('settings') || {};
    return settings.downloadPath || require('os').homedir() + '\\Downloads';
  } catch {
    return require('os').homedir() + '\\Downloads';
  }
}

let _dlIdCounter = 1000; // start from 1000 to avoid collision with regular downloads

function register() {
  // ── yt-dlp binary management ──────────────────────────────────────────────
  ipcMain.handle('vdl:getYtdlpStatus', async () => ({
    installed:       ytdlpMgr.isInstalled(),
    version:         ytdlpMgr.isInstalled() ? await ytdlpMgr.getVersion() : null,
    path:            ytdlpMgr.isInstalled() ? ytdlpMgr.getPath() : null,
    ffmpegInstalled: ytdlpMgr.isFfmpegInstalled(),
    ffmpegPath:      ytdlpMgr.getFfmpegPath(),
  }));

  ipcMain.handle('vdl:downloadYtdlp', async () => {
    try {
      await ytdlpMgr.download((percent) => {
        _pushToRenderer('vdl:ytdlpProgress', { type: 'ytdlp', percent });
      });
      return { success: true, version: await ytdlpMgr.getVersion() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('vdl:downloadFfmpeg', async () => {
    try {
      await ytdlpMgr.downloadFfmpeg((percent) => {
        _pushToRenderer('vdl:ytdlpProgress', { type: 'ffmpeg', percent });
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Video info ────────────────────────────────────────────────────────────
  ipcMain.handle('vdl:fetchInfo', async (_e, url) => {
    if (!ytdlpMgr.isInstalled()) {
      return { success: false, error: 'yt-dlp not installed. Click "Install yt-dlp" first.' };
    }
    try {
      const info = await infoFetcher.fetchInfo(ytdlpMgr.getPath(), url);
      return { success: true, info };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Download — also push to main downloads manager ────────────────────────
  ipcMain.handle('vdl:startDownload', async (_e, { url, formatId, ext, title }) => {
    if (!ytdlpMgr.isInstalled()) {
      return { success: false, error: 'yt-dlp not installed.' };
    }
    try {
      const outputDir = _getDownloadDir();
      const dlId      = ++_dlIdCounter;

      // Notify downloads manager — start
      _pushToRenderer('download:start', {
        id:             dlId,
        filename:       title + '.' + ext,
        totalBytes:     0,
        totalFormatted: 'Unknown',
        status:         'progressing',
        isVideo:        true,
      });
      _pushToRenderer('downloads:badge', 1);

      const id = downloader.startDownload({
        ytdlpPath:  ytdlpMgr.getPath(),
        ffmpegPath: ytdlpMgr.getFfmpegPath(),
        url, formatId, ext, title, outputDir,

        onProgress: (data) => {
          _pushToRenderer('vdl:progress', data);
          // Parse size strings to bytes for downloads manager
          const total    = _parseSize(data.size);
          const received = total > 0 ? Math.round(total * (data.percent || 0) / 100) : 0;
          _pushToRenderer('download:update', {
            id:               dlId,
            status:           'progressing',
            receivedBytes:    received,
            receivedFormatted: _fmtBytes(received),
            totalBytes:       total,
            totalFormatted:   total > 0 ? _fmtBytes(total) : (data.size || ''),
            speed:            data.speed || '',
            percent:          Math.round(data.percent || 0),
          });
        },

        onDone: (data) => {
          _pushToRenderer('vdl:done', data);
          // Notify downloads manager — done
          _pushToRenderer('download:done', {
            id:       dlId,
            status:   'completed',
            savePath: data.filePath,
            filename: title + '.' + ext,
          });
          _pushToRenderer('downloads:badge', 0);
        },

        onError: (data) => {
          _pushToRenderer('vdl:error', data);
          _pushToRenderer('download:done', {
            id:       dlId,
            status:   'interrupted',
            savePath: '',
            filename: title + '.' + ext,
          });
          _pushToRenderer('downloads:badge', 0);
        },
      });

      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.on('vdl:cancelDownload', (_e, id) => {
    downloader.cancelDownload(id);
  });

  ipcMain.handle('vdl:getQueue', () => downloader.getQueue());

  // Open downloaded file in explorer
  ipcMain.on('vdl:openFile', (_e, filePath) => {
    try { shell.showItemInFolder(filePath); } catch {}
  });
}

module.exports = { register };

// ── Helpers ───────────────────────────────────────────────────────────────────
function _parseSize(str) {
  if (!str) return 0;
  const m = str.match(/([\d.]+)\s*(B|KB|KiB|MB|MiB|GB|GiB)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  if (u === 'b')                    return Math.round(n);
  if (u === 'kb' || u === 'kib')   return Math.round(n * 1024);
  if (u === 'mb' || u === 'mib')   return Math.round(n * 1024 * 1024);
  if (u === 'gb' || u === 'gib')   return Math.round(n * 1024 * 1024 * 1024);
  return 0;
}

function _fmtBytes(bytes) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024)              return bytes + ' B';
  if (bytes < 1024 * 1024)       return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}
