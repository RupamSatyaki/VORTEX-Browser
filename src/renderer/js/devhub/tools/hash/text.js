// hash/text.js - Text hashing component
var HashText = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="hash-text-wrap">',

      // Input
      '<div class="hash-io-label"><span>Input Text</span><button class="hash-io-clear" id="ht-clear-in">\u2715</button></div>',
      '<textarea class="dh-textarea hash-textarea" id="ht-input" placeholder="Type or paste text to hash\u2026" spellcheck="false"></textarea>',

      // Options row
      '<div class="hash-options-row">',
      '<label class="hash-opt-label"><input type="checkbox" id="ht-live" checked class="hash-checkbox"/> Live hash</label>',
      '<label class="hash-opt-label"><input type="checkbox" id="ht-upper" class="hash-checkbox"/> Uppercase</label>',
      '<div class="hash-char-info" id="ht-char-info"></div>',
      '</div>',

      // Algorithm selector
      '<div class="hash-algo-row">',
      '<span class="hash-algo-label">Algorithms:</span>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="MD5"    checked class="hash-checkbox"/> MD5</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-1"  checked class="hash-checkbox"/> SHA-1</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-384" class="hash-checkbox"/> SHA-384</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '</div>',

      // Action buttons
      '<div class="hash-actions-row">',
      '<button class="dh-btn primary hash-action-btn" id="ht-hash-btn">Hash</button>',
      '<button class="dh-btn hash-action-btn" id="ht-copy-all">Copy All</button>',
      '<button class="dh-btn danger hash-action-btn" id="ht-clear-all">Clear</button>',
      '</div>',

      // Results
      '<div class="hash-results" id="ht-results"></div>',

      // HMAC section
      '<div class="hash-hmac-section">',
      '<div class="hash-section-label">HMAC-SHA256</div>',
      '<div class="hash-hmac-row">',
      '<input class="dh-input hash-hmac-key" id="ht-hmac-key" type="text" placeholder="Secret key\u2026" spellcheck="false"/>',
      '<button class="dh-btn primary hash-action-btn" id="ht-hmac-btn">Generate HMAC</button>',
      '</div>',
      '<div class="hash-result-item" id="ht-hmac-result" style="display:none">',
      '<div class="hash-result-algo">HMAC-SHA256</div>',
      '<div class="hash-result-val" id="ht-hmac-val"></div>',
      '<button class="dh-btn hash-action-btn hash-copy-btn" id="ht-hmac-copy">Copy</button>',
      '</div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _results = {};

    function getSelectedAlgos() {
      return Array.from(container.querySelectorAll('.hash-algo-check input:checked')).map(function(cb) { return cb.dataset.algo; });
    }

    function fmt(hex) { return $('ht-upper').checked ? hex.toUpperCase() : hex.toLowerCase(); }

    function renderResults() {
      var res = $('ht-results');
      var algos = getSelectedAlgos();
      if (!algos.length || !Object.keys(_results).length) { res.innerHTML = ''; return; }
      res.innerHTML = algos.filter(function(a) { return _results[a]; }).map(function(algo) {
        var hex = fmt(_results[algo]);
        return '<div class="hash-result-item">' +
          '<div class="hash-result-header">' +
          '<span class="hash-result-algo">' + algo + '</span>' +
          '<span class="hash-result-len">' + hex.length/2 + ' bytes</span>' +
          '</div>' +
          '<div class="hash-result-val hash-result-val-' + algo.replace('-','').toLowerCase() + '">' + hex + '</div>' +
          '<button class="dh-btn hash-action-btn hash-copy-btn" data-hex="' + hex + '">Copy</button>' +
          '</div>';
      }).join('');
      res.querySelectorAll('.hash-copy-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          navigator.clipboard.writeText(btn.dataset.hex);
          setStatus('Copied!', true);
        });
      });
    }

    async function doHash() {
      var text = $('ht-input').value;
      if (!text) { _results = {}; renderResults(); return; }
      var algos = getSelectedAlgos();
      if (!algos.length) return;
      try {
        for (var i = 0; i < algos.length; i++) {
          _results[algos[i]] = await HashUtils.digest(algos[i], text);
        }
        renderResults();
        setStatus('\u2713 Hashed', true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    }

    $('ht-input').addEventListener('input', function() {
      var val = $('ht-input').value;
      $('ht-char-info').textContent = val ? val.length + ' chars \u00b7 ' + new TextEncoder().encode(val).length + ' bytes' : '';
      if ($('ht-live').checked) doHash();
    });

    $('ht-hash-btn').addEventListener('click', doHash);

    $('ht-upper').addEventListener('change', renderResults);

    container.querySelectorAll('.hash-algo-check input').forEach(function(cb) {
      cb.addEventListener('change', function() { if ($('ht-live').checked) doHash(); });
    });

    $('ht-copy-all').addEventListener('click', function() {
      var algos = getSelectedAlgos();
      var lines = algos.filter(function(a) { return _results[a]; }).map(function(a) { return a + ': ' + fmt(_results[a]); });
      if (lines.length) { navigator.clipboard.writeText(lines.join('\n')); setStatus('All copied!', true); }
    });

    $('ht-clear-all').addEventListener('click', function() {
      $('ht-input').value = ''; _results = {}; renderResults();
      $('ht-char-info').textContent = ''; setStatus('', true);
    });
    $('ht-clear-in').addEventListener('click', function() { $('ht-input').value = ''; _results = {}; renderResults(); $('ht-char-info').textContent = ''; });

    $('ht-hmac-btn').addEventListener('click', async function() {
      var text = $('ht-input').value;
      var key  = $('ht-hmac-key').value;
      if (!text || !key) { setStatus('\u2717 Need text and key', false); return; }
      try {
        var hmac = await HashUtils.hmac(key, text);
        var hex = fmt(hmac);
        $('ht-hmac-val').textContent = hex;
        $('ht-hmac-result').style.display = '';
        $('ht-hmac-copy').onclick = function() { navigator.clipboard.writeText(hex); setStatus('HMAC copied!', true); };
        setStatus('\u2713 HMAC generated', true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
  },
};
