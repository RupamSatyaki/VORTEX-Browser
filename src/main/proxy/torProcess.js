const { app } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');
const net  = require('net');

let _proc    = null;
let _pushFn  = null;
let _status  = 'stopped'; // 'stopped' | 'starting' | 'connected' | 'error'
let _bootstrap = 0;

function setPushFn(fn) {
  _pushFn = fn;
  // Wire downloader push too
  try { require('./torDownloader').setPushFn(fn); } catch {}
}
function _push(ch, d) { if (_pushFn) _pushFn(ch, d); }

// ── Resolve tor.exe path ──────────────────────────────────────────────────────

function resolveTorPath(cfg) {
  const TorDownloader = require('./torDownloader');

  // 1. Custom user path
  if (cfg && cfg.customBinaryPath && fs.existsSync(cfg.customBinaryPath)) {
    return cfg.customBinaryPath;
  }

  // 2. Already downloaded into userData/tor/
  const downloaded = TorDownloader.findInstalledTorExe();
  if (downloaded) return downloaded;

  // 3. Bundled in resources/tor/win32/ (asar.unpacked — for packaged builds)
  const appPath = app.getAppPath();
  const unpackedBase = appPath.replace('app.asar', 'app.asar.unpacked');
  const bundledPaths = [
    path.join(unpackedBase, 'resources', 'tor', 'win32', 'tor.exe'),
    path.join(appPath, 'resources', 'tor', 'win32', 'tor.exe'),
    path.join(path.dirname(appPath), 'resources', 'tor', 'win32', 'tor.exe'),
  ];
  for (const p of bundledPaths) {
    if (fs.existsSync(p)) return p;
  }

  // 4. Not found
  return null;
}

function getTorDataDir() {
  const dir = path.join(app.getPath('userData'), 'tor-data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getGeoipPath(torExePath) {
  const dir = path.dirname(torExePath);
  const candidates = [
    path.join(dir, 'tor-geoip', 'geoip'),
    path.join(dir, 'geoip'),
    path.join(dir, '..', 'geoip'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ── Start Tor ─────────────────────────────────────────────────────────────────

async function start(cfg) {
  if (_proc) return { success: false, error: 'Tor already running' };

  let torExe = resolveTorPath(cfg);

  // Auto-download if not found
  if (!torExe) {
    _push('tor:bootstrapProgress', { percent: 0, message: 'tor.exe not found — downloading...' });
    const TorDownloader = require('./torDownloader');
    const dlResult = await TorDownloader.downloadAndInstall();
    if (!dlResult.success) {
      _status = 'error';
      _push('tor:error', { message: dlResult.error || 'Download failed' });
      return { success: false, error: dlResult.error };
    }
    torExe = dlResult.path || TorDownloader.findInstalledTorExe();
    if (!torExe) {
      _status = 'error';
      _push('tor:error', { message: 'tor.exe not found after download' });
      return { success: false, error: 'tor.exe not found after download' };
    }
  }

  const dataDir = getTorDataDir();
  const socksPort = (cfg && cfg.socksPort) || 9050;
  const ctrlPort  = (cfg && cfg.controlPort) || 9051;

  const args = [
    '--SocksPort',    String(socksPort),
    '--ControlPort',  String(ctrlPort),
    '--DataDirectory', dataDir,
    '--Log',          'notice stdout',
    '--SafeSocks',    '1',
    '--StrictNodes',  '0',
  ];

  // Geoip — check downloaded location first, then next to tor.exe
  const TorDownloader = require('./torDownloader');
  const geoip = TorDownloader.findGeoip() || getGeoipPath(torExe);
  if (geoip && fs.existsSync(geoip)) {
    args.push('--GeoIPFile', geoip);
    const geoip6 = geoip + '6';
    if (fs.existsSync(geoip6)) args.push('--GeoIPv6File', geoip6);
  }

  _status = 'starting';
  _bootstrap = 0;
  _push('tor:bootstrapProgress', { percent: 0, message: 'Starting Tor...' });

  try {
    _proc = spawn(torExe, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    _status = 'error';
    _push('tor:error', { message: `Failed to start Tor: ${err.message}` });
    return { success: false, error: err.message };
  }

  _proc.stdout.on('data', (data) => {
    const text = data.toString();
    const m = text.match(/Bootstrapped (\d+)%[^:]*:\s*(.+)/);
    if (m) {
      _bootstrap = parseInt(m[1]);
      const msg = m[2].trim();
      _push('tor:bootstrapProgress', { percent: _bootstrap, message: msg });
      if (_bootstrap >= 100) {
        _status = 'connected';
        _push('tor:ready', {});
        // FIX 2: Tell proxyManager Tor is ready — NOW apply the proxy
        try { require('./proxyManager').onTorReady(); } catch {}
      }
    }
  });

  _proc.stderr.on('data', (data) => {
    const text = data.toString();
    const m = text.match(/Bootstrapped (\d+)%[^:]*:\s*(.+)/);
    if (m) {
      _bootstrap = parseInt(m[1]);
      _push('tor:bootstrapProgress', { percent: _bootstrap, message: m[2].trim() });
      if (_bootstrap >= 100) {
        _status = 'connected';
        _push('tor:ready', {});
        try { require('./proxyManager').onTorReady(); } catch {}
      }
    }
  });

  _proc.on('exit', (code) => {
    _proc = null;
    _status = 'stopped';
    _bootstrap = 0;
    _push('tor:stopped', { reason: code === 0 ? 'normal' : `exit code ${code}` });
    // FIX 2: Remove proxy when Tor stops — restore direct connection
    try { require('./proxyManager').onTorStopped(); } catch {}
  });

  _proc.on('error', (err) => {
    _proc = null;
    _status = 'error';
    _push('tor:error', { message: err.message });
    try { require('./proxyManager').onTorStopped(); } catch {}
  });

  return { success: true };
}

// ── Stop Tor ──────────────────────────────────────────────────────────────────

function stop() {
  if (!_proc) return { success: false, error: 'Tor not running' };
  try {
    _proc.kill('SIGTERM');
    setTimeout(() => { if (_proc) { _proc.kill('SIGKILL'); _proc = null; } }, 3000);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── New Identity via control port ─────────────────────────────────────────────

function newIdentity(cfg) {
  return new Promise((resolve) => {
    const ctrlPort = (cfg && cfg.controlPort) || 9051;
    const password = (cfg && cfg.controlPassword) || '';
    const sock = new net.Socket();
    let done = false;

    const finish = (ok, err) => {
      if (done) return;
      done = true;
      try { sock.destroy(); } catch {}
      resolve(ok ? { success: true } : { success: false, error: err });
    };

    sock.setTimeout(5000);
    sock.connect(ctrlPort, '127.0.0.1', () => {
      const auth = password ? `AUTHENTICATE "${password}"\r\n` : 'AUTHENTICATE\r\n';
      sock.write(auth + 'SIGNAL NEWNYM\r\nQUIT\r\n');
    });

    sock.on('data', (d) => {
      const text = d.toString();
      if (text.includes('250 OK') && text.includes('NEWNYM')) finish(true);
      else if (text.includes('515') || text.includes('551')) finish(false, 'Auth failed or rate limited');
    });

    sock.on('timeout', () => finish(false, 'Control port timeout'));
    sock.on('error', (e) => finish(false, e.message));
    sock.on('close', () => finish(true)); // assume success on clean close
  });
}

// ── Get circuit info ──────────────────────────────────────────────────────────

function getCircuit(cfg) {
  return new Promise((resolve) => {
    const ctrlPort = (cfg && cfg.controlPort) || 9051;
    const password = (cfg && cfg.controlPassword) || '';
    const sock = new net.Socket();
    let buf = '';
    let done = false;

    const finish = (data) => {
      if (done) return;
      done = true;
      try { sock.destroy(); } catch {}
      resolve(data);
    };

    sock.setTimeout(5000);
    sock.connect(ctrlPort, '127.0.0.1', () => {
      const auth = password ? `AUTHENTICATE "${password}"\r\n` : 'AUTHENTICATE\r\n';
      sock.write(auth + 'GETINFO circuit-status\r\nQUIT\r\n');
    });

    sock.on('data', (d) => {
      buf += d.toString();
      // Parse a simple circuit line: BUILT $fingerprint~name,...
      const circuitMatch = buf.match(/BUILT\s+([\$\w~,]+)/);
      if (circuitMatch) {
        const nodes = circuitMatch[1].split(',').map(n => {
          const parts = n.split('~');
          return { fingerprint: parts[0].replace('$',''), name: parts[1] || '' };
        });
        finish({ success: true, nodes });
      }
    });

    sock.on('timeout', () => finish({ success: false, nodes: [] }));
    sock.on('error', () => finish({ success: false, nodes: [] }));
    sock.on('close', () => finish({ success: false, nodes: [] }));
  });
}

function isRunning() { return !!_proc; }
function getStatus() { return { status: _status, bootstrap: _bootstrap }; }
function getBinaryPath(cfg) {
  const p = resolveTorPath(cfg);
  return p || null; // null = not found/downloaded yet
}

module.exports = { start, stop, newIdentity, getCircuit, isRunning, getStatus, getBinaryPath, setPushFn, resolveTorPath };
