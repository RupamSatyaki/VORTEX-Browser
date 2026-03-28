// image-converter/converter.js - Main Image Converter component
var ImageConverter = {

  render: function(container) {
    container.innerHTML = [
      '<div class="ic-wrap">',

      // Header info
      '<div class="ic-header-info">Convert any image format \u2014 all processing happens locally in your browser</div>',

      // Drop zone
      '<div class="ic-drop-zone" id="ic-drop">',
      '<div class="ic-drop-icon">',
      '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#2e6060" stroke-width="1.2">',
      '<rect x="3" y="3" width="18" height="18" rx="2"/>',
      '<circle cx="8.5" cy="8.5" r="1.5"/>',
      '<polyline points="21 15 16 10 5 21"/>',
      '</svg>',
      '</div>',
      '<div class="ic-drop-text">Drop images here</div>',
      '<div class="ic-drop-sub">or</div>',
      '<label class="dh-btn ic-upload-btn">',
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      ' Choose Images',
      '<input type="file" id="ic-file-input" accept="image/*" multiple style="display:none"/>',
      '</label>',
      '<div class="ic-drop-hint">JPG \u00b7 PNG \u00b7 WebP \u00b7 GIF \u00b7 BMP \u00b7 SVG \u00b7 TIFF \u00b7 ICO \u00b7 Multiple files supported</div>',
      '</div>',

      // Settings panel
      '<div class="ic-settings" id="ic-settings" style="display:none">',

      // Output format
      '<div class="ic-settings-row">',
      '<div class="ic-settings-group">',
      '<div class="ic-settings-label">Output Format</div>',
      '<div class="ic-format-grid" id="ic-format-grid">',
      '<button class="ic-fmt-btn active" data-fmt="image/jpeg" data-ext="jpg">JPG</button>',
      '<button class="ic-fmt-btn" data-fmt="image/png"  data-ext="png">PNG</button>',
      '<button class="ic-fmt-btn" data-fmt="image/webp" data-ext="webp">WebP</button>',
      '<button class="ic-fmt-btn" data-fmt="image/bmp"  data-ext="bmp">BMP</button>',
      '<button class="ic-fmt-btn" data-fmt="image/gif"  data-ext="gif">GIF</button>',
      '</div>',
      '</div>',

      // Quality
      '<div class="ic-settings-group" id="ic-quality-group">',
      '<div class="ic-settings-label">Quality <span id="ic-quality-val">85%</span></div>',
      '<input type="range" id="ic-quality" min="1" max="100" value="85" class="ic-slider"/>',
      '<div class="ic-quality-hints"><span>Smaller file</span><span>Better quality</span></div>',
      '</div>',
      '</div>',

      // Resize
      '<div class="ic-settings-row">',
      '<div class="ic-settings-group">',
      '<div class="ic-settings-label">',
      'Resize',
      '<label class="ic-toggle-label"><input type="checkbox" id="ic-resize-enabled" class="hash-checkbox"/> Enable</label>',
      '</div>',
      '<div class="ic-resize-fields" id="ic-resize-fields" style="opacity:0.4;pointer-events:none;">',
      '<div class="ic-resize-row">',
      '<input class="dh-input ic-dim-input" id="ic-width"  type="number" min="1" max="8192" placeholder="Width"/>',
      '<span class="ic-dim-sep">\u00d7</span>',
      '<input class="dh-input ic-dim-input" id="ic-height" type="number" min="1" max="8192" placeholder="Height"/>',
      '<label class="ic-toggle-label"><input type="checkbox" id="ic-aspect" checked class="hash-checkbox"/> Lock ratio</label>',
      '</div>',
      '<div class="ic-resize-presets">',
      '<button class="dh-btn ic-preset-btn" data-w="1920" data-h="1080">1080p</button>',
      '<button class="dh-btn ic-preset-btn" data-w="1280" data-h="720">720p</button>',
      '<button class="dh-btn ic-preset-btn" data-w="800"  data-h="600">800\u00d7600</button>',
      '<button class="dh-btn ic-preset-btn" data-w="512"  data-h="512">512\u00d7512</button>',
      '<button class="dh-btn ic-preset-btn" data-w="256"  data-h="256">256\u00d7256</button>',
      '<button class="dh-btn ic-preset-btn" data-w="128"  data-h="128">128\u00d7128</button>',
      '</div>',
      '</div>',
      '</div>',

      // Flip/Rotate
      '<div class="ic-settings-group">',
      '<div class="ic-settings-label">Transform</div>',
      '<div class="ic-transform-row">',
      '<button class="dh-btn ic-transform-btn" data-action="rotate-90" title="Rotate 90\u00b0 CW">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>',
      ' 90\u00b0',
      '</button>',
      '<button class="dh-btn ic-transform-btn" data-action="rotate-180" title="Rotate 180\u00b0">180\u00b0</button>',
      '<button class="dh-btn ic-transform-btn" data-action="rotate-270" title="Rotate 270\u00b0 CW">270\u00b0</button>',
      '<button class="dh-btn ic-transform-btn" data-action="flip-h" title="Flip Horizontal">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="20" x2="12" y2="4"/></svg>',
      ' Flip H',
      '</button>',
      '<button class="dh-btn ic-transform-btn" data-action="flip-v" title="Flip Vertical">Flip V</button>',
      '<button class="dh-btn ic-transform-btn" data-action="grayscale" title="Grayscale">Gray</button>',
      '</div>',
      '</div>',
      '</div>',

      '</div>',

      // Image list
      '<div class="ic-image-list" id="ic-image-list" style="display:none">',
      '<div class="ic-list-header">',
      '<span class="ic-list-count" id="ic-list-count"></span>',
      '<div class="ic-list-actions">',
      '<button class="dh-btn primary ic-action-btn" id="ic-convert-all">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>',
      ' Convert All',
      '</button>',
      '<button class="dh-btn ic-action-btn" id="ic-download-all" style="display:none">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      ' Download All',
      '</button>',
      '<button class="dh-btn ic-action-btn" id="ic-add-more">+ Add More</button>',
      '<button class="dh-btn danger ic-action-btn" id="ic-clear-all">Clear</button>',
      '</div>',
      '</div>',
      '<div id="ic-items"></div>',
      '</div>',

      '</div>'
    ].join('');

    var $ = function(id) { return container.querySelector('#' + id); };
    var _images = []; // { id, file, origDataUrl, convertedDataUrl, origW, origH, status, transform }
    var _idCounter = 0;
    var _activeFmt = 'image/jpeg';
    var _activeExt = 'jpg';
    var _transforms = []; // pending transforms: ['rotate-90', 'flip-h', etc.]

    // ── Format selection ───────────────────────────────────────────────────────
    container.querySelectorAll('.ic-fmt-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        container.querySelectorAll('.ic-fmt-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        _activeFmt = btn.dataset.fmt;
        _activeExt = btn.dataset.ext;
        // Show/hide quality slider (not relevant for PNG/BMP)
        var showQuality = _activeFmt === 'image/jpeg' || _activeFmt === 'image/webp';
        $('ic-quality-group').style.opacity = showQuality ? '1' : '0.4';
        $('ic-quality-group').style.pointerEvents = showQuality ? '' : 'none';
      });
    });

    $('ic-quality').addEventListener('input', function(e) {
      $('ic-quality-val').textContent = e.target.value + '%';
    });

    // ── Resize toggle ──────────────────────────────────────────────────────────
    $('ic-resize-enabled').addEventListener('change', function() {
      var fields = $('ic-resize-fields');
      fields.style.opacity = this.checked ? '1' : '0.4';
      fields.style.pointerEvents = this.checked ? '' : 'none';
    });

    // Aspect ratio lock
    var _origRatio = 1;
    $('ic-width').addEventListener('input', function() {
      if ($('ic-aspect').checked && _origRatio) {
        $('ic-height').value = Math.round(+this.value / _origRatio) || '';
      }
    });
    $('ic-height').addEventListener('input', function() {
      if ($('ic-aspect').checked && _origRatio) {
        $('ic-width').value = Math.round(+this.value * _origRatio) || '';
      }
    });

    // Presets
    container.querySelectorAll('.ic-preset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        $('ic-width').value  = btn.dataset.w;
        $('ic-height').value = btn.dataset.h;
      });
    });

    // ── Transform buttons ──────────────────────────────────────────────────────
    container.querySelectorAll('.ic-transform-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        btn.classList.toggle('active');
        var action = btn.dataset.action;
        var idx = _transforms.indexOf(action);
        if (idx === -1) _transforms.push(action);
        else _transforms.splice(idx, 1);
      });
    });

    // ── Drop zone ──────────────────────────────────────────────────────────────
    var drop = $('ic-drop');
    drop.addEventListener('dragover',  function(e) { e.preventDefault(); drop.classList.add('ic-drop-active'); });
    drop.addEventListener('dragleave', function()  { drop.classList.remove('ic-drop-active'); });
    drop.addEventListener('drop', function(e) { e.preventDefault(); drop.classList.remove('ic-drop-active'); addFiles(e.dataTransfer.files); });
    $('ic-file-input').addEventListener('change', function(e) { addFiles(e.target.files); e.target.value = ''; });

    $('ic-add-more').addEventListener('click', function() { $('ic-file-input').click(); });

    function addFiles(files) {
      Array.from(files).forEach(function(file) {
        if (!file.type.startsWith('image/')) return;
        var id = ++_idCounter;
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.onload = function() {
            _origRatio = img.width / img.height;
            _images.push({ id: id, file: file, origDataUrl: e.target.result, convertedDataUrl: null, origW: img.width, origH: img.height, status: 'ready', transform: [] });
            renderList();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      $('ic-settings').style.display = '';
      $('ic-drop').style.display = 'none';
    }

    // ── Convert ────────────────────────────────────────────────────────────────
    function convertImage(imgData) {
      return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
          var cv = document.createElement('canvas');
          var w = img.naturalWidth, h = img.naturalHeight;

          // Resize
          if ($('ic-resize-enabled').checked) {
            var tw = +$('ic-width').value  || 0;
            var th = +$('ic-height').value || 0;
            if (tw && !th) { th = Math.round(h * tw / w); w = tw; }
            else if (th && !tw) { tw = Math.round(w * th / h); w = tw; h = th; }
            else if (tw && th) { w = tw; h = th; }
          }

          // Apply transforms
          var transforms = _transforms.slice();
          var needsSwap = transforms.filter(function(t) { return t === 'rotate-90' || t === 'rotate-270'; }).length % 2 === 1;
          if (needsSwap) { var tmp = w; w = h; h = tmp; }

          cv.width = w; cv.height = h;
          var ctx = cv.getContext('2d');

          // Background for JPEG (no transparency)
          if (_activeFmt === 'image/jpeg' || _activeFmt === 'image/bmp') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
          }

          ctx.save();
          ctx.translate(w/2, h/2);

          transforms.forEach(function(t) {
            if (t === 'rotate-90')  ctx.rotate(Math.PI/2);
            if (t === 'rotate-180') ctx.rotate(Math.PI);
            if (t === 'rotate-270') ctx.rotate(-Math.PI/2);
            if (t === 'flip-h') ctx.scale(-1, 1);
            if (t === 'flip-v') ctx.scale(1, -1);
          });

          var dw = needsSwap ? h : w;
          var dh = needsSwap ? w : h;
          ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
          ctx.restore();

          // Grayscale
          if (transforms.indexOf('grayscale') !== -1) {
            var imageData = ctx.getImageData(0, 0, w, h);
            var d = imageData.data;
            for (var i = 0; i < d.length; i += 4) {
              var gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
              d[i] = d[i+1] = d[i+2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
          }

          var quality = +$('ic-quality').value / 100;
          resolve({ dataUrl: cv.toDataURL(_activeFmt, quality), w: w, h: h });
        };
        img.src = imgData.origDataUrl;
      });
    }

    async function convertAll() {
      $('ic-convert-all').disabled = true;
      $('ic-convert-all').textContent = 'Converting\u2026';
      for (var i = 0; i < _images.length; i++) {
        _images[i].status = 'converting';
        renderList();
        var result = await convertImage(_images[i]);
        _images[i].convertedDataUrl = result.dataUrl;
        _images[i].convertedW = result.w;
        _images[i].convertedH = result.h;
        _images[i].status = 'done';
        renderList();
      }
      $('ic-convert-all').disabled = false;
      $('ic-convert-all').textContent = 'Convert All';
      $('ic-download-all').style.display = '';
    }

    $('ic-convert-all').addEventListener('click', convertAll);

    // ── Download ───────────────────────────────────────────────────────────────
    function downloadImage(imgData) {
      if (!imgData.convertedDataUrl) return;
      var baseName = imgData.file.name.replace(/\.[^.]+$/, '');
      var filename = baseName + '_converted.' + _activeExt;

      if (window.vortexAPI && typeof window.vortexAPI.send === 'function') {
        // Send via IPC → triggers will-download → appears in Downloads panel
        window.vortexAPI.send('devhub:download', { dataUrl: imgData.convertedDataUrl, filename: filename });
      } else {
        // Fallback: direct anchor download
        var a = document.createElement('a');
        a.href = imgData.convertedDataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }

    $('ic-download-all').addEventListener('click', function() {
      _images.filter(function(img) { return img.status === 'done'; }).forEach(function(img) {
        setTimeout(function() { downloadImage(img); }, 200);
      });
    });

    // ── Render list ────────────────────────────────────────────────────────────
    function fmtBytes(n) {
      if (n < 1024) return n + ' B';
      if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
      return (n/1024/1024).toFixed(2) + ' MB';
    }

    function renderList() {
      var list = $('ic-image-list');
      var items = $('ic-items');
      if (!_images.length) { list.style.display = 'none'; return; }
      list.style.display = '';
      $('ic-list-count').textContent = _images.length + ' image' + (_images.length !== 1 ? 's' : '');

      items.innerHTML = _images.map(function(img) {
        var statusClass = 'ic-status-' + img.status;
        var statusText = { ready:'Ready', converting:'Converting\u2026', done:'Done' }[img.status] || img.status;
        var convSize = img.convertedDataUrl ? fmtBytes(Math.round(img.convertedDataUrl.length * 0.75)) : '';
        var origSize = fmtBytes(img.file.size);

        return '<div class="ic-item" data-id="' + img.id + '">' +

          // ── Preview section ──
          '<div class="ic-item-previews">' +
          '<div class="ic-preview-col">' +
          '<div class="ic-preview-label">Original</div>' +
          '<div class="ic-preview-box ic-preview-orig" data-src="' + img.origDataUrl + '" title="Click to enlarge">' +
          '<img src="' + img.origDataUrl + '" class="ic-preview-img" alt="original"/>' +
          '<div class="ic-preview-dim">' + img.origW + '\u00d7' + img.origH + '</div>' +
          '<div class="ic-preview-size">' + origSize + '</div>' +
          '</div>' +
          '</div>' +

          (img.convertedDataUrl ?
            '<div class="ic-preview-arrow">' +
            '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00c8b4" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
            '<div class="ic-preview-arrow-label">' + _activeExt.toUpperCase() + '</div>' +
            '</div>' +
            '<div class="ic-preview-col">' +
            '<div class="ic-preview-label">Converted</div>' +
            '<div class="ic-preview-box ic-preview-conv" data-src="' + img.convertedDataUrl + '" title="Click to enlarge">' +
            '<img src="' + img.convertedDataUrl + '" class="ic-preview-img" alt="converted"/>' +
            '<div class="ic-preview-dim">' + (img.convertedW || img.origW) + '\u00d7' + (img.convertedH || img.origH) + '</div>' +
            '<div class="ic-preview-size">' + convSize + '</div>' +
            '</div>' +
            '</div>'
          : '<div class="ic-preview-placeholder"><div class="ic-preview-placeholder-inner">Convert to see preview</div></div>') +

          '</div>' +

          // ── Info + actions ──
          '<div class="ic-item-body">' +
          '<div class="ic-item-name">' + img.file.name.replace(/</g,'&lt;') + '</div>' +
          '<div class="ic-item-meta">' + img.file.type + '</div>' +
          '<div class="ic-item-status ' + statusClass + '">' + statusText + '</div>' +
          '<div class="ic-item-actions">' +
          (img.status === 'done' ?
            '<button class="dh-btn primary ic-action-btn ic-dl-btn" data-id="' + img.id + '">' +
            '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            ' Download</button>' : '') +
          '<button class="dh-btn danger ic-action-btn ic-remove-btn" data-id="' + img.id + '">\u2715</button>' +
          '</div>' +
          '</div>' +

          '</div>';
      }).join('');

      // Click to enlarge preview
      items.querySelectorAll('.ic-preview-box').forEach(function(box) {
        box.addEventListener('click', function() {
          var src = box.dataset.src;
          if (!src) return;
          var overlay = document.createElement('div');
          overlay.className = 'ic-lightbox';
          overlay.innerHTML = '<div class="ic-lightbox-inner"><img src="' + src + '" class="ic-lightbox-img"/><button class="ic-lightbox-close">\u2715</button></div>';
          document.body.appendChild(overlay);
          overlay.addEventListener('click', function(e) {
            if (e.target === overlay || e.target.classList.contains('ic-lightbox-close')) {
              document.body.removeChild(overlay);
            }
          });
        });
      });

      items.querySelectorAll('.ic-dl-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var img = _images.find(function(i) { return i.id === +btn.dataset.id; });
          if (img) downloadImage(img);
        });
      });
      items.querySelectorAll('.ic-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          _images = _images.filter(function(i) { return i.id !== +btn.dataset.id; });
          if (!_images.length) {
            $('ic-image-list').style.display = 'none';
            $('ic-settings').style.display = 'none';
            $('ic-drop').style.display = '';
          }
          renderList();
        });
      });
    }

    $('ic-clear-all').addEventListener('click', function() {
      _images = [];
      $('ic-image-list').style.display = 'none';
      $('ic-settings').style.display = 'none';
      $('ic-drop').style.display = '';
      $('ic-download-all').style.display = 'none';
    });
  },
};
