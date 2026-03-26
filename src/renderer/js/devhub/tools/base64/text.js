/**
 * base64/text.js — Text encode/decode component
 * Features: encode/decode, auto-detect, URL-safe, chunked, live,
 *           history, batch mode, copy as code, hex view
 */
const B64Text = {

  render(container, setStatus) {
    container.innerHTML = [
      '<div class="b64-text-wrap">',
      '<div class="b64-detect-row">',
      '<div class="b64-detect-badge" id="b64-detect-badge">',
      '<span class="b64-detect-dot" id="b64-detect-dot"></span>',
      '<span id="b64-detect-label">Waiting for input\u2026</span>',
      '</div>',
      '<div class="b64-size-info" id="b64-size-info" style="display:none"></div>',
      '</div>',
      '<div class="b64-mode-tabs">',
      '<button class="b64-mode-tab active" data-mode="single">Single</button>',
      '<button class="b64-mode-tab" data-mode="batch">Batch</button>',
      '<button class="b64-mode-tab" data-mode="hex">Hex View</button>',
      '<button class="b64-mode-tab" data-mode="history">History</button>',
      '</div>',
      '<div id="b64-mode-single">',
      '<div class="b64-io-row">',
      '<div class="b64-io-col">',
      '<div class="b64-io-label"><span>Input</span><button class="b64-io-clear" id="b64-txt-clear-in">\u2715</button></div>',
      '<textarea class="dh-textarea b64-textarea" id="b64-txt-in" placeholder="Type or paste text / Base64\u2026" spellcheck="false"></textarea>',
      '</div>',
      '<div class="b64-io-divider"><button class="b64-swap-btn" id="b64-swap" title="Swap">\u21c4</button></div>',
      '<div class="b64-io-col">',
      '<div class="b64-io-label"><span>Output</span><button class="b64-io-clear" id="b64-txt-clear-out">\u2715</button></div>',
      '<textarea class="dh-textarea b64-textarea" id="b64-txt-out" placeholder="Result appears here\u2026" readonly spellcheck="false"></textarea>',
      '</div>',
      '</div>',
      '<div class="b64-actions-row">',
      '<div class="b64-action-group">',
      '<button class="dh-btn primary b64-action-btn" id="b64-encode-btn">Encode</button>',
      '<button class="dh-btn b64-action-btn" id="b64-decode-btn">Decode</button>',
      '<button class="dh-btn b64-action-btn" id="b64-auto-btn">Auto</button>',
      '</div>',
      '<div class="b64-action-group">',
      '<button class="dh-btn b64-action-btn" id="b64-urlsafe-enc">URL-safe \u2191</button>',
      '<button class="dh-btn b64-action-btn" id="b64-urlsafe-dec">URL-safe \u2193</button>',
      '</div>',
      '<div class="b64-action-group">',
      '<button class="dh-btn b64-action-btn" id="b64-chunk-btn">Chunk</button>',
      '<button class="dh-btn b64-action-btn" id="b64-copy-out">Copy</button>',
      '<button class="dh-btn danger b64-action-btn" id="b64-clear-all">Clear</button>',
      '</div>',
      '</div>',
      '<div class="b64-code-row">',
      '<span class="b64-code-label">Copy as:</span>',
      '<button class="dh-btn b64-code-btn" data-lang="js">JS</button>',
      '<button class="dh-btn b64-code-btn" data-lang="ts">TS</button>',
      '<button class="dh-btn b64-code-btn" data-lang="py">Python</button>',
      '<button class="dh-btn b64-code-btn" data-lang="java">Java</button>',
      '<button class="dh-btn b64-code-btn" data-lang="go">Go</button>',
      '<button class="dh-btn b64-code-btn" data-lang="cs">C#</button>',
      '</div>',
      '<div class="b64-options-row">',
      '<label class="b64-opt-label"><input type="checkbox" id="b64-live" checked class="b64-checkbox"/> Live encode</label>',
      '<label class="b64-opt-label"><input type="checkbox" id="b64-urlsafe-mode" class="b64-checkbox"/> URL-safe</label>',
      '<label class="b64-opt-label"><input type="checkbox" id="b64-chunk-mode" class="b64-checkbox"/> Chunk (76)</label>',
      '</div>',
      '<div class="b64-validate-strip" id="b64-validate-strip" style="display:none">',
      '<div class="b64-validate-inner" id="b64-validate-inner"></div>',
      '</div>',
      '</div>',
      '<div id="b64-mode-batch" style="display:none">',
      '<div class="b64-batch-info">One string per line \u2014 all encoded/decoded together</div>',
      '<div class="b64-io-row">',
      '<div class="b64-io-col">',
      '<div class="b64-io-label"><span>Input (one per line)</span></div>',
      '<textarea class="dh-textarea b64-textarea" id="b64-batch-in" placeholder="line1&#10;line2&#10;line3" spellcheck="false" style="min-height:100px;"></textarea>',
      '</div>',
      '<div class="b64-io-divider"><div style="display:flex;flex-direction:column;gap:6px;">',
      '<button class="dh-btn primary b64-action-btn" id="b64-batch-enc">Encode All</button>',
      '<button class="dh-btn b64-action-btn" id="b64-batch-dec">Decode All</button>',
      '</div></div>',
      '<div class="b64-io-col">',
      '<div class="b64-io-label"><span>Output</span><button class="dh-btn b64-action-btn" id="b64-batch-copy" style="padding:2px 8px;font-size:10px;">Copy</button></div>',
      '<textarea class="dh-textarea b64-textarea" id="b64-batch-out" placeholder="Results\u2026" readonly spellcheck="false" style="min-height:100px;"></textarea>',
      '</div>',
      '</div>',
      '<div class="b64-batch-stats" id="b64-batch-stats"></div>',
      '</div>',
      '<div id="b64-mode-hex" style="display:none">',
      '<div class="b64-batch-info">Paste Base64 to see hex representation</div>',
      '<textarea class="dh-textarea b64-textarea" id="b64-hex-in" placeholder="Paste Base64 here\u2026" spellcheck="false" style="min-height:60px;"></textarea>',
      '<button class="dh-btn primary b64-action-btn" id="b64-hex-run" style="margin-top:6px;">Show Hex</button>',
      '<div class="b64-hex-out" id="b64-hex-out"></div>',
      '</div>',
      '<div id="b64-mode-history" style="display:none">',
      '<div class="b64-history-header">',
      '<span class="b64-batch-info">Last 10 operations (session)</span>',
      '<button class="dh-btn danger b64-action-btn" id="b64-hist-clear">Clear</button>',
      '</div>',
      '<div id="b64-hist-list" class="b64-hist-list"></div>',
      '</div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _history = [];

    // Mode switching
    container.querySelectorAll('.b64-mode-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.b64-mode-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        ['single','batch','hex','history'].forEach(function(m) {
          $('b64-mode-' + m).style.display = (m === tab.dataset.mode) ? '' : 'none';
        });
        if (tab.dataset.mode === 'history') renderHistory();
      });
    });

    function getIn()  { return $('b64-txt-in').value; }
    function setOut(v){ $('b64-txt-out').value = v; }
    function getOut() { return $('b64-txt-out').value; }

    function updateDetect(val) {
      var type = B64Utils.autoDetect(val);
      var dot   = $('b64-detect-dot');
      var lbl   = $('b64-detect-label');
      var badge = $('b64-detect-badge');
      var map = {
        empty:   { color:'#2e6060', text:'Waiting for input\u2026' },
        plain:   { color:'#22c55e', text:'Plain text detected' },
        base64:  { color:'#00c8b4', text:'Base64 detected \u2014 click Auto to decode' },
        urlsafe: { color:'#a78bfa', text:'URL-safe Base64 detected' },
        datauri: { color:'#38bdf8', text:'Data URI detected' },
        jwt:     { color:'#f59e0b', text:'JWT token detected \u2014 use JWT tab' },
      };
      var info = map[type] || map.empty;
      dot.style.background = info.color;
      lbl.textContent = info.text;
      badge.style.borderColor = info.color + '44';
    }

    function updateSizeInfo(origBytes, enc) {
      if (!enc) { $('b64-size-info').style.display = 'none'; return; }
      var s = B64Utils.sizeInfo(origBytes, enc);
      $('b64-size-info').style.display = '';
      $('b64-size-info').innerHTML =
        '<span>' + B64Utils.fmtBytes(s.origBytes) + '</span>' +
        '<span class="b64-size-arrow">\u2192</span>' +
        '<span>' + B64Utils.fmtBytes(s.encBytes) + '</span>' +
        '<span class="b64-size-overhead">' + s.overhead + '</span>';
    }

    function updateValidate(val) {
      var strip = $('b64-validate-strip');
      var inner = $('b64-validate-inner');
      if (!val.trim()) { strip.style.display = 'none'; return; }
      strip.style.display = '';
      var valid = B64Utils.isValid(val.trim().replace(/\s/g, ''));
      inner.className = 'b64-validate-inner ' + (valid ? 'b64-valid' : 'b64-invalid');
      inner.textContent = valid ? '\u2713 Valid Base64' : '\u2717 Not valid Base64';
    }

    function addHistory(op, input, output) {
      _history.unshift({ op: op, input: input.slice(0,80), output: output.slice(0,80), time: new Date().toLocaleTimeString() });
      if (_history.length > 10) _history.pop();
    }

    function renderHistory() {
      var list = $('b64-hist-list');
      if (!_history.length) { list.innerHTML = '<span style="font-size:11px;color:#4a8080">No operations yet</span>'; return; }
      list.innerHTML = _history.map(function(h, i) {
        return '<div class="b64-hist-item">' +
          '<div class="b64-hist-header">' +
          '<span class="b64-hist-op b64-hist-' + h.op + '">' + h.op.toUpperCase() + '</span>' +
          '<span class="b64-hist-time">' + h.time + '</span>' +
          '</div>' +
          '<div class="b64-hist-row"><span class="b64-hist-k">In</span><code class="b64-hist-v">' + h.input.replace(/</g,'&lt;') + '</code></div>' +
          '<div class="b64-hist-row"><span class="b64-hist-k">Out</span><code class="b64-hist-v">' + h.output.replace(/</g,'&lt;') + '</code></div>' +
          '<button class="dh-btn b64-action-btn b64-hist-load" data-i="' + i + '">Load</button>' +
          '</div>';
      }).join('');
      list.querySelectorAll('.b64-hist-load').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var h = _history[+btn.dataset.i];
          $('b64-txt-in').value = h.input;
          setOut(h.output);
          container.querySelector('[data-mode="single"]').click();
          updateDetect(h.input);
        });
      });
    }

    function doEncode() {
      try {
        var urlSafe = $('b64-urlsafe-mode').checked;
        var chunk   = $('b64-chunk-mode').checked;
        var inp = getIn();
        var result = urlSafe ? B64Utils.encodeUrlSafe(inp) : B64Utils.encode(inp);
        if (chunk) result = B64Utils.chunk(result);
        setOut(result);
        var origBytes = new TextEncoder().encode(inp).length;
        updateSizeInfo(origBytes, result);
        addHistory('encode', inp, result);
        setStatus('\u2713 Encoded', true);
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    }

    function doDecode() {
      try {
        var urlSafe = $('b64-urlsafe-mode').checked;
        var inp = getIn();
        var result = urlSafe ? B64Utils.decodeUrlSafe(inp) : B64Utils.decode(inp);
        setOut(result);
        var origBytes = new TextEncoder().encode(result).length;
        updateSizeInfo(origBytes, inp);
        addHistory('decode', inp, result);
        setStatus('\u2713 Decoded', true);
      } catch(e) { setStatus('\u2717 Invalid Base64', false); }
    }

    $('b64-txt-in').addEventListener('input', function() {
      var val = getIn();
      updateDetect(val);
      updateValidate(val);
      if ($('b64-live').checked && val) doEncode();
      else if (!val) { setOut(''); $('b64-size-info').style.display = 'none'; }
    });

    $('b64-encode-btn').addEventListener('click', doEncode);
    $('b64-decode-btn').addEventListener('click', doDecode);
    $('b64-auto-btn').addEventListener('click', function() {
      var type = B64Utils.autoDetect(getIn());
      if (type === 'base64' || type === 'urlsafe' || type === 'datauri') doDecode();
      else doEncode();
    });
    $('b64-urlsafe-enc').addEventListener('click', function() {
      try { var r = B64Utils.encodeUrlSafe(getIn()); setOut(r); addHistory('url-enc', getIn(), r); setStatus('\u2713 URL-safe encoded', true); }
      catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
    $('b64-urlsafe-dec').addEventListener('click', function() {
      try { var r = B64Utils.decodeUrlSafe(getIn()); setOut(r); addHistory('url-dec', getIn(), r); setStatus('\u2713 URL-safe decoded', true); }
      catch(e) { setStatus('\u2717 Invalid', false); }
    });
    $('b64-chunk-btn').addEventListener('click', function() {
      var v = getOut() || getIn();
      if (v) { setOut(B64Utils.chunk(v)); setStatus('\u2713 Chunked', true); }
    });
    $('b64-swap').addEventListener('click', function() {
      var tmp = getIn(); $('b64-txt-in').value = getOut(); setOut(tmp);
      updateDetect($('b64-txt-in').value);
    });
    $('b64-copy-out').addEventListener('click', function() {
      if (getOut()) { navigator.clipboard.writeText(getOut()); setStatus('Copied!', true); }
    });
    $('b64-clear-all').addEventListener('click', function() {
      $('b64-txt-in').value = ''; setOut('');
      $('b64-size-info').style.display = 'none';
      $('b64-validate-strip').style.display = 'none';
      updateDetect(''); setStatus('', true);
    });
    $('b64-txt-clear-in').addEventListener('click',  function() { $('b64-txt-in').value = ''; updateDetect(''); });
    $('b64-txt-clear-out').addEventListener('click', function() { setOut(''); });

    container.querySelectorAll('.b64-code-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var v = getOut() || getIn();
        if (!v) { setStatus('Nothing to copy', false); return; }
        navigator.clipboard.writeText(B64Utils.asCode(v, btn.dataset.lang));
        setStatus('Copied as ' + btn.dataset.lang + '!', true);
      });
    });

    $('b64-batch-enc').addEventListener('click', function() {
      var lines = $('b64-batch-in').value.split('\n');
      var results = lines.map(function(l) { try { return B64Utils.encode(l); } catch(e) { return '[error]'; } });
      $('b64-batch-out').value = results.join('\n');
      $('b64-batch-stats').textContent = lines.length + ' line' + (lines.length !== 1 ? 's' : '') + ' encoded';
      setStatus('\u2713 Batch encoded', true);
    });
    $('b64-batch-dec').addEventListener('click', function() {
      var lines = $('b64-batch-in').value.split('\n');
      var results = lines.map(function(l) { try { return B64Utils.decode(l.trim()); } catch(e) { return '[invalid]'; } });
      $('b64-batch-out').value = results.join('\n');
      $('b64-batch-stats').textContent = lines.length + ' line' + (lines.length !== 1 ? 's' : '') + ' decoded';
      setStatus('\u2713 Batch decoded', true);
    });
    $('b64-batch-copy').addEventListener('click', function() {
      var v = $('b64-batch-out').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); }
    });

    $('b64-hex-run').addEventListener('click', function() {
      var v = $('b64-hex-in').value.trim();
      if (!v) return;
      var hex = B64Utils.toHex(v);
      if (!hex) { $('b64-hex-out').innerHTML = '<span style="color:#ef4444">\u2717 Invalid Base64</span>'; return; }
      var bytes = hex.split(' ');
      $('b64-hex-out').innerHTML =
        '<div class="b64-hex-meta">' + bytes.length + ' bytes</div>' +
        '<div class="b64-hex-grid">' + bytes.map(function(b) { return '<span class="b64-hex-byte">' + b + '</span>'; }).join('') + '</div>';
    });

    $('b64-hist-clear').addEventListener('click', function() { _history.length = 0; renderHistory(); });
  },
};
