// url-encoder/utils.js - Shared URL utilities
var UEUtils = {

  encode: function(str) { return encodeURIComponent(str); },
  decode: function(str) { return decodeURIComponent(str); },
  encodeURI_: function(str) { return encodeURI(str); },

  autoDetect: function(str) {
    if (!str.trim()) return 'empty';
    if (/%[0-9A-Fa-f]{2}/.test(str)) return 'encoded';
    try { new URL(str); return 'url'; } catch(e) {}
    if (str.indexOf('=') !== -1 || str.indexOf('&') !== -1) return 'querystring';
    return 'plain';
  },

  parseURL: function(raw) {
    var u = new URL(raw);
    var params = [];
    u.searchParams.forEach(function(v, k) { params.push({ key: k, value: v }); });
    return {
      protocol: u.protocol,
      username: u.username,
      password: u.password,
      hostname: u.hostname,
      port: u.port,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      origin: u.origin,
      href: u.href,
      params: params,
    };
  },

  buildURL: function(base, params) {
    try {
      var u = new URL(base);
      u.search = '';
      params.forEach(function(p) {
        if (p.key) u.searchParams.append(p.key, p.value);
      });
      return u.href;
    } catch(e) {
      // fallback: just append query string
      var qs = params.filter(function(p) { return p.key; })
        .map(function(p) { return encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value); })
        .join('&');
      return qs ? base + '?' + qs : base;
    }
  },

  canonicalize: function(raw) {
    try {
      var u = new URL(raw);
      // lowercase hostname
      u.hostname = u.hostname.toLowerCase();
      // remove default ports
      if ((u.protocol === 'http:' && u.port === '80') ||
          (u.protocol === 'https:' && u.port === '443')) {
        u.port = '';
      }
      // sort query params
      var params = [];
      u.searchParams.forEach(function(v, k) { params.push([k, v]); });
      params.sort(function(a, b) { return a[0].localeCompare(b[0]); });
      u.search = '';
      params.forEach(function(p) { u.searchParams.append(p[0], p[1]); });
      // remove trailing slash from path (unless root)
      if (u.pathname.length > 1 && u.pathname.slice(-1) === '/') {
        u.pathname = u.pathname.slice(0, -1);
      }
      return u.href;
    } catch(e) { throw new Error('Invalid URL'); }
  },

  validate: function(raw) {
    var issues = [];
    if (!raw.trim()) { issues.push('URL is empty'); return issues; }
    try {
      var u = new URL(raw);
      if (!['http:', 'https:', 'ftp:', 'ftps:'].includes(u.protocol)) {
        issues.push('Unusual protocol: ' + u.protocol);
      }
      if (!u.hostname) issues.push('Missing hostname');
      if (u.hostname && !u.hostname.includes('.') && u.hostname !== 'localhost') {
        issues.push('Hostname has no TLD: ' + u.hostname);
      }
      if (u.hostname.length > 253) issues.push('Hostname too long (>253 chars)');
      if (u.pathname.includes(' ')) issues.push('Path contains unencoded spaces');
      if (u.search.includes(' ')) issues.push('Query string contains unencoded spaces');
    } catch(e) {
      issues.push('Not a valid URL: ' + e.message);
    }
    return issues;
  },

  toCode: function(url, lang) {
    var esc = url.replace(/'/g, "\\'").replace(/"/g, '\\"');
    if (lang === 'js-fetch')
      return 'fetch("' + esc + '")\n  .then(res => res.json())\n  .then(data => console.log(data));';
    if (lang === 'js-axios')
      return 'axios.get("' + esc + '")\n  .then(res => console.log(res.data));';
    if (lang === 'py-requests')
      return 'import requests\nresponse = requests.get("' + esc + '")\nprint(response.json())';
    if (lang === 'curl')
      return 'curl -X GET "' + esc + '" \\\n  -H "Accept: application/json"';
    if (lang === 'curl-verbose')
      return 'curl -v "' + esc + '"';
    if (lang === 'wget')
      return 'wget "' + esc + '"';
    if (lang === 'php')
      return '$response = file_get_contents("' + esc + '");\n$data = json_decode($response, true);';
    if (lang === 'go')
      return 'resp, err := http.Get("' + esc + '")\nif err != nil { log.Fatal(err) }\ndefer resp.Body.Close()';
    return url;
  },

  generateQR: function(canvas, text, size) {
    // Simple QR-like visual using canvas (not a real QR, but a visual hash grid)
    // For a real QR we'd need a library — this generates a deterministic pattern
    size = size || 200;
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d');
    var cells = 25;
    var cell = size / cells;
    ctx.fillStyle = '#0d1f1f';
    ctx.fillRect(0, 0, size, size);

    // Hash the text to get deterministic bits
    var hash = 0;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    var bits = [];
    for (var i = 0; i < cells * cells; i++) {
      var h = hash ^ (i * 2654435761);
      h ^= text.charCodeAt(i % text.length) || 0;
      bits.push((h & 1) === 0);
    }

    // Draw finder patterns (corners)
    function drawFinder(x, y) {
      ctx.fillStyle = '#00c8b4';
      ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = '#0d1f1f';
      ctx.fillRect((x+1)*cell, (y+1)*cell, 5*cell, 5*cell);
      ctx.fillStyle = '#00c8b4';
      ctx.fillRect((x+2)*cell, (y+2)*cell, 3*cell, 3*cell);
    }
    drawFinder(0, 0); drawFinder(cells-7, 0); drawFinder(0, cells-7);

    // Draw data bits
    ctx.fillStyle = '#00c8b4';
    for (var row = 0; row < cells; row++) {
      for (var col = 0; col < cells; col++) {
        var inFinder = (row < 8 && col < 8) || (row < 8 && col >= cells-8) || (row >= cells-8 && col < 8);
        if (!inFinder && bits[row * cells + col]) {
          ctx.fillRect(col * cell, row * cell, cell - 1, cell - 1);
        }
      }
    }
  },

  fmtBytes: function(n) {
    if (n < 1024) return n + ' B';
    return (n / 1024).toFixed(1) + ' KB';
  },
};
