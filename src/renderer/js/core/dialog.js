/**
 * dialog.js — Chrome-style Alert / Confirm / Prompt UI
 */

const VortexDialog = (() => {

  let _pendingCallback = null;

  function _injectStyles() {
    if (document.getElementById('vx-dialog-style')) return;
    const s = document.createElement('style');
    s.id = 'vx-dialog-style';
    s.textContent = `
      #vx-dialog-overlay {
        position: fixed; inset: 0; z-index: 99999999;
        display: flex; align-items: flex-start; justify-content: center;
        padding-top: 76px;
        pointer-events: none;
        background: rgba(0,0,0,0.15);
      }

      #vx-dialog-box {
        pointer-events: all;
        background: var(--bg-base, #1a2e2e);
        border: 1px solid var(--bg-border, #2e4a4c);
        border-radius: 10px;
        width: 420px; max-width: calc(100vw - 32px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
        overflow: hidden;
        animation: vxDlgIn 0.15s cubic-bezier(0.2,0,0,1.2) forwards;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      @keyframes vxDlgIn {
        from { opacity:0; transform:scale(0.96) translateY(-6px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      @keyframes vxDlgOut {
        from { opacity:1; transform:scale(1); }
        to   { opacity:0; transform:scale(0.96); }
      }

      /* Chrome-style header bar */
      .vx-dlg-bar {
        display: flex; align-items: center; gap: 8px;
        padding: 8px 12px;
        background: var(--bg-surface, #22383a);
        border-bottom: 1px solid var(--bg-border, #2e4a4c);
        font-size: 11px; color: var(--text-dim, #4a8080);
        user-select: none;
      }
      .vx-dlg-bar-favicon {
        width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0;
      }
      .vx-dlg-bar-origin {
        flex: 1; font-size: 11px; color: var(--text-dim, #4a8080);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .vx-dlg-bar-label {
        font-size: 10px; color: var(--text-dim, #4a8080);
        background: var(--bg-hover, #253f40);
        padding: 2px 7px; border-radius: 10px;
        flex-shrink: 0;
      }

      /* Body */
      .vx-dlg-body {
        padding: 16px 18px 14px;
      }
      .vx-dlg-message {
        font-size: 13px; color: var(--text-main, #c8e8e5);
        line-height: 1.6; word-break: break-word;
        white-space: pre-wrap; max-height: 180px; overflow-y: auto;
        margin-bottom: 0;
      }
      .vx-dlg-message::-webkit-scrollbar { width: 4px; }
      .vx-dlg-message::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }

      .vx-dlg-input {
        width: 100%; margin-top: 12px;
        background: var(--bg-deep, #0d1f1f);
        border: 1px solid var(--bg-border, #2e4a4c);
        border-radius: 6px; color: var(--text-main, #c8e8e5);
        font-size: 13px; padding: 8px 10px;
        outline: none; box-sizing: border-box;
        transition: border-color 0.15s;
      }
      .vx-dlg-input:focus { border-color: var(--accent, #00c8b4); }

      /* Footer */
      .vx-dlg-footer {
        display: flex; gap: 8px; padding: 0 18px 14px;
        justify-content: flex-end; align-items: center;
      }
      .vx-dlg-prevent {
        flex: 1; display: flex; align-items: center; gap: 6px;
        font-size: 11px; color: var(--text-dim, #4a8080); cursor: pointer;
        user-select: none;
      }
      .vx-dlg-prevent input { cursor: pointer; accent-color: var(--accent, #00c8b4); }

      .vx-dlg-btn {
        border: none; border-radius: 6px;
        font-size: 12px; font-weight: 600;
        padding: 7px 18px; cursor: pointer;
        transition: all 0.12s; min-width: 72px;
      }
      .vx-dlg-btn-cancel {
        background: var(--bg-hover, #253f40);
        border: 1px solid var(--bg-border, #2e4a4c);
        color: var(--text-muted, #7aadad);
      }
      .vx-dlg-btn-cancel:hover { background: var(--bg-surface, #22383a); }
      .vx-dlg-btn-ok {
        background: var(--accent, #00c8b4); color: #001a18;
      }
      .vx-dlg-btn-ok:hover { filter: brightness(1.1); }
    `;
    document.head.appendChild(s);
  }

  function show(type, message, origin, defaultValue) {
    _injectStyles();
    document.getElementById('vx-dialog-overlay')?.remove();

    const LABELS = { alert: 'Alert', confirm: 'Confirm', prompt: 'Prompt' };
    const faviconUrl = origin ? `https://www.google.com/s2/favicons?domain=${origin}&sz=16` : '';

    const overlay = document.createElement('div');
    overlay.id = 'vx-dialog-overlay';

    overlay.innerHTML = `
      <div id="vx-dialog-box">
        <!-- Chrome-style origin bar -->
        <div class="vx-dlg-bar">
          ${faviconUrl ? `<img class="vx-dlg-bar-favicon" src="${faviconUrl}" onerror="this.style.display='none'"/>` : ''}
          <span class="vx-dlg-bar-origin">${_esc(origin || 'This page')}</span>
          <span class="vx-dlg-bar-label">${LABELS[type] || 'Dialog'}</span>
        </div>

        <!-- Message -->
        <div class="vx-dlg-body">
          <div class="vx-dlg-message">${_esc(message)}</div>
          ${type === 'prompt' ? `<input class="vx-dlg-input" id="vx-dlg-inp" type="text" value="${_esc(defaultValue || '')}" autocomplete="off"/>` : ''}
        </div>

        <!-- Buttons -->
        <div class="vx-dlg-footer">
          ${type !== 'alert' ? `
            <label class="vx-dlg-prevent">
              <input type="checkbox" id="vx-dlg-prevent"/>
              Don't allow more dialogs
            </label>` : ''}
          ${type !== 'alert' ? `<button class="vx-dlg-btn vx-dlg-btn-cancel" id="vx-dlg-cancel">Cancel</button>` : ''}
          <button class="vx-dlg-btn vx-dlg-btn-ok" id="vx-dlg-ok">
            ${type === 'alert' ? 'OK' : type === 'confirm' ? 'OK' : 'Submit'}
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Focus
    if (type === 'prompt') {
      setTimeout(() => overlay.querySelector('#vx-dlg-inp')?.focus(), 50);
    } else {
      setTimeout(() => overlay.querySelector('#vx-dlg-ok')?.focus(), 50);
    }

    function _close(confirmed) {
      const box = overlay.querySelector('#vx-dialog-box');
      if (box) { box.style.animation = 'vxDlgOut 0.12s ease forwards'; }
      setTimeout(() => overlay.remove(), 130);
    }

    overlay.querySelector('#vx-dlg-ok').addEventListener('click', () => _close(true));
    overlay.querySelector('#vx-dlg-cancel')?.addEventListener('click', () => _close(false));

    // Keyboard
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); _close(true); }
      if (e.key === 'Escape') _close(false);
    });
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { show };
})();
