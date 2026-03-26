// url-encoder/builder.js - Query String Builder component
var UEBuilder = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="ue-builder-wrap">',
      '<div class="ue-builder-base-row">',
      '<div class="ue-section-label">Base URL</div>',
      '<input class="dh-input ue-url-input" id="ue-bld-base" type="text" placeholder="https://api.example.com/endpoint" spellcheck="false"/>',
      '</div>',
      '<div class="ue-builder-params-header">',
      '<div class="ue-section-label">Parameters</div>',
      '<button class="dh-btn primary ue-action-btn" id="ue-bld-add">+ Add Parameter</button>',
      '</div>',
      '<div id="ue-bld-params" class="ue-bld-params"></div>',
      '<div class="ue-bld-preview-section">',
      '<div class="ue-section-label">Built URL</div>',
      '<div class="ue-bld-url-display" id="ue-bld-url-display"></div>',
      '<div class="ue-bld-actions">',
      '<button class="dh-btn primary ue-action-btn" id="ue-bld-copy-url">Copy URL</button>',
      '<button class="dh-btn ue-action-btn" id="ue-bld-copy-qs">Copy Query String</button>',
      '<button class="dh-btn ue-action-btn" id="ue-bld-copy-json">Copy as JSON</button>',
      '<button class="dh-btn danger ue-action-btn" id="ue-bld-clear">Clear All</button>',
      '</div>',
      '</div>',
      '<div class="ue-bld-import-section">',
      '<div class="ue-section-label">Import from URL</div>',
      '<div class="ue-bld-import-row">',
      '<input class="dh-input ue-url-input" id="ue-bld-import-url" type="text" placeholder="Paste a URL to extract its params\u2026" spellcheck="false"/>',
      '<button class="dh-btn ue-action-btn" id="ue-bld-import-btn">Import</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _params = [{ key: '', value: '', enabled: true }];

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function rebuild() {
      var base = $('ue-bld-base').value.trim() || 'https://example.com';
      var active = _params.filter(function(p) { return p.enabled && p.key; });
      var url = UEUtils.buildURL(base, active);
      $('ue-bld-url-display').textContent = url;
    }

    function renderParams() {
      var list = $('ue-bld-params');
      if (!_params.length) {
        list.innerHTML = '<div style="font-size:11px;color:#4a8080;padding:8px 0">No parameters yet \u2014 click + Add Parameter</div>';
        rebuild(); return;
      }
      list.innerHTML = _params.map(function(p, i) {
        return '<div class="ue-bld-param-row" data-i="' + i + '">' +
          '<label class="ue-bld-toggle" title="Enable/disable"><input type="checkbox" class="ue-checkbox ue-bld-enabled" data-i="' + i + '"' + (p.enabled ? ' checked' : '') + '/></label>' +
          '<input class="dh-input ue-bld-key" type="text" value="' + escHtml(p.key) + '" placeholder="key" data-i="' + i + '"/>' +
          '<span class="ue-param-eq">=</span>' +
          '<input class="dh-input ue-bld-val" type="text" value="' + escHtml(p.value) + '" placeholder="value" data-i="' + i + '"/>' +
          '<button class="dh-btn danger ue-action-btn ue-bld-del" data-i="' + i + '" style="padding:4px 8px;">\u2715</button>' +
          '</div>';
      }).join('');

      list.querySelectorAll('.ue-bld-key').forEach(function(inp) {
        inp.addEventListener('input', function() { _params[+inp.dataset.i].key = inp.value; rebuild(); });
      });
      list.querySelectorAll('.ue-bld-val').forEach(function(inp) {
        inp.addEventListener('input', function() { _params[+inp.dataset.i].value = inp.value; rebuild(); });
      });
      list.querySelectorAll('.ue-bld-enabled').forEach(function(cb) {
        cb.addEventListener('change', function() { _params[+cb.dataset.i].enabled = cb.checked; rebuild(); });
      });
      list.querySelectorAll('.ue-bld-del').forEach(function(btn) {
        btn.addEventListener('click', function() { _params.splice(+btn.dataset.i, 1); renderParams(); });
      });
      rebuild();
    }

    $('ue-bld-base').addEventListener('input', rebuild);

    $('ue-bld-add').addEventListener('click', function() {
      _params.push({ key: '', value: '', enabled: true });
      renderParams();
      // Focus last key input
      var inputs = container.querySelectorAll('.ue-bld-key');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });

    $('ue-bld-copy-url').addEventListener('click', function() {
      navigator.clipboard.writeText($('ue-bld-url-display').textContent);
      setStatus('URL copied!', true);
    });
    $('ue-bld-copy-qs').addEventListener('click', function() {
      var url = $('ue-bld-url-display').textContent;
      var qs = url.indexOf('?') !== -1 ? url.split('?')[1] : '';
      navigator.clipboard.writeText(qs);
      setStatus('Query string copied!', true);
    });
    $('ue-bld-copy-json').addEventListener('click', function() {
      var active = _params.filter(function(p) { return p.enabled && p.key; });
      var obj = {};
      active.forEach(function(p) { obj[p.key] = p.value; });
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      setStatus('Copied as JSON!', true);
    });
    $('ue-bld-clear').addEventListener('click', function() {
      _params = [{ key: '', value: '', enabled: true }];
      $('ue-bld-base').value = '';
      renderParams();
    });

    $('ue-bld-import-btn').addEventListener('click', function() {
      var raw = $('ue-bld-import-url').value.trim();
      if (!raw) return;
      try {
        var parsed = UEUtils.parseURL(raw);
        $('ue-bld-base').value = parsed.origin + parsed.pathname;
        _params = parsed.params.length
          ? parsed.params.map(function(p) { return { key: p.key, value: p.value, enabled: true }; })
          : [{ key: '', value: '', enabled: true }];
        renderParams();
        setStatus('\u2713 Imported ' + parsed.params.length + ' params', true);
      } catch(e) { setStatus('\u2717 Invalid URL', false); }
    });

    renderParams();
  },
};
