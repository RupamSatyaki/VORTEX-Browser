/**
 * base64/index.js — Base64 Tool main entry
 * Registers tool with DevHub, manages tabs
 */
const Base64Tool = {
  id: 'base64',
  name: 'Base64',
  desc: 'Text · Image · File · Auto-detect · URL-safe · Embed code',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`,

  render(container) {
    const self = this;

    container.innerHTML = `
      <div class="b64-main-wrap">

        <!-- Tab pills -->
        <div class="b64-main-tabs">
          <button class="b64-main-tab active" data-tab="text">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Text
          </button>
          <button class="b64-main-tab" data-tab="image">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Image
          </button>
          <button class="b64-main-tab" data-tab="file">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            File
          </button>
        </div>

        <!-- Status bar -->
        <div class="b64-status-bar">
          <span class="dh-status" id="b64-status"></span>
        </div>

        <!-- Tab contents -->
        <div class="b64-main-content" id="b64-text-content"></div>
        <div class="b64-main-content" id="b64-image-content" style="display:none"></div>
        <div class="b64-main-content" id="b64-file-content" style="display:none"></div>

      </div>`;

    const $ = id => container.querySelector('#' + id);

    function setStatus(msg, ok) {
      const el = $('b64-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
      if (ok && msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2000);
    }

    // Render components
    B64Text.render($('b64-text-content'), setStatus);
    B64Image.render($('b64-image-content'), setStatus);
    B64File.render($('b64-file-content'), setStatus);

    // Tab switching
    container.querySelectorAll('.b64-main-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.b64-main-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $('b64-text-content').style.display   = tab.dataset.tab === 'text'  ? '' : 'none';
        $('b64-image-content').style.display  = tab.dataset.tab === 'image' ? '' : 'none';
        $('b64-file-content').style.display   = tab.dataset.tab === 'file'  ? '' : 'none';
      });
    });
  },
};
