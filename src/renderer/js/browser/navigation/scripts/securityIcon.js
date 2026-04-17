/**
 * browser/navigation/scripts/securityIcon.js
 * Security icon update, local address detection, security popup.
 */

const NavSecurityIcon = (() => {

  const LOCK_ICON = `<svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2" style="cursor:pointer;flex-shrink:0;transition:opacity 0.15s" title="Secure connection"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
  const UNLOCK_ICON = `<svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Not secure"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  const LOCAL_ICON  = `<svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="2" style="cursor:pointer;flex-shrink:0" title="Local network"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  const VORTEX_ICON = `<svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2" style="flex-shrink:0" title="Vortex internal page"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const SEARCH_ICON = `<svg id="url-security-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;

  function update(url) {
    const wrap = document.getElementById('address-bar-wrap');
    if (!wrap) return;
    const old = document.getElementById('url-security-icon');
    if (!old) return;

    let icon, borderColor = '';
    if (!url || url === '' || url.startsWith('about:')) icon = SEARCH_ICON;
    else if (url.startsWith('vortex://'))              icon = VORTEX_ICON;
    else if (_isLocalAddress(url))                     icon = LOCAL_ICON;
    else if (url.startsWith('https://'))               icon = LOCK_ICON;
    else if (url.startsWith('http://'))              { icon = UNLOCK_ICON; borderColor = 'rgba(245,158,11,0.4)'; }
    else                                               icon = SEARCH_ICON;

    const tmp = document.createElement('div');
    tmp.innerHTML = icon;
    const newEl = tmp.firstElementChild;
    newEl.addEventListener('click', (e) => { e.stopPropagation(); _showPopup(url, newEl); });
    old.replaceWith(newEl);

    if (borderColor) { wrap.style.setProperty('--http-border', borderColor); wrap.classList.add('http-warning'); }
    else             { wrap.classList.remove('http-warning'); }
  }

  function _isLocalAddress(url) {
    try {
      const host = new URL(url).hostname;
      return /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0)/.test(host)
          || /\.(local|lan|internal|home|corp|intranet|localdomain)$/.test(host)
          || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    } catch { return false; }
  }

  function _showPopup(url, anchor) {
    const existing = document.getElementById('url-security-popup');
    if (existing) { existing.remove(); return; }

    let type = 'search';
    if (url.startsWith('vortex://'))     type = 'vortex';
    else if (_isLocalAddress(url))       type = 'local';
    else if (url.startsWith('https://')) type = 'secure';
    else if (url.startsWith('http://'))  type = 'insecure';

    const CONFIGS = {
      secure:   { icon:'🔒', color:'#22c55e',              title:'Connection is secure',     desc:'Your connection to this site is encrypted and authenticated.' },
      insecure: { icon:'⚠️', color:'#f59e0b',              title:'Connection is not secure', desc:'Passwords and data you enter may be visible to others on the network.' },
      local:    { icon:'🏠', color:'#3b82f6',              title:'Local network',            desc:'This is a local or private network address.' },
      vortex:   { icon:'🛡️', color:'var(--accent,#00c8b4)',title:'Vortex page',              desc:'This is a built-in Vortex browser page.' },
      search:   { icon:'🔍', color:'#4a8080',              title:'Search',                   desc:'Enter a URL or search term.' },
    };
    const cfg = CONFIGS[type];
    let domain = ''; try { domain = new URL(url).hostname; } catch {}

    const popup = document.createElement('div');
    popup.id = 'url-security-popup';
    popup.style.cssText = `position:fixed;z-index:99999;background:var(--bg-panel,#0f2222);border:1px solid var(--bg-border,#2e4a4c);border-radius:10px;width:280px;padding:14px 16px;box-shadow:0 12px 40px rgba(0,0,0,0.6);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;animation:secPopIn 0.15s ease;`;

    if (!document.getElementById('sec-pop-style')) {
      const s = document.createElement('style');
      s.id = 'sec-pop-style';
      s.textContent = `@keyframes secPopIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`;
      document.head.appendChild(s);
    }

    popup.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:18px;">${cfg.icon}</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:${cfg.color};">${cfg.title}</div>
          ${domain ? `<div style="font-size:11px;color:#4a8080;margin-top:1px;">${domain}</div>` : ''}
        </div>
      </div>
      <div style="font-size:12px;color:#7aadad;line-height:1.6;margin-bottom:${type==='insecure'?'12px':'0'};">${cfg.desc}</div>
      ${type === 'insecure' ? `<button id="sec-try-https" style="width:100%;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:7px;color:#f59e0b;font-size:12px;font-weight:600;padding:7px;cursor:pointer;">Try HTTPS instead →</button>` : ''}`;

    document.body.appendChild(popup);
    const rect = anchor.getBoundingClientRect();
    popup.style.top  = (rect.bottom + 8) + 'px';
    popup.style.left = Math.max(8, rect.left - 10) + 'px';
    popup.querySelector('#sec-try-https')?.addEventListener('click', () => {
      popup.remove();
      WebView.loadURL(url.replace(/^http:\/\//, 'https://'));
    });
    setTimeout(() => document.addEventListener('click', () => popup.remove(), { once: true }), 0);
  }

  return { update, SEARCH_ICON };

})();
