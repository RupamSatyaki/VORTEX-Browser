/**
 * base64/jwt.js — JWT Decoder component
 */
const B64JWT = {

  render(container, setStatus) {
    container.innerHTML = `
      <div class="b64-jwt-wrap">

        <div class="b64-batch-info">Paste a JWT token to decode header, payload and signature</div>

        <div class="b64-jwt-input-row">
          <textarea class="dh-textarea b64-textarea b64-jwt-input" id="b64-jwt-in"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
            spellcheck="false" style="min-height:70px;font-family:monospace;font-size:11px;"></textarea>
          <div class="b64-jwt-actions">
            <button class="dh-btn primary" id="b64-jwt-decode">Decode</button>
            <button class="dh-btn danger" id="b64-jwt-clear">Clear</button>
          </div>
        </div>

        <!-- Colored token display -->
        <div class="b64-jwt-colored" id="b64-jwt-colored" style="display:none"></div>

        <!-- Results -->
        <div id="b64-jwt-result" style="display:none">

          <!-- Status bar -->
          <div class="b64-jwt-status-row" id="b64-jwt-status-row"></div>

          <!-- Header -->
          <div class="b64-jwt-section">
            <div class="b64-jwt-section-header b64-jwt-header-color">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
              Header
            </div>
            <div class="b64-jwt-claims" id="b64-jwt-header-claims"></div>
            <pre class="b64-jwt-raw" id="b64-jwt-header-raw"></pre>
          </div>

          <!-- Payload -->
          <div class="b64-jwt-section">
            <div class="b64-jwt-section-header b64-jwt-payload-color">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
              Payload
            </div>
            <div class="b64-jwt-claims" id="b64-jwt-payload-claims"></div>
            <pre class="b64-jwt-raw" id="b64-jwt-payload-raw"></pre>
          </div>

          <!-- Signature -->
          <div class="b64-jwt-section">
            <div class="b64-jwt-section-header b64-jwt-sig-color">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Signature
            </div>
            <code class="b64-jwt-sig" id="b64-jwt-sig"></code>
          </div>

          <!-- Copy actions -->
          <div class="b64-jwt-copy-row">
            <button class="dh-btn b64-action-btn" id="b64-jwt-copy-header">Copy Header</button>
            <button class="dh-btn b64-action-btn" id="b64-jwt-copy-payload">Copy Payload</button>
            <button class="dh-btn b64-action-btn" id="b64-jwt-copy-all">Copy Full JSON</button>
          </div>

        </div>

      </div>`;

    const $ = id => container.querySelector('#' + id);
    let _decoded = null;

    function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function formatVal(v) {
      if (v === null) return '<span style="color:#6b7280">null</span>';
      if (typeof v === 'boolean') return `<span style="color:#a5b4fc">${v}</span>`;
      if (typeof v === 'number') return `<span style="color:#fdba74">${v}</span>`;
      if (typeof v === 'string') return `<span style="color:#86efac">"${escHtml(v)}"</span>`;
      return `<span style="color:#c8e8e5">${escHtml(JSON.stringify(v))}</span>`;
    }

    function renderClaims(obj, containerId) {
      const el = $(containerId);
      const KNOWN = {
        // Standard claims
        iss: 'Issuer',        sub: 'Subject',       aud: 'Audience',
        exp: 'Expires',       nbf: 'Not Before',    iat: 'Issued At',
        jti: 'JWT ID',
        // Header
        alg: 'Algorithm',     typ: 'Type',          kid: 'Key ID',
        // Common payload
        name: 'Name',         email: 'Email',       role: 'Role',
        scope: 'Scope',       azp: 'Authorized Party',
      };
      const TIME_CLAIMS = ['exp','nbf','iat'];

      el.innerHTML = Object.entries(obj).map(([k, v]) => {
        const label = KNOWN[k] || k;
        let display = formatVal(v);
        let extra = '';

        if (TIME_CLAIMS.includes(k) && typeof v === 'number') {
          const d = new Date(v * 1000);
          const now = Date.now();
          const isExp = k === 'exp';
          const expired = isExp && v * 1000 < now;
          extra = `<span class="b64-jwt-time ${expired ? 'b64-jwt-expired' : 'b64-jwt-valid'}">
            ${d.toLocaleString()} ${isExp ? (expired ? '· EXPIRED' : '· Valid') : ''}
          </span>`;
        }

        return `<div class="b64-jwt-claim-row">
          <span class="b64-jwt-claim-key" title="${k}">${label}</span>
          <span class="b64-jwt-claim-val">${display}${extra}</span>
        </div>`;
      }).join('');
    }

    function decode() {
      const token = $('b64-jwt-in').value.trim();
      if (!token) return;
      try {
        _decoded = B64Utils.decodeJWT(token);
        const { header, payload, signature, raw } = _decoded;

        // Colored token display
        $('b64-jwt-colored').style.display = '';
        $('b64-jwt-colored').innerHTML =
          `<span class="b64-jwt-part-header">${raw[0]}</span>` +
          `<span class="b64-jwt-dot">.</span>` +
          `<span class="b64-jwt-part-payload">${raw[1]}</span>` +
          `<span class="b64-jwt-dot">.</span>` +
          `<span class="b64-jwt-part-sig">${raw[2]}</span>`;

        // Status
        const now = Date.now();
        const exp = payload.exp;
        const statusEl = $('b64-jwt-status-row');
        if (exp) {
          const expired = exp * 1000 < now;
          const diff = Math.abs(exp * 1000 - now);
          const mins = Math.floor(diff / 60000);
          const hrs  = Math.floor(mins / 60);
          const timeStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
          statusEl.innerHTML = expired
            ? `<div class="b64-jwt-badge b64-jwt-badge-expired">✗ EXPIRED ${timeStr} ago</div>`
            : `<div class="b64-jwt-badge b64-jwt-badge-valid">✓ Valid · expires in ${timeStr}</div>`;
        } else {
          statusEl.innerHTML = `<div class="b64-jwt-badge b64-jwt-badge-noexp">No expiry claim</div>`;
        }

        // Sections
        renderClaims(header, 'b64-jwt-header-claims');
        renderClaims(payload, 'b64-jwt-payload-claims');
        $('b64-jwt-header-raw').textContent  = JSON.stringify(header, null, 2);
        $('b64-jwt-payload-raw').textContent = JSON.stringify(payload, null, 2);
        $('b64-jwt-sig').textContent = signature;

        $('b64-jwt-result').style.display = '';
        setStatus('✓ JWT decoded', true);
      } catch(e) {
        $('b64-jwt-result').style.display = 'none';
        $('b64-jwt-colored').style.display = 'none';
        setStatus('✗ ' + e.message, false);
      }
    }

    $('b64-jwt-decode').addEventListener('click', decode);
    $('b64-jwt-in').addEventListener('input', () => {
      const v = $('b64-jwt-in').value.trim();
      if (v.split('.').length === 3) decode();
    });
    $('b64-jwt-clear').addEventListener('click', () => {
      $('b64-jwt-in').value='';
      $('b64-jwt-result').style.display='none';
      $('b64-jwt-colored').style.display='none';
      _decoded=null;
    });

    $('b64-jwt-copy-header').addEventListener('click', () => {
      if (_decoded) { navigator.clipboard.writeText(JSON.stringify(_decoded.header, null, 2)); setStatus('Header copied!', true); }
    });
    $('b64-jwt-copy-payload').addEventListener('click', () => {
      if (_decoded) { navigator.clipboard.writeText(JSON.stringify(_decoded.payload, null, 2)); setStatus('Payload copied!', true); }
    });
    $('b64-jwt-copy-all').addEventListener('click', () => {
      if (_decoded) {
        navigator.clipboard.writeText(JSON.stringify({ header: _decoded.header, payload: _decoded.payload }, null, 2));
        setStatus('Copied!', true);
      }
    });
  },
};
