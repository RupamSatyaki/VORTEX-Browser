/**
 * features/assistant/ui/thinkingBlock.js
 * Thinking accordion — spinner while streaming, expandable when done.
 */

const ThinkingBlock = (() => {

  function create() {
    const wrap = document.createElement('div');
    wrap.className = 'ast-thinking-wrap';

    wrap.innerHTML = `
      <div class="ast-thinking-header">
        <div class="ast-thinking-spinner"></div>
        <svg class="ast-thinking-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#eab308" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4"/>
          <circle cx="12" cy="16" r="1" fill="#eab308" stroke="none"/>
        </svg>
        <span class="ast-thinking-label"><em>Thinking...</em></span>
        <svg class="ast-thinking-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6a5020" stroke-width="2" style="display:none">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="ast-thinking-body"></div>
    `;

    const header  = wrap.querySelector('.ast-thinking-header');
    const label   = wrap.querySelector('.ast-thinking-label');
    const body    = wrap.querySelector('.ast-thinking-body');
    const chevron = wrap.querySelector('.ast-thinking-chevron');

    let _text     = '';
    let _startMs  = Date.now();
    let _done     = false;

    // Toggle expand/collapse
    header.addEventListener('click', () => {
      if (!_done) return;
      wrap.classList.toggle('expanded');
    });

    // Append token while streaming
    wrap.appendToken = (token) => {
      _text += token;
      body.textContent = _text;
    };

    // Called when </think> detected
    wrap.finalize = () => {
      _done = true;
      const secs = ((Date.now() - _startMs) / 1000).toFixed(1);
      wrap.classList.add('done');
      label.innerHTML = `<strong>Thought for ${secs}s</strong> — click to expand`;
      chevron.style.display = 'flex';
      body.textContent = _text;
    };

    return wrap;
  }

  return { create };

})();
