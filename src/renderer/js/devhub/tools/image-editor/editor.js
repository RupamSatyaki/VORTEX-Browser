// image-editor/editor.js - Main editor shell: header, toolbar, canvas area, footer, panels
var ImageEditor = {

  _activeTool: 'select',
  _fileName: '',
  _fileSize: 0,
  _adjState: { brightness:0, contrast:0, saturation:0, hue:0, exposure:0 },
  _brushOpts: { color:'#ff0000', size:10, opacity:1 },
  _textOpts:  { text:'Hello', font:'Arial', size:32, color:'#ffffff', bold:false, italic:false, align:'left', opacity:1 },
  _cropRect:  null,
  _cropDragging: false,
  _drawActive: false,
  _container: null,

  render: function(container) {
    this._container = container;
    container.innerHTML = this._buildHTML();
    EditorCanvas.init(container.querySelector('#ie-canvas-wrap'), this._onCanvasUpdate.bind(this));
    this._bindAll();
    this._showDropZone(true);
  },

  _buildHTML: function() {
    return [
      '<div class="ie-wrap" id="ie-wrap">',

      // ── Drop zone ──
      '<div class="ie-dropzone" id="ie-dropzone">',
      '<div class="ie-dz-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#2e6060" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>',
      '<div class="ie-dz-text">Drop an image to edit</div>',
      '<div class="ie-dz-sub">or</div>',
      '<label class="dh-btn ie-dz-btn">Open Image<input type="file" id="ie-open-file" accept="image/*" style="display:none"/></label>',
      '<div class="ie-dz-hint">JPG · PNG · WebP · GIF · BMP · SVG</div>',
      '</div>',

      // ── Editor UI (hidden until image loaded) ──
      '<div class="ie-editor" id="ie-editor" style="display:none">',

      // Header
      '<div class="ie-header">',
      '<div class="ie-header-left">',
      '<div class="ie-file-info" id="ie-file-info">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      '<span class="ie-filename" id="ie-filename">image.jpg</span>',
      '<button class="ie-hdr-btn" id="ie-info-btn" title="Image info (I)">',
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      '</button>',
      '</div>',
      '</div>',

      '<div class="ie-header-center">',
      // Undo/Redo
      '<button class="ie-hdr-btn" id="ie-undo" title="Undo (Ctrl+Z)" disabled>',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>',
      '</button>',
      '<span class="ie-hist-badge" id="ie-hist-badge">0/0</span>',
      '<button class="ie-hdr-btn" id="ie-redo" title="Redo (Ctrl+Y)" disabled>',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.95"/></svg>',
      '</button>',
      '<div class="ie-hdr-sep"></div>',
      // Rotate
      '<button class="ie-hdr-btn" id="ie-rot-ccw" title="Rotate 90° CCW (Shift+R)">',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>',
      '</button>',
      '<button class="ie-hdr-btn" id="ie-rot-cw" title="Rotate 90° CW (R)">',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.95"/></svg>',
      '</button>',
      '<button class="ie-hdr-btn" id="ie-flip-h" title="Flip Horizontal (H)">',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="20" x2="12" y2="4"/></svg>',
      '</button>',
      '<button class="ie-hdr-btn" id="ie-flip-v" title="Flip Vertical (V)">',
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
      '</button>',
      '<div class="ie-hdr-sep"></div>',
      // Zoom
      '<button class="ie-hdr-btn" id="ie-zoom-out" title="Zoom Out (Ctrl+-)">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
      '</button>',
      '<button class="ie-zoom-pct" id="ie-zoom-pct" title="Reset zoom (Ctrl+0)">100%</button>',
      '<button class="ie-hdr-btn" id="ie-zoom-in" title="Zoom In (Ctrl+=)">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
      '</button>',
      '<button class="ie-hdr-btn" id="ie-zoom-fit" title="Fit to window (Ctrl+Shift+0)">Fit</button>',
      '</div>',

      '<div class="ie-header-right">',
      '<button class="ie-hdr-btn" id="ie-before-after-btn" title="Toggle Before/After (\\)">B/A</button>',
      '<button class="ie-hdr-btn" id="ie-shortcuts-btn" title="Keyboard shortcuts (?)">?</button>',
      '<div class="ie-dropdown-wrap">',
      '<button class="dh-btn ie-save-btn" id="ie-save-btn">',
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
      ' Save <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>',
      '</button>',
      '<div class="ie-dropdown" id="ie-save-menu">',
      '<button class="ie-dd-item" data-fmt="image/png"  data-ext="png">Save as PNG</button>',
      '<button class="ie-dd-item" data-fmt="image/jpeg" data-ext="jpg">Save as JPG</button>',
      '<button class="ie-dd-item" data-fmt="image/webp" data-ext="webp">Save as WebP</button>',
      '<button class="ie-dd-item" data-fmt="image/bmp"  data-ext="bmp">Save as BMP</button>',
      '<div class="ie-dd-sep"></div>',
      '<button class="ie-dd-item" id="ie-copy-clip">Copy to Clipboard</button>',
      '</div>',
      '</div>',
      '<button class="ie-hdr-btn ie-close-btn" id="ie-close-btn" title="Close editor">',
      '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>',
      '</button>',
      '</div>',
      '</div>',

      // Body
      '<div class="ie-body">',

      // Left toolbar
      '<div class="ie-toolbar" id="ie-toolbar">',
      this._buildToolbar(),
      '</div>',

      // Canvas area
      '<div class="ie-canvas-area">',
      '<div class="ie-canvas-wrap" id="ie-canvas-wrap">',
      '<div class="ie-checker"></div>',
      '<canvas id="ie-canvas"></canvas>',
      '<canvas id="ie-overlay-canvas" style="position:absolute;top:0;left:0;pointer-events:none;"></canvas>',
      '</div>',
      '</div>',

      // Right panel
      '<div class="ie-panel" id="ie-panel">',
      '<div class="ie-panel-tabs">',
      '<button class="ie-ptab active" data-ptab="options">Options</button>',
      '<button class="ie-ptab" data-ptab="layers">Layers</button>',
      '</div>',
      '<div id="ie-panel-content"></div>',
      '<div id="ie-layers-content" style="display:none"></div>',
      '</div>',

      '</div>',

      // Footer
      '<div class="ie-footer">',
      '<span id="ie-footer-size">0 × 0</span>',
      '<span class="ie-footer-sep">·</span>',
      '<span id="ie-footer-zoom">100%</span>',
      '<span class="ie-footer-sep">·</span>',
      '<span id="ie-footer-tool">Select</span>',
      '<span class="ie-footer-sep">·</span>',
      '<span id="ie-footer-pos">0, 0</span>',
      '<span class="ie-footer-sep">·</span>',
      '<span id="ie-footer-hist">History: 0/0</span>',
      '</div>',

      '</div>',

      // Info modal
      '<div class="ie-modal" id="ie-info-modal" style="display:none">',
      '<div class="ie-modal-inner">',
      '<div class="ie-modal-header"><span>Image Info</span><button class="ie-hdr-btn" id="ie-info-close">\u2715</button></div>',
      '<div class="ie-modal-body" id="ie-info-body"></div>',
      '</div>',
      '</div>',

      '</div>',
    ].join('');
  },

  _buildToolbar: function() {
    var tools = [
      { id:'select',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-7 1-4 7z"/></svg>', title:'Select / Move (V)' },
      { id:'crop',     icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>', title:'Crop (C)' },
      { id:'rotate',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.95"/></svg>', title:'Rotate (R)' },
      { id:'resize',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>', title:'Resize (S)' },
      { id:'adjust',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>', title:'Adjustments (A)' },
      { id:'filter',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>', title:'Filters (F)' },
      { id:'draw',     icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>', title:'Draw / Brush (B)' },
      { id:'eraser',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20H7L3 16l10-10 7 7-3 3"/><path d="M6.0001 10.0001L14 18"/></svg>', title:'Eraser (E)' },
      { id:'text',     icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', title:'Text (T)' },
      { id:'overlay',  icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>', title:'Image Overlay (O)' },
      { id:'border',   icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><rect x="6" y="6" width="12" height="12" rx="1"/></svg>', title:'Border / Frame' },
    ];
    return tools.map(function(t) {
      return '<button class="ie-tool-btn" data-tool="' + t.id + '" id="ie-tool-' + t.id + '" title="' + t.title + '">' + t.icon + '</button>';
    }).join('');
  },
};

ImageEditor._showDropZone = function(show) {
  var dz = this._container.querySelector('#ie-dropzone');
  var ed = this._container.querySelector('#ie-editor');
  dz.style.display = show ? '' : 'none';
  ed.style.display = show ? 'none' : 'flex';
};

ImageEditor._onCanvasUpdate = function(info) {
  var $ = function(id) { return document.getElementById(id); };
  if ($('ie-footer-size'))  $('ie-footer-size').textContent  = info.w + ' \u00d7 ' + info.h;
  if ($('ie-footer-zoom'))  $('ie-footer-zoom').textContent  = info.zoom + '%';
  if ($('ie-footer-hist'))  $('ie-footer-hist').textContent  = 'History: ' + (info.histIdx+1) + '/' + info.histLen;
  if ($('ie-zoom-pct'))     $('ie-zoom-pct').textContent     = info.zoom + '%';
  if ($('ie-hist-badge'))   $('ie-hist-badge').textContent   = (info.histIdx+1) + '/' + info.histLen;
  if ($('ie-undo')) $('ie-undo').disabled = !info.canUndo;
  if ($('ie-redo')) $('ie-redo').disabled = !info.canRedo;
};

ImageEditor._setTool = function(tool) {
  this._activeTool = tool;
  var btns = this._container.querySelectorAll('.ie-tool-btn');
  btns.forEach(function(b) { b.classList.toggle('active', b.dataset.tool === tool); });
  var footer = document.getElementById('ie-footer-tool');
  if (footer) footer.textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
  this._renderPanel(tool);
  // Activate interaction mode
  EditorInteractions.setMode(tool);
};

ImageEditor._renderPanel = function(tool) {
  var panel = this._container.querySelector('#ie-panel-content');
  if (!panel) return;
  var self = this;

  if (tool === 'adjust') {
    panel.innerHTML = EditorAdjustments.buildPanel(this._adjState);
    EditorAdjustments.bind(panel, this._adjState, function(adj) {
      self._adjState = adj;
      EditorCanvas.applyAdjustments(adj);
    }, function() {
      EditorCanvas.commitAdjustments();
    });
  } else if (tool === 'filter') {
    panel.innerHTML = EditorFilters.buildPanel();
    EditorFilters.bindPanel(panel,
      function() { return EditorCanvas._ctx; },
      function() { return EditorCanvas._canvas; },
      function() { EditorCanvas._saveHistory(); }
    );
  } else if (tool === 'border') {
    panel.innerHTML = EditorFilters.buildBorderPanel();
    EditorFilters.bindBorderPanel(panel,
      function() { return EditorCanvas._ctx; },
      function() { return EditorCanvas._canvas; },
      function() { EditorCanvas._saveHistory(); EditorCanvas.fitToContainer(); }
    );
  } else if (tool === 'crop') {
    panel.innerHTML = EditorAdjustments.buildCropPanel();
    EditorAdjustments.bindCrop(panel, function() { self._confirmCrop(); }, function() { self._cancelCrop(); });
  } else if (tool === 'rotate') {
    panel.innerHTML = EditorAdjustments.buildRotatePanel();
    EditorAdjustments.bindRotate(panel, function(deg) { EditorCanvas.rotate(deg); });
  } else if (tool === 'resize') {
    var sz = EditorCanvas.getSize();
    panel.innerHTML = EditorAdjustments.buildResizePanel(sz.w, sz.h);
    EditorAdjustments.bindResize(panel, function(w, h) { EditorCanvas.resize(w, h); });
  } else if (tool === 'draw') {
    panel.innerHTML = EditorAdjustments.buildDrawPanel(this._brushOpts);
    EditorAdjustments.bindDraw(panel, this._brushOpts, function(opts) { self._brushOpts = opts; });
  } else if (tool === 'eraser') {
    panel.innerHTML = EditorAdjustments.buildEraserPanel(this._brushOpts);
    EditorAdjustments.bindDraw(panel, this._brushOpts, function(opts) { self._brushOpts = opts; });
  } else if (tool === 'text') {
    panel.innerHTML = EditorAdjustments.buildTextPanel(this._textOpts);
    var self2 = this;
    EditorAdjustments.bindText(panel, this._textOpts, function(opts) {
      self2._textOpts = opts;
      // Live preview: update last text item
      var items = EditorInteractions._textItems;
      if (items.length) {
        items[items.length-1].text = opts.text;
        items[items.length-1].opts = Object.assign({}, opts);
        EditorInteractions._drawTextOverlay();
      }
    });
    // Place text button
    var placeBtn = document.createElement('button');
    placeBtn.className = 'dh-btn primary ie-action-btn';
    placeBtn.textContent = 'Place Text';
    placeBtn.style.marginTop = '6px';
    placeBtn.addEventListener('click', function() {
      var sz = EditorCanvas.getSize();
      var item = { text: self2._textOpts.text, x: sz.w/2, y: sz.h/2, opts: Object.assign({}, self2._textOpts) };
      EditorInteractions.addTextItem(item);
      EditorLayers.addLayer('text', '"' + self2._textOpts.text.slice(0,12) + '"', item);
    });
    var commitBtn = document.createElement('button');
    commitBtn.className = 'dh-btn ie-action-btn';
    commitBtn.textContent = 'Commit to Image';
    commitBtn.style.marginTop = '4px';
    commitBtn.addEventListener('click', function() {
      EditorInteractions.commitTextToCanvas();
      EditorCanvas._saveHistory();
    });
    panel.querySelector('.ie-panel-section').appendChild(placeBtn);
    panel.querySelector('.ie-panel-section').appendChild(commitBtn);
  } else if (tool === 'overlay') {
    panel.innerHTML = EditorOverlay.buildPanel();
    EditorOverlay.bind(panel, function(img, x, y, w, h, opacity) {
      var item = { img: img, x: x, y: y, w: w, h: h, opacity: opacity };
      EditorInteractions.addOverlayItem(item);
      EditorLayers.addLayer('overlay', 'Image overlay', item);
    });
    // Commit button
    var commitOvBtn = document.createElement('button');
    commitOvBtn.className = 'dh-btn primary ie-action-btn';
    commitOvBtn.textContent = 'Commit Overlay';
    commitOvBtn.style.marginTop = '6px';
    commitOvBtn.addEventListener('click', function() {
      EditorInteractions.commitOverlayToCanvas();
      EditorCanvas._saveHistory();
    });
    panel.querySelector('.ie-panel-section').appendChild(commitOvBtn);
  } else {
    panel.innerHTML = '<div class="ie-panel-empty"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1e3838" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><div>Select a tool to see options</div></div>';
  }
};

ImageEditor._loadFile = function(file) {
  if (!file || !file.type.startsWith('image/')) return;
  this._fileName = file.name;
  this._fileSize = file.size;
  var self = this;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      self._showDropZone(false);
      EditorCanvas.loadImage(img);
      EditorInteractions.init(self._container,
        function(r) { /* crop change */ },
        function(deg) { /* rotate change */ }
      );
      EditorShortcuts.init(self._container.querySelector('#ie-canvas'));
      EditorShortcuts.saveBeforeSnapshot();
      EditorLayers.init(self._container.querySelector('#ie-layers-content'), function() {});
      var fn = self._container.querySelector('#ie-filename');
      if (fn) fn.textContent = file.name;
      self._setTool('select');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

ImageEditor._confirmCrop = function() {
  var r = EditorInteractions.getCropRect() || this._cropRect;
  if (!r || r.w < 2 || r.h < 2) return;
  EditorCanvas.crop(r.x, r.y, r.w, r.h);
  EditorInteractions.setMode('select');
  this._setTool('select');
};

ImageEditor._cancelCrop = function() {
  this._cropRect = null;
  this._clearCropOverlay();
};

ImageEditor._clearCropOverlay = function() {
  var oc = this._container.querySelector('#ie-overlay-canvas');
  if (oc) { var ctx = oc.getContext('2d'); ctx.clearRect(0, 0, oc.width, oc.height); }
};

ImageEditor._drawCropOverlay = function(r) {
  var cv = this._container.querySelector('#ie-canvas');
  var oc = this._container.querySelector('#ie-overlay-canvas');
  oc.width = cv.width; oc.height = cv.height;
  oc.style.width  = cv.style.width  || cv.width  + 'px';
  oc.style.height = cv.style.height || cv.height + 'px';
  oc.style.transform = cv.style.transform;
  oc.style.transformOrigin = '0 0';
  var ctx = oc.getContext('2d');
  ctx.clearRect(0, 0, oc.width, oc.height);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, oc.width, oc.height);
  ctx.clearRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = '#00c8b4';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  // Rule of thirds
  ctx.strokeStyle = 'rgba(0,200,180,0.3)';
  ctx.lineWidth = 0.5;
  for (var i = 1; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(r.x + r.w*i/3, r.y); ctx.lineTo(r.x + r.w*i/3, r.y+r.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h*i/3); ctx.lineTo(r.x+r.w, r.y + r.h*i/3); ctx.stroke();
  }
  // Update crop panel inputs
  var px = this._container.querySelector('#ie-crop-x'); if (px) px.value = Math.round(r.x);
  var py = this._container.querySelector('#ie-crop-y'); if (py) py.value = Math.round(r.y);
  var pw = this._container.querySelector('#ie-crop-w'); if (pw) pw.value = Math.round(r.w);
  var ph = this._container.querySelector('#ie-crop-h'); if (ph) ph.value = Math.round(r.h);
};

ImageEditor._bindAll = function() {
  var self = this;
  var c = this._container;
  var $ = function(id) { return c.querySelector('#' + id); };

  // File open
  $('ie-open-file').addEventListener('change', function(e) { self._loadFile(e.target.files[0]); e.target.value=''; });
  var dz = $('ie-dropzone');
  dz.addEventListener('dragover',  function(e) { e.preventDefault(); dz.classList.add('ie-dz-active'); });
  dz.addEventListener('dragleave', function()  { dz.classList.remove('ie-dz-active'); });
  dz.addEventListener('drop', function(e) { e.preventDefault(); dz.classList.remove('ie-dz-active'); self._loadFile(e.dataTransfer.files[0]); });

  // Header buttons
  $('ie-undo').addEventListener('click', function() { EditorCanvas.undo(); });
  $('ie-redo').addEventListener('click', function() { EditorCanvas.redo(); });
  $('ie-rot-cw').addEventListener('click',  function() { EditorCanvas.rotate(90); });
  $('ie-rot-ccw').addEventListener('click', function() { EditorCanvas.rotate(-90); });
  $('ie-flip-h').addEventListener('click',  function() { EditorCanvas.flip('h'); });
  $('ie-flip-v').addEventListener('click',  function() { EditorCanvas.flip('v'); });
  $('ie-zoom-in').addEventListener('click',  function() { EditorCanvas.zoomIn(); });
  $('ie-zoom-out').addEventListener('click', function() { EditorCanvas.zoomOut(); });
  $('ie-zoom-pct').addEventListener('click', function() { EditorCanvas.zoom100(); });
  $('ie-zoom-fit').addEventListener('click', function() { EditorCanvas.fitToContainer(); });
  $('ie-close-btn').addEventListener('click', function() { self._showDropZone(true); });

  // Save dropdown
  $('ie-save-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    var m = $('ie-save-menu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', function() { var m = $('ie-save-menu'); if (m) m.style.display='none'; });
  c.querySelectorAll('.ie-dd-item[data-fmt]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var dataUrl  = EditorCanvas.toDataURL(btn.dataset.fmt, 0.92);
      var baseName = self._fileName.replace(/\.[^.]+$/, '');
      var filename = baseName + '.' + btn.dataset.ext;
      if (window.vortexAPI && window.vortexAPI.send) {
        window.vortexAPI.send('devhub:download', { dataUrl: dataUrl, filename: filename });
      } else {
        var a = document.createElement('a'); a.href=dataUrl; a.download=filename; a.click();
      }
    });
  });
  $('ie-copy-clip').addEventListener('click', async function() {
    try {
      var dataUrl = EditorCanvas.toDataURL('image/png');
      var res = await fetch(dataUrl);
      var blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
    } catch(e) {}
  });

  // Before/After + Shortcuts
  var baBtn = $('ie-before-after-btn');
  if (baBtn) baBtn.addEventListener('click', function() { EditorShortcuts.toggleBeforeAfter(); });
  var scBtn = $('ie-shortcuts-btn');
  if (scBtn) scBtn.addEventListener('click', function() { EditorShortcuts.showCheatsheet(); });

  // Panel tabs (Options / Layers)
  c.querySelectorAll('.ie-ptab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      c.querySelectorAll('.ie-ptab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      $('ie-panel-content').style.display  = tab.dataset.ptab === 'options' ? '' : 'none';
      $('ie-layers-content').style.display = tab.dataset.ptab === 'layers'  ? '' : 'none';
    });
  });

  // Info modal
  $('ie-info-btn').addEventListener('click', function() {
    var sz = EditorCanvas.getSize();
    $('ie-info-body').innerHTML = [
      '<div class="ie-info-row"><span>Filename</span><span>' + self._fileName + '</span></div>',
      '<div class="ie-info-row"><span>Dimensions</span><span>' + sz.w + ' \u00d7 ' + sz.h + ' px</span></div>',
      '<div class="ie-info-row"><span>Megapixels</span><span>' + ((sz.w*sz.h)/1000000).toFixed(2) + ' MP</span></div>',
      '<div class="ie-info-row"><span>File size</span><span>' + (self._fileSize > 0 ? (self._fileSize/1024).toFixed(1)+' KB' : 'N/A') + '</span></div>',
      '<div class="ie-info-row"><span>Aspect ratio</span><span>' + sz.w + ':' + sz.h + '</span></div>',
    ].join('');
    $('ie-info-modal').style.display = 'flex';
  });
  $('ie-info-close').addEventListener('click', function() { $('ie-info-modal').style.display='none'; });
  $('ie-info-modal').addEventListener('click', function(e) { if (e.target===$('ie-info-modal')) $('ie-info-modal').style.display='none'; });

  // Toolbar tool buttons
  c.querySelectorAll('.ie-tool-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { self._setTool(btn.dataset.tool); });
  });

  // Canvas mouse events
  var cv = $('ie-canvas');
  cv.addEventListener('mousemove', function(e) {
    var pos = EditorCanvas.clientToCanvas(e.clientX, e.clientY);
    var fp = document.getElementById('ie-footer-pos');
    if (fp) fp.textContent = Math.round(pos.x) + ', ' + Math.round(pos.y);

    if (self._activeTool === 'crop' && self._cropDragging) {
      var r = self._cropRect;
      r.w = pos.x - r.x; r.h = pos.y - r.y;
      self._drawCropOverlay({ x: Math.min(r.x, r.x+r.w), y: Math.min(r.y, r.y+r.h), w: Math.abs(r.w), h: Math.abs(r.h) });
    }
    if ((self._activeTool === 'draw' || self._activeTool === 'eraser') && self._drawActive) {
      EditorCanvas.continueDraw(pos.x, pos.y);
    }
  });

  cv.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    var pos = EditorCanvas.clientToCanvas(e.clientX, e.clientY);
    if (self._activeTool === 'crop') {
      self._cropDragging = true;
      self._cropRect = { x: pos.x, y: pos.y, w: 0, h: 0 };
    }
    if (self._activeTool === 'draw') {
      self._drawActive = true;
      EditorCanvas.startDraw(pos.x, pos.y, self._brushOpts.color, self._brushOpts.size, self._brushOpts.opacity);
    }
    if (self._activeTool === 'eraser') {
      self._drawActive = true;
      EditorCanvas.startDraw(pos.x, pos.y, '#ffffff', self._brushOpts.size * 2, 1);
    }
    if (self._activeTool === 'text') {
      var opts = self._textOpts;
      EditorCanvas.drawText(opts.text, pos.x, pos.y, opts);
    }
  });

  document.addEventListener('mouseup', function() {
    if (self._cropDragging) {
      self._cropDragging = false;
      var r = self._cropRect;
      if (r) self._cropRect = { x: Math.min(r.x, r.x+r.w), y: Math.min(r.y, r.y+r.h), w: Math.abs(r.w), h: Math.abs(r.h) };
    }
    if (self._drawActive) { self._drawActive = false; EditorCanvas.endDraw(); }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (!$('ie-editor') || $('ie-editor').style.display === 'none') return;
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var k = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey) {
      if (k === 'z') { e.preventDefault(); EditorCanvas.undo(); }
      if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); EditorCanvas.redo(); }
      if (k === '=') { e.preventDefault(); EditorCanvas.zoomIn(); }
      if (k === '-') { e.preventDefault(); EditorCanvas.zoomOut(); }
      if (k === '0') { e.preventDefault(); e.shiftKey ? EditorCanvas.fitToContainer() : EditorCanvas.zoom100(); }
      if (k === 's') { e.preventDefault(); var d=EditorCanvas.toDataURL('image/png'); var a=document.createElement('a'); a.href=d; a.download=self._fileName||'image.png'; a.click(); }
    } else {
      if (k === 'v') self._setTool('select');
      if (k === 'c') self._setTool('crop');
      if (k === 'r') self._setTool('rotate');
      if (k === 's') self._setTool('resize');
      if (k === 'a') self._setTool('adjust');
      if (k === 'f') self._setTool('filter');
      if (k === 'b') self._setTool('draw');
      if (k === 'e') self._setTool('eraser');
      if (k === 't') self._setTool('text');
      if (k === 'o') self._setTool('overlay');
      if (k === 'h') EditorCanvas.flip('h');
      if (k === '\\') EditorShortcuts.toggleBeforeAfter();
      if (k === '?') EditorShortcuts.showCheatsheet();
      if (k === 'enter') self._confirmCrop();
      if (k === 'escape') self._cancelCrop();
      if (k === '[') { self._brushOpts.size = Math.max(1, self._brushOpts.size - 2); }
      if (k === ']') { self._brushOpts.size = Math.min(200, self._brushOpts.size + 2); }
    }
  });
};
