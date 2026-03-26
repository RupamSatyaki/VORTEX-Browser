/**
 * base64/image.js — Image encode/decode + embed code component
 */
const B64Image = {

  render(container, setStatus) {
    container.innerHTML = `
      <div class="b64-img-wrap">

        <!-- Drop zone -->
        <div class="b64-drop-zone" id="b64-img-drop">
          <div class="b64-drop-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2e6060" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div class="b64-drop-text">Drop image here</div>
          <div class="b64-drop-sub">or</div>
          <label class="dh-btn b64-upload-btn">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Choose Image
            <input type="file" id="b64-img-file" accept="image/*" style="display:none"/>
          </label>
          <div class="b64-drop-hint">PNG, JPG, GIF, SVG, WebP</div>
        </div>

        <!-- Result (hidden until image loaded) -->
        <div class="b64-img-result" id="b64-img-result" style="display:none">

          <!-- Preview + meta -->
          <div class="b64-img-preview-row">
            <div class="b64-img-preview-wrap">
              <img id="b64-img-preview" class="b64-img-preview" alt="preview"/>
              <button class="b64-img-reset" id="b64-img-reset" title="Remove image">✕</button>
            </div>
            <div class="b64-img-meta" id="b64-img-meta"></div>
          </div>

          <!-- Embed code tabs -->
          <div class="b64-embed-tabs">
            <button class="b64-embed-tab active" data-embed="html">HTML img</button>
            <button class="b64-embed-tab" data-embed="css">CSS bg</button>
            <button class="b64-embed-tab" data-embed="json">JSON</button>
            <button class="b64-embed-tab" data-embed="md">Markdown</button>
            <button class="b64-embed-tab" data-embed="raw">Raw Base64</button>
          </div>

          <div class="b64-embed-out-wrap">
            <pre class="b64-embed-out" id="b64-embed-out"></pre>
            <div class="b64-embed-actions">
              <button class="dh-btn primary" id="b64-embed-copy">Copy</button>
              <button class="dh-btn" id="b64-img-download" title="Download as .txt">Download</button>
            </div>
          </div>

          <!-- Decode from Base64 -->
          <div class="b64-decode-img-section">
            <div class="b64-section-label">Decode Base64 → Image</div>
            <textarea class="dh-textarea b64-textarea" id="b64-img-decode-in"
              placeholder="Paste data:image/... or raw Base64 here…" spellcheck="false" style="min-height:60px;"></textarea>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <button class="dh-btn primary" id="b64-img-decode-btn">Decode → Preview</button>
              <button class="dh-btn" id="b64-img-decode-dl">Download Image</button>
            </div>
            <div id="b64-img-decode-preview" style="margin-top:8px;"></div>
          </div>

        </div>

      </div>`;

    const $ = id => container.querySelector('#' + id);
    let _currentDataUri = '';
    let _currentMime    = 'image/png';
    let _activeEmbed    = 'html';

    function getEmbedCode(type) {
      const raw = _currentDataUri.split(',')[1] || '';
      switch(type) {
        case 'html': return B64Utils.htmlImgTag(_currentDataUri);
        case 'css':  return B64Utils.cssBackground(_currentDataUri);
        case 'json': return B64Utils.jsonEmbed(raw, _currentMime);
        case 'md':   return B64Utils.markdownImg(_currentDataUri);
        case 'raw':  return raw;
        default:     return _currentDataUri;
      }
    }

    function renderEmbed() {
      $('b64-embed-out').textContent = getEmbedCode(_activeEmbed);
    }

    function loadImage(file) {
      if (!file || !file.type.startsWith('image/')) {
        setStatus('✗ Not an image file', false); return;
      }
      _currentMime = file.type;
      const reader = new FileReader();
      reader.onload = e => {
        _currentDataUri = e.target.result;
        $('b64-img-preview').src = _currentDataUri;
        $('b64-img-result').style.display = '';
        $('b64-img-drop').style.display   = 'none';

        // Meta info
        const img = new Image();
        img.onload = () => {
          const raw  = _currentDataUri.split(',')[1] || '';
          const size = B64Utils.fmtBytes(new TextEncoder().encode(raw).length);
          $('b64-img-meta').innerHTML = `
            <div class="b64-meta-row"><span class="b64-meta-k">Type</span><span class="b64-meta-v">${file.type}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Size</span><span class="b64-meta-v">${B64Utils.fmtBytes(file.size)}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">B64 size</span><span class="b64-meta-v">${size}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Dimensions</span><span class="b64-meta-v">${img.width} × ${img.height}px</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Overhead</span><span class="b64-meta-v">${B64Utils.sizeInfo('x'.repeat(file.size), raw).overhead}</span></div>`;
        };
        img.src = _currentDataUri;
        renderEmbed();
        setStatus('✓ Image loaded', true);
      };
      reader.readAsDataURL(file);
    }

    // Drop zone
    const drop = $('b64-img-drop');
    drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('b64-drop-active'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('b64-drop-active'));
    drop.addEventListener('drop', e => {
      e.preventDefault(); drop.classList.remove('b64-drop-active');
      loadImage(e.dataTransfer.files[0]);
    });
    $('b64-img-file').addEventListener('change', e => { loadImage(e.target.files[0]); e.target.value=''; });

    // Embed tabs
    container.querySelectorAll('.b64-embed-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.b64-embed-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _activeEmbed = tab.dataset.embed;
        renderEmbed();
      });
    });

    $('b64-embed-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(getEmbedCode(_activeEmbed));
      setStatus('Copied!', true);
    });

    $('b64-img-download').addEventListener('click', () => {
      const blob = new Blob([getEmbedCode(_activeEmbed)], {type:'text/plain'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `base64-${_activeEmbed}.txt`;
      a.click();
    });

    $('b64-img-reset').addEventListener('click', () => {
      _currentDataUri = '';
      $('b64-img-result').style.display = 'none';
      $('b64-img-drop').style.display   = '';
      $('b64-img-file').value = '';
    });

    // Decode Base64 → image
    $('b64-img-decode-btn').addEventListener('click', () => {
      const raw = $('b64-img-decode-in').value.trim();
      if (!raw) return;
      try {
        const src = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`;
        $('b64-img-decode-preview').innerHTML =
          `<img src="${src}" style="max-width:100%;max-height:120px;border-radius:8px;border:1px solid #1e3838;" onerror="this.parentElement.innerHTML='<span style=color:#ef4444>✗ Invalid image data</span>'" />`;
        setStatus('✓ Decoded', true);
      } catch(e) { setStatus('✗ ' + e.message, false); }
    });

    $('b64-img-decode-dl').addEventListener('click', () => {
      const raw = $('b64-img-decode-in').value.trim();
      if (!raw) return;
      const src = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`;
      const a = document.createElement('a');
      a.href = src; a.download = 'decoded-image.png'; a.click();
    });
  },
};
