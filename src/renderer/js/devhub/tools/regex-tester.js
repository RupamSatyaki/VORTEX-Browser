const RegexTesterTool = {
  id: 'regex-tester',
  name: 'Regex Tester',
  desc: 'Live regex match highlighter with flags',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,

  render(container) {
    container.innerHTML = `
      <div class="dh-tool-wrap">
        <div class="rx-pattern-row">
          <span class="rx-slash">/</span>
          <input class="dh-input rx-pattern" id="rx-pattern" type="text" placeholder="pattern" spellcheck="false" />
          <span class="rx-slash">/</span>
          <div class="rx-flags">
            <label class="rx-flag"><input type="checkbox" id="rx-g" checked> g</label>
            <label class="rx-flag"><input type="checkbox" id="rx-i"> i</label>
            <label class="rx-flag"><input type="checkbox" id="rx-m"> m</label>
            <label class="rx-flag"><input type="checkbox" id="rx-s"> s</label>
          </div>
        </div>
        <div class="dh-status" id="rx-status" style="margin:4px 0 6px;"></div>

        <label style="font-size:11px;color:#4a8080;margin-bottom:4px;display:block;">Test String</label>
        <textarea class="dh-textarea" id="rx-input" placeholder="Enter test string here…" style="min-height:90px;"></textarea>

        <div class="rx-result-label" id="rx-match-count"></div>
        <div class="dh-output rx-highlighted" id="rx-highlighted"></div>

        <div class="rx-groups" id="rx-groups"></div>
      </div>`;

    const patEl  = container.querySelector('#rx-pattern');
    const testEl = container.querySelector('#rx-input');
    const status = container.querySelector('#rx-status');
    const countEl= container.querySelector('#rx-match-count');
    const hiEl   = container.querySelector('#rx-highlighted');
    const grpEl  = container.querySelector('#rx-groups');

    function getFlags() {
      return ['g','i','m','s'].filter(f => container.querySelector(`#rx-${f}`).checked).join('');
    }

    function run() {
      const pat = patEl.value, text = testEl.value, flags = getFlags();
      hiEl.innerHTML = ''; grpEl.innerHTML = ''; countEl.textContent = ''; status.textContent = '';
      if (!pat) { hiEl.textContent = text; return; }

      let re;
      try { re = new RegExp(pat, flags); status.textContent = '✓ Valid'; status.style.color='#22c55e'; }
      catch(e) { status.textContent = '✗ ' + e.message; status.style.color='#ef4444'; hiEl.textContent = text; return; }

      const matches = [...text.matchAll(new RegExp(pat, flags.includes('g') ? flags : flags+'g'))];
      countEl.textContent = `${matches.length} match${matches.length!==1?'es':''}`;

      // Highlight
      let last = 0, html = '';
      matches.forEach(m => {
        html += text.slice(last, m.index).replace(/</g,'&lt;');
        html += `<mark class="rx-mark">${m[0].replace(/</g,'&lt;')}</mark>`;
        last = m.index + m[0].length;
      });
      html += text.slice(last).replace(/</g,'&lt;');
      hiEl.innerHTML = html || '<span style="color:#2e6060">No matches</span>';

      // Groups
      if (matches.length && matches[0].length > 1) {
        grpEl.innerHTML = '<div style="font-size:11px;color:#4a8080;margin-top:8px;">Capture Groups (first match)</div>' +
          matches[0].slice(1).map((g,i) =>
            `<div class="rx-group-row"><span class="rx-group-idx">$${i+1}</span><span class="rx-group-val">${g ?? '<em>undefined</em>'}</span></div>`
          ).join('');
      }
    }

    patEl.addEventListener('input', run);
    testEl.addEventListener('input', run);
    container.querySelectorAll('.rx-flag input').forEach(cb => cb.addEventListener('change', run));
  }
};
