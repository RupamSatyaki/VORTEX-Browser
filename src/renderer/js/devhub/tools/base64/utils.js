// base64/utils.js - Shared Base64 utilities
var B64Utils = {

  encode: function(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  },

  decode: function(b64) {
    var bin = atob(b64.trim().replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  },

  encodeUrlSafe: function(str) {
    return this.encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  decodeUrlSafe: function(str) {
    var s = str.trim().replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return this.decode(s);
  },

  toHex: function(b64) {
    try {
      var bin = atob(b64.trim().replace(/\s/g, ''));
      var result = [];
      for (var i = 0; i < bin.length; i++) {
        result.push(bin.charCodeAt(i).toString(16).padStart(2, '0'));
      }
      return result.join(' ');
    } catch(e) { return ''; }
  },

  isValid: function(str) {
    var s = str.trim().replace(/\s/g, '');
    if (!s) return false;
    return /^[A-Za-z0-9+/]*={0,2}$/.test(s) && s.length % 4 === 0;
  },

  isUrlSafe: function(str) {
    var s = str.trim().replace(/\s/g, '');
    return s.length > 0 && /^[A-Za-z0-9\-_]+$/.test(s);
  },

  autoDetect: function(str) {
    var s = str.trim().replace(/\s/g, '');
    if (!s) return 'empty';
    if (s.indexOf('data:') === 0 && s.indexOf(';base64,') !== -1) return 'datauri';
    if (/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/.test(s)) return 'jwt';
    if (this.isValid(s) && s.length > 8) return 'base64';
    if (this.isUrlSafe(s) && s.length > 8) return 'urlsafe';
    return 'plain';
  },

  chunk: function(b64, size) {
    size = size || 76;
    var clean = b64.replace(/\s/g, '');
    var re = new RegExp('.{1,' + size + '}', 'g');
    var parts = clean.match(re);
    return parts ? parts.join('\n') : b64;
  },

  sizeInfo: function(origBytes, encStr) {
    var encBytes = new TextEncoder().encode(encStr).length;
    var overhead = origBytes > 0 ? (((encBytes - origBytes) / origBytes) * 100).toFixed(1) : 0;
    return { origBytes: origBytes, encBytes: encBytes, overhead: '+' + overhead + '%' };
  },

  fmtBytes: function(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  },

  htmlImgTag: function(dataUri) { return '<img src="' + dataUri + '" alt="image" />'; },
  cssBackground: function(dataUri) { return "background-image: url('" + dataUri + "');"; },
  jsonEmbed: function(b64, mime) {
    mime = mime || 'application/octet-stream';
    return '{\n  "data": "data:' + mime + ';base64,' + b64 + '"\n}';
  },
  markdownImg: function(dataUri) { return '![image](' + dataUri + ')'; },

  asCode: function(b64, lang) {
    if (lang === 'js')   return 'const base64 = "' + b64 + '";';
    if (lang === 'ts')   return 'const base64 = "' + b64 + '"; // string';
    if (lang === 'py')   return 'base64_str = "' + b64 + '"';
    if (lang === 'java') return 'String base64 = "' + b64 + '";';
    if (lang === 'go')   return 'base64Str := "' + b64 + '"';
    if (lang === 'cs')   return 'string base64 = "' + b64 + '";';
    return b64;
  },

  decodeJWT: function(token) {
    var parts = token.trim().split('.');
    if (parts.length !== 3) throw new Error('Not a valid JWT (need 3 parts)');
    function decPart(p) {
      var s = p.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return JSON.parse(atob(s));
    }
    return { header: decPart(parts[0]), payload: decPart(parts[1]), signature: parts[2], raw: parts };
  },
};
