const { session, net, app } = require('electron');
const { readFile, writeFile } = require('../storage');

const PROXY_FILE = 'proxy';

const DEFAULT_CONFIG = {
  enabled: false,
  type: 'none',
  http:   { host: '', port: 8080, username: '', password: '' },
  socks5: { host: '', port: 1080, username: '', password: '' },
  tor:    { socksPort: 9050, controlPort: 9051, controlPassword: 'vortex_tor_ctrl', customBinaryPath: '', useBundled: true, autoStart: false },
  bypassList: ['localhost', '127.0.0.1', '::1'],
};

let _status = { enabled: false, type: 'none', connected: false, ip: null, originalIp: null, latency: null, torBootstrap: 0 };
let _config  = null;
let _pushFn  = null;

function setPushFn(fn) { _pushFn = fn; }
function _push(channel, data) { if (_pushFn) _pushFn(channel, data); }

// ── Config ────────────────────────────────────────────────────────────────────

function getConfig() {
  if (!_config) {
    const stored = readFile(PROXY_FILE);
    _config = Object.assign({}, DEFAULT_CONFIG, stored || {});
    _config.http   = Object.assign({}, DEFAULT_CONFIG.http,   _config.http   || {});
    _config.socks5 = Object.assign({}, DEFAULT_CONFIG.socks5, _config.socks5 || {});
    _config.tor    = Object.assign({}, DEFAULT_CONFIG.tor,    _config.tor    || {});
    if (!Array.isArray(_config.bypassList)) _config.bypassList = [...DEFAULT_CONFIG.bypassList];
  }
  return _config;
}

function saveConfig(cfg) {
  _config = cfg;
  writeFile(PROXY_FILE, cfg);
}

// ── HTTP fetch helper ─────────────────────────────────────────────────────────

function _fetchJson(url, useSession) {
  return new Promise((resolve, reject) => {
    const opts = { method: 'GET', url };
    // Electron 28: session must be passed as part of options object
    const req = useSession
      ? net.request(Object.assign(opts, { session: useSession }))
      : net.request(opts);

    let body = '';
    req.on('response', (res) => {
      res.on('data', (chunk) => { body += chunk.toString(); });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    // Manual timeout via setTimeout since req.setTimeout may not exist in all versions
    const timer = setTimeout(() => { try { req.abort(); } catch {} reject(new Error('timeout')); }, 9000);
    req.on('response', () => clearTimeout(timer));
    req.on('error', () => clearTimeout(timer));
    req.end();
  });
}

// ── Fetch FULL IP details (IPv4 + IPv6 + geo + ISP) ─────────────────────────

async function fetchFullIpDetails(useSession) {
  // ipwho.is gives IPv4 + full geo
  // We also try to get IPv6 separately via a v6-only endpoint
  const results = {};

  // IPv4 + geo info
  const V4_APIS = [
    'https://ipwho.is/',
    'https://ipapi.co/json/',
    'https://ip-api.com/json/?fields=status,query,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting',
  ];

  for (const url of V4_APIS) {
    try {
      const data = await _fetchJson(url, useSession);
      const ip = data.ip || data.query;
      if (!ip) continue;
      results.ipv4        = ip;
      results.country     = data.country || data.country_name || '';
      results.countryCode = data.country_code || data.countryCode || '';
      results.region      = data.region || data.regionName || '';
      results.city        = data.city || '';
      results.zip         = data.postal || data.zip || '';
      results.lat         = data.latitude || data.lat || '';
      results.lon         = data.longitude || data.lon || '';
      results.timezone    = data.timezone || '';
      results.isp         = data.isp || data.org || '';
      results.org         = data.org || data.isp || '';
      results.as          = data.asn || data.as || data.asname || '';
      results.mobile      = data.mobile || false;
      results.proxy       = data.proxy || data.hosting || false;
      results.type        = data.type || (data.hosting ? 'Hosting' : data.mobile ? 'Mobile' : 'ISP');
      break;
    } catch { /* try next */ }
  }

  // IPv6 — use a v6-specific endpoint (api64.ipify.org returns IPv6 if available)
  try {
    const v6data = await _fetchJson('https://api64.ipify.org?format=json', useSession);
    const v6ip = v6data?.ip;
    // Only store if it's actually IPv6 (contains colons)
    if (v6ip && v6ip.includes(':')) {
      results.ipv6 = v6ip;
    } else if (v6ip && !results.ipv4) {
      results.ipv4 = v6ip; // fallback
    }
  } catch { /* no IPv6 */ }

  return Object.keys(results).length > 0 ? results : null;
}

// ── Fetch IP info (goes through current proxy) ────────────────────────────────

async function fetchIpInfo() {
  const data = await fetchFullIpDetails();
  if (!data) return null;
  return {
    ip:          data.ipv4 || data.ipv6 || '',
    ipv4:        data.ipv4 || '',
    ipv6:        data.ipv6 || '',
    country:     data.country || '',
    countryCode: data.countryCode || '',
    city:        data.city || '',
    region:      data.region || '',
    zip:         data.zip || '',
    lat:         data.lat || '',
    lon:         data.lon || '',
    timezone:    data.timezone || '',
    org:         data.org || '',
    isp:         data.isp || '',
    as:          data.as || '',
    mobile:      data.mobile || false,
    proxy:       data.proxy || false,
    type:        data.type || '',
  };
}

// ── Get REAL original IP + full details (direct, bypassing proxy) ─────────────

async function getOriginalIp() {
  try {
    const directSes = session.fromPartition('persist:proxy-ip-check');
    await directSes.setProxy({ proxyRules: 'direct://' });

    const APIS = [
      'https://ipwho.is/',
      'https://api.ipify.org?format=json',
      'https://ip-api.com/json/?fields=query',
    ];

    for (const url of APIS) {
      try {
        const data = await _fetchJson(url, directSes);
        const ip = data.ip || data.query;
        if (ip) return ip;
      } catch { /* try next */ }
    }
    return null;
  } catch {
    return null;
  }
}

// Full original IP details — used by renderer for detailed info card
async function getOriginalIpFull() {
  try {
    const directSes = session.fromPartition('persist:proxy-ip-check');
    await directSes.setProxy({ proxyRules: 'direct://' });
    const data = await fetchFullIpDetails(directSes);
    if (!data) return null;
    return {
      ip:          data.ipv4 || data.ipv6 || '',
      ipv4:        data.ipv4 || '',
      ipv6:        data.ipv6 || '',
      country:     data.country || '',
      countryCode: data.countryCode || '',
      city:        data.city || '',
      region:      data.region || '',
      zip:         data.zip || '',
      lat:         data.lat || '',
      lon:         data.lon || '',
      timezone:    data.timezone || '',
      org:         data.org || '',
      isp:         data.isp || '',
      as:          data.as || '',
      mobile:      data.mobile || false,
      proxy:       data.proxy || false,
      type:        data.type || '',
    };
  } catch {
    return null;
  }
}

// ── FIX 2: Apply proxy — Tor only applied AFTER bootstrap complete ────────────

async function applyProxy(cfg) {
  const ses = session.defaultSession;

  if (!cfg.enabled || cfg.type === 'none') {
    await ses.setProxy({ proxyRules: 'direct://' });
    _status = { ..._status, enabled: false, type: 'none', connected: false, ip: null, latency: null };
    _push('proxy:statusUpdate', _status);
    return { success: true };
  }

  try {
    let proxyRules = '';

    if (cfg.type === 'http') {
      const { host, port, username, password } = cfg.http;
      if (!host) return { success: false, error: 'Host required' };
      const auth = username ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
      proxyRules = `http://${auth}${host}:${port}`;
    } else if (cfg.type === 'socks5') {
      const { host, port } = cfg.socks5;
      if (!host) return { success: false, error: 'Host required' };
      proxyRules = `socks5://${host}:${port}`;
    } else if (cfg.type === 'tor') {
      // FIX 2: For Tor, only set proxy if Tor process is actually running + connected
      const TorProcess = require('./torProcess');
      if (!TorProcess.isRunning() || TorProcess.getStatus().status !== 'connected') {
        // Tor not ready yet — do NOT apply proxy, just save intent
        _status = { ..._status, enabled: true, type: 'tor', connected: false };
        _push('proxy:statusUpdate', _status);
        return { success: true, pending: true, message: 'Tor not connected yet — start Tor first' };
      }
      proxyRules = `socks5://127.0.0.1:${cfg.tor.socksPort || 9050}`;
    }

    const bypass = (cfg.bypassList || []).join(',');
    await ses.setProxy({ proxyRules, proxyBypassRules: bypass });

    _status = { ..._status, enabled: true, type: cfg.type, connected: true };
    _push('proxy:statusUpdate', _status);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Called by torProcess when bootstrap hits 100% — NOW apply the Tor proxy
async function onTorReady() {
  const cfg = getConfig();
  if (cfg.enabled && cfg.type === 'tor') {
    const ses = session.defaultSession;
    const proxyRules = `socks5://127.0.0.1:${cfg.tor.socksPort || 9050}`;
    const bypass = (cfg.bypassList || []).join(',');
    try {
      await ses.setProxy({ proxyRules, proxyBypassRules: bypass });
      _status = { ..._status, enabled: true, type: 'tor', connected: true };
      _push('proxy:statusUpdate', _status);
      // Fetch Tor IP
      setTimeout(async () => {
        try {
          const info = await fetchIpInfo();
          if (info) {
            _status = { ..._status, ip: info.ip, country: info.country, city: info.city, org: info.org };
            _push('proxy:statusUpdate', _status);
          }
        } catch {}
      }, 1500);
    } catch {}
  }
}

// Called by torProcess when Tor stops — remove proxy immediately
async function onTorStopped() {
  const cfg = getConfig();
  if (cfg.type === 'tor') {
    const ses = session.defaultSession;
    await ses.setProxy({ proxyRules: 'direct://' }).catch(() => {});
    _status = { ..._status, connected: false, ip: null };
    _push('proxy:statusUpdate', _status);
  }
}

// ── Test connection ───────────────────────────────────────────────────────────

async function testConnection() {
  const t0 = Date.now();
  try {
    const info = await fetchIpInfo();
    const latency = Date.now() - t0;
    if (!info) return { success: false, error: 'Could not reach IP API' };
    return { success: true, ip: info.ip, country: info.country, city: info.city, org: info.org, latency };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const cfg = getConfig();

  // Fetch real IP first — before any proxy is applied
  getOriginalIp().then(ip => {
    if (ip) {
      _status.originalIp = ip;
      _push('proxy:statusUpdate', { ..._status });
    }
  }).catch(() => {});

  // Only apply non-Tor proxies on startup
  // Tor requires manual start — never auto-apply on startup to avoid internet drop
  if (cfg.enabled && cfg.type !== 'none' && cfg.type !== 'tor') {
    await applyProxy(cfg);
    fetchIpInfo().then(info => {
      if (info) {
        _status.ip = info.ip;
        _status.country = info.country;
        _status.city = info.city;
        _status.org = info.org;
        _push('proxy:statusUpdate', { ..._status });
      }
    }).catch(() => {});
  }

  // Auto-start Tor only if explicitly configured AND was previously connected
  if (cfg.enabled && cfg.type === 'tor' && cfg.tor.autoStart) {
    const TorProcess = require('./torProcess');
    TorProcess.start(cfg.tor).catch(() => {});
  }
}

function shutdown() {
  try { require('./torProcess').stop(); } catch {}
  // Restore direct connection on exit
  try { session.defaultSession.setProxy({ proxyRules: 'direct://' }); } catch {}
}

function getStatus() { return { ..._status }; }

module.exports = {
  init, shutdown,
  getConfig, saveConfig,
  applyProxy, onTorReady, onTorStopped,
  testConnection, fetchIpInfo, fetchFullIpDetails,
  getOriginalIp, getOriginalIpFull,
  getStatus, setPushFn,
};
