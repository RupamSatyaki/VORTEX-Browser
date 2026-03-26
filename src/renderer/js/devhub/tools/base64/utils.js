/**
 * base64/utils.js — Shared Base64 utilities
 */
const B64Utils = {

  // ── Encode / Decode ──────────────────────────────────────────────────────────
  encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  },

  decode(b64) {
    return decodeURIComponent(escape(atob(b64.trim())));
  },

  encodeUrlSafe(str) {
    return this.encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  decodeUrlSafe(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return this.decode(s);
  },

  // ── Validate ─────────────────────────────────────────────────────────────────
  isValid(str) {
    try {
      const s = str.trim().replace(/\s/g, '');
      return /^[A-Za-z0-9+/]*={0,2}$/.test(s) && s.length % 4 === 0;
    } catch { return false; }
  },

  isUrlSafe(str) {
    return /^[A-Za-z0-9\-_]*$/.test(str.trim());
  },

  // ── Auto-detect ───────────────────────────────────────────────────────────────
  autoDetect(str) {
    const s = str.trim().replace(/\s/g, '');
    if (!s) return 'empty';
    if (this.isValid(s) && s.length > 8) return 'base64';
    if (this.isUrlSafe(s) && s.length > 8) return 'urlsafe';
    return 'plain';
  },

  // ── Chunked (MIME 76-char lines) ──────────────────────────────────────────────
  chunk(b64, size = 76) {
    return b64.match(new RegExp(`.{1,${size}}`, 'g'))?.join('\n') || b64;
  },

  // ── Size info ─────────────────────────────────────────────────────────────────
  sizeInfo(original, encoded) {
    const origBytes = new TextEncoder().encode(original).length;
    const encBytes  = new TextEncoder().encode(encoded).length;
    const overhead  = origBytes > 0 ? (((encBytes - origBytes) / origBytes) * 100).toFixed(1) : 0;
    return {
      origBytes,
      encBytes,
      origKB:   (origBytes / 1024).toFixed(2),
      encKB:    (encBytes  / 1024).toFixed(2),
      overhead: `+${overhead}%`,
    };
  },

  // ── Format bytes ─────────────────────────────────────────────────────────────
  fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  },

  // ── Embed code generators ─────────────────────────────────────────────────────
  htmlImgTag(dataUri) {
    return `<img src="${dataUri}" alt="image" />`;
  },

  cssBackground(dataUri) {
    return `background-image: url('${dataUri}');`;
  },

  jsonEmbed(b64, mime = 'application/octet-stream') {
    return `{\n  "data": "data:${mime};base64,${b64}"\n}`;
  },

  markdownImg(dataUri) {
    return `![image](${dataUri})`;
  },
};
