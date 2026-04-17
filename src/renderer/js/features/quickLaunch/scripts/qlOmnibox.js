/**
 * features/quickLaunch/scripts/qlOmnibox.js
 * Quick Launch omnibox — suggestions fetch, show, hide, navigate.
 */

const QLOmnibox = (() => {

  let _timer = null;

  function show(results) {
    const box = document.getElementById('ql-omni');
    if (!box) return;
    box.innerHTML = '';
    if (!results.length) { box.classList.remove('visible'); return; }

    results.forEach(r => {
      const row = document.createElement('div');
      row.className = 'ql-omni-row';
      const icon = r.type === 'url'
        ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
      const display = r.label
        ? `<span class="ql-omni-label">${r.label}</span><span class="ql-omni-sub">${r.text}</span>`
        : `<span class="ql-omni-text">${r.text}</span>`;
      row.innerHTML = `<span class="ql-omni-icon">${icon}</span><span class="ql-omni-texts">${display}</span>`;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const inp = document.getElementById('ql-search');
        if (inp) inp.value = r.label || r.text;
        hide();
        navigate(r.text);
      });
      box.appendChild(row);
    });
    box.classList.add('visible');
  }

  function hide() {
    document.getElementById('ql-omni')?.classList.remove('visible');
  }

  async function fetchSuggestions(query) {
    if (!query) { hide(); return; }
    const results = [];
    const q = query.toLowerCase();

    // URL detection
    if (/^https?:\/\//i.test(query) || (query.includes('.') && !query.includes(' '))) {
      results.push({ type: 'url', text: query.startsWith('http') ? query : 'https://' + query });
    }

    // Bookmark matches
    try {
      const bms = await BookmarkStore.load();
      bms.filter(b => b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach(b => results.push({ type: 'url', text: b.url, label: b.title }));
    } catch (_) {}

    // Google suggestions
    try {
      const res  = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      (data[1] || []).slice(0, 4).forEach(s => results.push({ type: 'search', text: s }));
    } catch (_) {}

    show(results.slice(0, 7));
  }

  function navigate(input) {
    let url = (input || '').trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    return url; // caller handles _openURL
  }

  function bindSearchInput(onNavigate, onClose) {
    const inp = document.getElementById('ql-search');
    if (!inp) return;

    inp.addEventListener('input', (e) => {
      clearTimeout(_timer);
      const val = e.target.value.trim();
      if (!val) { hide(); return; }
      _timer = setTimeout(() => fetchSuggestions(val), 200);
    });

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        hide();
        const url = navigate(inp.value);
        if (url) onNavigate(url);
      }
      if (e.key === 'Escape') onClose();
    });

    inp.addEventListener('blur', () => setTimeout(hide, 150));
  }

  return { show, hide, fetchSuggestions, navigate, bindSearchInput };

})();
