// image-editor/interactions.js
// Crop with draggable border handles, rotate wheel UI, text/overlay drag-drop
var EditorInteractions = {

  _mode: null,       // 'crop' | 'rotate-wheel' | 'text-drag' | 'overlay-drag'
  _cropRect: null,   // { x,y,w,h } in canvas coords
  _cropHandle: null, // which handle is being dragged
  _cropDragStart: null,
  _rotateAngle: 0,
  _rotateStart: null,
  _textItems: [],    // [{ text, x, y, opts, dragging }]
  _overlayItems: [], // [{ img, x, y, w, h, opacity, dragging }]
  _dragItem: null,
  _dragOffset: null,
  _canvas: null,
  _overlayCanvas: null,
  _ctx: null,
  _octx: null,
  _onCropChange: null,
  _onRotateChange: null,
  _container: null,

  init: function(container, onCropChange, onRotateChange) {
    this._container    = container;
    this._canvas       = container.querySelector('#ie-canvas');
    this._overlayCanvas= container.querySelector('#ie-overlay-canvas');
    this._ctx          = this._canvas.getContext('2d');
    this._octx         = this._overlayCanvas.getContext('2d');
    this._onCropChange = onCropChange;
    this._onRotateChange = onRotateChange;
    this._bindEvents();
  },

  setMode: function(mode) {
    this._mode = mode;
    this._clearOverlay();
    if (mode === 'crop') this._initCrop();
    if (mode === 'rotate-wheel') this._drawRotateWheel(this._rotateAngle);
    if (mode !== 'crop') this._cropRect = null;
  },

  // ── Overlay canvas sync ───────────────────────────────────────────────────
  _syncOverlay: function() {
    var cv = this._canvas;
    var oc = this._overlayCanvas;
    oc.width  = cv.width;
    oc.height = cv.height;
    oc.style.transform       = cv.style.transform;
    oc.style.transformOrigin = '0 0';
    oc.style.width  = cv.offsetWidth  + 'px';
    oc.style.height = cv.offsetHeight + 'px';
    this._octx = oc.getContext('2d');
  },

  _clearOverlay: function() {
    this._syncOverlay();
    this._octx.clearRect(0, 0, this._overlayCanvas.width, this._overlayCanvas.height);
  },

  // ── CROP ──────────────────────────────────────────────────────────────────
  _initCrop: function() {
    var w = this._canvas.width, h = this._canvas.height;
    var pad = Math.min(w, h) * 0.1;
    this._cropRect = { x: pad, y: pad, w: w - pad*2, h: h - pad*2 };
    this._drawCrop();
  },

  _drawCrop: function() {
    this._syncOverlay();
    var r = this._cropRect;
    if (!r) return;
    var ctx = this._octx;
    var cw = this._overlayCanvas.width, ch = this._overlayCanvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Dim outside
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(r.x, r.y, r.w, r.h);

    // Border
    ctx.strokeStyle = '#00c8b4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Rule of thirds
    ctx.strokeStyle = 'rgba(0,200,180,0.35)';
    ctx.lineWidth = 0.5;
    for (var i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(r.x + r.w*i/3, r.y); ctx.lineTo(r.x + r.w*i/3, r.y+r.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h*i/3); ctx.lineTo(r.x+r.w, r.y + r.h*i/3); ctx.stroke();
    }

    // Corner handles
    var hs = 10;
    ctx.fillStyle = '#00c8b4';
    var corners = [
      [r.x, r.y], [r.x+r.w-hs, r.y], [r.x, r.y+r.h-hs], [r.x+r.w-hs, r.y+r.h-hs]
    ];
    corners.forEach(function(c) { ctx.fillRect(c[0], c[1], hs, hs); });

    // Edge handles
    ctx.fillStyle = 'rgba(0,200,180,0.7)';
    var edges = [
      [r.x + r.w/2 - hs/2, r.y - 2],
      [r.x + r.w/2 - hs/2, r.y + r.h - hs + 2],
      [r.x - 2, r.y + r.h/2 - hs/2],
      [r.x + r.w - hs + 2, r.y + r.h/2 - hs/2],
    ];
    edges.forEach(function(e) { ctx.fillRect(e[0], e[1], hs, hs); });

    // Update panel inputs
    this._updateCropPanel();
    if (this._onCropChange) this._onCropChange(r);
  },

  _updateCropPanel: function() {
    var r = this._cropRect;
    if (!r) return;
    var fields = { 'ie-crop-x': Math.round(r.x), 'ie-crop-y': Math.round(r.y), 'ie-crop-w': Math.round(r.w), 'ie-crop-h': Math.round(r.h) };
    Object.keys(fields).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = fields[id];
    });
  },

  _getHandle: function(px, py) {
    var r = this._cropRect;
    if (!r) return null;
    var hs = 14;
    var handles = {
      'tl': [r.x, r.y], 'tr': [r.x+r.w, r.y], 'bl': [r.x, r.y+r.h], 'br': [r.x+r.w, r.y+r.h],
      'tm': [r.x+r.w/2, r.y], 'bm': [r.x+r.w/2, r.y+r.h],
      'ml': [r.x, r.y+r.h/2], 'mr': [r.x+r.w, r.y+r.h/2],
    };
    for (var k in handles) {
      var h = handles[k];
      if (Math.abs(px - h[0]) < hs && Math.abs(py - h[1]) < hs) return k;
    }
    // Inside = move
    if (px > r.x && px < r.x+r.w && py > r.y && py < r.y+r.h) return 'move';
    return null;
  },

  _applyCropHandle: function(handle, dx, dy) {
    var r = this._cropRect;
    var minSize = 10;
    if (handle === 'move') { r.x += dx; r.y += dy; }
    else {
      if (handle.includes('l')) { r.x += dx; r.w -= dx; }
      if (handle.includes('r')) { r.w += dx; }
      if (handle.includes('t')) { r.y += dy; r.h -= dy; }
      if (handle.includes('b')) { r.h += dy; }
      if (handle === 'tm' || handle === 'bm') { /* only y */ }
      if (handle === 'ml' || handle === 'mr') { /* only x */ }
    }
    // Clamp
    r.w = Math.max(minSize, r.w);
    r.h = Math.max(minSize, r.h);
    r.x = Math.max(0, Math.min(this._canvas.width  - r.w, r.x));
    r.y = Math.max(0, Math.min(this._canvas.height - r.h, r.y));
  },

  getCropRect: function() { return this._cropRect; },

  setCropFromPanel: function(x, y, w, h) {
    this._cropRect = { x: +x, y: +y, w: +w, h: +h };
    this._drawCrop();
  },

  // ── ROTATE WHEEL ──────────────────────────────────────────────────────────
  _drawRotateWheel: function(angle) {
    this._syncOverlay();
    var ctx = this._octx;
    var cw = this._overlayCanvas.width, ch = this._overlayCanvas.height;
    ctx.clearRect(0, 0, cw, ch);

    var cx = cw / 2, cy = ch / 2;
    var r  = Math.min(cw, ch) * 0.38;

    // Quarter circle arc (top-right quadrant)
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI/2, 0);
    ctx.strokeStyle = 'rgba(0,200,180,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tick marks every 15°
    for (var deg = 0; deg <= 90; deg += 15) {
      var rad = (deg - 90) * Math.PI / 180;
      var inner = r - 8, outer = r + 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad)*inner, cy + Math.sin(rad)*inner);
      ctx.lineTo(cx + Math.cos(rad)*outer, cy + Math.sin(rad)*outer);
      ctx.strokeStyle = deg % 45 === 0 ? 'rgba(0,200,180,0.6)' : 'rgba(0,200,180,0.25)';
      ctx.lineWidth = deg % 45 === 0 ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Current angle indicator
    var curRad = (angle - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(curRad)*r, cy + Math.sin(curRad)*r);
    ctx.strokeStyle = '#00c8b4';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dot at end
    ctx.beginPath();
    ctx.arc(cx + Math.cos(curRad)*r, cy + Math.sin(curRad)*r, 6, 0, Math.PI*2);
    ctx.fillStyle = '#00c8b4';
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,200,180,0.5)';
    ctx.fill();

    // Rotate icon at top-right of arc
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#00c8b4';
    ctx.fillText('\u21bb', cx + r*0.7, cy - r*0.7);
  },

  _getRotateAngleFromMouse: function(mx, my) {
    var cw = this._overlayCanvas.width, ch = this._overlayCanvas.height;
    var cx = cw/2, cy = ch/2;
    var dx = mx - cx, dy = my - cy;
    var rad = Math.atan2(dy, dx);
    var deg = rad * 180 / Math.PI + 90;
    return Math.round(deg);
  },

  getRotateAngle: function() { return this._rotateAngle; },

  setRotateAngle: function(deg) {
    this._rotateAngle = deg;
    this._drawRotateWheel(deg);
    if (this._onRotateChange) this._onRotateChange(deg);
  },

  // ── TEXT ITEMS (live preview + drag) ──────────────────────────────────────
  addTextItem: function(item) {
    // item: { text, x, y, opts }
    this._textItems.push(Object.assign({ dragging: false }, item));
    this._drawTextOverlay();
  },

  clearTextItems: function() { this._textItems = []; this._clearOverlay(); },

  _drawTextOverlay: function() {
    this._syncOverlay();
    var ctx = this._octx;
    ctx.clearRect(0, 0, this._overlayCanvas.width, this._overlayCanvas.height);
    this._textItems.forEach(function(item) {
      ctx.save();
      ctx.font = (item.opts.bold?'bold ':'') + (item.opts.italic?'italic ':'') + item.opts.size + 'px ' + item.opts.font;
      ctx.fillStyle   = item.opts.color;
      ctx.globalAlpha = item.opts.opacity || 1;
      ctx.textAlign   = item.opts.align || 'left';
      ctx.fillText(item.text, item.x, item.y);
      // Selection box
      var metrics = ctx.measureText(item.text);
      ctx.strokeStyle = 'rgba(0,200,180,0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(item.x - 2, item.y - item.opts.size, metrics.width + 4, item.opts.size + 6);
      ctx.setLineDash([]);
      ctx.restore();
    });
  },

  commitTextToCanvas: function() {
    var ctx = this._ctx;
    this._textItems.forEach(function(item) {
      ctx.save();
      ctx.font = (item.opts.bold?'bold ':'') + (item.opts.italic?'italic ':'') + item.opts.size + 'px ' + item.opts.font;
      ctx.fillStyle   = item.opts.color;
      ctx.globalAlpha = item.opts.opacity || 1;
      ctx.textAlign   = item.opts.align || 'left';
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    });
    this._textItems = [];
    this._clearOverlay();
  },

  // ── IMAGE OVERLAY (drag + resize) ─────────────────────────────────────────
  addOverlayItem: function(item) {
    // item: { img, x, y, w, h, opacity }
    this._overlayItems.push(Object.assign({ dragging: false, selected: true }, item));
    this._drawOverlayItems();
  },

  clearOverlayItems: function() { this._overlayItems = []; this._clearOverlay(); },

  _drawOverlayItems: function() {
    this._syncOverlay();
    var ctx = this._octx;
    ctx.clearRect(0, 0, this._overlayCanvas.width, this._overlayCanvas.height);
    this._overlayItems.forEach(function(item) {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
      ctx.restore();
      if (item.selected) {
        ctx.strokeStyle = '#00c8b4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(item.x, item.y, item.w, item.h);
        ctx.setLineDash([]);
        // Resize handle (bottom-right)
        ctx.fillStyle = '#00c8b4';
        ctx.fillRect(item.x + item.w - 8, item.y + item.h - 8, 10, 10);
        // Move icon
        ctx.fillStyle = 'rgba(0,200,180,0.8)';
        ctx.font = '12px sans-serif';
        ctx.fillText('\u2725', item.x + 4, item.y + 14);
      }
    });
  },

  commitOverlayToCanvas: function() {
    var ctx = this._ctx;
    this._overlayItems.forEach(function(item) {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
      ctx.restore();
    });
    this._overlayItems = [];
    this._clearOverlay();
  },

  // ── Event binding ─────────────────────────────────────────────────────────
  _bindEvents: function() {
    var self = this;
    var oc = this._overlayCanvas;

    oc.style.pointerEvents = 'auto';

    var _mouseDown = false;
    var _lastPos   = null;
    var _resizingOverlay = false;

    oc.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      _mouseDown = true;
      var pos = EditorCanvas.clientToCanvas(e.clientX, e.clientY);
      _lastPos = pos;

      if (self._mode === 'crop') {
        self._cropHandle = self._getHandle(pos.x, pos.y);
        self._cropDragStart = pos;
        oc.style.cursor = self._cropHandle ? (self._cropHandle === 'move' ? 'move' : 'nwse-resize') : 'crosshair';
        if (!self._cropHandle) {
          // Start new crop
          self._cropRect = { x: pos.x, y: pos.y, w: 1, h: 1 };
          self._cropHandle = 'br';
        }
      }

      if (self._mode === 'rotate-wheel') {
        self._rotateStart = pos;
      }

      // Text drag
      if (self._mode === 'text') {
        self._textItems.forEach(function(item) {
          var ctx = self._octx;
          ctx.font = item.opts.size + 'px ' + item.opts.font;
          var mw = ctx.measureText(item.text).width;
          if (pos.x >= item.x - 2 && pos.x <= item.x + mw + 4 &&
              pos.y >= item.y - item.opts.size && pos.y <= item.y + 6) {
            item.dragging = true;
            self._dragItem   = item;
            self._dragOffset = { x: pos.x - item.x, y: pos.y - item.y };
          }
        });
      }

      // Overlay drag / resize
      if (self._mode === 'overlay') {
        _resizingOverlay = false;
        self._overlayItems.forEach(function(item) {
          // Check resize handle
          if (pos.x >= item.x+item.w-12 && pos.x <= item.x+item.w+2 &&
              pos.y >= item.y+item.h-12 && pos.y <= item.y+item.h+2) {
            item.dragging = 'resize';
            self._dragItem = item;
            _resizingOverlay = true;
          } else if (pos.x >= item.x && pos.x <= item.x+item.w &&
                     pos.y >= item.y && pos.y <= item.y+item.h) {
            item.dragging = 'move';
            self._dragItem   = item;
            self._dragOffset = { x: pos.x - item.x, y: pos.y - item.y };
          }
        });
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (!_mouseDown) return;
      var pos = EditorCanvas.clientToCanvas(e.clientX, e.clientY);
      var dx = pos.x - (_lastPos ? _lastPos.x : pos.x);
      var dy = pos.y - (_lastPos ? _lastPos.y : pos.y);
      _lastPos = pos;

      if (self._mode === 'crop' && self._cropHandle) {
        self._applyCropHandle(self._cropHandle, dx, dy);
        self._drawCrop();
      }

      if (self._mode === 'rotate-wheel' && self._rotateStart) {
        var angle = self._getRotateAngleFromMouse(pos.x, pos.y);
        angle = Math.max(-180, Math.min(180, angle));
        self._rotateAngle = angle;
        self._drawRotateWheel(angle);
        if (self._onRotateChange) self._onRotateChange(angle);
      }

      if (self._mode === 'text' && self._dragItem && self._dragItem.dragging) {
        self._dragItem.x = pos.x - self._dragOffset.x;
        self._dragItem.y = pos.y - self._dragOffset.y;
        self._drawTextOverlay();
      }

      if (self._mode === 'overlay' && self._dragItem) {
        if (self._dragItem.dragging === 'move') {
          self._dragItem.x = pos.x - self._dragOffset.x;
          self._dragItem.y = pos.y - self._dragOffset.y;
        } else if (self._dragItem.dragging === 'resize') {
          self._dragItem.w = Math.max(20, pos.x - self._dragItem.x);
          self._dragItem.h = Math.max(20, pos.y - self._dragItem.y);
        }
        self._drawOverlayItems();
      }
    });

    document.addEventListener('mouseup', function() {
      _mouseDown = false;
      self._cropHandle = null;
      self._rotateStart = null;
      if (self._dragItem) { self._dragItem.dragging = false; self._dragItem = null; }
      oc.style.cursor = '';
    });

    // Cursor hints for crop
    oc.addEventListener('mousemove', function(e) {
      if (self._mode !== 'crop' || _mouseDown) return;
      var pos = EditorCanvas.clientToCanvas(e.clientX, e.clientY);
      var h = self._getHandle(pos.x, pos.y);
      var cursors = { tl:'nwse-resize', tr:'nesw-resize', bl:'nesw-resize', br:'nwse-resize', tm:'ns-resize', bm:'ns-resize', ml:'ew-resize', mr:'ew-resize', move:'move' };
      oc.style.cursor = h ? (cursors[h] || 'crosshair') : 'crosshair';
    });
  },
};
