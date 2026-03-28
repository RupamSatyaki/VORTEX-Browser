// hash/index.js - Hash Generator Tool entry point
var HashTool = {
  id: 'hash-generator',
  name: 'Hash Generator',
  desc: 'MD5 \u00b7 SHA-1/256/384/512 \u00b7 HMAC \u00b7 File \u00b7 Compare \u00b7 Batch',
  icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h7"/><path d="M15 15l2 2 4-4"/></svg>',

  _cssInjected: false,

  _injectCSS: function() {
    if (this._cssInjected || document.getElementById('hash-styles')) return;
    var base = window.location.href.replace(/\/index\.html.*$/, '/');
    var link = document.createElement('link');
    link.id   = 'hash-styles';
    link.rel  = 'stylesheet';
    link.href = base + 'js/devhub/tools/hash/styles.css';
    document.head.appendChild(link);
    this._cssInjected = true;
  },

  render: function(container) {
    this._injectCSS();

    container.innerHTML = [
      '<div class="hash-main-wrap">',
      '<div class="hash-main-tabs">',
      '<button class="hash-main-tab active" data-tab="text">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      ' Text',
      '</button>',
      '<button class="hash-main-tab" data-tab="file">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
      ' File',
      '</button>',
      '<button class="hash-main-tab" data-tab="compare">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      ' Compare &amp; Batch',
      '</button>',
      '</div>',
      '<div class="hash-status-bar"><span class="dh-status" id="hash-status"></span></div>',
      '<div class="hash-main-content" id="hash-text-content"></div>',
      '<div class="hash-main-content" id="hash-file-content"    style="display:none"></div>',
      '<div class="hash-main-content" id="hash-compare-content" style="display:none"></div>',
      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };

    function setStatus(msg, ok) {
      var el = $('hash-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
      if (ok && msg) setTimeout(function() { if (el.textContent === msg) el.textContent = ''; }, 2000);
    }

    HashText.render($('hash-text-content'),    setStatus);
    HashFile.render($('hash-file-content'),    setStatus);
    HashCompare.render($('hash-compare-content'), setStatus);

    container.querySelectorAll('.hash-main-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.hash-main-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        $('hash-text-content').style.display    = tab.dataset.tab === 'text'    ? '' : 'none';
        $('hash-file-content').style.display    = tab.dataset.tab === 'file'    ? '' : 'none';
        $('hash-compare-content').style.display = tab.dataset.tab === 'compare' ? '' : 'none';
      });
    });
  },
};
