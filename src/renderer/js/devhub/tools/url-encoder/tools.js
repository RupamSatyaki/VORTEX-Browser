// url-encoder/tools.js - Batch, Validator, Canonicalize, URL-to-Code, QR, History
var UETools = {

  _history: [],

  render: function(container, setStatus) {
    var self = this;
    container.innerHTML = [
      '<div class="ue-tools-wrap">',

      // Sub-tabs
      '<div class="ue-sub-tabs">',
      '<button class="ue-sub-tab active" data-sub="batch">Batch</button>',
      '<button class="ue-sub-tab" data-sub="validate">Validate</button>',
      '<button class="ue-sub-tab" data-sub="canon">Canonicalize</button>',
      '<button class="ue-sub-tab" data-sub="code">URL to Code</button>',
      '<button class="ue-sub-tab" data-sub="qr">QR Code</button>',
      '<button class="ue-sub-tab" data-sub="history">History</button>',
      '</div>',

      // Batch
      '<div class="ue-sub-content" id="ue-sub-batch">',
      '<div class="ue-batch-info">One URL per line \u2014 all encoded/decoded together</div>',
      '<div class="ue-io-row">',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Input</span></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-batch-in" placeholder="https://example.com/path?q=hello world&#10;https://api.test.com/v1?key=foo bar" spellcheck="false" style="min-height:90px;"></textarea>',
      '</div>',
      '<div class="ue-io-divider"><div style="display:flex;flex-direction:column;gap:6px;">',
      '<button class="dh-btn primary ue-action-btn" id="ue-batch-enc">Encode All</button>',
      '<button class="dh-btn ue-action-btn" id="ue-batch-dec">Decode All</button>',
      '<button class="dh-btn ue-action-btn" id="ue-batch-canon">Canonicalize</button>',
      '</div></div>',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Output</span><button class="dh-btn ue-action-btn" id="ue-batch-copy" style="padding:2px 8px;font-size:10px;">Copy</button></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-batch-out" placeholder="Results\u2026" readonly spellcheck="false" style="min-height:90px;"></textarea>',
      '</div>',
      '</div>',
      '<div class="ue-batch-stats" id="ue-batch-stats"></div>',
      '</div>',

      // Validate
      '<div class="ue-sub-content" id="ue-sub-validate" style="display:none">',
      '<div class="ue-io-row" style="grid-template-columns:1fr auto;">',
      '<input class="dh-input ue-url-input" id="ue-val-url" type="text" placeholder="https://example.com/path?q=test" spellcheck="false"/>',
      '<button class="dh-btn primary ue-action-btn" id="ue-val-btn">Validate</button>',
      '</div>',
      '<div id="ue-val-result" style="margin-top:10px;"></div>',
      '</div>',

      // Canonicalize
      '<div class="ue-sub-content" id="ue-sub-canon" style="display:none">',
      '<div class="ue-io-row">',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Input URL</span></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-canon-in" placeholder="HTTPS://Example.COM:443/Path/?b=2&a=1#section" spellcheck="false" style="min-height:70px;"></textarea>',
      '</div>',
      '<div class="ue-io-divider"><button class="dh-btn primary ue-action-btn" id="ue-canon-btn">Canonicalize</button></div>',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Result</span><button class="dh-btn ue-action-btn" id="ue-canon-copy" style="padding:2px 8px;font-size:10px;">Copy</button></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-canon-out" placeholder="Normalized URL\u2026" readonly spellcheck="false" style="min-height:70px;"></textarea>',
      '</div>',
      '</div>',
      '<div class="ue-canon-changes" id="ue-canon-changes"></div>',
      '</div>',

      // URL to Code
      '<div class="ue-sub-content" id="ue-sub-code" style="display:none">',
      '<input class="dh-input ue-url-input" id="ue-code-url" type="text" placeholder="https://api.example.com/data?key=value" spellcheck="false" style="margin-bottom:8px;"/>',
      '<div class="ue-code-langs">',
      '<button class="ue-lang-btn active" data-lang="js-fetch">JS fetch</button>',
      '<button class="ue-lang-btn" data-lang="js-axios">JS axios</button>',
      '<button class="ue-lang-btn" data-lang="py-requests">Python</button>',
      '<button class="ue-lang-btn" data-lang="curl">curl</button>',
      '<button class="ue-lang-btn" data-lang="curl-verbose">curl -v</button>',
      '<button class="ue-lang-btn" data-lang="wget">wget</button>',
      '<button class="ue-lang-btn" data-lang="php">PHP</button>',
      '<button class="ue-lang-btn" data-lang="go">Go</button>',
      '</div>',
      '<pre class="ue-code-out" id="ue-code-out"></pre>',
      '<button class="dh-btn ue-action-btn" id="ue-code-copy" style="margin-top:6px;">Copy Code</button>',
      '</div>',

      // QR Code
      '<div class="ue-sub-content" id="ue-sub-qr" style="display:none">',
      '<div class="ue-io-row" style="grid-template-columns:1fr auto;">',
      '<input class="dh-input ue-url-input" id="ue-qr-url" type="text" placeholder="https://example.com" spellcheck="false"/>',
      '<button class="dh-btn primary ue-action-btn" id="ue-qr-btn">Generate</button>',
      '</div>',
      '<div class="ue-qr-wrap" id="ue-qr-wrap" style="display:none">',
      '<canvas id="ue-qr-canvas" class="ue-qr-canvas"></canvas>',
      '<div class="ue-qr-actions">',
      '<button class="dh-btn ue-action-btn" id="ue-qr-download">Download PNG</button>',
      '<button class="dh-btn ue-action-btn" id="ue-qr-copy-url">Copy URL</button>',
      '</div>',
      '<div class="ue-qr-note">Visual pattern \u2014 for production use a proper QR library</div>',
      '</div>',
      '</div>',

      // History
      '<div class="ue-sub-content" id="ue-sub-history" style="display:none">',
      '<div class="ue-history-header">',
      '<span class="ue-batch-info">Last 15 URLs (session)</span>',
      '<button class="dh-btn danger ue-action-btn" id="ue-hist-clear">Clear</button>',
      '</div>',
      '<div id="ue-hist-list" class="ue-hist-list"></div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };

    // Sub-tab switching
    container.querySelectorAll('.ue-sub-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.ue-sub-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.ue-sub-content').forEach(function(c) { c.style.display = 'none'; });
        tab.classList.add('active');
        $('ue-sub-' + tab.dataset.sub).style.display = '';
        if (tab.dataset.sub === 'history') renderHistory();
      });
    });

    // ── Batch ──────────────────────────────────────────────────────────────────
    function batchOp(fn, label) {
      var lines = $('ue-batch-in').value.split('\n');
      var results = lines.map(function(l) {
        try { return fn(l.trim()); } catch(e) { return '[error: ' + e.message + ']'; }
      });
      $('ue-batch-out').value = results.join('\n');
      $('ue-batch-stats').textContent = lines.length + ' line' + (lines.length !== 1 ? 's' : '') + ' ' + label;
      setStatus('\u2713 Done', true);
    }
    $('ue-batch-enc').addEventListener('click',   function() { batchOp(UEUtils.encode.bind(UEUtils), 'encoded'); });
    $('ue-batch-dec').addEventListener('click',   function() { batchOp(UEUtils.decode.bind(UEUtils), 'decoded'); });
    $('ue-batch-canon').addEventListener('click', function() { batchOp(UEUtils.canonicalize.bind(UEUtils), 'canonicalized'); });
    $('ue-batch-copy').addEventListener('click',  function() {
      var v = $('ue-batch-out').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); }
    });

    // ── Validate ───────────────────────────────────────────────────────────────
    $('ue-val-btn').addEventListener('click', function() {
      var raw = $('ue-val-url').value.trim();
      var res = $('ue-val-result');
      var issues = UEUtils.validate(raw);
      if (!issues.length) {
        try {
          var u = new URL(raw);
          res.innerHTML = '<div class="ue-val-ok">\u2713 Valid URL</div>' +
            '<div class="ue-val-details">' +
            '<div class="ue-val-row"><span class="ue-val-k">Protocol</span><span class="ue-val-v">' + u.protocol + '</span></div>' +
            '<div class="ue-val-row"><span class="ue-val-k">Host</span><span class="ue-val-v">' + u.host + '</span></div>' +
            '<div class="ue-val-row"><span class="ue-val-k">Path</span><span class="ue-val-v">' + u.pathname + '</span></div>' +
            '<div class="ue-val-row"><span class="ue-val-k">Params</span><span class="ue-val-v">' + Array.from(u.searchParams.keys()).length + '</span></div>' +
            '<div class="ue-val-row"><span class="ue-val-k">Length</span><span class="ue-val-v">' + raw.length + ' chars</span></div>' +
            '</div>';
          self._addHistory(raw);
        } catch(e) { res.innerHTML = '<div class="ue-val-err">\u2717 ' + e.message + '</div>'; }
      } else {
        res.innerHTML = '<div class="ue-val-err">\u2717 ' + issues.length + ' issue' + (issues.length !== 1 ? 's' : '') + '</div>' +
          issues.map(function(i) { return '<div class="ue-val-issue">\u2022 ' + i + '</div>'; }).join('');
      }
    });

    // ── Canonicalize ───────────────────────────────────────────────────────────
    $('ue-canon-btn').addEventListener('click', function() {
      var raw = $('ue-canon-in').value.trim();
      try {
        var result = UEUtils.canonicalize(raw);
        $('ue-canon-out').value = result;
        var changes = [];
        if (raw !== result) {
          if (raw.toLowerCase().split('?')[0] !== result.split('?')[0]) changes.push('Normalized hostname/protocol');
          if (raw.indexOf(':80') !== -1 || raw.indexOf(':443') !== -1) changes.push('Removed default port');
          if (raw.indexOf('?') !== -1) changes.push('Sorted query parameters');
          if (raw.slice(-1) === '/' && result.slice(-1) !== '/') changes.push('Removed trailing slash');
        }
        $('ue-canon-changes').innerHTML = changes.length
          ? '<div class="ue-canon-change-list">' + changes.map(function(c) { return '<span class="ue-canon-change">\u2713 ' + c + '</span>'; }).join('') + '</div>'
          : '<span style="font-size:11px;color:#22c55e">\u2713 Already canonical</span>';
        self._addHistory(raw);
        setStatus('\u2713 Canonicalized', true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
    $('ue-canon-copy').addEventListener('click', function() {
      var v = $('ue-canon-out').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); }
    });

    // ── URL to Code ────────────────────────────────────────────────────────────
    var _activeLang = 'js-fetch';
    function renderCode() {
      var url = $('ue-code-url').value.trim() || 'https://api.example.com/data';
      $('ue-code-out').textContent = UEUtils.toCode(url, _activeLang);
    }
    $('ue-code-url').addEventListener('input', renderCode);
    container.querySelectorAll('.ue-lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        container.querySelectorAll('.ue-lang-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        _activeLang = btn.dataset.lang;
        renderCode();
      });
    });
    $('ue-code-copy').addEventListener('click', function() {
      navigator.clipboard.writeText($('ue-code-out').textContent);
      setStatus('Code copied!', true);
    });
    renderCode();

    // ── QR Code ────────────────────────────────────────────────────────────────
    $('ue-qr-btn').addEventListener('click', function() {
      var url = $('ue-qr-url').value.trim();
      if (!url) return;
      var canvas = $('ue-qr-canvas');
      UEUtils.generateQR(canvas, url, 200);
      $('ue-qr-wrap').style.display = '';
      self._addHistory(url);
      setStatus('\u2713 QR generated', true);
    });
    $('ue-qr-download').addEventListener('click', function() {
      var canvas = $('ue-qr-canvas');
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'qr-code.png'; a.click();
    });
    $('ue-qr-copy-url').addEventListener('click', function() {
      navigator.clipboard.writeText($('ue-qr-url').value);
      setStatus('URL copied!', true);
    });

    // ── History ────────────────────────────────────────────────────────────────
    function renderHistory() {
      var list = $('ue-hist-list');
      if (!self._history.length) {
        list.innerHTML = '<span style="font-size:11px;color:#4a8080">No URLs yet</span>';
        return;
      }
      list.innerHTML = self._history.map(function(h, i) {
        return '<div class="ue-hist-item">' +
          '<div class="ue-hist-url">' + h.url.replace(/</g,'&lt;') + '</div>' +
          '<div class="ue-hist-meta">' + h.time + '</div>' +
          '<button class="dh-btn ue-action-btn ue-hist-copy" data-i="' + i + '" style="padding:2px 8px;font-size:10px;">Copy</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.ue-hist-copy').forEach(function(btn) {
        btn.addEventListener('click', function() {
          navigator.clipboard.writeText(self._history[+btn.dataset.i].url);
          setStatus('Copied!', true);
        });
      });
    }

    $('ue-hist-clear').addEventListener('click', function() { self._history = []; renderHistory(); });
  },

  _addHistory: function(url) {
    if (!url) return;
    if (this._history.length && this._history[0].url === url) return;
    this._history.unshift({ url: url, time: new Date().toLocaleTimeString() });
    if (this._history.length > 15) this._history.pop();
  },
};
