/**
 * core/ipc/permissionPrompt.js
 * Permission request prompt UI — shown when a site requests a permission.
 */

const PermissionPrompt = (() => {

  const PERM_CONFIG = {
    'media':              { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`, color:'#3b82f6', desc:'access your camera and microphone' },
    'notifications':      { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`, color:'#f59e0b', desc:'send you notifications' },
    'geolocation':        { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`, color:'#22c55e', desc:'access your location' },
    'camera':             { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`, color:'#3b82f6', desc:'access your camera' },
    'microphone':         { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`, color:'#06b6d4', desc:'access your microphone' },
    'clipboard-read':     { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`, color:'#8b5cf6', desc:'read your clipboard' },
    'clipboard-write':    { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M12 9v6"/></svg>`, color:'#a78bfa', desc:'write to your clipboard' },
    'display-capture':    { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`, color:'#38bdf8', desc:'capture your screen' },
    'fullscreen':         { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`, color:'#64748b', desc:'go fullscreen' },
    'popup':              { icon:`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`, color:'#b45309', desc:'open popup windows' },
  };

  const DEFAULT_CFG = {
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    color: 'var(--accent,#00c8b4)',
    desc: 'use this feature',
  };

  function _injectStyles() {
    if (document.getElementById('perm-prompt-style')) return;
    const s = document.createElement('style');
    s.id = 'perm-prompt-style';
    s.textContent = `
      @keyframes permSlideDown { from{opacity:0;transform:translateX(-50%) translateY(-16px) scale(0.94)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
      @keyframes permSlideUp   { from{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} to{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.96)} }
      #perm-request-prompt { animation:permSlideDown 0.22s cubic-bezier(0.34,1.3,0.64,1) forwards; }
      #perm-request-prompt.dismissing { animation:permSlideUp 0.18s ease forwards; }
      #perm-request-prompt .perm-btn { flex:1;border:none;border-radius:9px;font-size:13px;font-weight:600;padding:10px 8px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px; }
      #perm-request-prompt .perm-btn:hover { filter:brightness(1.12);transform:translateY(-1px); }
      #perm-request-prompt .perm-btn-block { background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.28);color:#ef4444; }
      #perm-request-prompt .perm-btn-allow { background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.32);color:#22c55e; }
      #perm-request-prompt .perm-remember { display:flex;align-items:center;gap:7px;cursor:pointer;font-size:11px;color:var(--text-dim,#4a8080);user-select:none;padding:2px 0; }
      #perm-request-prompt .perm-remember input { cursor:pointer;accent-color:var(--accent,#00c8b4); }
      #perm-request-prompt .perm-timer-bar { height:2px;background:var(--bg-border,#2e4a4c);border-radius:0 0 14px 14px;overflow:hidden; }
      #perm-request-prompt .perm-timer-fill { height:100%;width:100%;background:var(--accent,#00c8b4);transition:width 30s linear;border-radius:0 0 14px 14px; }
    `;
    document.head.appendChild(s);
  }

  function show({ domain, permission, label, permIds }) {
    document.getElementById('perm-request-prompt')?.remove();
    _injectStyles();

    const cfg = PERM_CONFIG[permission] || { ...DEFAULT_CFG, desc: `use ${(label || permission).toLowerCase()}` };

    const el = document.createElement('div');
    el.id = 'perm-request-prompt';
    el.style.cssText = `position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:999999;width:360px;max-width:calc(100vw - 24px);background:var(--bg-panel,#0f2222);border:1px solid ${cfg.color}44;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.75),0 0 0 1px ${cfg.color}22;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;`;

    el.innerHTML = `
      <div style="height:3px;background:linear-gradient(90deg,${cfg.color}88,${cfg.color});"></div>
      <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 10px;border-bottom:1px solid var(--bg-border2,#1e3838);">
        <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" style="width:18px;height:18px;border-radius:4px;flex-shrink:0;object-fit:contain;" onerror="this.style.display='none'"/>
        <div style="flex:1;min-width:0;">
          <div style="font-size:11px;font-weight:700;color:var(--text-main,#c8e8e5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${domain}</div>
          <div style="font-size:10px;color:var(--text-dim,#4a8080);margin-top:1px;">Permission Request</div>
        </div>
        <button id="perm-dismiss-x" style="background:none;border:none;color:var(--text-dim,#4a8080);cursor:pointer;padding:3px;border-radius:5px;display:flex;align-items:center;font-size:15px;line-height:1;transition:color 0.12s;" title="Dismiss">✕</button>
      </div>
      <div style="padding:16px 16px 12px;display:flex;align-items:flex-start;gap:14px;">
        <div style="width:48px;height:48px;border-radius:14px;flex-shrink:0;background:${cfg.color}18;border:1px solid ${cfg.color}30;display:flex;align-items:center;justify-content:center;color:${cfg.color};">${cfg.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:700;color:var(--text-main,#c8e8e5);line-height:1.3;">${label || permission}</div>
          <div style="font-size:12px;color:var(--text-dim,#4a8080);margin-top:5px;line-height:1.5;"><span style="color:${cfg.color};font-weight:600;">${domain}</span> wants to ${cfg.desc}.</div>
        </div>
      </div>
      <div style="padding:0 16px 12px;">
        <label class="perm-remember"><input type="checkbox" id="perm-remember-chk" checked/> Remember my decision for this site</label>
      </div>
      <div style="display:flex;gap:8px;padding:0 14px 14px;">
        <button class="perm-btn perm-btn-block" id="perm-btn-block">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Block
        </button>
        <button class="perm-btn perm-btn-allow" id="perm-btn-allow">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Allow
        </button>
      </div>
      <div class="perm-timer-bar"><div class="perm-timer-fill" id="perm-timer-fill"></div></div>`;

    document.body.appendChild(el);
    requestAnimationFrame(() => { const f = el.querySelector('#perm-timer-fill'); if (f) f.style.width = '0%'; });

    let _responded = false;
    function respond(granted) {
      if (_responded) return;
      _responded = true;
      const remember = el.querySelector('#perm-remember-chk')?.checked !== false;
      el.classList.add('dismissing');
      setTimeout(() => el.parentNode && el.remove(), 200);
      IPC.send(`permission:response:${domain}:${permission}`, granted);
      if (remember && typeof PermissionManager !== 'undefined' && permIds?.length) {
        permIds.forEach(id => PermissionManager.setPermission(domain, id, granted ? 'granted' : 'denied'));
        if (typeof PermissionPopup !== 'undefined') PermissionPopup.updateBadge(domain);
      }
    }

    el.querySelector('#perm-btn-allow').addEventListener('click', () => respond(true));
    el.querySelector('#perm-btn-block').addEventListener('click', () => respond(false));
    el.querySelector('#perm-dismiss-x').addEventListener('click', () => respond(false));
    const dx = el.querySelector('#perm-dismiss-x');
    dx.addEventListener('mouseenter', () => dx.style.color = '#c86060');
    dx.addEventListener('mouseleave', () => dx.style.color = 'var(--text-dim,#4a8080)');

    const autoTimer = setTimeout(() => respond(false), 30000);
    el.addEventListener('mouseenter', () => clearTimeout(autoTimer), { once: true });
  }

  return { show };

})();
