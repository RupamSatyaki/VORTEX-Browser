/**
 * browser/tabs/ui/tabRenderer.js
 * Tab bar HTML rendering — builds tab elements + new tab button + window controls.
 */

const TabRenderer = (() => {

  function globeIcon() {
    return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  }

  function buildFaviconEl(tab) {
    const iconEl = document.createElement('div');
    iconEl.className = 'tab-icon';

    if (tab._sleeping) {
      iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a7a8a" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    } else if (tab.favicon) {
      const img = document.createElement('img');
      img.width = 14; img.height = 14;
      img.style.borderRadius = '2px';
      img.src = tab.favicon;
      img.onerror = async () => {
        img.remove();
        if (typeof FaviconCache !== 'undefined' && tab.url) {
          const cached = await FaviconCache.getFavicon(tab.url).catch(() => null);
          if (cached && cached !== tab.favicon) {
            const img2 = document.createElement('img');
            img2.width = 14; img2.height = 14;
            img2.style.borderRadius = '2px';
            img2.src = cached;
            img2.onerror = () => { img2.remove(); iconEl.innerHTML = globeIcon(); };
            iconEl.appendChild(img2);
            return;
          }
        }
        iconEl.innerHTML = globeIcon();
      };
      iconEl.appendChild(img);
    } else {
      iconEl.innerHTML = globeIcon();
    }
    return iconEl;
  }

  function buildTabEl(tab, activeTabId, callbacks) {
    const el = document.createElement('div');
    el.className = 'tab'
      + (tab.id === activeTabId ? ' active' : '')
      + (tab._sleeping  ? ' tab-sleeping'  : '')
      + (tab.incognito  ? ' tab-incognito' : '');
    el.dataset.id = tab.id;

    const iconEl  = buildFaviconEl(tab);
    const titleEl = document.createElement('span');
    titleEl.className   = 'tab-title';
    titleEl.textContent = tab.title;
    if (tab._sleeping) titleEl.title = 'Sleeping — click to wake';

    el.appendChild(iconEl);
    el.appendChild(titleEl);

    // Audio/mute icon
    if (tab._audible || tab._muted) {
      const audioBtn = document.createElement('div');
      audioBtn.className = 'tab-audio' + (tab._muted ? ' tab-muted' : '');
      audioBtn.title     = tab._muted ? 'Unmute tab' : 'Mute tab';
      audioBtn.innerHTML = tab._muted
        ? `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
        : `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      audioBtn.addEventListener('click', (e) => { e.stopPropagation(); callbacks.onMute(tab.id); });
      el.appendChild(audioBtn);
    }

    // Close button
    const closeBtn = document.createElement('div');
    closeBtn.className = 'tab-close';
    closeBtn.title     = 'Close tab';
    closeBtn.innerHTML = `<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>`;
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); callbacks.onClose(tab.id); });
    el.appendChild(closeBtn);

    // Hover preview
    el.addEventListener('mouseenter', () => TabPreview.show(el, tab.id, tab.title));
    el.addEventListener('mouseleave', () => TabPreview.hide());

    // Context menu
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation();
      callbacks.onContextMenu(e.clientX, e.clientY, tab.id);
    });

    return el;
  }

  function buildNewTabBtn() {
    const btn = document.createElement('button');
    btn.className = 'tab-add';
    btn.title     = 'New Tab';
    btn.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
    btn.addEventListener('click', () => QuickLaunch.open());
    return btn;
  }

  function buildWindowControls() {
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    controls.innerHTML = `
      <button class="wc-btn wc-minimize" title="Minimize">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="wc-btn wc-maximize" title="Maximize">
        <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
      </button>
      <button class="wc-btn wc-close" title="Close">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>`;
    controls.querySelector('.wc-minimize').addEventListener('click', () => window.vortexAPI.send('window:minimize'));
    controls.querySelector('.wc-maximize').addEventListener('click', () => window.vortexAPI.send('window:maximize'));
    controls.querySelector('.wc-close').addEventListener('click',    () => window.vortexAPI.send('window:close'));
    return controls;
  }

  return { buildTabEl, buildNewTabBtn, buildWindowControls, globeIcon };

})();
