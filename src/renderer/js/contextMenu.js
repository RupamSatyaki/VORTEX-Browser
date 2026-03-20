// Context Menu — right click handler for webview
const ContextMenu = (() => {
  let menuEl = null;
  let currentWv = null;
  let _autoHideTimer = null;

  const AUTO_HIDE_MS = 1500; // hide after 3s of no interaction

  function _resetAutoHide() {
    clearTimeout(_autoHideTimer);
    _autoHideTimer = setTimeout(hide, AUTO_HIDE_MS);
  }

  function init() {
    menuEl = document.createElement('div');
    menuEl.id = 'ctx-menu';
    document.body.appendChild(menuEl);

    // Hide on outside click
    document.addEventListener('mousedown', (e) => {
      if (!menuEl.contains(e.target)) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
    // Hide on scroll or window blur
    window.addEventListener('scroll', hide, true);
    window.addEventListener('blur', hide);
  }

  function hide() {
    clearTimeout(_autoHideTimer);
    menuEl.classList.remove('visible');
  }

  function show(x, y, params, wv) {
    currentWv = wv;
    const items = buildItems(params, wv);
    if (!items.length) return;

    menuEl.innerHTML = items.map(item => {
      if (item.type === 'separator') return `<div class="ctx-sep"></div>`;
      return `<div class="ctx-item ${item.disabled ? 'disabled' : ''}" data-action="${item.action}">
        <span class="ctx-icon">${item.icon || ''}</span>
        <span class="ctx-label">${item.label}</span>
        ${item.shortcut ? `<span class="ctx-shortcut">${item.shortcut}</span>` : ''}
      </div>`;
    }).join('');

    // Position — keep inside viewport
    menuEl.style.left = '0px';
    menuEl.style.top  = '0px';
    menuEl.classList.add('visible');

    const mw = menuEl.offsetWidth;
    const mh = menuEl.offsetHeight;
    menuEl.style.left = Math.min(x, window.innerWidth  - mw - 8) + 'px';
    menuEl.style.top  = Math.min(y, window.innerHeight - mh - 8) + 'px';

    // Pause auto-hide while hovering, resume on leave
    menuEl.addEventListener('mouseenter', () => clearTimeout(_autoHideTimer));
    menuEl.addEventListener('mouseleave', _resetAutoHide);

    // Start auto-hide countdown
    _resetAutoHide();

    // Bind actions
    menuEl.querySelectorAll('.ctx-item:not(.disabled)').forEach(el => {
      el.addEventListener('click', () => {
        handleAction(el.dataset.action, params, wv);
        hide();
      });
    });
  }

  function buildItems(p, wv) {
    const items = [];
    const hasLink  = p.linkURL && p.linkURL.length > 0;
    const hasImg   = p.mediaType === 'image';
    const hasVideo = p.mediaType === 'video';
    const hasSel   = p.selectionText && p.selectionText.trim().length > 0;
    const hasInput = p.isEditable;

    // ── Link items ──
    if (hasLink) {
      items.push({ action: 'open-link',     label: 'Open in New Tab',      icon: tabIcon() });
      items.push({ action: 'open-link-bg',  label: 'Open in Background',   icon: tabBgIcon() });
      items.push({ action: 'copy-link',     label: 'Copy Link Address',    icon: copyIcon() });
      items.push({ type: 'separator' });
    }

    // ── Image items ──
    if (hasImg) {
      items.push({ action: 'open-img',   label: 'Open Image in New Tab', icon: imgIcon() });
      items.push({ action: 'copy-img',   label: 'Copy Image',            icon: copyIcon() });
      items.push({ action: 'save-img',   label: 'Save Image As...',      icon: saveIcon() });
      items.push({ type: 'separator' });
    }

    // ── Video items ──
    if (hasVideo) {
      items.push({ action: 'open-video', label: 'Open Video in New Tab', icon: videoIcon() });
      items.push({ action: 'copy-video', label: 'Copy Video URL',        icon: copyIcon() });
      items.push({ type: 'separator' });
    }

    // ── Selection items ──
    if (hasSel) {
      items.push({ action: 'copy-sel',    label: 'Copy',                  icon: copyIcon(),   shortcut: 'Ctrl+C' });
      items.push({ action: 'search-sel',  label: `Search "${p.selectionText.slice(0,20)}${p.selectionText.length>20?'…':''}"`, icon: searchIcon() });
      items.push({ type: 'separator' });
    }

    // ── Input items ──
    if (hasInput) {
      items.push({ action: 'cut',   label: 'Cut',   icon: cutIcon(),   shortcut: 'Ctrl+X' });
      items.push({ action: 'copy',  label: 'Copy',  icon: copyIcon(),  shortcut: 'Ctrl+C' });
      items.push({ action: 'paste', label: 'Paste', icon: pasteIcon(), shortcut: 'Ctrl+V' });
      items.push({ type: 'separator' });
    }

    // ── Page items (always) ──
    if (!hasLink && !hasImg && !hasVideo && !hasSel && !hasInput) {
      items.push({ action: 'back',    label: 'Back',    icon: backIcon(),    shortcut: 'Alt+←', disabled: !wv.canGoBack() });
      items.push({ action: 'forward', label: 'Forward', icon: fwdIcon(),     shortcut: 'Alt+→', disabled: !wv.canGoForward() });
      items.push({ action: 'reload',  label: 'Reload',  icon: reloadIcon(),  shortcut: 'Ctrl+R' });
      items.push({ type: 'separator' });
      items.push({ action: 'save-page',  label: 'Save Page As...',  icon: saveIcon() });
      items.push({ action: 'print',      label: 'Print...',         icon: printIcon(), shortcut: 'Ctrl+P' });
      items.push({ action: 'view-src',   label: 'View Page Source', icon: srcIcon(),   shortcut: 'Ctrl+U' });
      items.push({ type: 'separator' });
    }

    // ── Always at bottom ──
    items.push({ action: 'inspect', label: 'Inspect Element', icon: inspectIcon(), shortcut: 'Ctrl+Shift+I' });

    return items;
  }

  function handleAction(action, p, wv) {
    switch (action) {
      case 'open-link':     Tabs.createTab(p.linkURL); break;
      case 'open-link-bg':  Tabs.createTabBackground(p.linkURL); break;
      case 'copy-link':     navigator.clipboard.writeText(p.linkURL); break;
      case 'open-img':      Tabs.createTab(p.srcURL); break;
      case 'copy-img':      wv.copyImageAt(p.x, p.y); break;
      case 'save-img':      wv.downloadURL(p.srcURL); break;
      case 'open-video':    Tabs.createTab(p.srcURL); break;
      case 'copy-video':    navigator.clipboard.writeText(p.srcURL); break;
      case 'copy-sel':
      case 'copy':          wv.copy(); break;
      case 'cut':           wv.cut(); break;
      case 'paste':         wv.paste(); break;
      case 'search-sel':
        Tabs.createTab(`https://www.google.com/search?q=${encodeURIComponent(p.selectionText)}`);
        break;
      case 'back':          wv.goBack(); break;
      case 'forward':       wv.goForward(); break;
      case 'reload':        wv.reload(); break;
      case 'save-page':     wv.downloadURL(wv.getURL()); break;
      case 'print':         wv.print(); break;
      case 'view-src':      Tabs.createTab('view-source:' + wv.getURL()); break;
      case 'inspect':       wv.openDevTools(); break;
    }
  }

  // ── SVG Icons ──
  const s = (d) => `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">${d}</svg>`;
  const tabIcon     = () => s('<rect x="2" y="4" width="12" height="9" rx="1"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>');
  const tabBgIcon   = () => s('<rect x="4" y="5" width="10" height="8" rx="1"/><rect x="2" y="3" width="10" height="8" rx="1" stroke-dasharray="2 1"/>');
  const copyIcon    = () => s('<rect x="5" y="5" width="8" height="9" rx="1"/><path d="M3 11V3h8"/>');
  const saveIcon    = () => s('<path d="M3 13h10V5l-3-3H3v11z"/><path d="M6 13V9h4v4"/><path d="M5 3v4h5V3"/>');
  const imgIcon     = () => s('<rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="6" cy="7" r="1.5"/><path d="M2 11l3-3 3 3 2-2 4 4"/>');
  const videoIcon   = () => s('<rect x="2" y="4" width="12" height="8" rx="1"/><polygon points="7,6 11,8 7,10" fill="currentColor" stroke="none"/>');
  const searchIcon  = () => s('<circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/>');
  const cutIcon     = () => s('<circle cx="5" cy="5" r="2"/><circle cx="5" cy="11" r="2"/><path d="M14 3L5 7l9 6"/>');
  const pasteIcon   = () => s('<path d="M5 3h6v2H5z"/><rect x="3" y="4" width="10" height="10" rx="1"/><path d="M6 8h4M6 11h4"/>');
  const backIcon    = () => s('<polyline points="10 4 6 8 10 12"/>');
  const fwdIcon     = () => s('<polyline points="6 4 10 8 6 12"/>');
  const reloadIcon  = () => s('<path d="M13 3v4h-4"/><path d="M13 7A6 6 0 1 1 7 2"/>');
  const printIcon   = () => s('<rect x="3" y="7" width="10" height="6" rx="1"/><path d="M5 7V3h6v4"/><path d="M5 11h6"/>');
  const srcIcon     = () => s('<polyline points="5 8 2 11 5 14"/><polyline points="11 8 14 11 11 14"/><line x1="8" y1="5" x2="8" y2="17"/>');
  const inspectIcon = () => s('<path d="M2 4h12v8H2z"/><path d="M6 12v2M10 12v2M4 14h8"/><circle cx="5" cy="7" r="1" fill="currentColor" stroke="none"/>');

  return { init, show, hide };
})();
