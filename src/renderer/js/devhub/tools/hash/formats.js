// hash/formats.js - Multiple output formats, Hash Visualization, Export
var HashFormats = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="hash-fmt-wrap">',

      // Sub-tabs
      '<div class="hash-sub-tabs">',
      '<button class="hash-sub-tab active" data-sub="formats">Formats</button>',
      '<button class="hash-sub-tab" data-sub="visual">Visualize</button>',
      '<button class="hash-sub-tab" data-sub="export">Export</button>',
      '</div>',

      // ── Formats ──
      '<div class="hash-sub-content" id="hf2-sub-formats">',
      '<div class="hash-io-label"><span>Input text</span></div>',
      '<textarea class="dh-textarea hash-textarea" id="hf2-input" placeholder="Enter text to hash in all formats\u2026" spellcheck="false" style="min-height:60px;"></textarea>',
      '<div class="hash-algo-row" style="margin-top:6px;">',
      '<span class="hash-algo-label">Algorithm:</span>',
      '<label class="hash-algo-check"><input type="radio" name="hf2-algo" value="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="radio" name="hf2-algo" value="MD5" class="hash-checkbox"/> MD5</label>',
      '<label class="hash-algo-check"><input type="radio" name="hf2-algo" value="SHA-1" class="hash-checkbox"/> SHA-1</label>',
      '<label class="hash-algo-check"><input type="radio" name="hf2-algo" value="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '</div>',
      '<button class="dh-btn primary hash-action-btn" id="hf2-run" style="margin-top:6px;">Hash</button>',
      '<div id="hf2-results" style="margin-top:10px;"></div>',
      '</div>',

      // ── Visualize ──
      '<div class="hash-sub-content" id="hf2-sub-visual" style="display:none">',
      '<div class="hash-batch-info">Visual identicon-style representation of any hash</div>',
      '<div class="hash-io-label"><span>Hash or text</span></div>',
      '<input class="dh-input" id="hf2-vis-input" type="text" placeholder="Paste hash or type text\u2026" spellcheck="false" style="width:100%;font-family:monospace;font-size:11.5px;margin-bottom:8px;"/>',
      '<div class="hash-vis-options">',
      '<label class="hash-opt-label"><input type="checkbox" id="hf2-vis-live" checked class="hash-checkbox"/> Live</label>',
      '<select class="dh-input" id="hf2-vis-size" style="font-size:11.5px;padding:4px 8px;"><option value="8">8x8</option><option value="10" selected>10x10</option><option value="12">12x12</option></select>',
      '</div>',
      '<div class="hash-vis-wrap" id="hf2-vis-wrap">',
      '<canvas id="hf2-vis-canvas" class="hash-vis-canvas"></canvas>',
      '<div class="hash-vis-info" id="hf2-vis-info"></div>',
      '</div>',
      '<div class="hash-vis-actions">',
      '<button class="dh-btn hash-action-btn" id="hf2-vis-dl">Download PNG</button>',
      '<button class="dh-btn hash-action-btn" id="hf2-vis-copy-hash">Copy Hash</button>',
      '</div>',
      '</div>',

      // ── Export ──
      '<div class="hash-sub-content" id="hf2-sub-export" style="display:none">',
      '<div class="hash-batch-info">Hash multiple strings and export results</div>',
      '<div class="hash-io-label"><span>Strings to hash (one per line)</span></div>',
      '<textarea class="dh-textarea hash-textarea" id="hf2-exp-input" placeholder="string1&#10;string2&#10;string3" spellcheck="false" style="min-height:80px;"></textarea>',
      '<div class="hash-algo-row" style="margin-top:6px;">',
      '<span class="hash-algo-label">Algorithms:</span>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="MD5"     checked class="hash-checkbox"/> MD5</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-1"   checked class="hash-checkbox"/> SHA-1</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="checkbox" data-algo="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '</div>',
      '<div class="hash-export-actions">',
      '<button class="dh-btn primary hash-action-btn" id="hf2-exp-run">Hash All</button>',
      '<button class="dh-btn hash-action-btn" id="hf2-exp-json">Export JSON</button>',
      '<button class="dh-btn hash-action-btn" id="hf2-exp-csv">Export CSV</button>',
      '<button class="dh-btn hash-action-btn" id="hf2-exp-copy">Copy JSON</button>',
      '</div>',
      '<div class="hash-batch-stats" id="hf2-exp-stats"></div>',
      '<div id="hf2-exp-preview" class="hash-exp-preview"></div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _expData = [];
    var _visHash = '';

    // Sub-tab switching
    container.querySelectorAll('.hash-sub-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.hash-sub-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.hash-sub-content').forEach(function(c) { c.style.display = 'none'; });
        tab.classList.add('active');
        $('hf2-sub-' + tab.dataset.sub).style.display = '';
      });
    });

    // ── Formats ───────────────────────────────────────────────────────────────
    async function runFormats() {
      var text = $('hf2-input').value;
      var algo = container.querySelector('input[name="hf2-algo"]:checked').value;
      var res  = $('hf2-results');
      if (!text) { res.innerHTML = ''; return; }
      try {
        var hex = await HashUtils.digest(algo, text);
        var hexUpper = hex.toUpperCase();
        var hexColon = hex.match(/.{2}/g).join(':');
        var hex0x    = '0x' + hex;
        var b64      = btoa(String.fromCharCode.apply(null, hex.match(/.{2}/g).map(function(h) { return parseInt(h,16); })));
        var b64url   = b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
        var binary   = hex.match(/.{2}/g).map(function(h) { return parseInt(h,16).toString(2).padStart(8,'0'); }).join(' ');

        var formats = [
          { label:'Hex (lowercase)',  val: hex },
          { label:'Hex (uppercase)',  val: hexUpper },
          { label:'Hex with 0x',      val: hex0x },
          { label:'Colon-separated',  val: hexColon },
          { label:'Base64',           val: b64 },
          { label:'Base64URL',        val: b64url },
          { label:'Binary',           val: binary },
        ];

        res.innerHTML = formats.map(function(f) {
          return '<div class="hash-fmt-item">' +
            '<span class="hash-fmt-label">' + f.label + '</span>' +
            '<code class="hash-fmt-val">' + f.val.replace(/</g,'&lt;') + '</code>' +
            '<button class="dh-btn hash-action-btn hash-copy-btn" data-val="' + f.val.replace(/"/g,'&quot;') + '">Copy</button>' +
            '</div>';
        }).join('');
        res.querySelectorAll('.hash-copy-btn').forEach(function(btn) {
          btn.addEventListener('click', function() { navigator.clipboard.writeText(btn.dataset.val); setStatus('Copied!', true); });
        });
        setStatus('\u2713 ' + algo, true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    }

    $('hf2-run').addEventListener('click', runFormats);

    // ── Visualize ─────────────────────────────────────────────────────────────
    async function renderVis(input) {
      if (!input) { $('hf2-vis-info').textContent = ''; return; }
      var isHex = /^[a-f0-9]{32,128}$/i.test(input.trim());
      var hex;
      if (isHex) { hex = input.trim().toLowerCase(); }
      else { hex = await HashUtils.digest('SHA-256', input); }
      _visHash = hex;

      var gridSize = +$('hf2-vis-size').value || 10;
      var cv = $('hf2-vis-canvas');
      var cellSize = Math.floor(200 / gridSize);
      cv.width = gridSize * cellSize; cv.height = gridSize * cellSize;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#060e0e';
      ctx.fillRect(0, 0, cv.width, cv.height);

      // Use hash bytes to color cells — symmetric (identicon style)
      var bytes = hex.match(/.{2}/g).map(function(h) { return parseInt(h,16); });
      var half = Math.ceil(gridSize / 2);
      for (var row = 0; row < gridSize; row++) {
        for (var col = 0; col < half; col++) {
          var idx = (row * half + col) % bytes.length;
          var on = bytes[idx] > 127;
          if (on) {
            var hue = (bytes[idx % bytes.length] / 255 * 360 + 160) % 360;
            ctx.fillStyle = 'hsl(' + hue + ',70%,55%)';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
            // Mirror
            var mirrorCol = gridSize - 1 - col;
            if (mirrorCol !== col) ctx.fillRect(mirrorCol * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }
      $('hf2-vis-info').textContent = hex.slice(0,16) + '\u2026 (' + (hex.length/2) + ' bytes)';
    }

    $('hf2-vis-input').addEventListener('input', async function() {
      if ($('hf2-vis-live').checked) await renderVis($('hf2-vis-input').value.trim());
    });
    $('hf2-vis-dl').addEventListener('click', function() {
      var cv = $('hf2-vis-canvas');
      var a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'hash-visual.png'; a.click();
    });
    $('hf2-vis-copy-hash').addEventListener('click', function() {
      if (_visHash) { navigator.clipboard.writeText(_visHash); setStatus('Hash copied!', true); }
    });

    // ── Export ────────────────────────────────────────────────────────────────
    async function runExport() {
      var lines = $('hf2-exp-input').value.split('\n').filter(function(l) { return l.trim(); });
      var algos = Array.from(container.querySelectorAll('#hf2-sub-export .hash-algo-check input:checked')).map(function(cb) { return cb.dataset.algo; });
      if (!lines.length || !algos.length) return;
      _expData = [];
      for (var i = 0; i < lines.length; i++) {
        var row = { input: lines[i] };
        for (var j = 0; j < algos.length; j++) {
          row[algos[j]] = await HashUtils.digest(algos[j], lines[i]);
        }
        _expData.push(row);
      }
      $('hf2-exp-stats').textContent = lines.length + ' strings hashed with ' + algos.join(', ');
      $('hf2-exp-preview').innerHTML = _expData.slice(0,3).map(function(r) {
        return '<div class="hash-exp-row"><span class="hash-exp-input">' + r.input.replace(/</g,'&lt;') + '</span>' +
          algos.map(function(a) { return '<span class="hash-exp-hash">' + a + ': ' + r[a].slice(0,16) + '\u2026</span>'; }).join('') +
          '</div>';
      }).join('') + (_expData.length > 3 ? '<div style="font-size:10.5px;color:#4a8080">+ ' + (_expData.length-3) + ' more\u2026</div>' : '');
      setStatus('\u2713 Ready to export', true);
    }

    $('hf2-exp-run').addEventListener('click', runExport);

    $('hf2-exp-json').addEventListener('click', function() {
      if (!_expData.length) { setStatus('Run first', false); return; }
      var blob = new Blob([JSON.stringify(_expData, null, 2)], {type:'application/json'});
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hashes.json'; a.click();
    });
    $('hf2-exp-csv').addEventListener('click', function() {
      if (!_expData.length) { setStatus('Run first', false); return; }
      var algos = Object.keys(_expData[0]).filter(function(k) { return k !== 'input'; });
      var csv = ['input,' + algos.join(',')].concat(_expData.map(function(r) {
        return '"' + r.input.replace(/"/g,'""') + '",' + algos.map(function(a) { return r[a]; }).join(',');
      })).join('\n');
      var blob = new Blob([csv], {type:'text/csv'});
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hashes.csv'; a.click();
    });
    $('hf2-exp-copy').addEventListener('click', function() {
      if (!_expData.length) { setStatus('Run first', false); return; }
      navigator.clipboard.writeText(JSON.stringify(_expData, null, 2));
      setStatus('Copied!', true);
    });
  },
};
