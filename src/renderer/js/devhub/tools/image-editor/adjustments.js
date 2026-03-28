// image-editor/adjustments.js - All panel builders and binders
var EditorAdjustments = {

  // ── Adjustments panel ─────────────────────────────────────────────────────
  buildPanel: function(state) {
    var sliders = [
      { key:'brightness', label:'Brightness', min:-100, max:100 },
      { key:'contrast',   label:'Contrast',   min:-100, max:100 },
      { key:'saturation', label:'Saturation', min:-100, max:100 },
      { key:'hue',        label:'Hue',        min:-180, max:180 },
      { key:'exposure',   label:'Exposure',   min:-100, max:100 },
    ];
    return '<div class="ie-panel-section"><div class="ie-panel-title">Adjustments</div>' +
      sliders.map(function(s) {
        var val = state[s.key] || 0;
        return '<div class="ie-slider-row">' +
          '<div class="ie-slider-label"><span>' + s.label + '</span><span class="ie-slider-val" id="ie-adj-val-' + s.key + '">' + val + '</span></div>' +
          '<div class="ie-slider-track-row">' +
          '<input type="range" class="ie-slider" id="ie-adj-' + s.key + '" min="' + s.min + '" max="' + s.max + '" value="' + val + '"/>' +
          '<button class="ie-reset-btn" data-key="' + s.key + '" title="Reset">↺</button>' +
          '</div></div>';
      }).join('') +
      '<div class="ie-panel-actions"><button class="dh-btn primary ie-action-btn" id="ie-adj-apply">Apply</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-adj-reset-all">Reset All</button></div>' +
      '</div>';
  },

  bind: function(panel, state, onLive, onCommit) {
    var keys = ['brightness','contrast','saturation','hue','exposure'];
    keys.forEach(function(k) {
      var inp = panel.querySelector('#ie-adj-' + k);
      var val = panel.querySelector('#ie-adj-val-' + k);
      if (!inp) return;
      inp.addEventListener('input', function() {
        state[k] = +inp.value;
        if (val) val.textContent = inp.value;
        onLive(Object.assign({}, state));
      });
    });
    panel.querySelectorAll('.ie-reset-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var k = btn.dataset.key;
        state[k] = 0;
        var inp = panel.querySelector('#ie-adj-' + k);
        var val = panel.querySelector('#ie-adj-val-' + k);
        if (inp) inp.value = 0;
        if (val) val.textContent = '0';
        onLive(Object.assign({}, state));
      });
    });
    var applyBtn = panel.querySelector('#ie-adj-apply');
    if (applyBtn) applyBtn.addEventListener('click', onCommit);
    var resetAll = panel.querySelector('#ie-adj-reset-all');
    if (resetAll) resetAll.addEventListener('click', function() {
      keys.forEach(function(k) {
        state[k] = 0;
        var inp = panel.querySelector('#ie-adj-' + k);
        var val = panel.querySelector('#ie-adj-val-' + k);
        if (inp) inp.value = 0;
        if (val) val.textContent = '0';
      });
      onLive(Object.assign({}, state));
    });
  },

  // ── Filters panel ─────────────────────────────────────────────────────────
  buildFilterPanel: function() {
    var filters = [
      { id:'grayscale', label:'Grayscale' },
      { id:'sepia',     label:'Sepia' },
      { id:'invert',    label:'Invert' },
      { id:'warm',      label:'Warm' },
      { id:'cool',      label:'Cool' },
    ];
    return '<div class="ie-panel-section"><div class="ie-panel-title">Filters</div>' +
      '<div class="ie-filter-grid">' +
      filters.map(function(f) {
        return '<button class="ie-filter-btn" data-filter="' + f.id + '">' + f.label + '</button>';
      }).join('') +
      '</div></div>';
  },

  bindFilters: function(panel, onApply) {
    panel.querySelectorAll('.ie-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('.ie-filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        onApply(btn.dataset.filter);
      });
    });
  },

  // ── Crop panel ────────────────────────────────────────────────────────────
  buildCropPanel: function() {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Crop</div>' +
      '<div class="ie-panel-hint">Drag on canvas to select crop area</div>' +
      '<div class="ie-panel-title" style="margin-top:6px;font-size:9.5px;">Aspect Ratio Presets</div>' +
      '<div class="ie-aspect-grid">' +
      '<button class="ie-aspect-btn" data-ratio="free">Free</button>' +
      '<button class="ie-aspect-btn" data-ratio="1:1">1:1</button>' +
      '<button class="ie-aspect-btn" data-ratio="16:9">16:9</button>' +
      '<button class="ie-aspect-btn" data-ratio="4:3">4:3</button>' +
      '<button class="ie-aspect-btn" data-ratio="3:2">3:2</button>' +
      '<button class="ie-aspect-btn" data-ratio="9:16">9:16</button>' +
      '<button class="ie-aspect-btn" data-ratio="2:3">2:3</button>' +
      '<button class="ie-aspect-btn" data-ratio="3:4">3:4</button>' +
      '</div>' +
      '<div class="ie-crop-grid">' +
      '<div class="ie-crop-field"><label>X</label><input class="dh-input ie-crop-inp" id="ie-crop-x" type="number" min="0" value="0"/></div>' +
      '<div class="ie-crop-field"><label>Y</label><input class="dh-input ie-crop-inp" id="ie-crop-y" type="number" min="0" value="0"/></div>' +
      '<div class="ie-crop-field"><label>W</label><input class="dh-input ie-crop-inp" id="ie-crop-w" type="number" min="1" value="0"/></div>' +
      '<div class="ie-crop-field"><label>H</label><input class="dh-input ie-crop-inp" id="ie-crop-h" type="number" min="1" value="0"/></div>' +
      '</div>' +
      '<div class="ie-panel-actions">' +
      '<button class="dh-btn primary ie-action-btn" id="ie-crop-confirm">Confirm (Enter)</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-crop-cancel">Cancel (Esc)</button>' +
      '</div></div>';
  },

  bindCrop: function(panel, onConfirm, onCancel) {
    var c = panel.querySelector('#ie-crop-confirm');
    var x = panel.querySelector('#ie-crop-cancel');
    if (c) c.addEventListener('click', onConfirm);
    if (x) x.addEventListener('click', onCancel);

    // Aspect ratio presets
    var _lockedRatio = null;
    panel.querySelectorAll('.ie-aspect-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('.ie-aspect-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var ratio = btn.dataset.ratio;
        if (ratio === 'free') { _lockedRatio = null; EditorInteractions._lockedAspect = null; return; }
        var parts = ratio.split(':');
        _lockedRatio = +parts[0] / +parts[1];
        EditorInteractions._lockedAspect = _lockedRatio;
        // Apply to current crop rect
        var r = EditorInteractions._cropRect;
        if (r) {
          r.h = Math.round(r.w / _lockedRatio);
          EditorInteractions._drawCrop();
        }
      });
    });

    // Live update from inputs
    ['ie-crop-x','ie-crop-y','ie-crop-w','ie-crop-h'].forEach(function(id) {
      var el = panel.querySelector('#' + id);
      if (el) el.addEventListener('input', function() {
        var px = +panel.querySelector('#ie-crop-x').value;
        var py = +panel.querySelector('#ie-crop-y').value;
        var pw = +panel.querySelector('#ie-crop-w').value;
        var ph = +panel.querySelector('#ie-crop-h').value;
        if (_lockedRatio && id === 'ie-crop-w') ph = Math.round(pw / _lockedRatio);
        if (_lockedRatio && id === 'ie-crop-h') pw = Math.round(ph * _lockedRatio);
        EditorInteractions.setCropFromPanel(px, py, pw, ph);
      });
    });
  },

  // ── Rotate panel ──────────────────────────────────────────────────────────
  buildRotatePanel: function() {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Rotate</div>' +
      '<div class="ie-rotate-info">' +
      '<div class="ie-rotate-info-row"><span class="ie-ri-label">Angle</span><input class="dh-input ie-ri-input" id="ie-rot-deg-inp" type="number" min="-360" max="360" value="0"/>°</div>' +
      '<div class="ie-rotate-info-row"><span class="ie-ri-label">Axis</span>' +
      '<select class="dh-input ie-ri-select" id="ie-rot-axis" style="font-size:11px;padding:4px 6px;">' +
      '<option value="z">Z (standard)</option>' +
      '<option value="x">X (horizontal)</option>' +
      '<option value="y">Y (vertical)</option>' +
      '</select></div>' +
      '</div>' +
      '<div class="ie-panel-hint" style="margin-top:6px;">Drag the wheel on canvas to rotate, or enter angle above</div>' +
      '<div class="ie-panel-actions">' +
      '<button class="dh-btn primary ie-action-btn" id="ie-rot-apply">Apply Rotation</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-rot-90cw">90° CW</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-rot-90ccw">90° CCW</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-rot-180">180°</button>' +
      '</div></div>';
  },

  bindRotate: function(panel, onApply) {
    var degInp = panel.querySelector('#ie-rot-deg-inp');
    var apply  = panel.querySelector('#ie-rot-apply');
    var cw     = panel.querySelector('#ie-rot-90cw');
    var ccw    = panel.querySelector('#ie-rot-90ccw');
    var r180   = panel.querySelector('#ie-rot-180');

    // Sync from wheel
    if (window._ieRotateSync) clearInterval(window._ieRotateSync);
    window._ieRotateSync = setInterval(function() {
      if (degInp && document.contains(degInp)) {
        var a = EditorInteractions.getRotateAngle();
        if (+degInp.value !== a) degInp.value = a;
      } else { clearInterval(window._ieRotateSync); }
    }, 100);

    if (degInp) degInp.addEventListener('input', function() {
      EditorInteractions.setRotateAngle(+degInp.value);
    });
    if (apply) apply.addEventListener('click', function() {
      onApply(+degInp.value);
      degInp.value = 0;
      EditorInteractions.setRotateAngle(0);
    });
    if (cw)  cw.addEventListener('click',  function() { onApply(90);  degInp.value=0; EditorInteractions.setRotateAngle(0); });
    if (ccw) ccw.addEventListener('click', function() { onApply(-90); degInp.value=0; EditorInteractions.setRotateAngle(0); });
    if (r180) r180.addEventListener('click', function() { onApply(180); degInp.value=0; EditorInteractions.setRotateAngle(0); });
  },

  // ── Resize panel ──────────────────────────────────────────────────────────
  buildResizePanel: function(w, h) {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Resize</div>' +
      '<div class="ie-crop-grid">' +
      '<div class="ie-crop-field"><label>Width</label><input class="dh-input ie-crop-inp" id="ie-rsz-w" type="number" min="1" value="' + w + '"/></div>' +
      '<div class="ie-crop-field"><label>Height</label><input class="dh-input ie-crop-inp" id="ie-rsz-h" type="number" min="1" value="' + h + '"/></div>' +
      '</div>' +
      '<label class="ie-check-label"><input type="checkbox" id="ie-rsz-lock" checked/> Lock aspect ratio</label>' +
      '<div class="ie-panel-actions"><button class="dh-btn primary ie-action-btn" id="ie-rsz-apply">Apply Resize</button></div>' +
      '</div>';
  },

  bindResize: function(panel, onApply) {
    var origW = +panel.querySelector('#ie-rsz-w').value;
    var origH = +panel.querySelector('#ie-rsz-h').value;
    var ratio = origW / origH;
    panel.querySelector('#ie-rsz-w').addEventListener('input', function() {
      if (panel.querySelector('#ie-rsz-lock').checked) {
        panel.querySelector('#ie-rsz-h').value = Math.round(+this.value / ratio);
      }
    });
    panel.querySelector('#ie-rsz-h').addEventListener('input', function() {
      if (panel.querySelector('#ie-rsz-lock').checked) {
        panel.querySelector('#ie-rsz-w').value = Math.round(+this.value * ratio);
      }
    });
    panel.querySelector('#ie-rsz-apply').addEventListener('click', function() {
      onApply(+panel.querySelector('#ie-rsz-w').value, +panel.querySelector('#ie-rsz-h').value);
    });
  },

  // ── Draw panel ────────────────────────────────────────────────────────────
  buildDrawPanel: function(opts) {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Brush</div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Size</span><span class="ie-slider-val" id="ie-draw-size-val">' + opts.size + 'px</span></div>' +
      '<input type="range" class="ie-slider" id="ie-draw-size" min="1" max="200" value="' + opts.size + '"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Opacity</span><span class="ie-slider-val" id="ie-draw-op-val">' + Math.round(opts.opacity*100) + '%</span></div>' +
      '<input type="range" class="ie-slider" id="ie-draw-opacity" min="1" max="100" value="' + Math.round(opts.opacity*100) + '"/></div>' +
      '<div class="ie-color-row"><label>Color</label><input type="color" id="ie-draw-color" value="' + opts.color + '" class="ie-color-inp"/></div>' +
      '</div>';
  },

  buildEraserPanel: function(opts) {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Eraser</div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Size</span><span class="ie-slider-val" id="ie-draw-size-val">' + opts.size*2 + 'px</span></div>' +
      '<input type="range" class="ie-slider" id="ie-draw-size" min="1" max="100" value="' + opts.size + '"/></div>' +
      '</div>';
  },

  bindDraw: function(panel, opts, onChange) {
    var sz  = panel.querySelector('#ie-draw-size');
    var szv = panel.querySelector('#ie-draw-size-val');
    var op  = panel.querySelector('#ie-draw-opacity');
    var opv = panel.querySelector('#ie-draw-op-val');
    var col = panel.querySelector('#ie-draw-color');
    if (sz)  sz.addEventListener('input',  function() { opts.size=+sz.value; if(szv) szv.textContent=sz.value+'px'; onChange(opts); });
    if (op)  op.addEventListener('input',  function() { opts.opacity=+op.value/100; if(opv) opv.textContent=op.value+'%'; onChange(opts); });
    if (col) col.addEventListener('input', function() { opts.color=col.value; onChange(opts); });
  },

  // ── Text panel ────────────────────────────────────────────────────────────
  buildTextPanel: function(opts) {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Text</div>' +
      '<div class="ie-text-field"><label>Text</label><input class="dh-input" id="ie-txt-text" type="text" value="' + opts.text + '"/></div>' +
      '<div class="ie-text-field"><label>Font</label><select class="dh-input" id="ie-txt-font" style="font-size:11.5px;padding:5px 8px;">' +
      ['Arial','Georgia','Courier New','Times New Roman','Verdana','Impact','Comic Sans MS'].map(function(f) {
        return '<option value="' + f + '"' + (f===opts.font?' selected':'') + '>' + f + '</option>';
      }).join('') + '</select></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Size</span><span class="ie-slider-val" id="ie-txt-size-val">' + opts.size + 'px</span></div>' +
      '<input type="range" class="ie-slider" id="ie-txt-size" min="8" max="200" value="' + opts.size + '"/></div>' +
      '<div class="ie-color-row"><label>Color</label><input type="color" id="ie-txt-color" value="' + opts.color + '" class="ie-color-inp"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Opacity</span><span class="ie-slider-val" id="ie-txt-op-val">' + Math.round(opts.opacity*100) + '%</span></div>' +
      '<input type="range" class="ie-slider" id="ie-txt-opacity" min="1" max="100" value="' + Math.round(opts.opacity*100) + '"/></div>' +
      '<div class="ie-text-style-row">' +
      '<button class="ie-style-btn' + (opts.bold?' active':'') + '" id="ie-txt-bold" title="Bold"><b>B</b></button>' +
      '<button class="ie-style-btn' + (opts.italic?' active':'') + '" id="ie-txt-italic" title="Italic"><i>I</i></button>' +
      '</div>' +
      '<div class="ie-panel-hint">Click on canvas to place text</div>' +
      '</div>';
  },

  bindText: function(panel, opts, onChange) {
    var bind = function(id, prop, transform) {
      var el = panel.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('input', function() { opts[prop] = transform ? transform(el.value) : el.value; onChange(opts); });
    };
    bind('ie-txt-text',    'text');
    bind('ie-txt-font',    'font');
    bind('ie-txt-color',   'color');
    bind('ie-txt-size',    'size',    function(v) { var el=panel.querySelector('#ie-txt-size-val'); if(el) el.textContent=v+'px'; return +v; });
    bind('ie-txt-opacity', 'opacity', function(v) { var el=panel.querySelector('#ie-txt-op-val');  if(el) el.textContent=v+'%'; return +v/100; });
    var bold   = panel.querySelector('#ie-txt-bold');
    var italic = panel.querySelector('#ie-txt-italic');
    if (bold)   bold.addEventListener('click',   function() { opts.bold=!opts.bold;     bold.classList.toggle('active',opts.bold);     onChange(opts); });
    if (italic) italic.addEventListener('click', function() { opts.italic=!opts.italic; italic.classList.toggle('active',opts.italic); onChange(opts); });
  },
};
