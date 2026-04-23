/**
 * features/assistant/ui/chatBubble.js
 * Flat chat messages — no bubble style, clean layout.
 */

const ChatBubble = (() => {

  function _md(text) {
    if (!text) return '';
    return text
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code>${_esc(code.trim())}</code></pre>`)
      .replace(/`([^`]+)`/g, (_, c) => `<code>${_esc(c)}</code>`)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<div class="ast-md-h3">$1</div>')
      .replace(/^## (.+)$/gm,  '<div class="ast-md-h2">$1</div>')
      .replace(/^# (.+)$/gm,   '<div class="ast-md-h1">$1</div>')
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm,  '<li>$1</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function _esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _time() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  // ── User message ──────────────────────────────────────────────────────────
  function renderUser(text) {
    const el = document.createElement('div');
    el.className = 'ast-msg ast-msg-user';
    el.innerHTML = `
      <div class="ast-msg-avatar ast-msg-avatar-user">You</div>
      <div class="ast-msg-body">
        <div class="ast-msg-text">${_esc(text).replace(/\n/g,'<br>')}</div>
        <div class="ast-msg-time">${_time()}</div>
      </div>
    `;
    return el;
  }

  // ── Assistant message ─────────────────────────────────────────────────────
  function renderAssistant(text = '', streaming = false) {
    const el = document.createElement('div');
    el.className = 'ast-msg ast-msg-assistant';

    const contentEl = document.createElement('div');
    contentEl.className = 'ast-msg-text';

    if (streaming) {
      const cursor = document.createElement('span');
      cursor.className = 'ast-cursor';
      contentEl.appendChild(cursor);
    } else if (text) {
      contentEl.innerHTML = _md(text);
    }

    const timeEl = document.createElement('div');
    timeEl.className = 'ast-msg-time';
    timeEl.textContent = _time();

    const copyBtn = document.createElement('button');
    copyBtn.className = 'ast-msg-copy';
    copyBtn.title = 'Copy';
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>`;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(el._rawText || '').catch(() => {});
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
      }, 1500);
    });

    const metaEl = document.createElement('div');
    metaEl.className = 'ast-msg-meta';
    metaEl.appendChild(timeEl);
    metaEl.appendChild(copyBtn);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'ast-msg-body';
    bodyEl.appendChild(contentEl);
    bodyEl.appendChild(metaEl);

    el.innerHTML = `<div class="ast-msg-avatar ast-msg-avatar-ai">AI</div>`;
    el.appendChild(bodyEl);

    el._rawText = '';

    el.appendToken = (token) => {
      el._rawText += token;
      const cursor = contentEl.querySelector('.ast-cursor');
      if (cursor) cursor.remove();
      contentEl.innerHTML = _md(el._rawText);
      const c = document.createElement('span');
      c.className = 'ast-cursor';
      contentEl.appendChild(c);
    };

    el.finalize = (finalText) => {
      const cursor = contentEl.querySelector('.ast-cursor');
      if (cursor) cursor.remove();
      const t = finalText !== undefined ? finalText : el._rawText;
      el._rawText = t;
      contentEl.innerHTML = t ? _md(t) : '<span style="color:var(--text-dim);font-style:italic;font-size:11px">Done.</span>';
    };

    return el;
  }

  return { renderUser, renderAssistant };

})();
