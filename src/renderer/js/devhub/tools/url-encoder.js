const UrlEncoderTool = {
  id: 'url-encoder',
  name: 'URL Encoder',
  desc: 'Encode & decode URL strings and query params',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`,

  render(container) {
    container.innerHTML = `
      <div class="dh-tool-wrap">
        <div class="dh-tab-row">
          <button class="dh-tab active" id="ue-tab-basic">Encode/Decode</button>
          <button class="dh-tab" id="ue-tab-parse">Parse URL</button>
        </div>

        <div id="ue-basic-mode">
          <textarea class="dh-textarea" id="ue-input" placeholder="Enter URL or text to encode/decode…"></textarea>
          <div class="dh-tool-actions">
            <button class="dh-btn primary" id="ue-encode">Encode</button>
            <button class="dh-btn" id="ue-decode">Decode</button>
            <button class="dh-btn" id="ue-encode-full">Encode Full URL</button>
            <button class="dh-btn" id="ue-copy">Copy</button>
            <span class="dh-status" id="ue-status"></span>
          </div>
          <textarea class="dh-textarea" id="ue-output" placeholder="Result…" readonly style="min-height:80px;"></textarea>
        </div>

        <div id="ue-parse-mode" style="display:none;">
          <input class="dh-input" id="ue-parse-input" type="text" placeholder="https://example.com/path?foo=bar&baz=qux#section" style="width:100%;margin-bottom:8px;" />
          <button class="dh-btn primary" id="ue-parse-btn" style="margin-bottom:10px;">Parse</button>
          <div id="ue-parse-result"></div>
        </div>
      </div>`;

    const st = container.querySelector('#ue-status');
    function setStatus(msg, ok) { st.textContent = msg; st.style.color = ok ? '#22c55e' : '#ef4444'; }

    container.querySelector('#ue-encode').addEventListener('click', () => {
      try { container.querySelector('#ue-output').value = encodeURIComponent(container.querySelector('#ue-input').value); setStatus('✓ Encoded', true); }
      catch(e) { setStatus('✗ ' + e.message, false); }
    });
    container.querySelector('#ue-decode').addEventListener('click', () => {
      try { container.querySelector('#ue-output').value = decodeURIComponent(container.querySelector('#ue-input').value); setStatus('✓ Decoded', true); }
      catch(e) { setStatus('✗ Invalid encoding', false); }
    });
    container.querySelector('#ue-encode-full').addEventListener('click', () => {
      try { container.querySelector('#ue-output').value = encodeURI(container.querySelector('#ue-input').value); setStatus('✓ Encoded (full URL)', true); }
      catch(e) { setStatus('✗ ' + e.message, false); }
    });
    container.querySelector('#ue-copy').addEventListener('click', () => {
      const v = container.querySelector('#ue-output').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); setTimeout(()=>st.textContent='',1500); }
    });

    // Tabs
    container.querySelector('#ue-tab-basic').addEventListener('click', () => {
      container.querySelector('#ue-basic-mode').style.display = '';
      container.querySelector('#ue-parse-mode').style.display = 'none';
      container.querySelector('#ue-tab-basic').classList.add('active');
      container.querySelector('#ue-tab-parse').classList.remove('active');
    });
    container.querySelector('#ue-tab-parse').addEventListener('click', () => {
      container.querySelector('#ue-basic-mode').style.display = 'none';
      container.querySelector('#ue-parse-mode').style.display = '';
      container.querySelector('#ue-tab-parse').classList.add('active');
      container.querySelector('#ue-tab-basic').classList.remove('active');
    });

    container.querySelector('#ue-parse-btn').addEventListener('click', () => {
      const raw = container.querySelector('#ue-parse-input').value.trim();
      const res = container.querySelector('#ue-parse-result');
      try {
        const u = new URL(raw);
        const params = [...u.searchParams.entries()];
        res.innerHTML = `
          <div class="ue-parse-table">
            ${[
              ['Protocol', u.protocol],
              ['Host', u.host],
              ['Hostname', u.hostname],
              ['Port', u.port || '(default)'],
              ['Pathname', u.pathname],
              ['Hash', u.hash || '(none)'],
            ].map(([k,v]) => `<div class="ue-parse-row"><span class="ue-parse-key">${k}</span><span class="ue-parse-val">${v}</span></div>`).join('')}
            ${params.length ? `<div class="ue-parse-row" style="margin-top:6px;"><span class="ue-parse-key" style="color:#00c8b4">Query Params</span></div>
              ${params.map(([k,v]) => `<div class="ue-parse-row" style="padding-left:12px;"><span class="ue-parse-key">${k}</span><span class="ue-parse-val">${v}</span></div>`).join('')}` : ''}
          </div>`;
      } catch(e) {
        res.innerHTML = `<span style="color:#ef4444;font-size:12px;">✗ Invalid URL</span>`;
      }
    });
  }
};
