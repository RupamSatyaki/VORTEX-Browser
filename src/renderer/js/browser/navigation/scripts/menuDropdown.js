/**
 * browser/navigation/scripts/menuDropdown.js
 * Nav dropdown menu — build, toggle, close, zoom sync, coming soon toast.
 */

const NavMenuDropdown = (() => {

  function build() {
    if (document.getElementById('nav-dropdown')) return;
    const menu = document.createElement('div');
    menu.id = 'nav-dropdown';
    menu.innerHTML = NavMenuHTML.render();
    document.body.appendChild(menu);

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      close();
      switch (item.dataset.action) {
        case 'new-tab':          QuickLaunch.open(); break;
        case 'new-window':       window.vortexAPI.send('window:new'); break;
        case 'new-incognito':    _showComingSoon('Incognito Mode'); break;
        case 'history':          Panel.open('history'); break;
        case 'downloads':        Panel.open('downloads'); break;
        case 'bookmarks':        Panel.open('bookmarks'); break;
        case 'find':             WebView.findInPage(); break;
        case 'screenshot':       Screenshot.capture(false); break;
        case 'screenshot-full':  Screenshot.capture(true); break;
        case 'print':            WebView.print(); break;
        case 'save-page':        WebView.savePage(); break;
        case 'devtools':         WebView.openDevTools(); break;
        case 'reload-hard':      WebView.hardReload(); break;
        case 'settings':         Panel.open('settings'); break;
      }
    });

    document.getElementById('nd-zoom-out').addEventListener('click', (e) => { e.stopPropagation(); WebView.zoomOut(); _syncZoom(); });
    document.getElementById('nd-zoom-in').addEventListener('click',  (e) => { e.stopPropagation(); WebView.zoomIn();  _syncZoom(); });
    document.getElementById('nd-zoom-pct').addEventListener('click', (e) => { e.stopPropagation(); WebView.zoomReset(); _syncZoom(); });
    document.getElementById('nd-zoom-fs').addEventListener('click',  (e) => { e.stopPropagation(); close(); window.vortexAPI.send('window:fullscreen'); });
  }

  function toggle() {
    build();
    const menu = document.getElementById('nav-dropdown');
    const btn  = document.getElementById('nav-menu');
    if (menu.classList.contains('visible')) { close(); return; }
    const rect = btn.getBoundingClientRect();
    menu.style.top   = (rect.bottom + 6) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.classList.add('visible');
    _syncZoom();
    setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
  }

  function close() {
    document.getElementById('nav-dropdown')?.classList.remove('visible');
  }

  function _syncZoom() {
    const pct = document.getElementById('nd-zoom-pct');
    const bar = document.getElementById('zoom-pct');
    if (pct && bar) pct.textContent = bar.textContent;
  }

  function _showComingSoon(feature) {
    const existing = document.getElementById('coming-soon-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'coming-soon-toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a855f7" stroke-width="2" style="flex-shrink:0">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span><strong>${feature}</strong> — Coming Soon</span>`;
    toast.style.cssText = `position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#1a0a2e;border:1px solid #a855f7;border-radius:10px;padding:10px 18px;display:flex;align-items:center;gap:10px;color:#d8b4fe;font-size:13px;z-index:99999;box-shadow:0 4px 20px rgba(168,85,247,0.3);animation:toastIn 0.2s ease;`;
    if (!document.getElementById('coming-soon-style')) {
      const s = document.createElement('style');
      s.id = 'coming-soon-style';
      s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
  }

  return { build, toggle, close };

})();
