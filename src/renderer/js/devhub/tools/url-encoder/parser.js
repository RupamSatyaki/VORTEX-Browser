// url-encoder/parser.js - Parse + Param Editor + Copy Parts + Diff
var UEParser = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="ue-parser-wrap">',
      '<div class="ue-parse-input-row">',
      '<input class="dh-input ue-url-input" id="ue-parse-url" type="text" placeholder="https://example.com/path?foo=bar&baz=qux#section" spellcheck="false"/>',
      '<button class="dh-btn primary ue-action-btn" id="ue-parse-btn">Parse</button>',
      '</div>',
      '<div id="ue-parse-result" style="display:none">',
      '<div class="ue-parse-parts" id="ue-parse-parts"></div>',
      '<div class="ue-params-section" id="ue-params-section" style="display:none">',
      '<div class="ue-section-label">',
      '<span>Query Parameters</span>',
      '<button class="dh-btn ue-action-btn" id="ue-param-add">+ Add Param</button>',
      '</div>',
      '<div id="ue-params-list"></div>',
      '<div class="ue-rebuilt-row">',
      '<div class="ue-rebuilt-label">Rebuilt URL</div>',
      '<div class="ue-rebuilt-url" id="ue-rebuilt-url"></div>',
      '<div class="ue-rebuilt-actions">',
      '<button class="dh-btn ue-action-btn" id="ue-rebuilt-copy">Copy URL</button>',
      '<button class="dh-btn ue-action-btn" id="ue-rebuilt-copy-qs">Copy Query String</button>',
      '</div>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="ue-diff-section">',
      '<div class="ue-section-label">URL Diff</div>',
      '<div class="ue-diff-row">',
      '<input class="dh-input ue-url-input" id="ue-diff-a" type="text" placeholder="URL A" spellcheck="false"/>',
      '<input class="dh-input ue-url-input" id="ue-diff-b" type="text" placeholder="URL B" spellcheck="false"/>',
      '<button class="dh-btn primary ue-action-btn" id="ue-diff-btn">Compare</button>',
      '</div>',
      '<div id="ue-diff-result"></div>',
      '</div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _parsed = null;
    var _params = [];

    function rebuildURL() {
      if (!_parsed) return;
      var base = _parsed.origin + _parsed.pathname;
      var url = UEUtils.buildURL(base, _params);
      if (_parsed.hash) url += _parsed.hash;
      $('ue-rebuilt-url').textContent = url;
    }

    function renderParams() {
      var list = $('ue-params-list');
      list.innerHTML = _params.map(function(p, i) {
        return '<div class="ue-param-row" data-i="' + i + '">' +
          '<input class="dh-input ue-param-key" type="text" value="' + escHtml(p.key) + '" placeholder="key" data-i="' + i + '" data-field="key"/>' +
          '<span class="ue-param-eq">=</span>' +
          '<input class="dh-input ue-param-val" type="text" value="' + escHtml(p.value) + '" placeholder="value" data-i="' + i + '" data-field="value"/>' +
          '<button class="dh-btn danger ue-param-del ue-action-btn" data-i="' + i + '">\u2715</button>' +
          '</div>';
      }).join('');

      list.querySelectorAll('.ue-param-key, .ue-param-val').forEach(function(inp) {
        inp.addEventListener('input', function() {
          var i = +inp.dataset.i;
          _params[i][inp.dataset.field] = inp.value;
          rebuildURL();
        });
      });
      list.querySelectorAll('.ue-param-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
          _params.splice(+btn.dataset.i, 1);
          renderParams(); rebuildURL();
        });
      });
    }

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function doParse() {
      var raw = $('ue-parse-url').value.trim();
      if (!raw) return;
      try {
        _parsed = UEUtils.parseURL(raw);
        _params = _parsed.params.map(function(p) { return { key: p.key, value: p.value }; });

        var parts = [
          ['Protocol',  _parsed.protocol],
          ['Hostname',  _parsed.hostname],
          ['Port',      _parsed.port || '(default)'],
          ['Pathname',  _parsed.pathname],
          ['Search',    _parsed.search || '(none)'],
          ['Hash',      _parsed.hash   || '(none)'],
          ['Origin',    _parsed.origin],
        ];

        $('ue-parse-parts').innerHTML = parts.map(function(p) {
          return '<div class="ue-part-row">' +
            '<span class="ue-part-key">' + p[0] + '</span>' +
            '<span class="ue-part-val">' + escHtml(p[1]) + '</span>' +
            '<button class="dh-btn ue-action-btn ue-part-copy" data-val="' + escHtml(p[1]) + '" style="padding:2px 7px;font-size:10px;">Copy</button>' +
            '</div>';
        }).join('');

        $('ue-parse-parts').querySelectorAll('.ue-part-copy').forEach(function(btn) {
          btn.addEventListener('click', function() {
            navigator.clipboard.writeText(btn.dataset.val);
            setStatus('Copied!', true);
          });
        });

        $('ue-parse-result').style.display = '';
        if (_params.length) {
          $('ue-params-section').style.display = '';
          renderParams();
          rebuildURL();
        } else {
          $('ue-params-section').style.display = 'none';
        }
        setStatus('\u2713 Parsed', true);
      } catch(e) {
        $('ue-parse-result').style.display = 'none';
        setStatus('\u2717 Invalid URL', false);
      }
    }

    $('ue-parse-btn').addEventListener('click', doParse);
    $('ue-parse-url').addEventListener('keydown', function(e) { if (e.key === 'Enter') doParse(); });

    $('ue-param-add').addEventListener('click', function() {
      _params.push({ key: '', value: '' });
      renderParams(); rebuildURL();
    });

    $('ue-rebuilt-copy').addEventListener('click', function() {
      navigator.clipboard.writeText($('ue-rebuilt-url').textContent);
      setStatus('URL copied!', true);
    });
    $('ue-rebuilt-copy-qs').addEventListener('click', function() {
      var url = $('ue-rebuilt-url').textContent;
      var qs = url.indexOf('?') !== -1 ? url.split('?')[1].split('#')[0] : '';
      navigator.clipboard.writeText(qs);
      setStatus('Query string copied!', true);
    });

    // Diff
    $('ue-diff-btn').addEventListener('click', function() {
      var rawA = $('ue-diff-a').value.trim();
      var rawB = $('ue-diff-b').value.trim();
      var res  = $('ue-diff-result');
      try {
        var a = UEUtils.parseURL(rawA);
        var b = UEUtils.parseURL(rawB);
        var diffs = [];

        ['protocol','hostname','port','pathname','hash'].forEach(function(field) {
          if (a[field] !== b[field]) {
            diffs.push({ field: field, a: a[field], b: b[field], type: 'changed' });
          }
        });

        var aParams = {}, bParams = {};
        a.params.forEach(function(p) { aParams[p.key] = p.value; });
        b.params.forEach(function(p) { bParams[p.key] = p.value; });
        var allKeys = Object.keys(Object.assign({}, aParams, bParams));
        allKeys.forEach(function(k) {
          if (!(k in aParams)) diffs.push({ field: 'param:' + k, a: '(missing)', b: bParams[k], type: 'added' });
          else if (!(k in bParams)) diffs.push({ field: 'param:' + k, a: aParams[k], b: '(missing)', type: 'removed' });
          else if (aParams[k] !== bParams[k]) diffs.push({ field: 'param:' + k, a: aParams[k], b: bParams[k], type: 'changed' });
        });

        if (!diffs.length) {
          res.innerHTML = '<div class="ue-diff-ok">\u2713 URLs are identical</div>';
          return;
        }
        res.innerHTML = '<div class="ue-diff-count">' + diffs.length + ' difference' + (diffs.length !== 1 ? 's' : '') + '</div>' +
          diffs.map(function(d) {
            return '<div class="ue-diff-item ue-diff-' + d.type + '">' +
              '<span class="ue-diff-field">' + d.field + '</span>' +
              '<span class="ue-diff-a">' + escHtml(d.a) + '</span>' +
              '<span class="ue-diff-arrow">\u2192</span>' +
              '<span class="ue-diff-b">' + escHtml(d.b) + '</span>' +
              '</div>';
          }).join('');
      } catch(e) {
        res.innerHTML = '<span style="color:#ef4444;font-size:11.5px">\u2717 ' + e.message + '</span>';
      }
    });
  },
};
