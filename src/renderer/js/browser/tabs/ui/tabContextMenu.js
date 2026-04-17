/**
 * browser/tabs/ui/tabContextMenu.js
 * Tab right-click context menu — show, remove.
 */

const TabContextMenu = (() => {

  let _menu = null;

  function show(x, y, tab, callbacks) {
    remove();

    const menu = document.createElement('div');
    menu.id = 'tab-ctx-menu';
    menu.style.cssText = `position:fixed;z-index:99999;background:#122222;border:1px solid #1e3838;border-radius:10px;padding:4px;min-width:180px;box-shadow:0 8px 28px rgba(0,0,0,0.5);`;

    const style = document.createElement('style');
    style.textContent = `.tctx-item{display:flex;align-items:center;gap:8px;padding:7px 12px;font-size:12px;color:#c8e8e5;cursor:pointer;border-radius:6px;transition:background 0.1s;}.tctx-item:hover{background:#1a3838;}.tctx-danger{color:#c86060;}.tctx-danger:hover{background:rgba(200,60,60,0.12);}`;
    menu.appendChild(style);

    menu.innerHTML += `
      <div class="tctx-item" data-action="mute">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          ${tab._muted
            ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
            : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>'}
        </svg>
        ${tab._muted ? 'Unmute Tab' : 'Mute Tab'}
      </div>
      <div class="tctx-item" data-action="reload">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>
        Reload Tab
      </div>
      <div class="tctx-item" data-action="duplicate">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Duplicate Tab
      </div>
      <div style="height:1px;background:#1e3838;margin:4px 0;"></div>
      <div class="tctx-item tctx-danger" data-action="close">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Close Tab
      </div>`;

    menu.style.left = Math.min(x, window.innerWidth  - 200) + 'px';
    menu.style.top  = Math.min(y, window.innerHeight - 160) + 'px';
    document.body.appendChild(menu);
    _menu = menu;

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      remove();
      switch (item.dataset.action) {
        case 'mute':      callbacks.onMute(tab.id); break;
        case 'reload':    callbacks.onReload(tab.id); break;
        case 'duplicate': callbacks.onDuplicate(tab.url); break;
        case 'close':     callbacks.onClose(tab.id); break;
      }
    });

    menu.addEventListener('mouseenter', () => clearTimeout(menu._autoClose));
    menu.addEventListener('mouseleave', () => { menu._autoClose = setTimeout(remove, 1500); });
    menu._autoClose = setTimeout(remove, 1500);
    setTimeout(() => document.addEventListener('click', remove, { once: true }), 0);
  }

  function remove() {
    if (_menu) { clearTimeout(_menu._autoClose); _menu.remove(); _menu = null; }
  }

  return { show, remove };

})();
