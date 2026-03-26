// url-encoder/index.js - URL Encoder Tool entry point
var UrlEncoderTool = {
  id: 'url-encoder',
  name: 'URL Encoder',
  desc: 'Encode \u00b7 Parse \u00b7 Builder \u00b7 Validate \u00b7 QR \u00b7 Code Gen',
  icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',

  _cssInjected: false,

  _injectCSS: function() {
    if (this._cssInjected || document.getElementById('ue-styles')) return;
    var base = window.location.href.replace(/\/index\.html.*$/, '/');
    var link = document.createElement('link');
    link.id   = 'ue-styles';
    link.rel  = 'stylesheet';
    link.href = base + 'js/devhub/tools/url-encoder/styles.css';
    document.head.appendChild(link);
    this._cssInjected = true;
  },

  render: function(container) {
    this._injectCSS();

    container.innerHTML = [
      '<div class="ue-main-wrap">',
      '<div class="ue-main-tabs">',
      '<button class="ue-main-tab active" data-tab="encode">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      'Encode/Decode',
      '</button>',
      '<button class="ue-main-tab" data-tab="parse">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      'Parse &amp; Edit',
      '</button>',
      '<button class="ue-main-tab" data-tab="builder">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      'Builder',
      '</button>',
      '<button class="ue-main-tab" data-tab="tools">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      'Tools',
      '</button>',
      '</div>',
      '<div class="ue-status-bar"><span class="dh-status" id="ue-status"></span></div>',
      '<div class="ue-main-content" id="ue-encode-content"></div>',
      '<div class="ue-main-content" id="ue-parse-content"   style="display:none"></div>',
      '<div class="ue-main-content" id="ue-builder-content" style="display:none"></div>',
      '<div class="ue-main-content" id="ue-tools-content"   style="display:none"></div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };

    function setStatus(msg, ok) {
      var el = $('ue-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
      if (ok && msg) setTimeout(function() { if (el.textContent === msg) el.textContent = ''; }, 2000);
    }

    UEEncode.render($('ue-encode-content'), setStatus);
    UEParser.render($('ue-parse-content'),  setStatus);
    UEBuilder.render($('ue-builder-content'), setStatus);
    UETools.render($('ue-tools-content'),   setStatus);

    container.querySelectorAll('.ue-main-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.ue-main-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        $('ue-encode-content').style.display  = tab.dataset.tab === 'encode'  ? '' : 'none';
        $('ue-parse-content').style.display   = tab.dataset.tab === 'parse'   ? '' : 'none';
        $('ue-builder-content').style.display = tab.dataset.tab === 'builder' ? '' : 'none';
        $('ue-tools-content').style.display   = tab.dataset.tab === 'tools'   ? '' : 'none';
      });
    });
  },
};
