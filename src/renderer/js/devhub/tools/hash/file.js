// hash/file.js - File hashing component
var HashFile = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="hash-file-wrap">',

      // Drop zone
      '<div class="hash-drop-zone" id="hf-drop">',
      '<div class="hash-drop-icon">',
      '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#2e6060" stroke-width="1.5">',
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>',
      '<polyline points="14 2 14 8 20 8"/>',
      '<line x1="12" y1="12" x2="12" y2="18"/>',
      '<line x1="9" y1="15" x2="15" y2="15"/>',
      '</svg>',
      '</div>',
      '<div class="hash-drop-text">Drop any file here</div>',
      '<div class="hash-drop-sub">or</div>',
      '<label class="dh-btn" style="cursor:pointer">',
      'Choose File',
      '<input type="file" id="hf-file-input" style="display:none"/>',
      '</label>',
      '<div class="hash-drop-hint">Any file type \u00b7 No size limit</div>',
      '</div>',

      // Algorithm selector
      '<div class="hash-algo-row" id="hf-algo-row" style="display:none">',
      '<span class="hash-algo-label">Hash with:</span>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="MD5"     checked class="hash-checkbox"/> MD5</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-1"   checked class="hash-checkbox"/> SHA-1</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-384" class="hash-checkbox"/> SHA-384</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '</div>',

      // Progress
      '<div class="hash-progress-wrap" id="hf-progress-wrap" style="display:none">',
      '<div class="hash-progress-label" id="hf-progress-label">Reading file\u2026</div>',
      '<div class="hash-progress-track">',
      '<div class="hash-progress-fill" id="hf-progress-fill"></div>',
      '</div>',
      '</div>',

      // File info + results
      '<div class="hash-file-result" id="hf-result" style="display:none">',
      '<div class="hash-file-meta" id="hf-meta"></div>',
      '<div class="hash-options-row" style="margin-top:6px;">',
      '<label class="hash-opt-label"><input type="checkbox" id="hf-upper" class="hash-checkbox"/> Uppercase</label>',
      '<button class="dh-btn hash-action-btn" id="hf-copy-all">Copy All</button>',
      '<button class="dh-btn hash-action-btn" id="hf-rehash">Re-hash</button>',
      '<button class="dh-btn danger hash-action-btn" id="hf-reset">Clear</button>',
      '</div>',
      '<div class="hash-results" id="hf-results"></div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _file = null;
    var _hashes = {};

    function getSelectedAlgos() {
      return Array.from(container.querySelectorAll('#hf-algo-row .hash-algo-check input:checked'))
        .map(function(cb) { return cb.dataset.algo; });
    }

    function fmt(hex) { return $('hf-upper').checked ? hex.toUpperCase() : hex.toLowerCase(); }

    function renderResults() {
      var res = $('hf-results');
      var algos = getSelectedAlgos();
      res.innerHTML = algos.filter(function(a) { return _hashes[a]; }).map(function(algo) {
        var hex = fmt(_hashes[algo]);
        return '<div class="hash-result-item">' +
          '<div class="hash-result-header">' +
          '<span class="hash-result-algo">' + algo + '</span>' +
          '<span class="hash-result-len">' + (hex.length/2) + ' bytes</span>' +
          '</div>' +
          '<div class="hash-result-val">' + hex + '</div>' +
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
      if (!_file) return;
      var algos = getSelectedAlgos();
      if (!algos.length) return;

      $('hf-progress-wrap').style.display = '';
      $('hf-result').style.display = 'none';
      $('hf-progress-fill').style.width = '0%';
      $('hf-progress-label').textContent = 'Reading file\u2026';

      try {
        _hashes = await HashUtils.hashFile(_file, algos, function(pct) {
          $('hf-progress-fill').style.width = Math.round(pct * 100) + '%';
          $('hf-progress-label').textContent = 'Hashing\u2026 ' + Math.round(pct * 100) + '%';
        });
        $('hf-progress-wrap').style.display = 'none';
        $('hf-result').style.display = '';
        renderResults();
        setStatus('\u2713 File hashed', true);
      } catch(e) {
        $('hf-progress-wrap').style.display = 'none';
        setStatus('\u2717 ' + e.message, false);
      }
    }

    function loadFile(file) {
      if (!file) return;
      _file = file;
      _hashes = {};
      $('hf-drop').style.display = 'none';
      $('hf-algo-row').style.display = 'flex';
      $('hf-meta').innerHTML =
        '<div class="hash-file-meta-row"><span class="hash-meta-k">Name</span><span class="hash-meta-v">' + file.name + '</span></div>' +
        '<div class="hash-file-meta-row"><span class="hash-meta-k">Size</span><span class="hash-meta-v">' + HashUtils.fmtBytes(file.size) + '</span></div>' +
        '<div class="hash-file-meta-row"><span class="hash-meta-k">Type</span><span class="hash-meta-v">' + (file.type || 'unknown') + '</span></div>' +
        '<div class="hash-file-meta-row"><span class="hash-meta-k">Modified</span><span class="hash-meta-v">' + new Date(file.lastModified).toLocaleString() + '</span></div>';
      doHash();
    }

    // Drop zone
    var drop = $('hf-drop');
    drop.addEventListener('dragover',  function(e) { e.preventDefault(); drop.classList.add('hash-drop-active'); });
    drop.addEventListener('dragleave', function()  { drop.classList.remove('hash-drop-active'); });
    drop.addEventListener('drop', function(e) { e.preventDefault(); drop.classList.remove('hash-drop-active'); loadFile(e.dataTransfer.files[0]); });
    $('hf-file-input').addEventListener('change', function(e) { loadFile(e.target.files[0]); e.target.value = ''; });

    $('hf-upper').addEventListener('change', renderResults);
    $('hf-rehash').addEventListener('click', doHash);
    $('hf-copy-all').addEventListener('click', function() {
      var algos = getSelectedAlgos();
      var lines = algos.filter(function(a) { return _hashes[a]; }).map(function(a) { return a + ': ' + fmt(_hashes[a]); });
      if (lines.length) { navigator.clipboard.writeText(lines.join('\n')); setStatus('All copied!', true); }
    });
    $('hf-reset').addEventListener('click', function() {
      _file = null; _hashes = {};
      $('hf-drop').style.display = '';
      $('hf-algo-row').style.display = 'none';
      $('hf-result').style.display = 'none';
      $('hf-progress-wrap').style.display = 'none';
      setStatus('', true);
    });

    container.querySelectorAll('#hf-algo-row .hash-algo-check input').forEach(function(cb) {
      cb.addEventListener('change', doHash);
    });
  },
};
