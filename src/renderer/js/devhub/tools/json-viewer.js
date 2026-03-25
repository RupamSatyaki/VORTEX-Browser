const JsonViewerTool = {
  id: 'json-viewer',
  name: 'JSON Viewer',
  desc: 'Pretty print, validate & explore JSON',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="12" y2="17"/>
  </svg>`,

  render(container) {
    container.innerHTML = `
      <div class="dh-tool-wrap">
        <div class="dh-tool-row">
          <textarea class="dh-textarea" id="jv-input" placeholder='Paste JSON here…\n\n{"name":"Vortex","version":"2.0.0"}'></textarea>
        </div>
        <div class="dh-tool-actions">
          <button class="dh-btn primary" id="jv-format">Format</button>
          <button class="dh-btn" id="jv-minify">Minify</button>
          <button class="dh-btn" id="jv-copy">Copy</button>
          <button class="dh-btn danger" id="jv-clear">Clear</button>
          <span class="dh-status" id="jv-status"></span>
        </div>
        <div class="dh-output-wrap">
          <div class="dh-output" id="jv-output"></div>
        </div>
      </div>`;

    const input  = container.querySelector('#jv-input');
    const output = container.querySelector('#jv-output');
    const status = container.querySelector('#jv-status');

    function setStatus(msg, ok) {
      status.textContent = msg;
      status.style.color = ok ? '#22c55e' : '#ef4444';
    }

    function buildTree(val, depth = 0) {
      if (val === null) return `<span class="jv-null">null</span>`;
      if (typeof val === 'boolean') return `<span class="jv-bool">${val}</span>`;
      if (typeof val === 'number') return `<span class="jv-num">${val}</span>`;
      if (typeof val === 'string') return `<span class="jv-str">"${val.replace(/</g,'&lt;').replace(/>/g,'&gt;')}"</span>`;

      if (Array.isArray(val)) {
        if (val.length === 0) return `<span class="jv-bracket">[]</span>`;
        const items = val.map((v, i) =>
          `<div class="jv-line" style="padding-left:${(depth+1)*14}px">
            <span class="jv-idx">${i}</span>: ${buildTree(v, depth+1)}${i < val.length-1 ? ',' : ''}
          </div>`).join('');
        return `<span class="jv-bracket">[</span>${items}<div style="padding-left:${depth*14}px"><span class="jv-bracket">]</span></div>`;
      }

      const keys = Object.keys(val);
      if (keys.length === 0) return `<span class="jv-bracket">{}</span>`;
      const items = keys.map((k, i) =>
        `<div class="jv-line" style="padding-left:${(depth+1)*14}px">
          <span class="jv-key">"${k}"</span>: ${buildTree(val[k], depth+1)}${i < keys.length-1 ? ',' : ''}
        </div>`).join('');
      return `<span class="jv-bracket">{</span>${items}<div style="padding-left:${depth*14}px"><span class="jv-bracket">}</span></div>`;
    }

    container.querySelector('#jv-format').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(input.value.trim());
        input.value = JSON.stringify(parsed, null, 2);
        output.innerHTML = buildTree(parsed);
        setStatus('✓ Valid JSON', true);
      } catch(e) {
        output.innerHTML = '';
        setStatus('✗ ' + e.message, false);
      }
    });

    container.querySelector('#jv-minify').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(input.value.trim());
        input.value = JSON.stringify(parsed);
        output.innerHTML = '';
        setStatus('✓ Minified', true);
      } catch(e) {
        setStatus('✗ ' + e.message, false);
      }
    });

    container.querySelector('#jv-copy').addEventListener('click', () => {
      if (input.value) {
        navigator.clipboard.writeText(input.value);
        setStatus('Copied!', true);
        setTimeout(() => setStatus('', true), 1500);
      }
    });

    container.querySelector('#jv-clear').addEventListener('click', () => {
      input.value = ''; output.innerHTML = ''; status.textContent = '';
    });
  }
};
