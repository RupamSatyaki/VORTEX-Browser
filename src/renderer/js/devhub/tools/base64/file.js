/**
 * base64/file.js — Any file encode/decode component
 */
const B64File = {

  render(container, setStatus) {
    container.innerHTML = `
      <div class="b64-file-wrap">

        <!-- Encode section -->
        <div class="b64-file-section">
          <div class="b64-section-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Encode File → Base64
          </div>
          <div class="b64-file-drop" id="b64-file-drop">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2e6060" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Drop any file here or</span>
            <label class="dh-btn" style="cursor:pointer">
              Browse
              <input type="file" id="b64-any-file" style="display:none"/>
            </label>
          </div>
          <div class="b64-file-info" id="b64-file-info" style="display:none"></div>
          <div class="b64-file-actions" id="b64-file-actions" style="display:none">
            <button class="dh-btn primary" id="b64-file-copy">Copy Base64</button>
            <button class="dh-btn" id="b64-file-copy-uri">Copy Data URI</button>
            <button class="dh-btn" id="b64-file-dl-txt">Download .txt</button>
          </div>
          <textarea class="dh-textarea b64-textarea" id="b64-file-out"
            placeholder="Base64 output appears here…" readonly spellcheck="false"
            style="min-height:70px;font-size:10.5px;display:none;"></textarea>
        </div>

        <div class="b64-file-divider"></div>

        <!-- Decode section -->
        <div class="b64-file-section">
          <div class="b64-section-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Decode Base64 → File
          </div>
          <textarea class="dh-textarea b64-textarea" id="b64-dec-in"
            placeholder="Paste Base64 or data:mime/type;base64,... here…"
            spellcheck="false" style="min-height:80px;font-size:11px;"></textarea>
          <div class="b64-dec-row">
            <input class="dh-input" id="b64-dec-filename" type="text"
              placeholder="filename.bin" style="flex:1;" spellcheck="false"/>
            <button class="dh-btn primary" id="b64-dec-dl">Download File</button>
            <button class="dh-btn" id="b64-dec-preview">Preview</button>
          </div>
          <div id="b64-dec-preview-out" style="margin-top:8px;"></div>
        </div>

      </div>`;

    const $ = id => container.querySelector('#' + id);
    let _fileB64 = '', _fileMime = 'application/octet-stream', _fileName = '';

    function loadFile(file) {
      if (!file) return;
      _fileName = file.name;
      _fileMime = file.type || 'application/octet-stream';
      const reader = new FileReader();
      reader.onload = e => {
        const dataUri = e.target.result;
        _fileB64 = dataUri.split(',')[1] || '';
        const size = B64Utils.fmtBytes(file.size);
        const encSize = B64Utils.fmtBytes(new TextEncoder().encode(_fileB64).length);

        $('b64-file-info').style.display = '';
        $('b64-file-info').innerHTML = `
          <div class="b64-file-meta-grid">
            <div class="b64-meta-row"><span class="b64-meta-k">Name</span><span class="b64-meta-v">${file.name}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Type</span><span class="b64-meta-v">${_fileMime}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Original</span><span class="b64-meta-v">${size}</span></div>
            <div class="b64-meta-row"><span class="b64-meta-k">Encoded</span><span class="b64-meta-v">${encSize}</span></div>
          </div>`;

        $('b64-file-actions').style.display = 'flex';
        $('b64-file-out').style.display = '';
        $('b64-file-out').value = _fileB64;
        $('b64-dec-filename').value = file.name;
        setStatus('✓ File encoded', true);
      };
      reader.readAsDataURL(file);
    }

    // Drop zone
    const drop = $('b64-file-drop');
    drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('b64-drop-active'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('b64-drop-active'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('b64-drop-active'); loadFile(e.dataTransfer.files[0]); });
    $('b64-any-file').addEventListener('change', e => { loadFile(e.target.files[0]); e.target.value=''; });

    $('b64-file-copy').addEventListener('click', () => {
      if (_fileB64) { navigator.clipboard.writeText(_fileB64); setStatus('Copied!', true); }
    });
    $('b64-file-copy-uri').addEventListener('click', () => {
      if (_fileB64) { navigator.clipboard.writeText(`data:${_fileMime};base64,${_fileB64}`); setStatus('Data URI copied!', true); }
    });
    $('b64-file-dl-txt').addEventListener('click', () => {
      if (!_fileB64) return;
      const blob = new Blob([_fileB64], {type:'text/plain'});
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
      a.download=(_fileName||'file')+'.b64.txt'; a.click();
    });

    // Decode
    $('b64-dec-dl').addEventListener('click', () => {
      const raw = $('b64-dec-in').value.trim();
      if (!raw) return;
      try {
        let b64 = raw, mime = 'application/octet-stream';
        if (raw.startsWith('data:')) {
          const [header, data] = raw.split(',');
          b64 = data;
          mime = header.split(':')[1]?.split(';')[0] || mime;
        }
        const binary = atob(b64);
        const bytes  = new Uint8Array(binary.length);
        for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], {type: mime});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = $('b64-dec-filename').value || 'decoded-file.bin';
        a.click();
        setStatus('✓ Downloaded', true);
      } catch(e) { setStatus('✗ Invalid Base64', false); }
    });

    $('b64-dec-preview').addEventListener('click', () => {
      const raw = $('b64-dec-in').value.trim();
      if (!raw) return;
      const prev = $('b64-dec-preview-out');
      try {
        let b64 = raw, mime = '';
        if (raw.startsWith('data:')) { const [h,d]=raw.split(','); b64=d; mime=h.split(':')[1]?.split(';')[0]||''; }
        if (mime.startsWith('image/') || (!mime && B64Utils.isValid(b64))) {
          const src = raw.startsWith('data:') ? raw : `data:image/png;base64,${b64}`;
          prev.innerHTML = `<img src="${src}" style="max-width:100%;max-height:100px;border-radius:8px;border:1px solid #1e3838;" onerror="this.parentElement.innerHTML='<span style=color:#4a8080>Cannot preview this file type</span>'" />`;
        } else {
          const decoded = atob(b64);
          const text = decoded.slice(0, 500);
          prev.innerHTML = `<pre class="b64-text-preview">${text.replace(/</g,'&lt;')}${decoded.length>500?'\n…':''}
</pre>`;
        }
      } catch(e) { prev.innerHTML=`<span style="color:#ef4444;font-size:11.5px">✗ ${e.message}</span>`; }
    });
  },
};
