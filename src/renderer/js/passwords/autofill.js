/**
 * passwords/autofill.js
 * Address bar key icon + autofill + save password popup + form submit detection
 */

const PasswordAutofill = (() => {

  let _currentDomain = '';
  let _autoFillTimer = null;
  let _lastSavePromptUrl = ''; // prevent duplicate save prompts

  // ── CSS inject once ───────────────────────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById('pm-banner-style')) return;
    const s = document.createElement('style');
    s.id = 'pm-banner-style';
    s.textContent = `
      @keyframes pmBannerIn {
        from { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.96); }
        to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
      }
      @keyframes pmBannerOut {
        from { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        to   { opacity:0; transform:translateX(-50%) translateY(-8px) scale(0.96); }
      }
      .pm-banner-btn {
        cursor:pointer; border:none; border-radius:7px;
        font-size:11px; font-weight:600; padding:5px 12px;
        transition:all 0.12s;
      }
      .pm-banner-btn:hover { filter:brightness(1.15); }
    `;
    document.head.appendChild(s);
  }

  // ── Inject key icon into address bar ─────────────────────────────────────
  function _injectIcon() {
    const icons = document.querySelector('.address-bar-icons');
    if (!icons || document.getElementById('btn-autofill')) return;
    const btn = document.createElement('div');
    btn.className = 'address-icon';
    btn.id = 'btn-autofill';
    btn.title = 'Autofill Password';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>
      <span class="pm-autofill-badge" id="pm-af-badge" style="display:none;"></span>`;
    const bookmark = document.getElementById('btn-bookmark');
    if (bookmark) icons.insertBefore(btn, bookmark);
    else icons.prepend(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); _toggleDropdown(); });
  }

  // ── Badge update ──────────────────────────────────────────────────────────
  function updateBadge(domain) {
    _currentDomain = domain || '';
    const badge = document.getElementById('pm-af-badge');
    const btn   = document.getElementById('btn-autofill');
    if (!badge || !btn) return;
    const matches = _getMatches(domain);
    badge.style.display = matches.length ? 'block' : 'none';
    btn.style.opacity   = matches.length ? '1' : '0.5';
  }

  function _getMatches(domain) {
    if (!domain) return [];
    try {
      if (typeof PasswordManager === 'undefined') return [];
      return PasswordManager.getMatchingEntries(domain) || [];
    } catch { return []; }
  }

  // ── Dropdown ──────────────────────────────────────────────────────────────
  function _buildDropdown() {
    if (document.getElementById('pm-autofill-dropdown')) return;
    const el = document.createElement('div');
    el.id = 'pm-autofill-dropdown';
    document.body.appendChild(el);
    document.addEventListener('click', e => {
      if (!e.target.closest('#pm-autofill-dropdown') && !e.target.closest('#btn-autofill'))
        el.classList.remove('visible');
    });
  }

  function _renderDropdown(matches, domain) {
    const dropdown = document.getElementById('pm-autofill-dropdown');
    if (!dropdown) return;
    if (!matches.length) {
      dropdown.innerHTML = `
        <div class="pm-af-header">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          No saved passwords for this site
        </div>
        <div style="padding:10px 14px;font-size:11px;color:#4a8080;">Settings → Password Manager to add.</div>`;
      return;
    }
    dropdown.innerHTML = `
      <div class="pm-af-header">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ${matches.length} password${matches.length > 1 ? 's' : ''} for <strong style="color:#c8e8e5;">${domain}</strong>
      </div>
      ${matches.map(e => `
        <div class="pm-af-item" data-id="${e.id}">
          <div class="pm-af-favicon">
            <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" onerror="this.style.display='none'" loading="lazy"/>
          </div>
          <div class="pm-af-info">
            <div class="pm-af-user">${e.username || e.title || 'Unknown'}</div>
            <div class="pm-af-site">${e.site || domain} · ${'•'.repeat(Math.min(8,(e.password||'').length))}</div>
          </div>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>
        </div>`).join('')}`;
    dropdown.querySelectorAll('.pm-af-item').forEach(item => {
      item.addEventListener('click', () => {
        const entry = matches.find(e => e.id === item.dataset.id);
        if (entry) _injectCredentials(entry.username, entry.password);
        dropdown.classList.remove('visible');
      });
    });
  }

  function _toggleDropdown() {
    _buildDropdown();
    const dropdown = document.getElementById('pm-autofill-dropdown');
    if (dropdown.classList.contains('visible')) { dropdown.classList.remove('visible'); return; }
    const matches = _getMatches(_currentDomain);
    _renderDropdown(matches, _currentDomain);
    const btn  = document.getElementById('btn-autofill');
    const rect = btn.getBoundingClientRect();
    dropdown.style.top  = (rect.bottom + 8) + 'px';
    let left = rect.left + rect.width / 2 - 130;
    left = Math.max(8, Math.min(left, window.innerWidth - 268));
    dropdown.style.left = left + 'px';
    dropdown.classList.add('visible');
  }

  // ── Inject credentials into webview ──────────────────────────────────────
  function _injectCredentials(username, password) {
    const activeWv = document.querySelector('webview.vortex-wv.active');
    if (!activeWv) return;
    const script = `
      (function() {
        var inputs = Array.from(document.querySelectorAll('input'));
        // Find best username field
        var u = document.querySelector('input[type="email"]') ||
          document.querySelector('input[autocomplete="username"]') ||
          document.querySelector('input[autocomplete="email"]') ||
          inputs.find(function(i){ return /user|email|login|phone/i.test(i.name+i.id+i.placeholder); }) ||
          inputs.find(function(i){ return i.type === 'text' && !i.hidden; });
        var p = document.querySelector('input[type="password"]');
        function fill(el, val) {
          if (!el || val === undefined || val === null) return;
          var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          desc.set.call(el, val);
          ['input','change','keyup'].forEach(function(ev){
            el.dispatchEvent(new Event(ev, { bubbles:true }));
          });
          el.style.outline = '2px solid #00c8b4';
          setTimeout(function(){ el.style.outline = ''; }, 1500);
        }
        fill(u, ${JSON.stringify(username || '')});
        fill(p, ${JSON.stringify(password || '')});
      })();`;
    activeWv.executeJavaScript(script).catch(() => {});
  }

  // ── Save password popup ───────────────────────────────────────────────────
  function showSavePrompt(domain, username, password) {
    _injectStyles();
    const existing = document.getElementById('pm-save-prompt');
    if (existing) existing.remove();

    // Check never-save list
    try {
      const blocked = JSON.parse(localStorage.getItem('vx_pw_save_never') || '[]');
      if (blocked.includes(domain)) return;
    } catch {}

    const el = document.createElement('div');
    el.id = 'pm-save-prompt';
    el.style.cssText = `
      position:fixed; top:76px; right:16px;
      z-index:99998; width:320px;
      background:var(--bg-panel,#0f2222);
      border:1px solid rgba(0,200,180,0.35);
      border-radius:14px; overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,200,180,0.1);
      animation:pmSlideRight 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    `;

    if (!document.getElementById('pm-slide-style')) {
      const s = document.createElement('style');
      s.id = 'pm-slide-style';
      s.textContent = `
        @keyframes pmSlideRight {
          from { opacity:0; transform:translateX(20px) scale(0.96); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes pmSlideRightOut {
          from { opacity:1; transform:translateX(0) scale(1); }
          to   { opacity:0; transform:translateX(20px) scale(0.96); }
        }
        #pm-save-prompt input:focus { border-color:var(--accent,#00c8b4) !important; outline:none; }
      `;
      document.head.appendChild(s);
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    el.innerHTML = `
      <!-- Top accent line -->
      <div style="height:3px;background:linear-gradient(90deg,var(--accent,#00c8b4),#36e8d4);"></div>

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 10px;background:var(--bg-deep,#0d1f1f);">
        <div style="position:relative;flex-shrink:0;">
          <div style="width:36px;height:36px;border-radius:10px;background:#162828;border:1px solid #1e3838;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <img src="${faviconUrl}" width="20" height="20" style="object-fit:contain;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
            <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--accent,#00c8b4);">${domain[0].toUpperCase()}</div>
          </div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:#c8e8e5;">Save Password?</div>
          <div style="font-size:11px;color:#4a8080;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${domain}</div>
        </div>
        <button id="pm-save-dismiss" style="background:none;border:none;color:#4a8080;cursor:pointer;width:24px;height:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;transition:all 0.12s;flex-shrink:0;"
          onmouseenter="this.style.background='rgba(200,60,60,0.12)';this.style.color='#c86060'"
          onmouseleave="this.style.background='none';this.style.color='#4a8080'">
          <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
        </button>
      </div>

      <!-- Fields -->
      <div style="padding:12px 14px 10px;">
        <div style="margin-bottom:10px;">
          <div style="font-size:10px;color:#4a8080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Username / Email
          </div>
          <input id="pm-save-user" type="text" value="${(username||'').replace(/"/g,'&quot;')}"
            style="width:100%;background:#0a1818;border:1px solid #2e4a4c;border-radius:8px;color:#c8e8e5;font-size:13px;padding:9px 12px;box-sizing:border-box;transition:border-color 0.15s;"/>
        </div>
        <div style="margin-bottom:4px;">
          <div style="font-size:10px;color:#4a8080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;display:flex;align-items:center;gap:5px;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Password
          </div>
          <div style="position:relative;">
            <input id="pm-save-pw" type="password" value="${(password||'').replace(/"/g,'&quot;')}"
              style="width:100%;background:#0a1818;border:1px solid #2e4a4c;border-radius:8px;color:#c8e8e5;font-size:13px;padding:9px 38px 9px 12px;box-sizing:border-box;transition:border-color 0.15s;font-family:monospace;letter-spacing:2px;"/>
            <button id="pm-save-eye" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#4a8080;cursor:pointer;padding:2px;display:flex;align-items:center;transition:color 0.12s;"
              onmouseenter="this.style.color='var(--accent,#00c8b4)'" onmouseleave="this.style.color='#4a8080'">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <!-- Strength bar -->
          <div id="pm-save-str-wrap" style="margin-top:5px;">
            <div style="height:3px;background:#1e3838;border-radius:2px;overflow:hidden;">
              <div id="pm-save-str-bar" style="height:100%;border-radius:2px;transition:all 0.3s;width:0%;"></div>
            </div>
            <div id="pm-save-str-label" style="font-size:10px;margin-top:2px;"></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex;gap:6px;padding:0 14px 14px;">
        <button id="pm-save-never"
          style="flex:1;background:transparent;border:1px solid #2e4a4c;border-radius:8px;color:#4a8080;font-size:11px;font-weight:600;padding:8px 6px;cursor:pointer;transition:all 0.12s;"
          onmouseenter="this.style.borderColor='#ef4444';this.style.color='#ef4444'"
          onmouseleave="this.style.borderColor='#2e4a4c';this.style.color='#4a8080'">
          Never
        </button>
        <button id="pm-save-skip"
          style="flex:1;background:transparent;border:1px solid #2e4a4c;border-radius:8px;color:#7aadad;font-size:11px;font-weight:600;padding:8px 6px;cursor:pointer;transition:all 0.12s;"
          onmouseenter="this.style.background='#162828'" onmouseleave="this.style.background='transparent'">
          Not now
        </button>
        <button id="pm-save-confirm"
          style="flex:2;background:var(--accent,#00c8b4);border:none;border-radius:8px;color:#001a18;font-size:12px;font-weight:700;padding:8px 10px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:5px;"
          onmouseenter="this.style.filter='brightness(1.1)'" onmouseleave="this.style.filter=''">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Save Password
        </button>
      </div>`;

    document.body.appendChild(el);

    // Strength meter
    const pwInp = el.querySelector('#pm-save-pw');
    function _updateStr() {
      if (typeof PasswordGenerator === 'undefined') return;
      const str = PasswordGenerator.strength(pwInp.value);
      const bar = el.querySelector('#pm-save-str-bar');
      const lbl = el.querySelector('#pm-save-str-label');
      if (bar) { bar.style.width = (str.pct||0) + '%'; bar.style.background = str.color; }
      if (lbl) { lbl.textContent = str.label; lbl.style.color = str.color; }
    }
    _updateStr();
    pwInp.addEventListener('input', _updateStr);

    // Eye toggle
    el.querySelector('#pm-save-eye').addEventListener('click', () => {
      pwInp.type = pwInp.type === 'password' ? 'text' : 'password';
      pwInp.style.letterSpacing = pwInp.type === 'text' ? 'normal' : '2px';
    });

    function _dismiss(animate) {
      if (animate) {
        el.style.animation = 'pmSlideRightOut 0.18s ease forwards';
        setTimeout(() => el.remove(), 200);
      } else { el.remove(); }
    }

    el.querySelector('#pm-save-dismiss').addEventListener('click', () => _dismiss(true));
    el.querySelector('#pm-save-skip').addEventListener('click', () => _dismiss(true));

    el.querySelector('#pm-save-never').addEventListener('click', () => {
      try {
        const blocked = JSON.parse(localStorage.getItem('vx_pw_save_never') || '[]');
        if (!blocked.includes(domain)) { blocked.push(domain); localStorage.setItem('vx_pw_save_never', JSON.stringify(blocked)); }
      } catch {}
      _dismiss(true);
    });

    el.querySelector('#pm-save-confirm').addEventListener('click', async () => {
      const user = el.querySelector('#pm-save-user').value.trim();
      const pw   = pwInp.value;
      if (!user && !pw) return;
      const btn = el.querySelector('#pm-save-confirm');
      btn.disabled = true; btn.textContent = 'Saving...';
      if (typeof PasswordManager !== 'undefined') {
        await PasswordManager.saveFromAutofill({ domain, username: user, password: pw });
      }
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
      setTimeout(() => _dismiss(true), 800);
    });

    // Auto-dismiss after 20s
    const autoTimer = setTimeout(() => _dismiss(true), 20000);
    el.addEventListener('mouseenter', () => clearTimeout(autoTimer), { once: true });
  }

  // ── Detect form submit in webview ─────────────────────────────────────────
  function _injectFormDetector(wv, domain) {
    const script = `
      (function() {
        if (window.__vxPwDetector) return;
        window.__vxPwDetector = true;
        function _extract() {
          var u = document.querySelector('input[type="email"]') ||
            document.querySelector('input[autocomplete="username"]') ||
            Array.from(document.querySelectorAll('input')).find(function(i){
              return /user|email|login|phone/i.test(i.name+i.id+i.placeholder) && i.type !== 'password';
            });
          var p = document.querySelector('input[type="password"]');
          return { username: u ? u.value : '', password: p ? p.value : '' };
        }
        document.addEventListener('submit', function(e) {
          var data = _extract();
          if (data.password) {
            window.postMessage({ __vxPwCapture: true, username: data.username, password: data.password }, '*');
          }
        }, true);
        // Also detect button clicks that look like submit
        document.addEventListener('click', function(e) {
          var btn = e.target.closest('button[type="submit"],input[type="submit"],[role="button"]');
          if (!btn) return;
          setTimeout(function() {
            var data = _extract();
            if (data.password) {
              window.postMessage({ __vxPwCapture: true, username: data.username, password: data.password }, '*');
            }
          }, 200);
        }, true);
      })();`;
    wv.executeJavaScript(script).catch(() => {});

    // Listen for captured credentials from webview
    wv.addEventListener('ipc-message', () => {}); // keep alive
    // Use console-message as bridge (webview postMessage → console.log trick won't work)
    // Instead inject a polling approach via did-navigate
  }

  // Called from webview.js on page load
  function onPageLoad(url) {
    clearTimeout(_autoFillTimer);
    if (!url || !url.startsWith('http')) return;

    let domain;
    try { domain = new URL(url).hostname.replace(/^www\./, ''); }
    catch { return; }

    _currentDomain = domain;
    updateBadge(domain);

    const matches = _getMatches(domain);

    _autoFillTimer = setTimeout(async () => {
      const activeWv = document.querySelector('webview.vortex-wv.active');
      if (!activeWv) return;

      // Scan for password field
      let hasPasswordField = false;
      try {
        hasPasswordField = await activeWv.executeJavaScript(
          '!!document.querySelector("input[type=\'password\']")'
        );
      } catch { return; }

      if (hasPasswordField) {
        // Inject form submit detector
        _injectFormDetector(activeWv, domain);

        if (matches.length === 1) {
          _showAutofillBanner(matches[0], domain);
          _injectCredentials(matches[0].username, matches[0].password);
        } else if (matches.length > 1) {
          _showAutofillBanner(null, domain, matches);
        }
      }
    }, 900);
  }

  // Called from webview.js on navigation (did-navigate) to detect post-login
  function onNavigate(url, prevUrl) {
    if (!url || !url.startsWith('http')) return;
    if (!prevUrl || !prevUrl.startsWith('http')) return;

    let domain;
    try { domain = new URL(url).hostname.replace(/^www\./, ''); }
    catch { return; }

    // If URL changed on same domain — possible login/signup success
    if (url === _lastSavePromptUrl) return;

    const prevDomain = (() => { try { return new URL(prevUrl).hostname.replace(/^www\./, ''); } catch { return ''; } })();
    if (domain !== prevDomain) return; // cross-domain nav — skip

    // Check if prev page had a password field (login/signup)
    const activeWv = document.querySelector('webview.vortex-wv.active');
    if (!activeWv) return;

    // Extract credentials that were filled
    activeWv.executeJavaScript(`
      (function() {
        var u = document.querySelector('input[type="email"]') ||
          document.querySelector('input[autocomplete="username"]') ||
          Array.from(document.querySelectorAll('input')).find(function(i){
            return /user|email|login|phone/i.test(i.name+i.id+i.placeholder) && i.type !== 'password';
          });
        var p = document.querySelector('input[type="password"]');
        return { username: u ? u.value : '', password: p ? p.value : '' };
      })();
    `).then(data => {
      if (!data || !data.password) return;
      // Check not in never-save list
      try {
        const blocked = JSON.parse(localStorage.getItem('vx_pw_save_never') || '[]');
        if (blocked.includes(domain)) return;
      } catch {}
      // Check not already saved
      const existing = _getMatches(domain).find(e => e.username === data.username);
      if (existing) return;

      _lastSavePromptUrl = url;
      showSavePrompt(domain, data.username, data.password);
    }).catch(() => {});
  }

  // ── Autofill banner ───────────────────────────────────────────────────────
  function _showAutofillBanner(entry, domain, multipleMatches) {
    _injectStyles();
    const existing = document.getElementById('pm-autofill-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'pm-autofill-banner';
    banner.style.cssText = `
      position:fixed; top:76px; left:50%; transform:translateX(-50%);
      z-index:99997; display:flex; align-items:center; gap:10px;
      background:var(--bg-panel,#0f2222);
      border:1px solid var(--accent,#00c8b4);
      border-radius:10px; padding:8px 14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      font-size:12px; color:var(--text-main,#c8e8e5);
      animation:pmBannerIn 0.2s ease;
      max-width:460px; width:max-content;
    `;

    if (entry && !multipleMatches) {
      banner.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2" style="flex-shrink:0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span style="flex:1;">Filled <strong style="color:var(--accent,#00c8b4);">${entry.username || domain}</strong></span>
        <button id="pm-banner-dismiss" style="background:transparent;border:none;color:#4a8080;cursor:pointer;font-size:15px;padding:2px;">✕</button>`;
    } else if (multipleMatches) {
      const btns = multipleMatches.map((m, i) =>
        `<button class="pm-banner-btn pm-banner-select" data-idx="${i}"
          style="background:rgba(0,200,180,0.1);color:var(--accent,#00c8b4);border:1px solid rgba(0,200,180,0.25);">
          ${m.username || m.title || domain}
        </button>`).join('');
      banner.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2" style="flex-shrink:0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span style="flex:1;">Choose for <strong style="color:var(--accent,#00c8b4);">${domain}</strong></span>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">${btns}</div>
        <button id="pm-banner-dismiss" style="background:transparent;border:none;color:#4a8080;cursor:pointer;font-size:15px;padding:2px;">✕</button>`;
    }

    document.body.appendChild(banner);
    const timer = setTimeout(() => banner.remove(), 8000);
    banner.querySelector('#pm-banner-dismiss')?.addEventListener('click', () => { clearTimeout(timer); banner.remove(); });
    banner.querySelectorAll('.pm-banner-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = multipleMatches[parseInt(btn.dataset.idx)];
        if (m) _injectCredentials(m.username, m.password);
        clearTimeout(timer); banner.remove();
      });
    });
  }

  function init() {
    _injectIcon();
    _injectStyles();
  }

  return { init, updateBadge, onPageLoad, onNavigate, showSavePrompt };
})();
