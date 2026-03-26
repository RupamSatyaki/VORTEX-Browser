// url-encoder/encode.js - Encode/Decode tab component
var UEEncode = {

  render: function(container, setStatus) {
    container.innerHTML = [
      '<div class="ue-encode-wrap">',
      '<div class="ue-detect-row">',
      '<div class="ue-detect-badge" id="ue-detect-badge">',
      '<span class="ue-detect-dot" id="ue-detect-dot"></span>',
      '<span id="ue-detect-label">Waiting for input\u2026</span>',
      '</div>',
      '</div>',
      '<div class="ue-io-row">',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Input</span><button class="ue-io-clear" id="ue-enc-clear-in">\u2715</button></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-enc-in" placeholder="Paste URL, encoded string, or plain text\u2026" spellcheck="false"></textarea>',
      '</div>',
      '<div class="ue-io-divider"><button class="ue-swap-btn" id="ue-enc-swap" title="Swap">\u21c4</button></div>',
      '<div class="ue-io-col">',
      '<div class="ue-io-label"><span>Output</span><button class="ue-io-clear" id="ue-enc-clear-out">\u2715</button></div>',
      '<textarea class="dh-textarea ue-textarea" id="ue-enc-out" placeholder="Result\u2026" readonly spellcheck="false"></textarea>',
      '</div>',
      '</div>',
      '<div class="ue-actions-row">',
      '<div class="ue-action-group">',
      '<button class="dh-btn primary ue-action-btn" id="ue-encode-comp">encodeURIComponent</button>',
      '<button class="dh-btn ue-action-btn" id="ue-decode-comp">decodeURIComponent</button>',
      '</div>',
      '<div class="ue-action-group">',
      '<button class="dh-btn ue-action-btn" id="ue-encode-uri">encodeURI</button>',
      '<button class="dh-btn ue-action-btn" id="ue-auto-btn">Auto</button>',
      '</div>',
      '<div class="ue-action-group">',
      '<button class="dh-btn ue-action-btn" id="ue-enc-copy">Copy</button>',
      '<button class="dh-btn danger ue-action-btn" id="ue-enc-clear-all">Clear</button>',
      '</div>',
      '</div>',
      '<div class="ue-options-row">',
      '<label class="ue-opt-label"><input type="checkbox" id="ue-live" checked class="ue-checkbox"/> Live encode</label>',
      '</div>',
      '<div class="ue-char-info" id="ue-char-info" style="display:none"></div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };

    function getIn()  { return $('ue-enc-in').value; }
    function setOut(v){ $('ue-enc-out').value = v; }
    function getOut() { return $('ue-enc-out').value; }

    function updateDetect(val) {
      var type = UEUtils.autoDetect(val);
      var dot  = $('ue-detect-dot');
      var lbl  = $('ue-detect-label');
      var badge= $('ue-detect-badge');
      var map = {
        empty:       { color:'#2e6060', text:'Waiting for input\u2026' },
        plain:       { color:'#22c55e', text:'Plain text detected' },
        url:         { color:'#00c8b4', text:'URL detected \u2014 click encodeURIComponent or encodeURI' },
        encoded:     { color:'#a78bfa', text:'Percent-encoded string detected \u2014 click Auto to decode' },
        querystring: { color:'#38bdf8', text:'Query string detected' },
      };
      var info = map[type] || map.empty;
      dot.style.background = info.color;
      lbl.textContent = info.text;
      badge.style.borderColor = info.color + '44';
    }

    function updateCharInfo(val) {
      var info = $('ue-char-info');
      if (!val) { info.style.display = 'none'; return; }
      info.style.display = '';
      info.textContent = val.length + ' chars \u00b7 ' + new TextEncoder().encode(val).length + ' bytes';
    }

    $('ue-enc-in').addEventListener('input', function() {
      var val = getIn();
      updateDetect(val);
      updateCharInfo(val);
      if ($('ue-live').checked && val) {
        try { setOut(UEUtils.encode(val)); } catch(e) {}
      } else if (!val) { setOut(''); }
    });

    $('ue-encode-comp').addEventListener('click', function() {
      try { setOut(UEUtils.encode(getIn())); setStatus('\u2713 encodeURIComponent', true); }
      catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
    $('ue-decode-comp').addEventListener('click', function() {
      try { setOut(UEUtils.decode(getIn())); setStatus('\u2713 decodeURIComponent', true); }
      catch(e) { setStatus('\u2717 Invalid encoding', false); }
    });
    $('ue-encode-uri').addEventListener('click', function() {
      try { setOut(UEUtils.encodeURI_(getIn())); setStatus('\u2713 encodeURI', true); }
      catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
    $('ue-auto-btn').addEventListener('click', function() {
      var type = UEUtils.autoDetect(getIn());
      try {
        if (type === 'encoded') { setOut(UEUtils.decode(getIn())); setStatus('\u2713 Auto decoded', true); }
        else { setOut(UEUtils.encode(getIn())); setStatus('\u2713 Auto encoded', true); }
      } catch(e) { setStatus('\u2717 ' + e.message, false); }
    });
    $('ue-enc-copy').addEventListener('click', function() {
      if (getOut()) { navigator.clipboard.writeText(getOut()); setStatus('Copied!', true); }
    });
    $('ue-enc-clear-all').addEventListener('click', function() {
      $('ue-enc-in').value = ''; setOut('');
      $('ue-char-info').style.display = 'none';
      updateDetect(''); setStatus('', true);
    });
    $('ue-enc-clear-in').addEventListener('click',  function() { $('ue-enc-in').value = ''; updateDetect(''); });
    $('ue-enc-clear-out').addEventListener('click', function() { setOut(''); });
    $('ue-enc-swap').addEventListener('click', function() {
      var tmp = getIn(); $('ue-enc-in').value = getOut(); setOut(tmp);
      updateDetect($('ue-enc-in').value);
    });
  },
};
