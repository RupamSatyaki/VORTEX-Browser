const Base64Tool = {
  id: 'base64',
  name: 'Base64',
  desc: 'Encode & decode Base64 text or images',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`,

  render(container) {
    container.innerHTML = `
      <div class="dh-tool-wrap">
        <div class="dh-tab-row">
          <button class="dh-tab active" id="b64-tab-text">Text</button>
          <button class="dh-tab" id="b64-tab-img">Image</button>
        </div>

        <div id="b64-text-mode">
          <textarea class="dh-textarea" id="b64-input" placeholder="Enter text or Base64 string…"></textarea>
          <div class="dh-tool-actions">
            <button class="dh-btn primary" id="b64-encode">Encode</button>
            <button class="dh-btn" id="b64-decode">Decode</button>
            <button class="dh-btn" id="b64-copy">Copy</button>
            <button class="dh-btn danger" id="b64-clear">Clear</button>
            <span class="dh-status" id="b64-status"></span>
          </div>
          <textarea class="dh-textarea" id="b64-output" placeholder="Result…" readonly style="min-height:80px;"></textarea>
        </div>

        <div id="b64-img-mode" style="display:none;">
          <div class="b64-drop" id="b64-drop">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2e6060" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div>Drop image here or <label style="color:#00c8b4;cursor:pointer;"><input type="file" id="b64-file" accept="image/*" style="display:none">click to upload</label></div>
          </div>
          <div class="dh-tool-actions" style="margin-top:8px;">
            <button class="dh-btn" id="b64-img-copy">Copy Base64</button>
            <span class="dh-status" id="b64-img-status"></span>
          </div>
          <div id="b64-img-preview" style="margin-top:8px;"></div>
          <textarea class="dh-textarea" id="b64-img-out" placeholder="Base64 output…" readonly style="min-height:60px;font-size:10px;"></textarea>
        </div>
      </div>`;

    const st = container.querySelector('#b64-status');
    function setStatus(msg, ok) { st.textContent = msg; st.style.color = ok ? '#22c55e' : '#ef4444'; }

    container.querySelector('#b64-encode').addEventListener('click', () => {
      try {
        container.querySelector('#b64-output').value = btoa(unescape(encodeURIComponent(container.querySelector('#b64-input').value)));
        setStatus('✓ Encoded', true);
      } catch(e) { setStatus('✗ ' + e.message, false); }
    });
    container.querySelector('#b64-decode').addEventListener('click', () => {
      try {
        container.querySelector('#b64-output').value = decodeURIComponent(escape(atob(container.querySelector('#b64-input').value.trim())));
        setStatus('✓ Decoded', true);
      } catch(e) { setStatus('✗ Invalid Base64', false); }
    });
    container.querySelector('#b64-copy').addEventListener('click', () => {
      const v = container.querySelector('#b64-output').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); setTimeout(()=>st.textContent='',1500); }
    });
    container.querySelector('#b64-clear').addEventListener('click', () => {
      container.querySelector('#b64-input').value = '';
      container.querySelector('#b64-output').value = '';
      st.textContent = '';
    });

    // Tabs
    container.querySelector('#b64-tab-text').addEventListener('click', () => {
      container.querySelector('#b64-text-mode').style.display = '';
      container.querySelector('#b64-img-mode').style.display = 'none';
      container.querySelector('#b64-tab-text').classList.add('active');
      container.querySelector('#b64-tab-img').classList.remove('active');
    });
    container.querySelector('#b64-tab-img').addEventListener('click', () => {
      container.querySelector('#b64-text-mode').style.display = 'none';
      container.querySelector('#b64-img-mode').style.display = '';
      container.querySelector('#b64-tab-img').classList.add('active');
      container.querySelector('#b64-tab-text').classList.remove('active');
    });

    // Image mode
    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const b64 = e.target.result;
        container.querySelector('#b64-img-out').value = b64;
        container.querySelector('#b64-img-preview').innerHTML = `<img src="${b64}" style="max-width:100%;max-height:120px;border-radius:6px;border:1px solid #1e3838;" />`;
      };
      reader.readAsDataURL(file);
    }
    container.querySelector('#b64-file').addEventListener('change', e => handleFile(e.target.files[0]));
    const drop = container.querySelector('#b64-drop');
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor='#00c8b4'; });
    drop.addEventListener('dragleave', () => drop.style.borderColor='');
    drop.addEventListener('drop', e => { e.preventDefault(); drop.style.borderColor=''; handleFile(e.dataTransfer.files[0]); });
    container.querySelector('#b64-img-copy').addEventListener('click', () => {
      const v = container.querySelector('#b64-img-out').value;
      if (v) { navigator.clipboard.writeText(v); const s=container.querySelector('#b64-img-status'); s.textContent='Copied!'; s.style.color='#22c55e'; setTimeout(()=>s.textContent='',1500); }
    });
  }
};
