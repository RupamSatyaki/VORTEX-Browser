/**
 * blocklist/components/customRules.js
 */

const CustomRules = {
  render(container, domains, onAdd, onRemove) {
    container.innerHTML = `
      <div class="bl-custom-wrap">
        <div class="bl-custom-header">
          <div class="bl-custom-title">Custom Block Rules</div>
          <span class="bl-custom-count">${domains.length} rule${domains.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="bl-custom-add-row">
          <input class="bl-custom-inp" id="bl-custom-inp" type="text"
            placeholder="e.g. ads.example.com" spellcheck="false" autocomplete="off"/>
          <button class="bl-custom-add-btn" id="bl-custom-add">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add
          </button>
        </div>
        <div class="bl-custom-list" id="bl-custom-list">
          ${domains.length === 0
            ? '<div class="bl-empty">No custom rules yet</div>'
            : domains.map(d => `
              <div class="bl-custom-item">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ef4444" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                <span class="bl-custom-domain">${d}</span>
                <button class="bl-custom-del" data-domain="${d}" title="Remove">
                  <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
                </button>
              </div>`).join('')}
        </div>
      </div>`;

    const inp = container.querySelector('#bl-custom-inp');
    container.querySelector('#bl-custom-add').addEventListener('click', () => {
      const val = inp.value.trim();
      if (val) { onAdd(val); inp.value = ''; }
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const val = inp.value.trim(); if (val) { onAdd(val); inp.value = ''; } }
    });
    container.querySelectorAll('.bl-custom-del').forEach(btn => {
      btn.addEventListener('click', () => onRemove(btn.dataset.domain));
    });
  },
};
