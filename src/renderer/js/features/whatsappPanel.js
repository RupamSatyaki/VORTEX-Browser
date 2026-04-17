/**
 * features/whatsappPanel.js
 * WhatsApp Web panel — open/close/toggle/fullscreen
 */

const WhatsAppPanel = (() => {

  let _isOpen = false;
  let _isFullscreen = false;

  function open() {
    const panel = document.getElementById('wa-panel');
    if (!panel) return;
    panel.classList.add('visible');
    _isOpen = true;
    const btn = document.getElementById('nav-whatsapp');
    if (btn) btn.classList.add('active');
  }

  function close() {
    const panel = document.getElementById('wa-panel');
    if (!panel) return;
    panel.classList.remove('visible', 'fullscreen');
    _isOpen = false;
    _isFullscreen = false;
    const btn = document.getElementById('nav-whatsapp');
    if (btn) btn.classList.remove('active');
  }

  function toggle() {
    _isOpen ? close() : open();
  }

  function toggleFullscreen() {
    const panel = document.getElementById('wa-panel');
    if (!panel) return;
    _isFullscreen = !_isFullscreen;
    panel.classList.toggle('fullscreen', _isFullscreen);
  }

  function _bind() {
    const closeBtn = document.getElementById('wa-close');
    const fsBtn    = document.getElementById('wa-fullscreen');
    const refresh  = document.getElementById('wa-refresh');

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (fsBtn)    fsBtn.addEventListener('click', toggleFullscreen);
    if (refresh) {
      refresh.addEventListener('click', () => {
        const wv = document.getElementById('wa-webview');
        if (wv) wv.reload();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _bind);
  } else {
    _bind();
  }

  return { open, close, toggle, toggleFullscreen };

})();
