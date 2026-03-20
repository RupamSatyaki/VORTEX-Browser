// Omnibox — search suggestions with local history, bookmarks + Google Suggest
window.Omnibox = (() => {
  let _enabled = true;
  let _debounce = null;
  let _cache = {};          // query → suggestions array
  let _activeIdx = -1;      // keyboard nav index
  let _items = [];          // current rendered items
  let _originalValue = '';  // saved value before keyboard nav

  // ── DOM ──────────────────────────────────────────────────────────────────

  function _getBox() { return document.getElementById('omnibox-dropdown'); }
  function _getInput() { return document.getElementById('url-bar'); }

  function _ensureBox() {
    if (_getBox()) return _getBox();
    const box = document.createElement('div');
    box.id = 'omnibox-dropdown';
    document.getElementById('address-bar-wrap').appendChild(box);
    return box;
  }

  // ── Fetch Google Suggest ─────────────────────────────────────────────────

  async function _fetchSuggest(query) {
    if (_cache[query]) return _cache[query];
    try {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const json = await res.json();
      const suggestions = (json[1] || []).slice(0, 5);
      _cache[query] = suggestions;
      return suggestions;
    } catch (_) {
      return [];
    }
  }

  // ── Local sources ────────────────────────────────────────────────────────

  function _matchLocal(query) {
    const q = query.toLowerCase();
    const results = [];

    // Bookmarks
    if (window.BookmarkStore && BookmarkStore._cache) {
      BookmarkStore._cache.forEach(bm => {
        if (
          (bm.title && bm.title.toLowerCase().includes(q)) ||
          (bm.url && bm.url.toLowerCase().includes(q))
        ) {
          results.push({ type: 'bookmark', title: bm.title || bm.url, url: bm.url });
        }
      });
    }

    // Tab history (closed tabs navLog)
    if (window.TabHistory) {
      TabHistory.getClosedTabs().forEach(tab => {
        tab.navLog.forEach(nav => {
          if (
            (nav.title && nav.title.toLowerCase().includes(q)) ||
            (nav.url && nav.url.toLowerCase().includes(q))
          ) {
            // Deduplicate by URL
            if (!results.find(r => r.url === nav.url)) {
              results.push({ type: 'history', title: nav.title || nav.url, url: nav.url });
            }
          }
        });
      });
      // Active tabs
      TabHistory.getActiveTabs().forEach(tab => {
        tab.navLog.forEach(nav => {
          if (
            (nav.title && nav.title.toLowerCase().includes(q)) ||
            (nav.url && nav.url.toLowerCase().includes(q))
          ) {
            if (!results.find(r => r.url === nav.url)) {
              results.push({ type: 'history', title: nav.title || nav.url, url: nav.url });
            }
          }
        });
      });
    }

    return results.slice(0, 4);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const ICONS = {
    bookmark: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#00c8b4" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    history:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    suggest:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a8080" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  };

  function _render(localItems, suggestions, query) {
    const box = _ensureBox();
    box.innerHTML = '';
    _items = [];
    _activeIdx = -1;

    // Local results first
    localItems.forEach(item => {
      _items.push({ value: item.url, label: item.title, sub: item.url, type: item.type });
    });

    // Google suggestions
    suggestions.forEach(s => {
      _items.push({ value: s, label: s, sub: null, type: 'suggest' });
    });

    if (_items.length === 0) { _hide(); return; }

    _items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'omni-row';
      row.dataset.idx = idx;

      const icon = document.createElement('span');
      icon.className = 'omni-icon';
      icon.innerHTML = ICONS[item.type] || ICONS.suggest;

      const text = document.createElement('span');
      text.className = 'omni-text';

      const title = document.createElement('span');
      title.className = 'omni-title';
      title.textContent = item.label;

      text.appendChild(title);

      if (item.sub) {
        const sub = document.createElement('span');
        sub.className = 'omni-sub';
        sub.textContent = item.sub;
        text.appendChild(sub);
      }

      row.appendChild(icon);
      row.appendChild(text);

      row.addEventListener('mousedown', (e) => {
        e.preventDefault(); // prevent blur
        _select(idx);
      });

      row.addEventListener('mouseover', () => {
        _setActive(idx, false); // hover highlight, don't fill input
      });

      box.appendChild(row);
    });

    box.classList.add('visible');
  }

  function _setActive(idx, fillInput = true) {
    const rows = _getBox()?.querySelectorAll('.omni-row');
    if (!rows) return;
    rows.forEach(r => r.classList.remove('active'));
    _activeIdx = idx;
    if (idx >= 0 && idx < rows.length) {
      rows[idx].classList.add('active');
      if (fillInput) {
        const input = _getInput();
        if (input) input.value = _items[idx].value;
      }
    }
  }

  function _select(idx) {
    const item = _items[idx];
    if (!item) return;
    const input = _getInput();
    if (input) input.value = item.value;
    _hide();
    // Navigate
    if (window.WebView) WebView.loadURL(_resolveNav(item.value));
    else if (window.Tabs) Tabs.createTab(_resolveNav(item.value));
  }

  function _resolveNav(value) {
    if (/^https?:\/\//i.test(value)) return value;
    if (value.includes('.') && !value.includes(' ')) return 'https://' + value;
    // It's a search query
    const engine = window.Navigation ? Navigation._getSearchEngine() : 'google';
    const bases = {
      google: 'https://www.google.com/search?q=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      brave: 'https://search.brave.com/search?q=',
      ecosia: 'https://www.ecosia.org/search?q=',
    };
    return (bases[engine] || bases.google) + encodeURIComponent(value);
  }

  function _hide() {
    const box = _getBox();
    if (box) box.classList.remove('visible');
    _items = [];
    _activeIdx = -1;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  function onInput(value) {
    if (!_enabled) return;
    const q = value.trim();
    if (!q) { _hide(); return; }

    _originalValue = value;

    // Instant local results
    const local = _matchLocal(q);
    _render(local, [], q);

    // Debounced Google suggest
    clearTimeout(_debounce);
    _debounce = setTimeout(async () => {
      const suggestions = await _fetchSuggest(q);
      const freshLocal = _matchLocal(q);
      _render(freshLocal, suggestions, q);
    }, 220);
  }

  function onKeydown(e) {
    const box = _getBox();
    if (!box || !box.classList.contains('visible')) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(_activeIdx + 1, _items.length - 1);
      _setActive(next);
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (_activeIdx <= 0) {
        // Back to original typed value
        _activeIdx = -1;
        const rows = box.querySelectorAll('.omni-row');
        rows.forEach(r => r.classList.remove('active'));
        const input = _getInput();
        if (input) input.value = _originalValue;
      } else {
        _setActive(_activeIdx - 1);
      }
      return true;
    }
    if (e.key === 'Enter' && _activeIdx >= 0) {
      e.preventDefault();
      _select(_activeIdx);
      return true;
    }
    if (e.key === 'Escape') {
      _hide();
      return false;
    }
    return false;
  }

  function onBlur() {
    // Small delay so mousedown on row fires first
    setTimeout(_hide, 150);
  }

  function setEnabled(val) { _enabled = val; if (!val) _hide(); }

  return { onInput, onKeydown, onBlur, setEnabled };
})();
