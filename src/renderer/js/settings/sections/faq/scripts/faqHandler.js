/**
 * settings/sections/faq/scripts/faqHandler.js
 * Search, category filter, accordion toggle for FAQ section.
 */

const FaqHandler = (() => {

  let _activeCategory = 'all';
  let _searchQuery    = '';
  let _openId         = null;
  let _container      = null;

  function bind(container, _settings) {
    _container = container;
    _activeCategory = 'all';
    _searchQuery    = '';
    _openId         = null;

    // Render initial state
    _renderAll();

    // Search input
    const inp = container.querySelector('#faq-search-input');
    if (inp) {
      inp.addEventListener('input', () => {
        _searchQuery = inp.value;
        _openId = null;
        _renderAll();
        // Show/hide clear button
        const clear = container.querySelector('#faq-search-clear');
        if (clear) clear.style.display = _searchQuery ? '' : 'none';
      });
    }

    // Clear button
    const clear = container.querySelector('#faq-search-clear');
    if (clear) {
      clear.addEventListener('click', () => {
        _searchQuery = '';
        _openId = null;
        if (inp) inp.value = '';
        clear.style.display = 'none';
        _renderAll();
        inp?.focus();
      });
    }

    // Category tabs — delegated
    const cats = container.querySelector('#faq-cats');
    if (cats) {
      cats.addEventListener('click', (e) => {
        const btn = e.target.closest('.faq-cat-tab');
        if (!btn) return;
        _activeCategory = btn.dataset.cat;
        _openId = null;
        _renderAll();
      });
    }

    // FAQ item accordion — delegated
    const list = container.querySelector('#faq-list');
    if (list) {
      list.addEventListener('click', (e) => {
        const item = e.target.closest('.faq-item');
        if (!item) return;
        const id = item.dataset.faqId;
        _openId = _openId === id ? null : id;
        _renderList();
      });
    }
  }

  function _filtered() {
    const q = _searchQuery.toLowerCase().trim();
    return FaqData.ITEMS.filter(item => {
      const inCat = _activeCategory === 'all' || item.category === _activeCategory;
      if (!q) return inCat;
      const inText = item.q.toLowerCase().includes(q) ||
                     item.a.toLowerCase().includes(q) ||
                     item.tags.some(t => t.includes(q));
      return inCat && inText;
    });
  }

  function _renderAll() {
    _renderCats();
    _renderStats();
    _renderList();
  }

  function _renderCats() {
    const el = _container?.querySelector('#faq-cats');
    if (el) el.innerHTML = FaqUI.renderCatTabs(_activeCategory);
  }

  function _renderStats() {
    const el = _container?.querySelector('#faq-stats');
    if (!el) return;
    const filtered = _filtered();
    const q = _searchQuery.trim();
    el.innerHTML = `
      ${filtered.length} of ${FaqData.ITEMS.length} questions
      ${q ? `· matching "<strong style="color:#00c8b4">${q}</strong>"` : ''}`;
  }

  function _renderList() {
    const el = _container?.querySelector('#faq-list');
    if (el) el.innerHTML = FaqUI.renderItems(_filtered(), _openId, _searchQuery.trim());
  }

  return { bind };

})();
