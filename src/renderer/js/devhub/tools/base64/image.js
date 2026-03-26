// base64/image.js - Image encode/decode + embed code + resize/quality/format
var B64Image = {

  render: function(container, setStatus) {
    var html = '<div class="b64-img-wrap">';
    html += '<div class="b64-drop-zone" id="b64-img-drop">';
    html += '<div class="b64-drop-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2e6060" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
    html += '<div class="b64-drop-text">Drop image here</div>';
    html += '<div class="b64-drop-sub">or</div>';
    html += '<label class="dh-btn b64-upload-btn">Choose Image<input type="file" id="b64-img-file" accept="image/*" style="display:none"/></label>';
    html += '<div class="b64-drop-hint">PNG, JPG, GIF, SVG, WebP</div>';
    html += '<label class="dh-btn" style="cursor:pointer;font-size:10.5px;">Multiple<input type="file" id="b64-img-multi" accept="image/*" multiple style="display:none"/></label>';
    html += '</div>';
    html += '<div class="b64-img-result" id="b64-img-result" style="display:none">';
    html += '<div class="b64-img-preview-row">';
    html += '<div class="b64-img-preview-wrap"><img id="b64-img-preview" class="b64-img-preview" alt="preview"/><button class="b64-img-reset" id="b64-img-reset">\u2715</button></div>';
    html += '<div class="b64-img-meta" id="b64-img-meta"></div>';
    html += '</div>';
    html += '<div class="b64-transform-section">';
    html += '<div class="b64-section-label">Transform before encode</div>';
    html += '<div class="b64-transform-grid">';
    html += '<div class="b64-transform-field"><label>Width</label><input class="dh-input b64-dim-input" id="b64-resize-w" type="number" min="1" max="4096" placeholder="auto"/></div>';
    html += '<div class="b64-transform-field"><label>Height</label><input class="dh-input b64-dim-input" id="b64-resize-h" type="number" min="1" max="4096" placeholder="auto"/></div>';
    html += '<div class="b64-transform-field"><label>Format</label><select class="dh-input" id="b64-fmt-select" style="font-size:11.5px;padding:5px 8px;"><option value="original">Original</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>';
    html += '<div class="b64-transform-field"><label>Quality <span id="b64-quality-val">90%</span></label><input type="range" id="b64-quality" min="1" max="100" value="90" class="b64-quality-slider"/></div>';
    html += '</div>';
    html += '<button class="dh-btn primary" id="b64-apply-transform">Apply &amp; Re-encode</button>';
    html += '</div>';
    html += '<div class="b64-embed-tabs">';
    html += '<button class="b64-embed-tab active" data-embed="html">HTML img</button>';
    html += '<button class="b64-embed-tab" data-embed="css">CSS bg</button>';
    html += '<button class="b64-embed-tab" data-embed="json">JSON</button>';
    html += '<button class="b64-embed-tab" data-embed="md">Markdown</button>';
    html += '<button class="b64-embed-tab" data-embed="raw">Raw Base64</button>';
    html += '</div>';
    html += '<div class="b64-embed-out-wrap">';
    html += '<pre class="b64-embed-out" id="b64-embed-out"></pre>';
    html += '<div class="b64-embed-actions">';
    html += '<button class="dh-btn primary" id="b64-embed-copy">Copy</button>';
    html += '<button class="dh-btn" id="b64-img-download">Download .txt</button>';
    html += '<button class="dh-btn" id="b64-img-dl-processed">Download Image</button>';
    html += '</div></div>';
    html += '<div class="b64-decode-img-section">';
    html += '<div class="b64-section-label">Decode Base64 \u2192 Image</div>';
    html += '<textarea class="dh-textarea b64-textarea" id="b64-img-decode-in" placeholder="Paste data:image/... or raw Base64 here\u2026" spellcheck="false" style="min-height:60px;"></textarea>';
    html += '<div style="display:flex;gap:6px;margin-top:6px;">';
    html += '<button class="dh-btn primary" id="b64-img-decode-btn">Decode \u2192 Preview</button>';
    html += '<button class="dh-btn" id="b64-img-decode-dl">Download Image</button>';
    html += '</div>';
    html += '<div id="b64-img-decode-preview" style="margin-top:8px;"></div>';
    html += '</div></div>';
    html += '<div id="b64-multi-result" style="display:none">';
    html += '<div class="b64-section-label">Multiple Images \u2014 Base64 Array</div>';
    html += '<pre class="b64-embed-out" id="b64-multi-out" style="max-height:150px;"></pre>';
    html += '<div style="display:flex;gap:6px;margin-top:6px;">';
    html += '<button class="dh-btn primary" id="b64-multi-copy">Copy JSON Array</button>';
    html += '<button class="dh-btn danger" id="b64-multi-reset">Clear</button>';
    html += '</div></div>';
    html += '</div>';
    container.innerHTML = html;

    var $ = function(id) { return container.querySelector('#' + id); };
    var _currentDataUri = '';
    var _currentMime    = 'image/png';
    var _activeEmbed    = 'html';
    var _origImg        = null;

    function processImage(img, mime, quality, maxW, maxH) {
      var cv = document.createElement('canvas');
      var w = img.naturalWidth, h = img.naturalHeight;
      if (maxW && !maxH) { h = Math.round(h * maxW / w); w = maxW; }
      else if (maxH && !maxW) { w = Math.round(w * maxH / h); h = maxH; }
      else if (maxW && maxH) { w = maxW; h = maxH; }
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      return cv.toDataURL(mime, quality / 100);
    }

    function updateMeta(dataUri, origFile) {
      var raw = dataUri.split(',')[1] || '';
      var encSize = B64Utils.fmtBytes(new TextEncoder().encode(raw).length);
      var img2 = new Image();
      img2.onload = function() {
        var meta = '';
        meta += '<div class="b64-meta-row"><span class="b64-meta-k">Type</span><span class="b64-meta-v">' + (dataUri.split(';')[0].split(':')[1]) + '</span></div>';
        if (origFile) meta += '<div class="b64-meta-row"><span class="b64-meta-k">Original</span><span class="b64-meta-v">' + B64Utils.fmtBytes(origFile.size) + '</span></div>';
        meta += '<div class="b64-meta-row"><span class="b64-meta-k">B64 size</span><span class="b64-meta-v">' + encSize + '</span></div>';
        meta += '<div class="b64-meta-row"><span class="b64-meta-k">Dimensions</span><span class="b64-meta-v">' + img2.width + ' \u00d7 ' + img2.height + 'px</span></div>';
        $('b64-img-meta').innerHTML = meta;
      };
      img2.src = dataUri;
    }

    function getEmbedCode(type) {
      var raw = _currentDataUri.split(',')[1] || '';
      if (type === 'html') return B64Utils.htmlImgTag(_currentDataUri);
      if (type === 'css')  return B64Utils.cssBackground(_currentDataUri);
      if (type === 'json') return B64Utils.jsonEmbed(raw, _currentMime);
      if (type === 'md')   return B64Utils.markdownImg(_currentDataUri);
      if (type === 'raw')  return raw;
      return _currentDataUri;
    }

    function renderEmbed() { $('b64-embed-out').textContent = getEmbedCode(_activeEmbed); }

    function applyAndShow(dataUri, origFile) {
      _currentDataUri = dataUri;
      _currentMime    = dataUri.split(';')[0].split(':')[1] || 'image/png';
      $('b64-img-preview').src = dataUri;
      $('b64-img-result').style.display = '';
      $('b64-img-drop').style.display   = 'none';
      updateMeta(dataUri, origFile);
      renderEmbed();
    }

    function loadImage(file) {
      if (!file || !file.type.startsWith('image/')) { setStatus('\u2717 Not an image', false); return; }
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() {
          _origImg = img;
          applyAndShow(e.target.result, file);
          setStatus('\u2713 Image loaded', true);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    $('b64-quality').addEventListener('input', function(e) {
      $('b64-quality-val').textContent = e.target.value + '%';
    });

    $('b64-apply-transform').addEventListener('click', function() {
      if (!_origImg) return;
      var w    = +$('b64-resize-w').value || 0;
      var h    = +$('b64-resize-h').value || 0;
      var fmt  = $('b64-fmt-select').value;
      var qual = +$('b64-quality').value;
      var mime = fmt === 'original' ? _currentMime : fmt;
      var dataUri = processImage(_origImg, mime, qual, w || null, h || null);
      applyAndShow(dataUri, null);
      setStatus('\u2713 Transformed', true);
    });

    var drop = $('b64-img-drop');
    drop.addEventListener('dragover',  function(e) { e.preventDefault(); drop.classList.add('b64-drop-active'); });
    drop.addEventListener('dragleave', function()  { drop.classList.remove('b64-drop-active'); });
    drop.addEventListener('drop', function(e) { e.preventDefault(); drop.classList.remove('b64-drop-active'); loadImage(e.dataTransfer.files[0]); });
    $('b64-img-file').addEventListener('change', function(e) { loadImage(e.target.files[0]); e.target.value = ''; });

    $('b64-img-multi').addEventListener('change', function(e) {
      var files = Array.from(e.target.files);
      if (!files.length) return;
      var results = new Array(files.length);
      var done = 0;
      files.forEach(function(file, i) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          results[i] = { name: file.name, type: file.type, base64: ev.target.result.split(',')[1] };
          done++;
          if (done === files.length) {
            $('b64-img-drop').style.display = 'none';
            $('b64-multi-result').style.display = '';
            $('b64-multi-out').textContent = JSON.stringify(results, null, 2);
            setStatus('\u2713 ' + files.length + ' images encoded', true);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    });

    $('b64-multi-copy').addEventListener('click', function() {
      navigator.clipboard.writeText($('b64-multi-out').textContent);
      setStatus('Copied!', true);
    });
    $('b64-multi-reset').addEventListener('click', function() {
      $('b64-multi-result').style.display = 'none';
      $('b64-img-drop').style.display = '';
    });

    container.querySelectorAll('.b64-embed-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.b64-embed-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        _activeEmbed = tab.dataset.embed;
        renderEmbed();
      });
    });

    $('b64-embed-copy').addEventListener('click', function() {
      navigator.clipboard.writeText(getEmbedCode(_activeEmbed));
      setStatus('Copied!', true);
    });
    $('b64-img-download').addEventListener('click', function() {
      var blob = new Blob([getEmbedCode(_activeEmbed)], {type:'text/plain'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'base64-' + _activeEmbed + '.txt';
      a.click();
    });
    $('b64-img-dl-processed').addEventListener('click', function() {
      if (!_currentDataUri) return;
      var a = document.createElement('a');
      a.href = _currentDataUri;
      a.download = 'processed-image.' + (_currentMime.split('/')[1] || 'png');
      a.click();
    });
    $('b64-img-reset').addEventListener('click', function() {
      _currentDataUri = ''; _origImg = null;
      $('b64-img-result').style.display = 'none';
      $('b64-img-drop').style.display = '';
      $('b64-img-file').value = '';
    });

    $('b64-img-decode-btn').addEventListener('click', function() {
      var raw = $('b64-img-decode-in').value.trim();
      if (!raw) return;
      var src = raw.indexOf('data:') === 0 ? raw : 'data:image/png;base64,' + raw;
      $('b64-img-decode-preview').innerHTML =
        '<img src="' + src + '" style="max-width:100%;max-height:120px;border-radius:8px;border:1px solid #1e3838;" onerror="this.parentElement.innerHTML=\'<span style=color:#ef4444>\u2717 Invalid image data</span>\'" />';
      setStatus('\u2713 Decoded', true);
    });
    $('b64-img-decode-dl').addEventListener('click', function() {
      var raw = $('b64-img-decode-in').value.trim();
      if (!raw) return;
      var src = raw.indexOf('data:') === 0 ? raw : 'data:image/png;base64,' + raw;
      var a = document.createElement('a');
      a.href = src; a.download = 'decoded-image.png'; a.click();
    });
  },
};
