// hash/utils.js - Web Crypto API hash utilities
var HashUtils = {

  ALGOS: ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'],

  // Web Crypto digest (returns hex string)
  digest: async function(algo, data) {
    if (algo === 'MD5') return HashUtils._md5(typeof data === 'string' ? data : new TextDecoder().decode(data));
    var cryptoAlgo = algo; // SHA-1, SHA-256, SHA-384, SHA-512
    var bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    var buf = await crypto.subtle.digest(cryptoAlgo, bytes);
    return HashUtils._bufToHex(buf);
  },

  // HMAC-SHA256
  hmac: async function(key, message) {
    var keyBytes = new TextEncoder().encode(key);
    var msgBytes = new TextEncoder().encode(message);
    var cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    var sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
    return HashUtils._bufToHex(sig);
  },

  // Hash a File object, returns { algo: hex } map
  hashFile: async function(file, algos, onProgress) {
    var buf = await HashUtils._readFileBuffer(file, onProgress);
    var results = {};
    for (var i = 0; i < algos.length; i++) {
      results[algos[i]] = await HashUtils.digest(algos[i], buf);
    }
    return results;
  },

  _readFileBuffer: function(file, onProgress) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onprogress = function(e) { if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total); };
      reader.onload = function(e) { resolve(new Uint8Array(e.target.result)); };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  _bufToHex: function(buf) {
    return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
  },

  // Pure-JS MD5 (no Web Crypto support)
  _md5: function(str) {
    function safeAdd(x, y) { var lsw=(x&0xFFFF)+(y&0xFFFF); var msw=(x>>16)+(y>>16)+(lsw>>16); return (msw<<16)|(lsw&0xFFFF); }
    function bitRotateLeft(num, cnt) { return (num<<cnt)|(num>>>(32-cnt)); }
    function md5cmn(q,a,b,x,s,t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b); }
    function md5ff(a,b,c,d,x,s,t) { return md5cmn((b&c)|((~b)&d),a,b,x,s,t); }
    function md5gg(a,b,c,d,x,s,t) { return md5cmn((b&d)|(c&(~d)),a,b,x,s,t); }
    function md5hh(a,b,c,d,x,s,t) { return md5cmn(b^c^d,a,b,x,s,t); }
    function md5ii(a,b,c,d,x,s,t) { return md5cmn(c^(b|(~d)),a,b,x,s,t); }
    var utf8 = unescape(encodeURIComponent(str));
    var msg = [];
    for (var i=0;i<utf8.length;i++) msg.push(utf8.charCodeAt(i));
    msg.push(0x80);
    while (msg.length%64!==56) msg.push(0);
    var len = utf8.length*8;
    msg.push(len&0xFF,(len>>8)&0xFF,(len>>16)&0xFF,(len>>24)&0xFF,0,0,0,0);
    var M=[];
    for (var i=0;i<msg.length;i+=4) M.push(msg[i]|(msg[i+1]<<8)|(msg[i+2]<<16)|(msg[i+3]<<24));
    var a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
    for (var i=0;i<M.length;i+=16) {
      var A=a,B=b,C=c,D=d;
      a=md5ff(a,b,c,d,M[i+0],7,-680876936);d=md5ff(d,a,b,c,M[i+1],12,-389564586);c=md5ff(c,d,a,b,M[i+2],17,606105819);b=md5ff(b,c,d,a,M[i+3],22,-1044525330);
      a=md5ff(a,b,c,d,M[i+4],7,-176418897);d=md5ff(d,a,b,c,M[i+5],12,1200080426);c=md5ff(c,d,a,b,M[i+6],17,-1473231341);b=md5ff(b,c,d,a,M[i+7],22,-45705983);
      a=md5ff(a,b,c,d,M[i+8],7,1770035416);d=md5ff(d,a,b,c,M[i+9],12,-1958414417);c=md5ff(c,d,a,b,M[i+10],17,-42063);b=md5ff(b,c,d,a,M[i+11],22,-1990404162);
      a=md5ff(a,b,c,d,M[i+12],7,1804603682);d=md5ff(d,a,b,c,M[i+13],12,-40341101);c=md5ff(c,d,a,b,M[i+14],17,-1502002290);b=md5ff(b,c,d,a,M[i+15],22,1236535329);
      a=md5gg(a,b,c,d,M[i+1],5,-165796510);d=md5gg(d,a,b,c,M[i+6],9,-1069501632);c=md5gg(c,d,a,b,M[i+11],14,643717713);b=md5gg(b,c,d,a,M[i+0],20,-373897302);
      a=md5gg(a,b,c,d,M[i+5],5,-701558691);d=md5gg(d,a,b,c,M[i+10],9,38016083);c=md5gg(c,d,a,b,M[i+15],14,-660478335);b=md5gg(b,c,d,a,M[i+4],20,-405537848);
      a=md5gg(a,b,c,d,M[i+9],5,568446438);d=md5gg(d,a,b,c,M[i+14],9,-1019803690);c=md5gg(c,d,a,b,M[i+3],14,-187363961);b=md5gg(b,c,d,a,M[i+8],20,1163531501);
      a=md5gg(a,b,c,d,M[i+13],5,-1444681467);d=md5gg(d,a,b,c,M[i+2],9,-51403784);c=md5gg(c,d,a,b,M[i+7],14,1735328473);b=md5gg(b,c,d,a,M[i+12],20,-1926607734);
      a=md5hh(a,b,c,d,M[i+5],4,-378558);d=md5hh(d,a,b,c,M[i+8],11,-2022574463);c=md5hh(c,d,a,b,M[i+11],16,1839030562);b=md5hh(b,c,d,a,M[i+14],23,-35309556);
      a=md5hh(a,b,c,d,M[i+1],4,-1530992060);d=md5hh(d,a,b,c,M[i+4],11,1272893353);c=md5hh(c,d,a,b,M[i+7],16,-155497632);b=md5hh(b,c,d,a,M[i+10],23,-1094730640);
      a=md5hh(a,b,c,d,M[i+13],4,681279174);d=md5hh(d,a,b,c,M[i+0],11,-358537222);c=md5hh(c,d,a,b,M[i+3],16,-722521979);b=md5hh(b,c,d,a,M[i+6],23,76029189);
      a=md5hh(a,b,c,d,M[i+9],4,-640364487);d=md5hh(d,a,b,c,M[i+12],11,-421815835);c=md5hh(c,d,a,b,M[i+15],16,530742520);b=md5hh(b,c,d,a,M[i+2],23,-995338651);
      a=md5ii(a,b,c,d,M[i+0],6,-198630844);d=md5ii(d,a,b,c,M[i+7],10,1126891415);c=md5ii(c,d,a,b,M[i+14],15,-1416354905);b=md5ii(b,c,d,a,M[i+5],21,-57434055);
      a=md5ii(a,b,c,d,M[i+12],6,1700485571);d=md5ii(d,a,b,c,M[i+3],10,-1894986606);c=md5ii(c,d,a,b,M[i+10],15,-1051523);b=md5ii(b,c,d,a,M[i+1],21,-2054922799);
      a=md5ii(a,b,c,d,M[i+8],6,1873313359);d=md5ii(d,a,b,c,M[i+15],10,-30611744);c=md5ii(c,d,a,b,M[i+6],15,-1560198380);b=md5ii(b,c,d,a,M[i+13],21,1309151649);
      a=md5ii(a,b,c,d,M[i+4],6,-145523070);d=md5ii(d,a,b,c,M[i+11],10,-1120210379);c=md5ii(c,d,a,b,M[i+2],15,718787259);b=md5ii(b,c,d,a,M[i+9],21,-343485551);
      a=safeAdd(a,A);b=safeAdd(b,B);c=safeAdd(c,C);d=safeAdd(d,D);
    }
    function le32(n){return String.fromCharCode(n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255);}
    var raw=le32(a)+le32(b)+le32(c)+le32(d);
    var hex='';
    for(var i=0;i<raw.length;i++) hex+=('0'+raw.charCodeAt(i).toString(16)).slice(-2);
    return hex;
  },

  fmtBytes: function(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
    return (n/1024/1024).toFixed(2) + ' MB';
  },

  compareHashes: function(a, b) {
    var clean = function(s) { return s.trim().toLowerCase().replace(/\s/g,''); };
    return clean(a) === clean(b);
  },
};
