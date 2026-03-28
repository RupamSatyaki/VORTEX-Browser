// hash/compare.js - Hash comparison + batch hashing component
var HashCompare = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="hash-compare-wrap">',

      // Compare section
      '<div class="hash-section-label">Hash Comparison</div>',
      '<div class="hash-cmp-row">',
      '<div class="hash-cmp-col">',
      '<div class="hash-io-label"><span>Hash A</span></div>',
      '<input class="dh-input hash-cmp-input" id="hc-a" type="text" placeholder="Paste first hash\u2026" spellcheck="false"/>',
      '</div>',
      '<div class="hash-cmp-col">',
      '<div class="hash-io-label"><span>Hash B</span></div>',
      '<input class="dh-input hash-cmp-input" id="hc-b" type="text" placeholder="Paste second hash\u2026" spellcheck="false"/>',
      '</div>',
      '</div>',
      '<div class="hash-cmp-result" id="hc-result"></div>',

      // Batch section
      '<div class="hash-section-label" style="margin-top:14px;">Batch Hash</div>',
      '<div class="hash-batch-info">One string per line \u2014 all hashed with selected algorithm</div>',
      '<div class="hash-algo-row">',
      '<span class="hash-algo-label">Algorithm:</span>',
      '<label class="hash-algo-check"><input type="radio" name="hb-algo" value="MD5"     class="hash-checkbox"/> MD5</label>',
      '<label class="hash-algo-check"><input type="radio" name="hb-algo" value="SHA-1"   class="hash-checkbox"/> SHA-1</label>',
      '<label class="hash-algo-check"><input type="radio" name="hb-algo" value="SHA-256" checked class="hash-checkbox"/> SHA-256</label>',
      '<label class="hash-algo-check"><input type="radio" name="hb-algo" value="SHA-512" class="hash-checkbox"/> SHA-512</label>',
      '</div>',
      '<div class="hash-io-row">',
      '<div class="hash-io-col">',
      '<div class="hash-io-label"><span>Input (one per line)</span></div>',
      '<textarea class="dh-textarea hash-textarea" id="hb-input" placeholder="password123&#10;hello world&#10;secret" spellcheck="false" style="min-height:90px;"></textarea>',
      '</div>',
      '<div class="hash-io-divider">',
      '<button class="dh-btn primary hash-action-btn" id="hb-run">Hash All</button>',
      '</div>',
      '<div class="hash-io-col">',
      '<div class="hash-io-label"><span>Output</span><button class="dh-btn hash-action-btn" id="hb-copy" style="padding:2px 8px;font-size:10px;">Copy</button></div>',
      '<textarea class="dh-textarea hash-textarea" id="hb-output" placeholder="Results\u2026" readonly spellcheck="false" style="min-height:90px;"></textarea>',
      '</div>',
      '</div>',
      '<div class="hash-batch-stats" id="hb-stats"></div>',

      // History section
      '<div class="hash-section-label" style="margin-top:14px;">',
      '<span>Hash History</span>',
      '<button class="dh-btn danger hash-action-btn" id="hh-clear" style="font-size:10px;padding:2px 8px;">Clear</button>',
      '</div>',
      '<div id="hh-list" class="hash-hist-list"></div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _history = [];

    // ── Compare ────────────────────────────────────────────────────────────────
    function doCompare() {
      var a = $('hc-a').value.trim();
      var b = $('hc-b').value.trim();
      var res = $('hc-result');
      if (!a || !b) { res.innerHTML = ''; return; }
      var match = HashUtils.compareHashes(a, b);
      if (match) {
        res.innerHTML = '<div class="hash-cmp-match">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
          ' Hashes match</div>';
      } else {
        // Find first differing character
        var ca = a.toLowerCase().replace(/\s/g,'');
        var cb = b.toLowerCase().replace(/\s/g,'');
        var diffAt = -1;
        for (var i = 0; i < Math.min(ca.length, cb.length); i++) {
          if (ca[i] !== cb[i]) { diffAt = i; break; }
        }
        res.innerHTML = '<div class="hash-cmp-nomatch">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          ' Hashes do NOT match' +
          (diffAt >= 0 ? ' \u00b7 first difference at position ' + diffAt : '') +
          '</div>' +
          '<div class="hash-cmp-lengths">A: ' + ca.length + ' chars \u00b7 B: ' + cb.length + ' chars</div>';
      }
    }

    $('hc-a').addEventListener('input', doCompare);
    $('hc-b').addEventListener('input', doCompare);

    // ── Batch ──────────────────────────────────────────────────────────────────
    $('hb-run').addEventListener('click', async function() {
      var lines = $('hb-input').value.split('\n').filter(function(l) { return l.trim(); });
      if (!lines.length) return;
      var algo = container.querySelector('input[name="hb-algo"]:checked').value;
      var results = [];
      for (var i = 0; i < lines.length; i++) {
        try {
          var h = await HashUtils.digest(algo, lines[i]);
          results.push(h);
          _addHistory(algo, lines[i], h);
        } catch(e) {
          results.push('[error]');
        }
      }
      $('hb-output').value = results.join('\n');
      $('hb-stats').textContent = lines.length + ' string' + (lines.length !== 1 ? 's' : '') + ' hashed with ' + algo;
      renderHistory();
      setStatus('\u2713 Batch done', true);
    });

    $('hb-copy').addEventListener('click', function() {
      var v = $('hb-output').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); }
    });

    // ── History ────────────────────────────────────────────────────────────────
    function _addHistory(algo, input, hash) {
      _history.unshift({ algo: algo, input: input.slice(0,40), hash: hash, time: new Date().toLocaleTimeString() });
      if (_history.length > 10) _history.pop();
    }

    function renderHistory() {
      var list = $('hh-list');
      if (!_history.length) { list.innerHTML = '<span style="font-size:11px;color:#4a8080">No hashes yet</span>'; return; }
      list.innerHTML = _history.map(function(h, i) {
        return '<div class="hash-hist-item">' +
          '<div class="hash-hist-header">' +
          '<span class="hash-hist-algo">' + h.algo + '</span>' +
          '<span class="hash-hist-time">' + h.time + '</span>' +
          '</div>' +
          '<div class="hash-hist-input">' + h.input.replace(/</g,'&lt;') + '</div>' +
          '<div class="hash-hist-val">' + h.hash + '</div>' +
          '<button class="dh-btn hash-action-btn hash-copy-btn" data-hex="' + h.hash + '" style="padding:2px 8px;font-size:10px;">Copy</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.hash-copy-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          navigator.clipboard.writeText(btn.dataset.hex);
          setStatus('Copied!', true);
        });
      });
    }

    $('hh-clear').addEventListener('click', function() { _history = []; renderHistory(); });
    renderHistory();
  },
};
