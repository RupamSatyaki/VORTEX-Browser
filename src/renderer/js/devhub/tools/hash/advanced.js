// hash/advanced.js - Password Strength, Hash Detector, Salted Hash, PBKDF2, CRC32/Adler32
var HashAdvanced = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="hash-adv-wrap">',

      // Sub-tabs
      '<div class="hash-sub-tabs">',
      '<button class="hash-sub-tab active" data-sub="password">Password</button>',
      '<button class="hash-sub-tab" data-sub="detector">Detector</button>',
      '<button class="hash-sub-tab" data-sub="salted">Salted Hash</button>',
      '<button class="hash-sub-tab" data-sub="pbkdf2">PBKDF2</button>',
      '<button class="hash-sub-tab" data-sub="checksum">Checksum</button>',
      '</div>',

      // ── Password Strength ──
      '<div class="hash-sub-content" id="ha-sub-password">',
      '<div class="hash-io-label"><span>Password</span></div>',
      '<div class="hash-pw-input-row">',
      '<input class="dh-input hash-pw-input" id="ha-pw-input" type="text" placeholder="Enter password to analyze\u2026" spellcheck="false" autocomplete="off"/>',
      '<button class="dh-btn hash-action-btn" id="ha-pw-toggle" title="Show/hide">&#128065;</button>',
      '</div>',
      '<div id="ha-pw-result" style="margin-top:10px;"></div>',
      '</div>',

      // ── Hash Detector ──
      '<div class="hash-sub-content" id="ha-sub-detector" style="display:none">',
      '<div class="hash-io-label"><span>Paste any hash</span></div>',
      '<input class="dh-input" id="ha-det-input" type="text" placeholder="e.g. 5d41402abc4b2a76b9719d911017c592" spellcheck="false" style="width:100%;font-family:monospace;font-size:11.5px;"/>',
      '<div id="ha-det-result" style="margin-top:10px;"></div>',
      '</div>',

      // ── Salted Hash ──
      '<div class="hash-sub-content" id="ha-sub-salted" style="display:none">',
      '<div class="hash-io-label"><span>Text to hash</span></div>',
      '<input class="dh-input" id="ha-salt-text" type="text" placeholder="password or text\u2026" spellcheck="false" style="width:100%;margin-bottom:8px;"/>',
      '<div class="hash-salt-row">',
      '<div class="hash-io-label" style="margin-bottom:4px;"><span>Salt</span></div>',
      '<div style="display:flex;gap:6px;align-items:center;">',
      '<input class="dh-input" id="ha-salt-val" type="text" placeholder="salt value\u2026" spellcheck="false" style="flex:1;font-family:monospace;"/>',
      '<button class="dh-btn hash-action-btn" id="ha-salt-gen">Random</button>',
      '</div>',
      '</div>',
      '<div class="hash-algo-row" style="margin-top:8px;">',
      '<span class="hash-algo-label">Algorithm:</span>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-algo" value="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-algo" value="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-algo" value="MD5" class="hash-checkbox"/> MD5</label>',
      '</div>',
      '<div class="hash-salt-format-row">',
      '<span class="hash-algo-label">Format:</span>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-fmt" value="dollar" checked class="hash-checkbox"/> $salt$hash</label>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-fmt" value="colon" class="hash-checkbox"/> salt:hash</label>',
      '<label class="hash-algo-check"><input type="radio" name="ha-salt-fmt" value="json" class="hash-checkbox"/> JSON</label>',
      '</div>',
      '<button class="dh-btn primary hash-action-btn" id="ha-salt-run" style="margin-top:8px;">Generate Salted Hash</button>',
      '<div class="hash-result-item" id="ha-salt-result" style="display:none;margin-top:8px;">',
      '<div class="hash-result-val" id="ha-salt-out" style="word-break:break-all;"></div>',
      '<button class="dh-btn hash-action-btn" id="ha-salt-copy">Copy</button>',
      '</div>',
      '</div>',

      // ── PBKDF2 ──
      '<div class="hash-sub-content" id="ha-sub-pbkdf2" style="display:none">',
      '<div class="hash-pbkdf2-grid">',
      '<div class="hash-pbkdf2-field"><label>Password</label><input class="dh-input" id="ha-p2-pass" type="password" placeholder="password\u2026" spellcheck="false"/></div>',
      '<div class="hash-pbkdf2-field"><label>Salt</label><div style="display:flex;gap:4px;"><input class="dh-input" id="ha-p2-salt" type="text" placeholder="salt\u2026" spellcheck="false" style="flex:1;"/><button class="dh-btn hash-action-btn" id="ha-p2-salt-gen">Rand</button></div></div>',
      '<div class="hash-pbkdf2-field"><label>Iterations</label><input class="dh-input" id="ha-p2-iter" type="number" value="100000" min="1000" max="1000000"/></div>',
      '<div class="hash-pbkdf2-field"><label>Key length (bytes)</label><input class="dh-input" id="ha-p2-len" type="number" value="32" min="16" max="64"/></div>',
      '<div class="hash-pbkdf2-field"><label>Hash</label><select class="dh-input" id="ha-p2-hash" style="font-size:11.5px;padding:5px 8px;"><option value="SHA-256">SHA-256</option><option value="SHA-512">SHA-512</option><option value="SHA-1">SHA-1</option></select></div>',
      '</div>',
      '<button class="dh-btn primary hash-action-btn" id="ha-p2-run" style="margin-top:8px;">Derive Key</button>',
      '<div class="hash-pbkdf2-result" id="ha-p2-result" style="display:none;margin-top:8px;"></div>',
      '</div>',

      // ── Checksum ──
      '<div class="hash-sub-content" id="ha-sub-checksum" style="display:none">',
      '<div class="hash-batch-info">Verify file integrity by comparing checksums</div>',
      '<div class="hash-checksum-drop" id="ha-cs-drop">',
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2e6060" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      '<span>Drop file or <label style="color:#00c8b4;cursor:pointer"><input type="file" id="ha-cs-file" style="display:none"/>click to choose</label></span>',
      '</div>',
      '<div class="hash-cs-expected-row">',
      '<input class="dh-input" id="ha-cs-expected" type="text" placeholder="Paste expected checksum here\u2026" spellcheck="false" style="flex:1;font-family:monospace;font-size:11.5px;"/>',
      '</div>',
      '<div id="ha-cs-result" style="margin-top:8px;"></div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };

    // Sub-tab switching
    container.querySelectorAll('.hash-sub-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.hash-sub-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.hash-sub-content').forEach(function(c) { c.style.display = 'none'; });
        tab.classList.add('active');
        $('ha-sub-' + tab.dataset.sub).style.display = '';
      });
    });

    // ── Password Strength ──────────────────────────────────────────────────────
    var _pwVisible = false;
    $('ha-pw-toggle').addEventListener('click', function() {
      _pwVisible = !_pwVisible;
      $('ha-pw-input').type = _pwVisible ? 'text' : 'password';
    });

    var COMMON_PASSWORDS = ['password','123456','password123','admin','letmein','qwerty','abc123','monkey','1234567890','iloveyou','welcome','login','master','hello','dragon','pass','test','user'];

    $('ha-pw-input').addEventListener('input', function() {
      var pw = $('ha-pw-input').value;
      var res = $('ha-pw-result');
      if (!pw) { res.innerHTML = ''; return; }

      var len = pw.length;
      var hasLower  = /[a-z]/.test(pw);
      var hasUpper  = /[A-Z]/.test(pw);
      var hasDigit  = /[0-9]/.test(pw);
      var hasSymbol = /[^a-zA-Z0-9]/.test(pw);
      var isCommon  = COMMON_PASSWORDS.indexOf(pw.toLowerCase()) !== -1;

      var charsetSize = 0;
      if (hasLower)  charsetSize += 26;
      if (hasUpper)  charsetSize += 26;
      if (hasDigit)  charsetSize += 10;
      if (hasSymbol) charsetSize += 32;
      charsetSize = charsetSize || 26;

      var entropy = Math.round(len * Math.log2(charsetSize));
      var score = 0;
      if (len >= 8)  score++;
      if (len >= 12) score++;
      if (len >= 16) score++;
      if (hasLower && hasUpper) score++;
      if (hasDigit) score++;
      if (hasSymbol) score++;
      if (!isCommon) score++;
      score = Math.min(score, 5);

      var labels = ['Very Weak','Weak','Fair','Good','Strong','Very Strong'];
      var colors = ['#ef4444','#f97316','#eab308','#22c55e','#00c8b4','#a78bfa'];
      var label = labels[score]; var color = colors[score];

      // Crack time estimate
      var guessesPerSec = 1e10; // 10 billion/sec (GPU)
      var combinations = Math.pow(charsetSize, len);
      var seconds = combinations / guessesPerSec / 2;
      var crackTime = seconds < 1 ? 'instantly' :
        seconds < 60 ? Math.round(seconds) + ' seconds' :
        seconds < 3600 ? Math.round(seconds/60) + ' minutes' :
        seconds < 86400 ? Math.round(seconds/3600) + ' hours' :
        seconds < 31536000 ? Math.round(seconds/86400) + ' days' :
        seconds < 3153600000 ? Math.round(seconds/31536000) + ' years' :
        'centuries';

      res.innerHTML =
        '<div class="hash-pw-strength-bar"><div class="hash-pw-fill" style="width:' + (score/5*100) + '%;background:' + color + '"></div></div>' +
        '<div class="hash-pw-label" style="color:' + color + '">' + label + '</div>' +
        (isCommon ? '<div class="hash-pw-warn">\u26a0 Common password \u2014 easily guessable</div>' : '') +
        '<div class="hash-pw-grid">' +
        '<div class="hash-pw-stat"><span class="hash-pw-stat-k">Length</span><span class="hash-pw-stat-v">' + len + '</span></div>' +
        '<div class="hash-pw-stat"><span class="hash-pw-stat-k">Entropy</span><span class="hash-pw-stat-v">' + entropy + ' bits</span></div>' +
        '<div class="hash-pw-stat"><span class="hash-pw-stat-k">Charset</span><span class="hash-pw-stat-v">' + charsetSize + '</span></div>' +
        '<div class="hash-pw-stat"><span class="hash-pw-stat-k">Crack time</span><span class="hash-pw-stat-v">' + crackTime + '</span></div>' +
        '</div>' +
        '<div class="hash-pw-checks">' +
        _pwCheck(len >= 8,  'At least 8 characters') +
        _pwCheck(len >= 12, 'At least 12 characters') +
        _pwCheck(hasLower,  'Lowercase letters') +
        _pwCheck(hasUpper,  'Uppercase letters') +
        _pwCheck(hasDigit,  'Numbers') +
        _pwCheck(hasSymbol, 'Special characters') +
        _pwCheck(!isCommon, 'Not a common password') +
        '</div>';
    });

    function _pwCheck(ok, label) {
      return '<div class="hash-pw-check ' + (ok ? 'ok' : 'fail') + '">' +
        (ok ? '\u2713' : '\u2717') + ' ' + label + '</div>';
    }

    // ── Hash Detector ──────────────────────────────────────────────────────────
    var HASH_PATTERNS = [
      { name:'MD5',        len:32,  pattern:/^[a-f0-9]{32}$/i,   note:'128-bit, cryptographically broken' },
      { name:'SHA-1',      len:40,  pattern:/^[a-f0-9]{40}$/i,   note:'160-bit, deprecated for security' },
      { name:'SHA-256',    len:64,  pattern:/^[a-f0-9]{64}$/i,   note:'256-bit, widely used' },
      { name:'SHA-384',    len:96,  pattern:/^[a-f0-9]{96}$/i,   note:'384-bit' },
      { name:'SHA-512',    len:128, pattern:/^[a-f0-9]{128}$/i,  note:'512-bit, very strong' },
      { name:'bcrypt',     len:60,  pattern:/^\$2[aby]\$\d{2}\$.{53}$/, note:'Password hash, includes salt+cost' },
      { name:'SHA-256 (Base64)', len:44, pattern:/^[A-Za-z0-9+/]{43}=$/, note:'SHA-256 in Base64 encoding' },
      { name:'CRC32',      len:8,   pattern:/^[a-f0-9]{8}$/i,    note:'32-bit checksum' },
      { name:'Adler-32',   len:8,   pattern:/^[a-f0-9]{8}$/i,    note:'32-bit checksum (same length as CRC32)' },
      { name:'NTLM',       len:32,  pattern:/^[a-f0-9]{32}$/i,   note:'Windows password hash (same as MD5 length)' },
    ];

    $('ha-det-input').addEventListener('input', function() {
      var val = $('ha-det-input').value.trim();
      var res = $('ha-det-result');
      if (!val) { res.innerHTML = ''; return; }
      var matches = HASH_PATTERNS.filter(function(p) { return p.pattern.test(val); });
      if (!matches.length) {
        res.innerHTML = '<div style="font-size:11.5px;color:#4a8080">Unknown hash format (length: ' + val.length + ')</div>';
        return;
      }
      res.innerHTML = '<div class="hash-det-count">' + matches.length + ' possible match' + (matches.length !== 1 ? 'es' : '') + '</div>' +
        matches.map(function(m) {
          return '<div class="hash-det-item">' +
            '<span class="hash-det-name">' + m.name + '</span>' +
            '<span class="hash-det-note">' + m.note + '</span>' +
            '<span class="hash-det-len">' + m.len + ' chars</span>' +
            '</div>';
        }).join('');
    });

    // ── Salted Hash ────────────────────────────────────────────────────────────
    function genSalt(len) {
      var arr = new Uint8Array(len || 16);
      crypto.getRandomValues(arr);
      return Array.from(arr).map(function(b) { return b.toString(16).padStart(2,'0'); }).join('');
    }

    $('ha-salt-gen').addEventListener('click', function() { $('ha-salt-val').value = genSalt(16); });

    $('ha-salt-run').addEventListener('click', async function() {
      var text = $('ha-salt-text').value;
      var salt = $('ha-salt-val').value;
      if (!text) { setStatus('\u2717 Enter text', false); return; }
      if (!salt) { $('ha-salt-val').value = salt = genSalt(16); }
      var algo = container.querySelector('input[name="ha-salt-algo"]:checked').value;
      var fmt  = container.querySelector('input[name="ha-salt-fmt"]:checked').value;
      try {
        var hash = await HashUtils.digest(algo, salt + text);
        var out;
        if (fmt === 'dollar') out = '$' + salt + '$' + hash;
        else if (fmt === 'colon') out = salt + ':' + hash;
        else out = JSON.stringify({ algo: algo, salt: salt, hash: hash }, null, 2);
        $('ha-salt-out').textContent = out;
        $('ha-salt-result').style.display = '';
        $('ha-salt-copy').onclick = function() { navigator.clipboard.writeText(out); setStatus('Copied!', true); };
        setStatus('\u2713 Salted hash generated', true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    });

    // ── PBKDF2 ────────────────────────────────────────────────────────────────
    $('ha-p2-salt-gen').addEventListener('click', function() { $('ha-p2-salt').value = genSalt(16); });

    $('ha-p2-run').addEventListener('click', async function() {
      var pass = $('ha-p2-pass').value;
      var salt = $('ha-p2-salt').value;
      var iter = +$('ha-p2-iter').value || 100000;
      var keyLen = +$('ha-p2-len').value || 32;
      var hashAlgo = $('ha-p2-hash').value;
      if (!pass || !salt) { setStatus('\u2717 Need password and salt', false); return; }
      var res = $('ha-p2-result');
      res.innerHTML = '<div style="font-size:11px;color:#4a8080">Deriving key\u2026 (' + iter.toLocaleString() + ' iterations)</div>';
      res.style.display = '';
      try {
        var passBytes = new TextEncoder().encode(pass);
        var saltBytes = new TextEncoder().encode(salt);
        var keyMaterial = await crypto.subtle.importKey('raw', passBytes, 'PBKDF2', false, ['deriveBits']);
        var bits = await crypto.subtle.deriveBits(
          { name:'PBKDF2', salt:saltBytes, iterations:iter, hash:hashAlgo },
          keyMaterial, keyLen * 8
        );
        var hex = HashUtils._bufToHex(bits);
        var b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(bits)));
        res.innerHTML =
          '<div class="hash-result-item">' +
          '<div class="hash-result-header"><span class="hash-result-algo">PBKDF2-' + hashAlgo + '</span><span class="hash-result-len">' + keyLen + ' bytes</span></div>' +
          '<div class="hash-result-val">' + hex + '</div>' +
          '<div style="font-size:10.5px;color:#4a8080;margin-top:4px;">Base64: ' + b64 + '</div>' +
          '<div style="font-size:10px;color:#2e6060;margin-top:4px;">Iterations: ' + iter.toLocaleString() + ' \u00b7 Salt: ' + salt + '</div>' +
          '<button class="dh-btn hash-action-btn" id="ha-p2-copy-hex">Copy Hex</button>' +
          '<button class="dh-btn hash-action-btn" id="ha-p2-copy-b64" style="margin-left:4px;">Copy Base64</button>' +
          '</div>';
        document.getElementById('ha-p2-copy-hex').onclick = function() { navigator.clipboard.writeText(hex); setStatus('Hex copied!', true); };
        document.getElementById('ha-p2-copy-b64').onclick = function() { navigator.clipboard.writeText(b64); setStatus('Base64 copied!', true); };
        setStatus('\u2713 Key derived', true);
      } catch(e) { res.innerHTML = '<span style="color:#ef4444">\u2717 ' + e.message + '</span>'; }
    });

    // ── Checksum Verifier ─────────────────────────────────────────────────────
    var _csHashes = {};
    var _csFile = null;

    async function runChecksum(file) {
      _csFile = file;
      var res = $('ha-cs-result');
      res.innerHTML = '<div style="font-size:11px;color:#4a8080">Computing checksums\u2026</div>';
      try {
        _csHashes = await HashUtils.hashFile(file, ['MD5','SHA-1','SHA-256','SHA-512'], null);
        var expected = $('ha-cs-expected').value.trim().toLowerCase().replace(/\s/g,'');
        renderChecksumResult(expected);
      } catch(e) { res.innerHTML = '<span style="color:#ef4444">\u2717 ' + e.message + '</span>'; }
    }

    function renderChecksumResult(expected) {
      var res = $('ha-cs-result');
      var algos = ['MD5','SHA-1','SHA-256','SHA-512'];
      var matchAlgo = null;
      if (expected) {
        algos.forEach(function(a) { if (_csHashes[a] === expected) matchAlgo = a; });
      }
      res.innerHTML =
        (expected ? (matchAlgo
          ? '<div class="hash-cmp-match" style="margin-bottom:8px;">\u2713 Checksum verified \u2014 matches ' + matchAlgo + '</div>'
          : '<div class="hash-cmp-nomatch" style="margin-bottom:8px;">\u2717 Checksum does NOT match any algorithm</div>') : '') +
        '<div class="hash-file-meta" style="margin-bottom:8px;">' +
        '<div class="hash-file-meta-row"><span class="hash-meta-k">File</span><span class="hash-meta-v">' + (_csFile ? _csFile.name : '') + '</span></div>' +
        '<div class="hash-file-meta-row"><span class="hash-meta-k">Size</span><span class="hash-meta-v">' + (_csFile ? HashUtils.fmtBytes(_csFile.size) : '') + '</span></div>' +
        '</div>' +
        algos.map(function(a) {
          var hex = _csHashes[a] || '';
          var isMatch = expected && hex === expected;
          return '<div class="hash-result-item' + (isMatch ? ' hash-cs-match' : '') + '">' +
            '<div class="hash-result-header"><span class="hash-result-algo">' + a + '</span>' +
            (isMatch ? '<span style="color:#22c55e;font-size:10.5px;">\u2713 MATCH</span>' : '') +
            '</div>' +
            '<div class="hash-result-val">' + hex + '</div>' +
            '<button class="dh-btn hash-action-btn hash-copy-btn" data-hex="' + hex + '">Copy</button>' +
            '</div>';
        }).join('');
      res.querySelectorAll('.hash-copy-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { navigator.clipboard.writeText(btn.dataset.hex); setStatus('Copied!', true); });
      });
    }

    var csDrop = $('ha-cs-drop');
    csDrop.addEventListener('dragover',  function(e) { e.preventDefault(); csDrop.classList.add('hash-drop-active'); });
    csDrop.addEventListener('dragleave', function()  { csDrop.classList.remove('hash-drop-active'); });
    csDrop.addEventListener('drop', function(e) { e.preventDefault(); csDrop.classList.remove('hash-drop-active'); runChecksum(e.dataTransfer.files[0]); });
    $('ha-cs-file').addEventListener('change', function(e) { runChecksum(e.target.files[0]); e.target.value = ''; });
    $('ha-cs-expected').addEventListener('input', function() {
      if (_csFile && Object.keys(_csHashes).length) renderChecksumResult($('ha-cs-expected').value.trim().toLowerCase().replace(/\s/g,''));
    });
  },
};
