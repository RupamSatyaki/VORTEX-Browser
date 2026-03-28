// image-editor/core/filters.js - Advanced filters: sharpen, blur, vignette, noise, grain, border
var EditorFilters = {

  // ── Convolution helper ────────────────────────────────────────────────────
  _convolve: function(data, w, h, kernel, divisor) {
    var out = new Uint8ClampedArray(data.length);
    var ks  = Math.sqrt(kernel.length) | 0;
    var half = ks >> 1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var r=0, g=0, b=0;
        for (var ky = 0; ky < ks; ky++) {
          for (var kx = 0; kx < ks; kx++) {
            var px = Math.min(w-1, Math.max(0, x + kx - half));
            var py = Math.min(h-1, Math.max(0, y + ky - half));
            var idx = (py*w + px)*4;
            var k   = kernel[ky*ks + kx];
            r += data[idx]   * k;
            g += data[idx+1] * k;
            b += data[idx+2] * k;
          }
        }
        var oi = (y*w + x)*4;
        out[oi]   = Math.max(0, Math.min(255, r/divisor));
        out[oi+1] = Math.max(0, Math.min(255, g/divisor));
        out[oi+2] = Math.max(0, Math.min(255, b/divisor));
        out[oi+3] = data[oi+3];
      }
    }
    return out;
  },

  // ── Sharpen ───────────────────────────────────────────────────────────────
  sharpen: function(ctx, w, h, amount) {
    amount = amount || 1;
    var id = ctx.getImageData(0, 0, w, h);
    var k  = [ 0, -amount, 0, -amount, 1+4*amount, -amount, 0, -amount, 0 ];
    id.data.set(this._convolve(id.data, w, h, k, 1));
    ctx.putImageData(id, 0, 0);
  },

  // ── Gaussian blur ─────────────────────────────────────────────────────────
  blur: function(ctx, w, h, radius) {
    radius = Math.max(1, Math.round(radius || 2));
    // Use CSS filter for speed (canvas supports it)
    var tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    var tc = tmp.getContext('2d');
    tc.filter = 'blur(' + radius + 'px)';
    tc.drawImage(ctx.canvas, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0);
  },

  // ── Vignette ──────────────────────────────────────────────────────────────
  vignette: function(ctx, w, h, strength) {
    strength = strength || 0.5;
    var grad = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.3, w/2, h/2, Math.max(w,h)*0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,' + strength + ')');
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  // ── Noise ─────────────────────────────────────────────────────────────────
  noise: function(ctx, w, h, amount) {
    amount = amount || 30;
    var id = ctx.getImageData(0, 0, w, h);
    var d  = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * amount * 2;
      d[i]   = Math.max(0, Math.min(255, d[i]   + n));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
    }
    ctx.putImageData(id, 0, 0);
  },

  // ── Film grain ────────────────────────────────────────────────────────────
  grain: function(ctx, w, h, amount) {
    amount = amount || 20;
    var id = ctx.getImageData(0, 0, w, h);
    var d  = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var g = (Math.random() - 0.5) * amount;
      d[i]   = Math.max(0, Math.min(255, d[i]   + g));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + g * 0.8));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + g * 0.6));
    }
    ctx.putImageData(id, 0, 0);
  },

  // ── Border / Frame ────────────────────────────────────────────────────────
  addBorder: function(canvas, ctx, thickness, color, style) {
    thickness = thickness || 10;
    color     = color     || '#ffffff';
    style     = style     || 'solid';
    var w = canvas.width, h = canvas.height;
    var nw = w + thickness*2, nh = h + thickness*2;
    var tmp = document.createElement('canvas');
    tmp.width = nw; tmp.height = nh;
    var tc = tmp.getContext('2d');

    if (style === 'shadow') {
      tc.fillStyle = '#000000';
      tc.fillRect(0, 0, nw, nh);
      tc.shadowColor = 'rgba(0,0,0,0.6)';
      tc.shadowBlur  = thickness;
      tc.drawImage(canvas, thickness, thickness);
    } else if (style === 'double') {
      tc.fillStyle = color;
      tc.fillRect(0, 0, nw, nh);
      tc.fillStyle = '#000000';
      var inner = Math.round(thickness * 0.3);
      tc.fillRect(inner, inner, nw-inner*2, nh-inner*2);
      tc.fillStyle = color;
      tc.fillRect(inner*2, inner*2, nw-inner*4, nh-inner*4);
      tc.drawImage(canvas, thickness, thickness);
    } else if (style === 'polaroid') {
      tc.fillStyle = '#f5f0e8';
      tc.fillRect(0, 0, nw, nh + thickness*2);
      tc.drawImage(canvas, thickness, thickness);
    } else {
      // solid
      tc.fillStyle = color;
      tc.fillRect(0, 0, nw, nh);
      tc.drawImage(canvas, thickness, thickness);
    }

    canvas.width  = nw;
    canvas.height = nh;
    ctx.drawImage(tmp, 0, 0);
  },

  // ── Build filter panel ────────────────────────────────────────────────────
  buildPanel: function() {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Filters & Effects</div>' +
      '<div class="ie-filter-grid">' +
      '<button class="ie-filter-btn" data-filter="grayscale">Grayscale</button>' +
      '<button class="ie-filter-btn" data-filter="sepia">Sepia</button>' +
      '<button class="ie-filter-btn" data-filter="invert">Invert</button>' +
      '<button class="ie-filter-btn" data-filter="warm">Warm</button>' +
      '<button class="ie-filter-btn" data-filter="cool">Cool</button>' +
      '</div>' +
      '<div class="ie-panel-title" style="margin-top:10px;">Advanced</div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Sharpen</span><span class="ie-slider-val" id="ie-sharpen-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-sharpen" min="0" max="5" step="0.1" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Blur</span><span class="ie-slider-val" id="ie-blur-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-blur" min="0" max="20" step="0.5" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Vignette</span><span class="ie-slider-val" id="ie-vignette-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-vignette" min="0" max="1" step="0.05" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Noise</span><span class="ie-slider-val" id="ie-noise-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-noise" min="0" max="80" step="1" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Grain</span><span class="ie-slider-val" id="ie-grain-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-grain" min="0" max="60" step="1" value="0"/></div>' +
      '<div class="ie-panel-actions">' +
      '<button class="dh-btn primary ie-action-btn" id="ie-filter-apply">Apply Effects</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-filter-reset">Reset</button>' +
      '</div></div>';
  },

  bindPanel: function(panel, getCtx, getCanvas, onSave) {
    var self = this;
    var sliders = ['sharpen','blur','vignette','noise','grain'];
    sliders.forEach(function(k) {
      var inp = panel.querySelector('#ie-' + k);
      var val = panel.querySelector('#ie-' + k + '-val');
      if (inp) inp.addEventListener('input', function() { if (val) val.textContent = inp.value; });
    });

    panel.querySelectorAll('.ie-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('.ie-filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var ctx = getCtx(), cv = getCanvas();
        var id = ctx.getImageData(0, 0, cv.width, cv.height);
        var d  = id.data;
        var f  = btn.dataset.filter;
        for (var i = 0; i < d.length; i += 4) {
          var r=d[i], g=d[i+1], b=d[i+2];
          if (f==='grayscale') { var gr=0.299*r+0.587*g+0.114*b; d[i]=d[i+1]=d[i+2]=gr; }
          else if (f==='sepia') { d[i]=Math.min(255,r*0.393+g*0.769+b*0.189); d[i+1]=Math.min(255,r*0.349+g*0.686+b*0.168); d[i+2]=Math.min(255,r*0.272+g*0.534+b*0.131); }
          else if (f==='invert') { d[i]=255-r; d[i+1]=255-g; d[i+2]=255-b; }
          else if (f==='warm') { d[i]=Math.min(255,r+20); d[i+2]=Math.max(0,b-20); }
          else if (f==='cool') { d[i]=Math.max(0,r-20); d[i+2]=Math.min(255,b+20); }
        }
        ctx.putImageData(id, 0, 0);
        onSave();
      });
    });

    panel.querySelector('#ie-filter-apply').addEventListener('click', function() {
      var ctx = getCtx(), cv = getCanvas();
      var sh = +panel.querySelector('#ie-sharpen').value;
      var bl = +panel.querySelector('#ie-blur').value;
      var vi = +panel.querySelector('#ie-vignette').value;
      var no = +panel.querySelector('#ie-noise').value;
      var gr = +panel.querySelector('#ie-grain').value;
      if (sh > 0) self.sharpen(ctx, cv.width, cv.height, sh);
      if (bl > 0) self.blur(ctx, cv.width, cv.height, bl);
      if (vi > 0) self.vignette(ctx, cv.width, cv.height, vi);
      if (no > 0) self.noise(ctx, cv.width, cv.height, no);
      if (gr > 0) self.grain(ctx, cv.width, cv.height, gr);
      onSave();
    });

    panel.querySelector('#ie-filter-reset').addEventListener('click', function() {
      sliders.forEach(function(k) {
        var inp = panel.querySelector('#ie-' + k);
        var val = panel.querySelector('#ie-' + k + '-val');
        if (inp) inp.value = 0;
        if (val) val.textContent = '0';
      });
    });
  },

  // ── Border panel ─────────────────────────────────────────────────────────
  buildBorderPanel: function() {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Border / Frame</div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Thickness</span><span class="ie-slider-val" id="ie-brd-thick-val">20px</span></div>' +
      '<input type="range" class="ie-slider" id="ie-brd-thick" min="1" max="100" value="20"/></div>' +
      '<div class="ie-color-row"><label>Color</label><input type="color" id="ie-brd-color" value="#ffffff" class="ie-color-inp"/></div>' +
      '<div class="ie-panel-title" style="margin-top:8px;">Style</div>' +
      '<div class="ie-filter-grid">' +
      '<button class="ie-filter-btn active" data-style="solid">Solid</button>' +
      '<button class="ie-filter-btn" data-style="double">Double</button>' +
      '<button class="ie-filter-btn" data-style="shadow">Shadow</button>' +
      '<button class="ie-filter-btn" data-style="polaroid">Polaroid</button>' +
      '</div>' +
      '<div class="ie-panel-actions"><button class="dh-btn primary ie-action-btn" id="ie-brd-apply">Add Border</button></div>' +
      '</div>';
  },

  bindBorderPanel: function(panel, getCtx, getCanvas, onSave) {
    var self = this;
    var _style = 'solid';
    var thick = panel.querySelector('#ie-brd-thick');
    var thickVal = panel.querySelector('#ie-brd-thick-val');
    if (thick) thick.addEventListener('input', function() { if (thickVal) thickVal.textContent = thick.value + 'px'; });
    panel.querySelectorAll('[data-style]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        panel.querySelectorAll('[data-style]').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        _style = btn.dataset.style;
      });
    });
    panel.querySelector('#ie-brd-apply').addEventListener('click', function() {
      var cv  = getCanvas();
      var ctx = getCtx();
      var t   = +thick.value;
      var col = panel.querySelector('#ie-brd-color').value;
      self.addBorder(cv, ctx, t, col, _style);
      onSave();
    });
  },
};
