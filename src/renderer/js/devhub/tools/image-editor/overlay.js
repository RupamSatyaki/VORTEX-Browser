// image-editor/overlay.js - Image overlay panel
var EditorOverlay = {

  buildPanel: function() {
    return '<div class="ie-panel-section"><div class="ie-panel-title">Image Overlay</div>' +
      '<div class="ie-overlay-drop" id="ie-ov-drop">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2e6060" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' +
      '<span>Drop overlay image or <label style="color:#00c8b4;cursor:pointer">choose<input type="file" id="ie-ov-file" accept="image/*" style="display:none"/></label></span>' +
      '</div>' +
      '<div id="ie-ov-controls" style="display:none">' +
      '<div class="ie-ov-preview-row"><img id="ie-ov-preview" class="ie-ov-preview" alt="overlay"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>X</span><span class="ie-slider-val" id="ie-ov-x-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-ov-x" min="0" max="2000" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Y</span><span class="ie-slider-val" id="ie-ov-y-val">0</span></div>' +
      '<input type="range" class="ie-slider" id="ie-ov-y" min="0" max="2000" value="0"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Width</span><span class="ie-slider-val" id="ie-ov-w-val">100</span></div>' +
      '<input type="range" class="ie-slider" id="ie-ov-w" min="10" max="2000" value="100"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Height</span><span class="ie-slider-val" id="ie-ov-h-val">100</span></div>' +
      '<input type="range" class="ie-slider" id="ie-ov-h" min="10" max="2000" value="100"/></div>' +
      '<div class="ie-slider-row"><div class="ie-slider-label"><span>Opacity</span><span class="ie-slider-val" id="ie-ov-op-val">100%</span></div>' +
      '<input type="range" class="ie-slider" id="ie-ov-opacity" min="1" max="100" value="100"/></div>' +
      '<div class="ie-panel-actions"><button class="dh-btn primary ie-action-btn" id="ie-ov-apply">Apply Overlay</button>' +
      '<button class="dh-btn ie-action-btn" id="ie-ov-reset">Reset</button></div>' +
      '</div></div>';
  },

  bind: function(panel, onApply) {
    var _img = null;
    var $ = function(id) { return panel.querySelector('#' + id); };

    function loadImg(file) {
      if (!file || !file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          _img = img;
          $('ie-ov-preview').src = e.target.result;
          $('ie-ov-controls').style.display = '';
          $('ie-ov-drop').style.display = 'none';
          $('ie-ov-w').value = Math.min(img.naturalWidth, 400);
          $('ie-ov-h').value = Math.min(img.naturalHeight, 400);
          $('ie-ov-w-val').textContent = $('ie-ov-w').value;
          $('ie-ov-h-val').textContent = $('ie-ov-h').value;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    $('ie-ov-file').addEventListener('change', function(e) { loadImg(e.target.files[0]); e.target.value=''; });
    var drop = $('ie-ov-drop');
    drop.addEventListener('dragover',  function(e) { e.preventDefault(); drop.style.borderColor='#00c8b4'; });
    drop.addEventListener('dragleave', function()  { drop.style.borderColor=''; });
    drop.addEventListener('drop', function(e) { e.preventDefault(); drop.style.borderColor=''; loadImg(e.dataTransfer.files[0]); });

    ['x','y','w','h'].forEach(function(k) {
      var inp = $('ie-ov-' + k);
      var val = $('ie-ov-' + k + '-val');
      if (inp) inp.addEventListener('input', function() { if (val) val.textContent = inp.value; });
    });
    var op  = $('ie-ov-opacity');
    var opv = $('ie-ov-op-val');
    if (op) op.addEventListener('input', function() { if (opv) opv.textContent = op.value + '%'; });

    $('ie-ov-apply').addEventListener('click', function() {
      if (!_img) return;
      onApply(_img, +$('ie-ov-x').value, +$('ie-ov-y').value, +$('ie-ov-w').value, +$('ie-ov-h').value, +$('ie-ov-opacity').value/100);
    });
    $('ie-ov-reset').addEventListener('click', function() {
      _img = null;
      $('ie-ov-controls').style.display = 'none';
      $('ie-ov-drop').style.display = '';
    });
  },
};
