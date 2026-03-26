/**
 * base64/text.js — Text encode/decode component
 */
const B64Text = {

  render(container, setStatus) {
    container.innerHTML = `
      <div class="b64-text-wrap">

        <!-- Auto-detect badge -->
        <div class="b64-detect-row">
          <div class="b64-detect-badge" id="b64-detect-badge">
            <span class="b64-detect-dot" id="b64-detect-dot"></span>
            <span id="b64-detect-label">Waiting for input…</span>
          </div>
          <div class="b64-size-info" id="b64-size-info" style="display:none"></div>
        </div>

        <!-- Input -->
        <div class="b64-io-row">
          <div class="b64-io-col">
            <div class="b64-io-label">
              <span>Input</span>
              <button class="b64-io-clear" id="b64-txt-clear-in" title="Clear">✕</button>
            </div>
            <textarea class="dh-textarea b64-textarea" id="b64-txt-in"
              placeholder="Type or paste text / Base64…" spellcheck="false"></textarea>
          </div>
          <div class="b64-io-divider">
            <button class="b64-swap-btn" id="b64-swap" title="Swap input ↔ output">⇄</button>
          </div>
          <div class="b64-io-col">
            <div class="b64-io-label">
              <span>Output</span>
              <button class="b64-io-clear" id="b64-txt-clear-out" title="Clear">✕</button>
            </div>
            <textarea class="dh-textarea b64-textarea" id="b64-txt-out"
              placeholder="Result appears here…" readonly spellcheck="false"></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="b64-actions-row">
          <div class="b64-action-group">
            <button class="dh-btn primary b64-action-btn" id="b64-encode-btn">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              Encode
            </button>
            <button class="dh-btn b64-action-btn" id="b64-decode-btn">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Decode
            </button>
            <button class="dh-btn b64-action-btn" id="b64-auto-btn" title="Auto-detect and encode or decode">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Auto
            </button>
          </div>
          <div class="b64-action-group">
            <button class="dh-btn b64-action-btn" id="b64-urlsafe-enc">URL-safe ↑</button>
            <button class="dh-btn b64-action-btn" id="b64-urlsafe-dec">URL-safe ↓</button>
          </div>
          <div class="b64-action-group">
            <button class="dh-btn b64-action-btn" id="b64-chunk-btn" title="Wrap at 76 chars (MIME)">Chunk</button>
            <button class="dh-btn b64-action-btn" id="b64-copy-out">Copy</button>
            <button class="dh-btn danger b64-action-btn" id="b64-clear-all">Clear</button>
          </div>
        </div>

        <!-- Options -->
        <div class="b64-options-row">
          <label class="b64-opt-label">
            <input type="checkbox" id="b64-live" checked class="b64-checkbox"/>
            Live encode on type
          </label>
          <label class="b64-opt-label">
            <input type="checkbox" id="b64-urlsafe-mode" class="b64-checkbox"/>
            URL-safe mode
          </label>
          <label class="b64-opt-label">
            <input type="checkbox" id="b64-chunk-mode" class="b64-checkbox"/>
            Chunk output (76 chars)
          </label>
        </div>

        <!-- Validate strip -->
        <div class="b64-validate-strip" id="b64-validate-strip" style="display:none">
          <div class="b64-validate-inner" id="b64-validate-inner"></div>
        </div>

      </div>`;

    const $ = id => container.querySelector('#' + id);

    function getIn()  { return $('b64-txt-in').value; }
    function setOut(v){ $('b64-txt-out').value = v; }
    function getOut() { return $('b64-txt-out').value; }

    function updateDetect(val) {
      const type = B64Utils.autoDetect(val);
      const dot  = $('b64-detect-dot');
      const lbl  = $('b64-detect-label');
      const badge= $('b64-detect-badge');
      const map  = {
        empty:   { color:'#2e6060', text:'Waiting for input…' },
        plain:   { color:'#22c55e', text:'Plain text detected' },
        base64:  { color:'#00c8b4', text:'Base64 detected — click Auto to decode' },
        urlsafe: { color:'#a78bfa', text:'URL-safe Base64 detected' },
      };
      const info = map[type] || map.empty;
      dot.style.background = info.color;
      lbl.textContent = info.text;
      badge.style.borderColor = info.color + '44';
    }

    function updateSizeInfo(orig, enc) {
      if (!orig || !enc) { $('b64-size-info').style.display='none'; return; }
      const s = B64Utils.sizeInfo(orig, enc);
      $('b64-size-info').style.display = '';
      $('b64-size-info').innerHTML =
        `<span>${B64Utils.fmtBytes(s.origBytes)}</span>
         <span class="b64-size-arrow">→</span>
         <span>${B64Utils.fmtBytes(s.encBytes)}</span>
         <span class="b64-size-overhead">${s.overhead}</span>`;
    }

    function updateValidate(val) {
      const strip = $('b64-validate-strip');
      const inner = $('b64-validate-inner');
      if (!val.trim()) { strip.style.display='none'; return; }
      strip.style.display = '';
      const valid = B64Utils.isValid(val.trim().replace(/\s/g,''));
      inner.className = 'b64-validate-inner ' + (valid ? 'b64-valid' : 'b64-invalid');
      inner.innerHTML = valid
        ? `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Valid Base64`
        : `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Not valid Base64`;
    }

    function doEncode() {
      try {
        const urlSafe = $('b64-urlsafe-mode').checked;
        const chunk   = $('b64-chunk-mode').checked;
        let result = urlSafe ? B64Utils.encodeUrlSafe(getIn()) : B64Utils.encode(getIn());
        if (chunk) result = B64Utils.chunk(result);
        setOut(result);
        updateSizeInfo(getIn(), result);
        setStatus('✓ Encoded', true);
      } catch(e) { setStatus('✗ ' + e.message, false); }
    }

    function doDecode() {
      try {
        const urlSafe = $('b64-urlsafe-mode').checked;
        const result  = urlSafe ? B64Utils.decodeUrlSafe(getIn()) : B64Utils.decode(getIn());
        setOut(result);
        updateSizeInfo(result, getIn());
        setStatus('✓ Decoded', true);
      } catch(e) { setStatus('✗ Invalid Base64', false); }
    }

    // Live encode
    $('b64-txt-in').addEventListener('input', () => {
      const val = getIn();
      updateDetect(val);
      updateValidate(val);
      if ($('b64-live').checked && val) doEncode();
      else if (!val) { setOut(''); $('b64-size-info').style.display='none'; }
    });

    $('b64-encode-btn').addEventListener('click', doEncode);
    $('b64-decode-btn').addEventListener('click', doDecode);

    $('b64-auto-btn').addEventListener('click', () => {
      const type = B64Utils.autoDetect(getIn());
      if (type === 'base64' || type === 'urlsafe') doDecode();
      else doEncode();
    });

    $('b64-urlsafe-enc').addEventListener('click', () => {
      try { setOut(B64Utils.encodeUrlSafe(getIn())); setStatus('✓ URL-safe encoded', true); } catch(e) { setStatus('✗ '+e.message, false); }
    });
    $('b64-urlsafe-dec').addEventListener('click', () => {
      try { setOut(B64Utils.decodeUrlSafe(getIn())); setStatus('✓ URL-safe decoded', true); } catch(e) { setStatus('✗ Invalid', false); }
    });

    $('b64-chunk-btn').addEventListener('click', () => {
      const v = getOut() || getIn();
      if (v) { setOut(B64Utils.chunk(v)); setStatus('✓ Chunked', true); }
    });

    $('b64-swap').addEventListener('click', () => {
      const tmp = getIn();
      $('b64-txt-in').value = getOut();
      setOut(tmp);
      updateDetect($('b64-txt-in').value);
    });

    $('b64-copy-out').addEventListener('click', () => {
      if (getOut()) { navigator.clipboard.writeText(getOut()); setStatus('Copied!', true); }
    });

    $('b64-clear-all').addEventListener('click', () => {
      $('b64-txt-in').value = ''; setOut('');
      $('b64-size-info').style.display = 'none';
      $('b64-validate-strip').style.display = 'none';
      updateDetect('');
      setStatus('', true);
    });

    $('b64-txt-clear-in').addEventListener('click',  () => { $('b64-txt-in').value=''; updateDetect(''); });
    $('b64-txt-clear-out').addEventListener('click', () => setOut(''));
  },
};
