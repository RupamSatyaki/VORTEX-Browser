// image-editor/canvas.js - Canvas engine: draw, transform, history, zoom/pan
var EditorCanvas = {

  _canvas: null,
  _ctx: null,
  _container: null,
  _history: [],       // array of ImageData snapshots
  _histIdx: -1,
  _zoom: 1,
  _panX: 0,
  _panY: 0,
  _isPanning: false,
  _panStart: null,
  _origW: 0,
  _origH: 0,
  _onUpdate: null,    // callback(info)

  // ── Init ──────────────────────────────────────────────────────────────────
  init: function(container, onUpdate) {
    this._container = container;
    this._onUpdate  = onUpdate;
    this._canvas    = container.querySelector('#ie-canvas');
    this._ctx       = this._canvas.getContext('2d');
    this._bindPan();
  },

  // ── Load image ────────────────────────────────────────────────────────────
  loadImage: function(img) {
    this._origW = img.naturalWidth  || img.width;
    this._origH = img.naturalHeight || img.height;
    this._canvas.width  = this._origW;
    this._canvas.height = this._origH;
    this._ctx.drawImage(img, 0, 0);
    this._history = [];
    this._histIdx = -1;
    this._saveHistory();
    this.fitToContainer();
    this._notify();
  },

  // ── History ───────────────────────────────────────────────────────────────
  _saveHistory: function() {
    // Truncate forward history
    this._history = this._history.slice(0, this._histIdx + 1);
    this._history.push(this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height));
    if (this._history.length > 50) this._history.shift();
    this._histIdx = this._history.length - 1;
    this._notify();
  },

  undo: function() {
    if (this._histIdx <= 0) return false;
    this._histIdx--;
    var snap = this._history[this._histIdx];
    this._canvas.width  = snap.width;
    this._canvas.height = snap.height;
    this._ctx.putImageData(snap, 0, 0);
    this._notify();
    return true;
  },

  redo: function() {
    if (this._histIdx >= this._history.length - 1) return false;
    this._histIdx++;
    var snap = this._history[this._histIdx];
    this._canvas.width  = snap.width;
    this._canvas.height = snap.height;
    this._ctx.putImageData(snap, 0, 0);
    this._notify();
    return true;
  },

  canUndo: function() { return this._histIdx > 0; },
  canRedo: function() { return this._histIdx < this._history.length - 1; },

  // ── Zoom / Pan ────────────────────────────────────────────────────────────
  fitToContainer: function() {
    var cw = this._container.clientWidth  - 40;
    var ch = this._container.clientHeight - 40;
    var sx = cw / this._canvas.width;
    var sy = ch / this._canvas.height;
    this._zoom = Math.min(sx, sy, 1);
    this._panX = (this._container.clientWidth  - this._canvas.width  * this._zoom) / 2;
    this._panY = (this._container.clientHeight - this._canvas.height * this._zoom) / 2;
    this._applyTransform();
  },

  zoomIn:  function() { this._setZoom(this._zoom * 1.2); },
  zoomOut: function() { this._setZoom(this._zoom / 1.2); },
  zoom100: function() { this._setZoom(1); },

  _setZoom: function(z) {
    this._zoom = Math.max(0.05, Math.min(10, z));
    this._applyTransform();
    this._notify();
  },

  _applyTransform: function() {
    this._canvas.style.transform = 'translate(' + this._panX + 'px,' + this._panY + 'px) scale(' + this._zoom + ')';
    this._canvas.style.transformOrigin = '0 0';
  },

  _bindPan: function() {
    var self = this;
    var wrap = this._container;

    wrap.addEventListener('wheel', function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? 0.9 : 1.1;
      self._setZoom(self._zoom * delta);
    }, { passive: false });

    wrap.addEventListener('mousedown', function(e) {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        self._isPanning = true;
        self._panStart  = { x: e.clientX - self._panX, y: e.clientY - self._panY };
        wrap.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    document.addEventListener('mousemove', function(e) {
      if (!self._isPanning) return;
      self._panX = e.clientX - self._panStart.x;
      self._panY = e.clientY - self._panStart.y;
      self._applyTransform();
    });
    document.addEventListener('mouseup', function() {
      if (self._isPanning) { self._isPanning = false; wrap.style.cursor = ''; }
    });
  },

  // ── Transforms ────────────────────────────────────────────────────────────
  rotate: function(deg) {
    var rad = deg * Math.PI / 180;
    var sw  = this._canvas.width, sh = this._canvas.height;
    var nw  = Math.abs(sw * Math.cos(rad)) + Math.abs(sh * Math.sin(rad));
    var nh  = Math.abs(sw * Math.sin(rad)) + Math.abs(sh * Math.cos(rad));
    nw = Math.round(nw); nh = Math.round(nh);
    var tmp = document.createElement('canvas');
    tmp.width = nw; tmp.height = nh;
    var tc = tmp.getContext('2d');
    tc.translate(nw/2, nh/2);
    tc.rotate(rad);
    tc.drawImage(this._canvas, -sw/2, -sh/2);
    this._canvas.width  = nw;
    this._canvas.height = nh;
    this._ctx.drawImage(tmp, 0, 0);
    this._saveHistory();
    this.fitToContainer();
  },

  flip: function(axis) {
    var tmp = document.createElement('canvas');
    tmp.width = this._canvas.width; tmp.height = this._canvas.height;
    var tc = tmp.getContext('2d');
    if (axis === 'h') { tc.translate(tmp.width, 0); tc.scale(-1, 1); }
    else              { tc.translate(0, tmp.height); tc.scale(1, -1); }
    tc.drawImage(this._canvas, 0, 0);
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._ctx.drawImage(tmp, 0, 0);
    this._saveHistory();
  },

  crop: function(x, y, w, h) {
    x = Math.round(x); y = Math.round(y);
    w = Math.round(w); h = Math.round(h);
    if (w < 1 || h < 1) return;
    var data = this._ctx.getImageData(x, y, w, h);
    this._canvas.width  = w;
    this._canvas.height = h;
    this._ctx.putImageData(data, 0, 0);
    this._saveHistory();
    this.fitToContainer();
  },

  resize: function(w, h) {
    var tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    tmp.getContext('2d').drawImage(this._canvas, 0, 0, w, h);
    this._canvas.width  = w;
    this._canvas.height = h;
    this._ctx.drawImage(tmp, 0, 0);
    this._saveHistory();
    this.fitToContainer();
  },

  // ── Adjustments (apply to copy, save) ────────────────────────────────────
  applyAdjustments: function(adj) {
    // Restore from last saved state before applying
    var base = this._history[this._histIdx];
    this._canvas.width  = base.width;
    this._canvas.height = base.height;
    this._ctx.putImageData(base, 0, 0);

    var data = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    var d = data.data;
    var brightness  = (adj.brightness  || 0) / 100;
    var contrast    = (adj.contrast    || 0) / 100;
    var saturation  = (adj.saturation  || 0) / 100;
    var hue         = (adj.hue         || 0);
    var exposure    = (adj.exposure    || 0) / 100;

    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i+1], b = d[i+2];

      // Exposure
      if (exposure !== 0) { r *= (1 + exposure); g *= (1 + exposure); b *= (1 + exposure); }

      // Brightness
      if (brightness !== 0) { r += brightness * 255; g += brightness * 255; b += brightness * 255; }

      // Contrast
      if (contrast !== 0) {
        var f = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        r = f * (r - 128) + 128;
        g = f * (g - 128) + 128;
        b = f * (b - 128) + 128;
      }

      // Saturation
      if (saturation !== 0) {
        var gray = 0.299*r + 0.587*g + 0.114*b;
        r = gray + (r - gray) * (1 + saturation);
        g = gray + (g - gray) * (1 + saturation);
        b = gray + (b - gray) * (1 + saturation);
      }

      d[i]   = Math.max(0, Math.min(255, r));
      d[i+1] = Math.max(0, Math.min(255, g));
      d[i+2] = Math.max(0, Math.min(255, b));
    }
    this._ctx.putImageData(data, 0, 0);
  },

  commitAdjustments: function() { this._saveHistory(); },

  // ── Filters ───────────────────────────────────────────────────────────────
  applyFilter: function(name) {
    var data = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    var d = data.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i], g = d[i+1], b = d[i+2];
      if (name === 'grayscale') {
        var gr = 0.299*r + 0.587*g + 0.114*b;
        d[i] = d[i+1] = d[i+2] = gr;
      } else if (name === 'sepia') {
        d[i]   = Math.min(255, r*0.393 + g*0.769 + b*0.189);
        d[i+1] = Math.min(255, r*0.349 + g*0.686 + b*0.168);
        d[i+2] = Math.min(255, r*0.272 + g*0.534 + b*0.131);
      } else if (name === 'invert') {
        d[i] = 255-r; d[i+1] = 255-g; d[i+2] = 255-b;
      } else if (name === 'warm') {
        d[i]   = Math.min(255, r + 20);
        d[i+2] = Math.max(0,   b - 20);
      } else if (name === 'cool') {
        d[i]   = Math.max(0,   r - 20);
        d[i+2] = Math.min(255, b + 20);
      }
    }
    this._ctx.putImageData(data, 0, 0);
    this._saveHistory();
  },

  // ── Draw / Brush ──────────────────────────────────────────────────────────
  startDraw: function(x, y, color, size, opacity) {
    this._ctx.globalAlpha = opacity;
    this._ctx.strokeStyle = color;
    this._ctx.lineWidth   = size;
    this._ctx.lineCap     = 'round';
    this._ctx.lineJoin    = 'round';
    this._ctx.beginPath();
    this._ctx.moveTo(x, y);
  },
  continueDraw: function(x, y) {
    this._ctx.lineTo(x, y);
    this._ctx.stroke();
  },
  endDraw: function() {
    this._ctx.globalAlpha = 1;
    this._saveHistory();
  },

  // ── Text overlay ──────────────────────────────────────────────────────────
  drawText: function(text, x, y, opts) {
    var ctx = this._ctx;
    ctx.save();
    ctx.font = (opts.bold ? 'bold ' : '') + (opts.italic ? 'italic ' : '') + opts.size + 'px ' + opts.font;
    ctx.fillStyle   = opts.color;
    ctx.globalAlpha = opts.opacity || 1;
    ctx.textAlign   = opts.align || 'left';
    ctx.fillText(text, x, y);
    ctx.restore();
    this._saveHistory();
  },

  // ── Image overlay ─────────────────────────────────────────────────────────
  drawOverlay: function(img, x, y, w, h, opacity) {
    this._ctx.save();
    this._ctx.globalAlpha = opacity;
    this._ctx.drawImage(img, x, y, w, h);
    this._ctx.restore();
    this._saveHistory();
  },

  // ── Export ────────────────────────────────────────────────────────────────
  toDataURL: function(fmt, quality) {
    return this._canvas.toDataURL(fmt || 'image/png', quality || 0.92);
  },

  getSize: function() {
    return { w: this._canvas.width, h: this._canvas.height };
  },

  getZoom: function() { return this._zoom; },

  // ── Canvas-to-image coords ────────────────────────────────────────────────
  clientToCanvas: function(cx, cy) {
    var rect = this._canvas.getBoundingClientRect();
    return {
      x: (cx - rect.left) / this._zoom,
      y: (cy - rect.top)  / this._zoom,
    };
  },

  _notify: function() {
    if (this._onUpdate) this._onUpdate({
      w: this._canvas.width,
      h: this._canvas.height,
      zoom: Math.round(this._zoom * 100),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      histLen: this._history.length,
      histIdx: this._histIdx,
    });
  },
};
