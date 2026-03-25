/**
 * json-viewer.js — Full-featured JSON Viewer
 * Features: tree, search/filter, JSONPath copy, schema gen, diff, edit mode,
 *           JSON→CSV, sort keys, flatten/unflatten, size info, line numbers,
 *           real-time validation, syntax theme toggle, bookmark nodes
 */
const JsonViewerTool = {
  id: 'json-viewer',
  name: 'JSON Viewer',
  desc: 'Upload, explore, edit & visualize JSON — 13 tools in one',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="12" y2="17"/>
  </svg>`,

  // State
  _collapsed: new Set(),
  _bookmarked: new Set(),
  _parsed: null,
  _nodeId: 0,
  _searchQ: '',
  _editMode: false,
  _theme: 'dark', // 'dark' | 'light'
  _activeTab: 'tree',

  render(container) {
    this._collapsed  = new Set();
    this._bookmarked = new Set();
    this._parsed     = null;
    this._nodeId     = 0;
    this._searchQ    = '';
    this._editMode   = false;
    this._theme      = 'dark';
    this._activeTab  = 'tree';
    const self = this;

    container.innerHTML = `<div class="jv-wrap" id="jv-root">

      <!-- ── Input row ── -->
      <div class="jv-input-row">
        <div class="jv-textarea-wrap" id="jv-textarea-wrap">
          <div class="jv-line-nums" id="jv-line-nums">1</div>
          <textarea class="dh-textarea jv-textarea" id="jv-input"
            placeholder='Paste JSON here…' spellcheck="false"></textarea>
        </div>
        <div class="jv-size-badge" id="jv-size-badge" style="display:none"></div>
      </div>

      <!-- ── Action bar ── -->
      <div class="jv-action-bar">
        <div class="jv-action-left">
          <button class="dh-btn primary" id="jv-parse">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            Parse
          </button>
          <button class="dh-btn" id="jv-minify">Minify</button>
          <button class="dh-btn" id="jv-sort-keys" title="Sort keys alphabetically">Sort Keys</button>
          <button class="dh-btn" id="jv-flatten" title="Flatten nested JSON">Flatten</button>
          <button class="dh-btn" id="jv-unflatten" title="Unflatten dotted keys">Unflatten</button>
          <button class="dh-btn" id="jv-to-csv" title="Convert array to CSV">→ CSV</button>
        </div>
        <div class="jv-action-right">
          <button class="dh-btn" id="jv-copy">Copy</button>
          <label class="dh-btn" title="Upload .json file" style="cursor:pointer">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload
            <input type="file" id="jv-file" accept=".json" style="display:none"/>
          </label>
          <button class="dh-btn danger" id="jv-clear">Clear</button>
          <span class="dh-status" id="jv-status"></span>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="jv-tabs" id="jv-tabs" style="display:none">
        <div class="jv-tab-pills">
          <button class="jv-tab active" data-tab="tree">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Tree
          </button>
          <button class="jv-tab" data-tab="diff">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Diff
          </button>
          <button class="jv-tab" data-tab="schema">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Schema
          </button>
          <button class="jv-tab" data-tab="stats">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            Stats
          </button>
        </div>
        <div class="jv-tree-controls" id="jv-tree-controls">
          <div class="jv-search-wrap">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#4a8080" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input class="jv-search-input" id="jv-search" type="text" placeholder="Search keys/values…" spellcheck="false"/>
            <span class="jv-search-count" id="jv-search-count"></span>
          </div>
          <button class="dh-btn jv-sm-btn" id="jv-expand-all">⊞</button>
          <button class="dh-btn jv-sm-btn" id="jv-collapse-all">⊟</button>
          <button class="dh-btn jv-sm-btn" id="jv-edit-toggle" title="Toggle edit mode">✎</button>
          <button class="dh-btn jv-sm-btn" id="jv-theme-toggle" title="Toggle syntax theme">◑</button>
        </div>
      </div>

      <!-- ── Tree view ── -->
      <div class="jv-tree-wrap" id="jv-tree-wrap" style="display:none">
        <div class="jv-tree" id="jv-tree"></div>
      </div>

      <!-- ── Diff view ── -->
      <div class="jv-diff-wrap" id="jv-diff-wrap" style="display:none">
        <div class="jv-diff-inputs">
          <div class="jv-diff-col">
            <div class="jv-diff-label">JSON A (original)</div>
            <textarea class="dh-textarea jv-diff-ta" id="jv-diff-a" placeholder='{"a":1}' spellcheck="false"></textarea>
          </div>
          <div class="jv-diff-col">
            <div class="jv-diff-label">JSON B (modified)</div>
            <textarea class="dh-textarea jv-diff-ta" id="jv-diff-b" placeholder='{"a":2,"b":3}' spellcheck="false"></textarea>
          </div>
        </div>
        <button class="dh-btn primary" id="jv-diff-run" style="margin-top:8px">Compare</button>
        <div class="jv-diff-result" id="jv-diff-result"></div>
      </div>

      <!-- ── Schema view ── -->
      <div class="jv-schema-wrap" id="jv-schema-wrap" style="display:none">
        <div class="jv-schema-actions">
          <button class="dh-btn" id="jv-schema-copy">Copy Schema</button>
          <span style="font-size:11px;color:#4a8080">Auto-generated from parsed JSON</span>
        </div>
        <div class="jv-tree-wrap" style="margin-top:8px">
          <pre class="jv-schema-out" id="jv-schema-out"></pre>
        </div>
      </div>

      <!-- ── Stats view ── -->
      <div class="jv-stats-wrap" id="jv-stats-wrap" style="display:none"></div>

    </div>`;

    const $ = id => container.querySelector('#' + id);

    // ── Helpers ────────────────────────────────────────────────────────────────
    function setStatus(msg, ok) {
      const el = $('jv-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
      if (ok) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2000);
    }

    function typeOf(v) {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v;
    }

    function typeColor(t, theme) {
      const dark  = { string:'#86efac', number:'#fdba74', boolean:'#a5b4fc', null:'#6b7280', object:'#67e8f9', array:'#38bdf8' };
      const light = { string:'#16a34a', number:'#c2410c', boolean:'#7c3aed', null:'#9ca3af', object:'#0891b2', array:'#0369a1' };
      return (theme === 'light' ? light : dark)[t] || '#c8e8e5';
    }

    // ── Line numbers ───────────────────────────────────────────────────────────
    function updateLineNums() {
      const ta = $('jv-input');
      const lines = ta.value.split('\n').length;
      $('jv-line-nums').textContent = Array.from({length: lines}, (_,i) => i+1).join('\n');
    }

    // ── Real-time validation ───────────────────────────────────────────────────
    function validateLive(val) {
      const ta = $('jv-input');
      const badge = $('jv-size-badge');
      if (!val.trim()) { ta.style.borderColor = ''; badge.style.display = 'none'; return; }
      try {
        const p = JSON.parse(val);
        ta.style.borderColor = 'rgba(34,197,94,0.5)';
        const bytes = new TextEncoder().encode(val).length;
        const kb = (bytes/1024).toFixed(1);
        const nodes = _countNodes(p);
        badge.style.display = '';
        badge.innerHTML = `<span style="color:#22c55e">✓ Valid</span> · ${kb} KB · ${nodes} nodes`;
      } catch {
        ta.style.borderColor = 'rgba(239,68,68,0.4)';
        badge.style.display = 'none';
      }
    }

    function _countNodes(v, n=0) {
      n++;
      if (Array.isArray(v)) v.forEach(i => n = _countNodes(i, n));
      else if (v && typeof v === 'object') Object.values(v).forEach(i => n = _countNodes(i, n));
      return n;
    }

    // ── Parse ──────────────────────────────────────────────────────────────────
    function parseAndRender(raw) {
      try {
        self._parsed = JSON.parse(raw);
        $('jv-input').value = JSON.stringify(self._parsed, null, 2);
        updateLineNums();
        validateLive($('jv-input').value);
        $('jv-tabs').style.display = 'flex';
        setActiveTab('tree');
        setStatus('✓ Parsed', true);
      } catch(e) {
        $('jv-tabs').style.display = 'none';
        $('jv-tree-wrap').style.display = 'none';
        setStatus('✗ ' + e.message, false);
      }
    }

    // ── Tree ───────────────────────────────────────────────────────────────────
    function renderTree() {
      self._nodeId = 0;
      const tree = $('jv-tree');
      tree.innerHTML = '';
      tree.appendChild(buildNode(self._parsed, null, null, 0, true, '$'));
      // Apply theme class
      $('jv-tree-wrap').className = 'jv-tree-wrap' + (self._theme === 'light' ? ' jv-light' : '');
    }

    function _matchesSearch(val, key) {
      if (!self._searchQ) return false;
      const q = self._searchQ.toLowerCase();
      if (String(key).toLowerCase().includes(q)) return true;
      if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
      if (typeof val === 'number' && String(val).includes(q)) return true;
      return false;
    }

    function _hasSearchMatch(val) {
      if (!self._searchQ) return true;
      const q = self._searchQ.toLowerCase();
      if (typeof val === 'string') return val.toLowerCase().includes(q);
      if (typeof val === 'number') return String(val).includes(q);
      if (Array.isArray(val)) return val.some(v => _hasSearchMatch(v));
      if (val && typeof val === 'object') return Object.entries(val).some(([k,v]) => k.toLowerCase().includes(q) || _hasSearchMatch(v));
      return false;
    }

    function preview(v) {
      const t = typeOf(v);
      const c = typeColor(t, self._theme);
      if (t === 'object') { const keys = Object.keys(v); return `<span style="color:#4a8080">{${keys.slice(0,3).map(k=>`<span style="color:${typeColor('object',self._theme)}">${k}</span>`).join(', ')}${keys.length>3?'…':''}}</span>`; }
      if (t === 'array')  return `<span style="color:#4a8080">[${v.length} item${v.length!==1?'s':''}]</span>`;
      if (t === 'string') return `<span style="color:${c}">"${String(v).slice(0,50).replace(/</g,'&lt;')}${v.length>50?'…':''}"</span>`;
      return `<span style="color:${c}">${v}</span>`;
    }

    function buildNode(val, key, parentType, depth, isLast, path) {
      const t = typeOf(val);
      const id = 'jvn' + (self._nodeId++);
      const isComplex = t === 'object' || t === 'array';
      const isBookmarked = self._bookmarked.has(path);
      const isCollapsed = self._collapsed.has(id);
      const matchesSelf = _matchesSearch(val, key);
      const hasMatch = self._searchQ ? _hasSearchMatch(val) : true;

      if (self._searchQ && !hasMatch) return document.createDocumentFragment();

      const wrap = document.createElement('div');
      wrap.className = 'jv-node';
      if (depth > 0) wrap.style.paddingLeft = '18px';

      const row = document.createElement('div');
      row.className = 'jv-row' + (matchesSelf ? ' jv-match' : '') + (isBookmarked ? ' jv-bookmarked' : '');
      row.dataset.path = path;

      // Toggle
      const toggle = document.createElement('span');
      toggle.className = isComplex ? 'jv-toggle' : 'jv-toggle-empty';
      if (isComplex) {
        toggle.innerHTML = isCollapsed
          ? `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`
          : `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        toggle.addEventListener('click', e => { e.stopPropagation(); self._collapsed.has(id) ? self._collapsed.delete(id) : self._collapsed.add(id); renderTree(); });
      }
      row.appendChild(toggle);

      // Bookmark btn
      const bm = document.createElement('span');
      bm.className = 'jv-bm-btn' + (isBookmarked ? ' active' : '');
      bm.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this node';
      bm.textContent = '★';
      bm.addEventListener('click', e => { e.stopPropagation(); isBookmarked ? self._bookmarked.delete(path) : self._bookmarked.add(path); renderTree(); });
      row.appendChild(bm);

      // Key
      if (key !== null) {
        const keyEl = document.createElement('span');
        keyEl.className = 'jv-key';
        keyEl.style.color = typeColor('object', self._theme);
        keyEl.textContent = parentType === 'array' ? key : `"${key}"`;
        // JSONPath copy on click
        keyEl.title = `Click to copy path: ${path}`;
        keyEl.style.cursor = 'pointer';
        keyEl.addEventListener('click', e => { e.stopPropagation(); navigator.clipboard.writeText(path); setStatus(`Copied: ${path}`, true); });
        row.appendChild(keyEl);
        const colon = document.createElement('span');
        colon.className = 'jv-colon';
        colon.textContent = ': ';
        row.appendChild(colon);
      }

      if (isComplex && isCollapsed) {
        const prev = document.createElement('span');
        prev.className = 'jv-preview';
        prev.innerHTML = preview(val);
        row.appendChild(prev);
        _addTooltip(row, val, t);
        wrap.appendChild(row);
        return wrap;
      }

      if (isComplex) {
        const open = document.createElement('span');
        open.className = 'jv-bracket';
        open.textContent = t === 'array' ? '[' : '{';
        row.appendChild(open);
        const count = t === 'array' ? val.length : Object.keys(val).length;
        const badge = document.createElement('span');
        badge.className = 'jv-count';
        badge.textContent = count + (t === 'array' ? ' items' : ' keys');
        row.appendChild(badge);
        wrap.appendChild(row);

        const children = document.createElement('div');
        children.className = 'jv-children';
        const entries = t === 'array' ? val.map((v,i)=>[i,v]) : Object.entries(val);
        entries.forEach(([k,v], idx) => {
          const childPath = t === 'array' ? `${path}[${k}]` : `${path}.${k}`;
          children.appendChild(buildNode(v, k, t, depth+1, idx===entries.length-1, childPath));
        });
        wrap.appendChild(children);

        const closeRow = document.createElement('div');
        closeRow.className = 'jv-row jv-close-row';
        if (depth > 0) closeRow.style.paddingLeft = '18px';
        const close = document.createElement('span');
        close.className = 'jv-bracket';
        close.textContent = (t==='array'?']':'}') + (isLast?'':',');
        closeRow.appendChild(close);
        wrap.appendChild(closeRow);
      } else {
        // Edit mode
        if (self._editMode && key !== null) {
          const inp = document.createElement('input');
          inp.className = 'jv-edit-input';
          inp.value = t === 'string' ? val : JSON.stringify(val);
          inp.addEventListener('change', () => {
            try {
              const newVal = t === 'string' ? inp.value : JSON.parse(inp.value);
              _setByPath(self._parsed, path, newVal);
              $('jv-input').value = JSON.stringify(self._parsed, null, 2);
              updateLineNums();
              setStatus('✓ Updated', true);
            } catch { setStatus('✗ Invalid value', false); }
          });
          row.appendChild(inp);
        } else {
          const valEl = document.createElement('span');
          valEl.innerHTML = preview(val) + (isLast ? '' : '<span style="color:#4a8080">,</span>');
          row.appendChild(valEl);
        }
        _addTooltip(row, val, t);
        wrap.appendChild(row);
      }
      return wrap;
    }

    function _setByPath(obj, path, val) {
      const parts = path.replace(/\[(\d+)\]/g,'.$1').split('.').slice(1);
      let cur = obj;
      for (let i = 0; i < parts.length-1; i++) cur = cur[parts[i]];
      cur[parts[parts.length-1]] = val;
    }

    function _addTooltip(row, val, t) {
      row.addEventListener('mouseenter', e => {
        let tip = document.getElementById('jv-tooltip');
        if (!tip) { tip = document.createElement('div'); tip.id = 'jv-tooltip'; tip.className = 'jv-tooltip'; document.body.appendChild(tip); }
        const c = typeColor(t, self._theme);
        const lines = [`<span style="color:#4a8080">type</span>: <span style="color:${c}">${t}</span>`];
        if (t==='string') lines.push(`<span style="color:#4a8080">length</span>: <span style="color:#fdba74">${val.length}</span>`);
        if (t==='array')  lines.push(`<span style="color:#4a8080">items</span>: <span style="color:#fdba74">${val.length}</span>`);
        if (t==='object') lines.push(`<span style="color:#4a8080">keys</span>: <span style="color:#fdba74">${Object.keys(val).length}</span>`);
        if (t==='number') { lines.push(`<span style="color:#4a8080">int?</span>: <span style="color:#a5b4fc">${Number.isInteger(val)}</span>`); }
        if (row.dataset.path) lines.push(`<span style="color:#4a8080">path</span>: <span style="color:#67e8f9">${row.dataset.path}</span>`);
        tip.innerHTML = lines.join('<br>');
        tip.style.display = 'block';
        _posTip(tip, e);
      });
      row.addEventListener('mousemove', e => { const t2 = document.getElementById('jv-tooltip'); if (t2) _posTip(t2, e); });
      row.addEventListener('mouseleave', () => { const t2 = document.getElementById('jv-tooltip'); if (t2) t2.style.display='none'; });
    }

    function _posTip(tip, e) {
      tip.style.left = Math.min(e.clientX+14, window.innerWidth-200)+'px';
      tip.style.top  = Math.min(e.clientY-10,  window.innerHeight-100)+'px';
    }

    // ── JSON Schema Generator ──────────────────────────────────────────────────
    function generateSchema(val, required=true) {
      const t = typeOf(val);
      if (t === 'null')    return { type: 'null' };
      if (t === 'boolean') return { type: 'boolean' };
      if (t === 'number')  return Number.isInteger(val) ? { type: 'integer' } : { type: 'number' };
      if (t === 'string')  return { type: 'string' };
      if (t === 'array') {
        if (!val.length) return { type: 'array', items: {} };
        const itemSchemas = val.map(v => generateSchema(v));
        // Merge if all same type
        const allSame = itemSchemas.every(s => s.type === itemSchemas[0].type);
        return { type: 'array', items: allSame ? itemSchemas[0] : { oneOf: itemSchemas } };
      }
      if (t === 'object') {
        const props = {}, req = [];
        Object.entries(val).forEach(([k,v]) => { props[k] = generateSchema(v); req.push(k); });
        return { type: 'object', properties: props, required: req };
      }
      return {};
    }

    function renderSchema() {
      if (!self._parsed) return;
      const schema = { $schema: 'http://json-schema.org/draft-07/schema#', ...generateSchema(self._parsed) };
      $('jv-schema-out').textContent = JSON.stringify(schema, null, 2);
    }

    // ── Diff ───────────────────────────────────────────────────────────────────
    function runDiff() {
      const aRaw = $('jv-diff-a').value.trim();
      const bRaw = $('jv-diff-b').value.trim();
      const res  = $('jv-diff-result');
      try {
        const a = JSON.parse(aRaw), b = JSON.parse(bRaw);
        const diffs = _diffObjects(a, b, '$');
        if (!diffs.length) { res.innerHTML = `<div class="jv-diff-ok">✓ No differences found</div>`; return; }
        res.innerHTML = `<div class="jv-diff-count">${diffs.length} difference${diffs.length!==1?'s':''}</div>` +
          diffs.map(d => `
            <div class="jv-diff-item jv-diff-${d.type}">
              <span class="jv-diff-type">${d.type.toUpperCase()}</span>
              <span class="jv-diff-path">${d.path}</span>
              ${d.type==='changed' ? `<span class="jv-diff-from">${JSON.stringify(d.from)}</span><span class="jv-diff-arrow">→</span><span class="jv-diff-to">${JSON.stringify(d.to)}</span>` : ''}
              ${d.type==='added'   ? `<span class="jv-diff-to">${JSON.stringify(d.val)}</span>` : ''}
              ${d.type==='removed' ? `<span class="jv-diff-from">${JSON.stringify(d.val)}</span>` : ''}
            </div>`).join('');
      } catch(e) { res.innerHTML = `<span style="color:#ef4444">✗ ${e.message}</span>`; }
    }

    function _diffObjects(a, b, path, diffs=[]) {
      const ta = typeOf(a), tb = typeOf(b);
      if (ta !== tb || (ta !== 'object' && ta !== 'array')) {
        if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push({ type:'changed', path, from:a, to:b });
        return diffs;
      }
      if (ta === 'array') {
        const len = Math.max(a.length, b.length);
        for (let i=0; i<len; i++) {
          if (i >= a.length) diffs.push({ type:'added',   path:`${path}[${i}]`, val:b[i] });
          else if (i >= b.length) diffs.push({ type:'removed', path:`${path}[${i}]`, val:a[i] });
          else _diffObjects(a[i], b[i], `${path}[${i}]`, diffs);
        }
      } else {
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        keys.forEach(k => {
          const p = `${path}.${k}`;
          if (!(k in a)) diffs.push({ type:'added',   path:p, val:b[k] });
          else if (!(k in b)) diffs.push({ type:'removed', path:p, val:a[k] });
          else _diffObjects(a[k], b[k], p, diffs);
        });
      }
      return diffs;
    }

    // ── Sort Keys ──────────────────────────────────────────────────────────────
    function sortKeys(val) {
      if (Array.isArray(val)) return val.map(sortKeys);
      if (val && typeof val === 'object') {
        return Object.keys(val).sort().reduce((o,k) => { o[k]=sortKeys(val[k]); return o; }, {});
      }
      return val;
    }

    // ── Flatten / Unflatten ────────────────────────────────────────────────────
    function flatten(obj, prefix='', res={}) {
      if (Array.isArray(obj)) { obj.forEach((v,i) => flatten(v, `${prefix}[${i}]`, res)); }
      else if (obj && typeof obj === 'object') { Object.entries(obj).forEach(([k,v]) => flatten(v, prefix ? `${prefix}.${k}` : k, res)); }
      else { res[prefix] = obj; }
      return res;
    }

    function unflatten(obj) {
      const res = {};
      Object.entries(obj).forEach(([path, val]) => {
        const parts = path.replace(/\[(\d+)\]/g,'.$1').split('.');
        let cur = res;
        parts.forEach((p, i) => {
          if (i === parts.length-1) { cur[p] = val; }
          else { if (!(p in cur)) cur[p] = isNaN(parts[i+1]) ? {} : []; cur = cur[p]; }
        });
      });
      return res;
    }

    // ── JSON → CSV ─────────────────────────────────────────────────────────────
    function toCSV(data) {
      const arr = Array.isArray(data) ? data : [data];
      if (!arr.length || typeof arr[0] !== 'object') throw new Error('Need array of objects');
      const keys = [...new Set(arr.flatMap(r => Object.keys(r)))];
      const esc = v => { const s = v==null?'':String(v); return s.includes(',')||s.includes('"')||s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s; };
      return [keys.join(','), ...arr.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    function _collectStats(val, depth=0, stats=null) {
      if (!stats) stats = { totalNodes:0, maxDepth:0, nullCount:0, types:{}, depthCounts:{}, keys:{} };
      stats.totalNodes++; stats.maxDepth = Math.max(stats.maxDepth, depth);
      stats.depthCounts[depth] = (stats.depthCounts[depth]||0)+1;
      const t = typeOf(val); stats.types[t] = (stats.types[t]||0)+1;
      if (val===null) stats.nullCount++;
      if (t==='object') Object.entries(val).forEach(([k,v]) => { stats.keys[k]=(stats.keys[k]||0)+1; _collectStats(v,depth+1,stats); });
      else if (t==='array') val.forEach(v => _collectStats(v,depth+1,stats));
      stats.topKeys = Object.entries(stats.keys).sort((a,b)=>b[1]-a[1]);
      return stats;
    }

    function renderStats() {
      if (!self._parsed) return;
      const stats = _collectStats(self._parsed);
      const wrap = $('jv-stats-wrap');
      const typeEntries = Object.entries(stats.types).sort((a,b)=>b[1]-a[1]);
      const total = typeEntries.reduce((s,[,v])=>s+v,0);
      const maxVal = Math.max(...typeEntries.map(([,v])=>v));
      const depthEntries = Object.entries(stats.depthCounts).sort((a,b)=>+a[0]-+b[0]);
      const maxD = Math.max(...Object.values(stats.depthCounts));
      const bytes = new TextEncoder().encode($('jv-input').value).length;

      wrap.innerHTML = `
        <div class="jv-stats-grid">
          ${[[stats.totalNodes,'Total Nodes'],[stats.maxDepth,'Max Depth'],
             [stats.types.string||0,'Strings'],[stats.types.number||0,'Numbers'],
             [(stats.types.object||0)+(stats.types.array||0),'Objects/Arrays'],[stats.nullCount,'Nulls'],
             [(bytes/1024).toFixed(1)+' KB','File Size'],[Object.keys(stats.keys).length,'Unique Keys']
            ].map(([n,l],i)=>`<div class="jv-stat-card" style="animation-delay:${i*0.05}s"><div class="jv-stat-num">${n}</div><div class="jv-stat-label">${l}</div></div>`).join('')}
        </div>
        <div class="jv-graph-section">
          <div class="jv-graph-title">Type Distribution</div>
          <div class="jv-bars">${typeEntries.map(([t,n])=>`
            <div class="jv-bar-row">
              <div class="jv-bar-label" style="color:${typeColor(t,'dark')}">${t}</div>
              <div class="jv-bar-track"><div class="jv-bar-inner" data-pct="${(n/maxVal*100).toFixed(1)}" style="background:${typeColor(t,'dark')};opacity:0.75"></div></div>
              <div class="jv-bar-count">${n}</div>
              <div class="jv-bar-pct">${(n/total*100).toFixed(1)}%</div>
            </div>`).join('')}
          </div>
        </div>
        <div class="jv-graph-section">
          <div class="jv-graph-title">Depth Distribution</div>
          <div class="jv-depth-bars">${depthEntries.map(([d,n])=>`
            <div class="jv-depth-col" title="Depth ${d}: ${n} nodes">
              <div class="jv-depth-fill" data-h="${(n/maxD*80).toFixed(0)}"></div>
              <div class="jv-depth-num">${n}</div>
              <div class="jv-depth-label">d${d}</div>
            </div>`).join('')}
          </div>
        </div>
        ${stats.topKeys.length?`<div class="jv-graph-section">
          <div class="jv-graph-title">Most Common Keys</div>
          <div class="jv-key-list">${stats.topKeys.slice(0,10).map(([k,n])=>`
            <div class="jv-key-row">
              <span class="jv-key-name">"${k}"</span>
              <div class="jv-key-bar-wrap"><div class="jv-key-bar" data-pct="${(n/stats.topKeys[0][1]*100).toFixed(0)}"></div></div>
              <span class="jv-key-count">${n}×</span>
            </div>`).join('')}
          </div>
        </div>`:''}`;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        wrap.querySelectorAll('[data-pct]').forEach(el => el.style.width = el.dataset.pct+'%');
        wrap.querySelectorAll('[data-h]').forEach(el => el.style.height = el.dataset.h+'px');
      }));
    }

    // ── Tab switching ──────────────────────────────────────────────────────────
    function setActiveTab(name) {
      self._activeTab = name;
      container.querySelectorAll('.jv-tab').forEach(t => t.classList.toggle('active', t.dataset.tab===name));
      $('jv-tree-wrap').style.display   = name==='tree'   ? '' : 'none';
      $('jv-diff-wrap').style.display   = name==='diff'   ? '' : 'none';
      $('jv-schema-wrap').style.display = name==='schema' ? '' : 'none';
      $('jv-stats-wrap').style.display  = name==='stats'  ? '' : 'none';
      $('jv-tree-controls').style.display = name==='tree' ? 'flex' : 'none';
      if (name==='tree')   renderTree();
      if (name==='schema') renderSchema();
      if (name==='stats')  renderStats();
    }

    // ── Search ─────────────────────────────────────────────────────────────────
    function updateSearchCount() {
      if (!self._searchQ || !self._parsed) { $('jv-search-count').textContent=''; return; }
      let n=0;
      function count(v,k) {
        if (_matchesSearch(v,k)) n++;
        if (Array.isArray(v)) v.forEach((i,idx)=>count(i,idx));
        else if (v&&typeof v==='object') Object.entries(v).forEach(([k2,v2])=>count(v2,k2));
      }
      count(self._parsed, null);
      $('jv-search-count').textContent = n ? `${n} match${n!==1?'es':''}` : 'no match';
    }

    // ── Collapse all helper ────────────────────────────────────────────────────
    function collectAllIds(v) {
      const t = typeOf(v);
      const id = 'jvn'+(self._nodeId++);
      if (t==='object') { self._collapsed.add(id); Object.values(v).forEach(collectAllIds); }
      else if (t==='array') { self._collapsed.add(id); v.forEach(collectAllIds); }
    }

    // ── Wire up events ─────────────────────────────────────────────────────────
    const ta = $('jv-input');

    ta.addEventListener('input', () => { updateLineNums(); validateLive(ta.value); });
    ta.addEventListener('scroll', () => { $('jv-line-nums').scrollTop = ta.scrollTop; });
    ta.addEventListener('paste', () => setTimeout(() => { const v=ta.value.trim(); if(v.startsWith('{')||v.startsWith('[')) parseAndRender(v); }, 50));

    container.querySelectorAll('.jv-tab').forEach(t => t.addEventListener('click', () => setActiveTab(t.dataset.tab)));

    $('jv-parse').addEventListener('click', () => parseAndRender(ta.value.trim()));
    $('jv-minify').addEventListener('click', () => { try { ta.value=JSON.stringify(JSON.parse(ta.value)); updateLineNums(); setStatus('✓ Minified',true); } catch(e){setStatus('✗ '+e.message,false);} });
    $('jv-copy').addEventListener('click', () => { if(ta.value){navigator.clipboard.writeText(ta.value);setStatus('Copied!',true);} });
    $('jv-clear').addEventListener('click', () => { ta.value=''; ta.style.borderColor=''; $('jv-tabs').style.display='none'; $('jv-tree-wrap').style.display='none'; $('jv-size-badge').style.display='none'; $('jv-status').textContent=''; self._parsed=null; updateLineNums(); });

    $('jv-sort-keys').addEventListener('click', () => { if(!self._parsed){setStatus('Parse first',false);return;} self._parsed=sortKeys(self._parsed); ta.value=JSON.stringify(self._parsed,null,2); updateLineNums(); if(self._activeTab==='tree') renderTree(); setStatus('✓ Keys sorted',true); });
    $('jv-flatten').addEventListener('click', () => { if(!self._parsed){setStatus('Parse first',false);return;} const f=flatten(self._parsed); ta.value=JSON.stringify(f,null,2); updateLineNums(); setStatus('✓ Flattened',true); });
    $('jv-unflatten').addEventListener('click', () => { try { const p=JSON.parse(ta.value); const u=unflatten(p); ta.value=JSON.stringify(u,null,2); updateLineNums(); setStatus('✓ Unflattened',true); } catch(e){setStatus('✗ '+e.message,false);} });
    $('jv-to-csv').addEventListener('click', () => { if(!self._parsed){setStatus('Parse first',false);return;} try { const csv=toCSV(self._parsed); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='data.csv'; a.click(); setStatus('✓ CSV downloaded',true); } catch(e){setStatus('✗ '+e.message,false);} });

    $('jv-expand-all').addEventListener('click', () => { self._collapsed.clear(); renderTree(); });
    $('jv-collapse-all').addEventListener('click', () => { self._nodeId=0; collectAllIds(self._parsed); renderTree(); });
    $('jv-edit-toggle').addEventListener('click', () => { self._editMode=!self._editMode; $('jv-edit-toggle').style.color=self._editMode?'#00c8b4':''; setStatus(self._editMode?'Edit mode ON':'Edit mode OFF',true); if(self._activeTab==='tree') renderTree(); });
    $('jv-theme-toggle').addEventListener('click', () => { self._theme=self._theme==='dark'?'light':'dark'; if(self._activeTab==='tree') renderTree(); });

    $('jv-search').addEventListener('input', e => { self._searchQ=e.target.value; updateSearchCount(); if(self._activeTab==='tree') renderTree(); });
    $('jv-diff-run').addEventListener('click', runDiff);
    $('jv-schema-copy').addEventListener('click', () => { navigator.clipboard.writeText($('jv-schema-out').textContent); setStatus('Schema copied!',true); });

    $('jv-file').addEventListener('change', e => { const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>parseAndRender(ev.target.result); r.readAsText(f); e.target.value=''; });

    updateLineNums();
  }
};
