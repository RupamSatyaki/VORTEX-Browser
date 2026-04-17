/**
 * features/quickLaunch/scripts/popularSitesHandler.js
 * Popular sites list render + category filter + search.
 */

const QLPopularSitesHandler = (() => {

  let _activeCategory = 'all';

  function render(query, category, onOpen) {
    _activeCategory = category || 'all';

    // Update category button active state
    document.querySelectorAll('.ql-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === _activeCategory);
    });

    const list = document.getElementById('ql-popular-list');
    if (!list) return;
    list.innerHTML = '';

    const filtered = QLPopularSitesUI.filter(query, _activeCategory);
    filtered.forEach(site => list.appendChild(QLPopularSitesUI.buildItem(site, onOpen)));

    if (!filtered.length) {
      list.innerHTML = `<div style="padding:14px;text-align:center;font-size:12px;color:#2e6060">No results</div>`;
    }
  }

  function bindCategoryBtns(onOpen) {
    document.querySelectorAll('.ql-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const q = document.getElementById('ql-pop-search')?.value || '';
        render(q, btn.dataset.cat, onOpen);
      });
    });
  }

  function bindPopSearch(onOpen, onNavigate) {
    const popSearch = document.getElementById('ql-pop-search');
    const menuDrop  = document.getElementById('ql-menu-dropdown');
    if (!popSearch) return;

    popSearch.addEventListener('input', (e) => render(e.target.value, _activeCategory, onOpen));
    popSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) { menuDrop?.classList.remove('visible'); onNavigate(val); }
      }
      e.stopPropagation();
    });
  }

  function bindMenuBtn() {
    const menuBtn  = document.getElementById('ql-menu-btn');
    const menuDrop = document.getElementById('ql-menu-dropdown');
    if (!menuBtn || !menuDrop) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuDrop.classList.toggle('visible');
      if (isOpen) {
        const inp = document.getElementById('ql-pop-search');
        if (inp) { inp.value = ''; inp.focus(); }
      }
    });

    document.addEventListener('click', (e) => {
      if (!menuDrop.contains(e.target) && e.target !== menuBtn) {
        menuDrop.classList.remove('visible');
      }
    });
  }

  function getActiveCategory() { return _activeCategory; }

  return { render, bindCategoryBtns, bindPopSearch, bindMenuBtn, getActiveCategory };

})();
