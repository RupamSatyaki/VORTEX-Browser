/**
 * core/app/updateBadge.js
 * Update badge — check GitHub releases, show badge in tab bar.
 */

const AppUpdateBadge = (() => {

  function _cmp(a, b) {
    const pa = String(a).replace(/^v/, '').split('.').map(Number);
    const pb = String(b).replace(/^v/, '').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i]||0) > (pb[i]||0)) return  1;
      if ((pa[i]||0) < (pb[i]||0)) return -1;
    }
    return 0;
  }

  async function check() {
    try {
      const currentVer = await IPC.invoke('app:version');
      if (!currentVer) return;
      const releases = await IPC.invoke('updater:fetchAllReleases');
      if (!releases || releases.error || !releases.length) return;
      const latest = releases[0];
      if (!latest?.tag) return;
      if (_cmp(currentVer, latest.tag) < 0) _show(latest.tag);
    } catch {}
  }

  function _show(tag) {
    if (document.getElementById('update-badge-btn')) return;

    if (!document.getElementById('update-badge-style')) {
      const s = document.createElement('style');
      s.id = 'update-badge-style';
      s.textContent = `
        @keyframes updatePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.3)} 50%{box-shadow:0 0 0 4px rgba(34,197,94,0)} }
        #update-badge-btn:hover { background:rgba(34,197,94,0.22)!important; border-color:rgba(34,197,94,0.5)!important; transform:translateY(-1px); }
      `;
      document.head.appendChild(s);
    }

    const btn = document.createElement('button');
    btn.id = 'update-badge-btn';
    btn.title = `Update available: ${tag} — Click to update`;
    btn.style.cssText = `display:flex;align-items:center;gap:5px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:6px;color:#22c55e;font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer;transition:all 0.15s;white-space:nowrap;flex-shrink:0;-webkit-app-region:no-drag;animation:updatePulse 2s ease-in-out infinite;margin-right:6px;`;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      ${tag}`;

    const controls = document.querySelector('.window-controls');
    if (controls) controls.insertBefore(btn, controls.firstChild);

    btn.addEventListener('click', () => {
      Panel.open('settings');
      let attempts = 0;
      const _nav = () => {
        const frame = document.getElementById('panel-frame');
        frame?.contentWindow?.postMessage({ __vortexIPC: true, channel: 'settings:navigate', data: 'updates' }, '*');
        if (++attempts < 5) setTimeout(_nav, 300);
      };
      setTimeout(_nav, 300);
    });
  }

  return { check };

})();
