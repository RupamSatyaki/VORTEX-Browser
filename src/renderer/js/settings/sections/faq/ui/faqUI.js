/**
 * settings/sections/faq/ui/faqUI.js
 * HTML renderers for FAQ section — pure HTML, no event listeners.
 */

const FaqUI = (() => {

  function renderShell() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Help & FAQ',
        subtitle: `${FaqData.ITEMS.length} questions across ${FaqData.CATEGORIES.length - 1} categories`,
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/>
                 <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                 <line x1="12" y1="17" x2="12.01" y2="17"/>
               </svg>`,
      })}

      <!-- Search bar -->
      <div class="faq-search-wrap">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4a8080" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input class="faq-search" id="faq-search-input" type="text"
          placeholder="Search questions, features, issues…"
          spellcheck="false" autocomplete="off"/>
        <button class="faq-search-clear" id="faq-search-clear"
          style="display:none;">✕</button>
      </div>

      <!-- Category tabs -->
      <div class="faq-cats" id="faq-cats"></div>

      <!-- Stats bar -->
      <div class="faq-stats" id="faq-stats"></div>

      <!-- Items list -->
      <div class="faq-list" id="faq-list"></div>`;
  }

  function renderCatTabs(activeId) {
    return FaqData.CATEGORIES.map(c => {
      const count = c.id === 'all'
        ? FaqData.ITEMS.length
        : FaqData.ITEMS.filter(i => i.category === c.id).length;
      return `
        <button class="faq-cat-tab ${activeId === c.id ? 'active' : ''}"
          data-cat="${c.id}">
          ${c.icon} ${c.label}
          <span class="faq-cat-count">${count}</span>
        </button>`;
    }).join('');
  }

  function renderItems(items, openId, searchQ) {
    if (!items.length) {
      return `
        <div class="faq-empty">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2e6060" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <div>No results${searchQ ? ` for "<strong style="color:#c8e8e5">${searchQ}</strong>"` : ''}</div>
          <div style="font-size:11px;color:#2e6060;margin-top:4px;">
            Try different keywords or browse a category
          </div>
        </div>`;
    }
    return items.map(item => renderItem(item, openId, searchQ)).join('');
  }

  function renderItem(item, openId, searchQ) {
    const isOpen   = openId === item.id;
    const catObj   = FaqData.CATEGORIES.find(c => c.id === item.category);
    const catLabel = catObj ? catObj.label : item.category;
    const qText    = _highlight(item.q, searchQ);

    return `
      <div class="faq-item ${isOpen ? 'open' : ''}" data-faq-id="${item.id}">
        <div class="faq-q">
          <div class="faq-q-text">${qText}</div>
          <div class="faq-q-right">
            <span class="faq-cat-pill">${catLabel}</span>
            <svg class="faq-arrow" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <div class="faq-a">
          <div class="faq-a-inner">${item.a}</div>
        </div>
      </div>`;
  }

  function _highlight(text, q) {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re,
      '<mark style="background:rgba(0,200,180,0.25);color:#00c8b4;border-radius:2px;">$1</mark>');
  }

  return { renderShell, renderCatTabs, renderItems, renderItem };

})();
