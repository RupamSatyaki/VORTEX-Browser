const JsonViewerTool = {
  id: 'json-viewer',
  name: 'JSON Viewer',
  desc: 'Upload, explore & visualize JSON with collapsible tree',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="12" y2="17"/>
  </svg>`,

  _collapsed: new Set(),
  _parsed: null,
  _nodeId: 0,

  render(container) {
    this._collapsed = new Set();
    this._parsed = null;
    this._nodeId = 0;
    const self = this;

    container.innerHTML = `
      <div class="jv-wrap">
        <!-- Input area -->
        <div class="jv-input-section">
          <textarea class="dh-textarea jv-textarea" id="jv-input"
            placeholder='Paste JSON here…&#10;&#10;{"name":"Vortex","version":"2.1.0"}'
            spellcheck="false"></textarea>
          <div class="jv-input-actions">
            <button class="dh-btn primary" id="jv-parse">Parse</button>
            <button class="dh-btn" id="jv-minify">Minify</button>
            <button class="dh-btn" id="jv-copy">Copy</button>
            <label class="dh-btn jv-upload-label" title="Upload JSON file">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload .json
              <input type="file" id="jv-file" accept=".json,application/json" style="display:none"/>
            </label>
            <button class="dh-btn danger" id="jv-clear">Clear</button>
            <span class="dh-status" id="jv-status"></span>
          </div>
        </div>

        <!-- Tabs: Tree / Stats -->
        <div class="jv-tabs" id="jv-tabs" style="display:none">
          <button class="jv-tab active" data-tab="tree">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Tree
          </button>
          <button class="jv-tab" data-tab="stats">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            Stats & Graph
          </button>
          <div class="jv-tab-actions">
            <button class="dh-btn jv-sm-btn" id="jv-expand-all" title="Expand all">⊞ All</button>
            <button class="dh-btn jv-sm-btn" id="jv-collapse-all" title="Collapse all">⊟ All</button>
          </div>
        </div>

        <!-- Tree view -->
        <div class="jv-tree-wrap" id="jv-tree-wrap" style="display:none">
          <div class="jv-tree" id="jv-tree"></div>
        </div>

        <!-- Stats view -->
        <div class="jv-stats-wrap" id="jv-stats-wrap" style="display:none"></div>
      </div>`;

    // ── Helpers ────────────────────────────────────────────────────────────────
    const $ = id => container.querySelector('#' + id);

    function setStatus(msg, ok) {
      const el = $('jv-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
    }

    // ── Parse & render ─────────────────────────────────────────────────────────
    function parseAndRender(raw) {
      try {
        self._parsed = JSON.parse(raw);
        $('jv-input').value = JSON.stringify(self._parsed, null, 2);
        $('jv-tabs').style.display = 'flex';
        $('jv-tree-wrap').style.display = '';
        $('jv-stats-wrap').style.display = 'none';
        setActiveTab('tree');
        renderTree();
        setStatus('✓ Valid JSON', true);
      } catch(e) {
        $('jv-tree-wrap').style.display = 'none';
        $('jv-tabs').style.display = 'none';
        setStatus('✗ ' + e.message, false);
      }
    }

    // ── Tree builder ───────────────────────────────────────────────────────────
    function renderTree() {
      self._nodeId = 0;
      $('jv-tree').innerHTML = '';
      $('jv-tree').appendChild(buildNode(self._parsed, null, null, 0, true));
    }

    function typeOf(v) {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v;
    }

    function typeColor(t) {
      return { string:'#a3e635', number:'#fb923c', boolean:'#818cf8',
               null:'#6b7280', object:'#00c8b4', array:'#38bdf8' }[t] || '#c8e8e5';
    }

    function preview(v) {
      const t = typeOf(v);
      if (t === 'object') {
        const keys = Object.keys(v);
        return `<span style="color:#4a8080">{${keys.slice(0,3).map(k=>`<span style="color:#00c8b4">${k}</span>`).join(', ')}${keys.length>3?'…':''}}</span>`;
      }
      if (t === 'array') return `<span style="color:#4a8080">[${v.length} item${v.length!==1?'s':''}]</span>`;
      if (t === 'string') return `<span style="color:#a3e635">"${String(v).slice(0,40).replace(/</g,'&lt;')}${v.length>40?'…':''}"</span>`;
      if (t === 'number') return `<span style="color:#fb923c">${v}</span>`;
      if (t === 'boolean') return `<span style="color:#818cf8">${v}</span>`;
      return `<span style="color:#6b7280">null</span>`;
    }

    function buildNode(val, key, parentType, depth, isLast) {
      const t = typeOf(val);
      const id = 'jvn' + (self._nodeId++);
      const isComplex = t === 'object' || t === 'array';
      const wrap = document.createElement('div');
      wrap.className = 'jv-node';
      wrap.style.paddingLeft = depth > 0 ? '18px' : '0';

      const row = document.createElement('div');
      row.className = 'jv-row';
      row.dataset.id = id;

      // Expand toggle
      const toggle = document.createElement('span');
      toggle.className = 'jv-toggle';
      if (isComplex) {
        const isCol = self._collapsed.has(id);
        toggle.innerHTML = isCol
          ? `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`
          : `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        toggle.style.cursor = 'pointer';
        toggle.addEventListener('click', e => {
          e.stopPropagation();
          if (self._collapsed.has(id)) self._collapsed.delete(id);
          else self._collapsed.add(id);
          renderTree();
        });
      }
      row.appendChild(toggle);

      // Key label
      if (key !== null) {
        const keyEl = document.createElement('span');
        keyEl.className = 'jv-key';
        keyEl.textContent = parentType === 'array' ? key : `"${key}"`;
        row.appendChild(keyEl);
        const colon = document.createElement('span');
        colon.className = 'jv-colon';
        colon.textContent = ': ';
        row.appendChild(colon);
      }

      if (isComplex && self._collapsed.has(id)) {
        // Collapsed preview
        const prev = document.createElement('span');
        prev.className = 'jv-preview';
        prev.innerHTML = preview(val);
        row.appendChild(prev);
        // Hover tooltip
        _addTooltip(row, val, t);
        wrap.appendChild(row);
        return wrap;
      }

      if (isComplex) {
        // Opening bracket
        const open = document.createElement('span');
        open.className = 'jv-bracket';
        open.textContent = t === 'array' ? '[' : '{';
        row.appendChild(open);

        // Count badge
        const count = t === 'array' ? val.length : Object.keys(val).length;
        const badge = document.createElement('span');
        badge.className = 'jv-count';
        badge.textContent = count + (t === 'array' ? ' items' : ' keys');
        row.appendChild(badge);

        wrap.appendChild(row);

        // Children
        const children = document.createElement('div');
        children.className = 'jv-children';
        const entries = t === 'array'
          ? val.map((v, i) => [i, v])
          : Object.entries(val);
        entries.forEach(([k, v], idx) => {
          children.appendChild(buildNode(v, k, t, depth + 1, idx === entries.length - 1));
        });
        wrap.appendChild(children);

        // Closing bracket
        const closeRow = document.createElement('div');
        closeRow.className = 'jv-row jv-close-row';
        closeRow.style.paddingLeft = depth > 0 ? '18px' : '0';
        const close = document.createElement('span');
        close.className = 'jv-bracket';
        close.textContent = (t === 'array' ? ']' : '}') + (isLast ? '' : ',');
        closeRow.appendChild(close);
        wrap.appendChild(closeRow);
      } else {
        // Primitive
        const valEl = document.createElement('span');
        valEl.innerHTML = preview(val) + (isLast ? '' : '<span style="color:#4a8080">,</span>');
        row.appendChild(valEl);
        _addTooltip(row, val, t);
        wrap.appendChild(row);
      }

      return wrap;
    }

    function _addTooltip(row, val, t) {
      row.addEventListener('mouseenter', e => {
        let tip = document.getElementById('jv-tooltip');
        if (!tip) {
          tip = document.createElement('div');
          tip.id = 'jv-tooltip';
          tip.className = 'jv-tooltip';
          document.body.appendChild(tip);
        }
        const lines = [
          `<span style="color:#4a8080">type</span>: <span style="color:${typeColor(t)}">${t}</span>`,
        ];
        if (t === 'string') lines.push(`<span style="color:#4a8080">length</span>: <span style="color:#fb923c">${val.length}</span>`);
        if (t === 'array') lines.push(`<span style="color:#4a8080">items</span>: <span style="color:#fb923c">${val.length}</span>`);
        if (t === 'object') lines.push(`<span style="color:#4a8080">keys</span>: <span style="color:#fb923c">${Object.keys(val).length}</span>`);
        if (t === 'number') {
          lines.push(`<span style="color:#4a8080">int?</span>: <span style="color:#818cf8">${Number.isInteger(val)}</span>`);
          lines.push(`<span style="color:#4a8080">value</span>: <span style="color:#fb923c">${val}</span>`);
        }
        tip.innerHTML = lines.join('<br>');
        tip.style.display = 'block';
        _positionTip(tip, e);
      });
      row.addEventListener('mousemove', e => {
        const tip = document.getElementById('jv-tooltip');
        if (tip) _positionTip(tip, e);
      });
      row.addEventListener('mouseleave', () => {
        const tip = document.getElementById('jv-tooltip');
        if (tip) tip.style.display = 'none';
      });
    }

    function _positionTip(tip, e) {
      const x = e.clientX + 14, y = e.clientY - 10;
      tip.style.left = Math.min(x, window.innerWidth - 180) + 'px';
      tip.style.top  = Math.min(y, window.innerHeight - 80) + 'px';
    }

    // ── Stats & Graph ──────────────────────────────────────────────────────────
    function renderStats() {
      if (!self._parsed) return;
      const stats = _collectStats(self._parsed);
      const wrap = $('jv-stats-wrap');

      const typeEntries = Object.entries(stats.types).sort((a,b) => b[1]-a[1]);
      const total = typeEntries.reduce((s,[,v])=>s+v, 0);
      const maxVal = Math.max(...typeEntries.map(([,v])=>v));
      const depthEntries = Object.entries(stats.depthCounts).sort((a,b)=>+a[0]-+b[0]);
      const maxD = Math.max(...Object.values(stats.depthCounts));

      wrap.innerHTML = `
        <div class="jv-stats-grid">
          ${[
            [stats.totalNodes, 'Total Nodes'],
            [stats.maxDepth,   'Max Depth'],
            [stats.types.string||0, 'Strings'],
            [stats.types.number||0, 'Numbers'],
            [(stats.types.object||0)+(stats.types.array||0), 'Objects/Arrays'],
            [stats.nullCount, 'Nulls'],
          ].map(([n,l],i) => `
            <div class="jv-stat-card" style="animation-delay:${i*0.06}s">
              <div class="jv-stat-num">${n}</div>
              <div class="jv-stat-label">${l}</div>
            </div>`).join('')}
        </div>

        <div class="jv-graph-section">
          <div class="jv-graph-title">Type Distribution</div>
          <div class="jv-bars">
            ${typeEntries.map(([t, n]) => `
              <div class="jv-bar-row">
                <div class="jv-bar-label" style="color:${typeColor(t)}">${t}</div>
                <div class="jv-bar-track">
                  <div class="jv-bar-inner" data-pct="${(n/maxVal*100).toFixed(1)}"
                       style="background:${typeColor(t)};opacity:0.75;"></div>
                </div>
                <div class="jv-bar-count">${n}</div>
                <div class="jv-bar-pct">${(n/total*100).toFixed(1)}%</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="jv-graph-section">
          <div class="jv-graph-title">Depth Distribution</div>
          <div class="jv-depth-bars">
            ${depthEntries.map(([d,n]) => `
              <div class="jv-depth-col" title="Depth ${d}: ${n} nodes">
                <div class="jv-depth-fill" data-h="${(n/maxD*80).toFixed(0)}"></div>
                <div class="jv-depth-num">${n}</div>
                <div class="jv-depth-label">d${d}</div>
              </div>`).join('')}
          </div>
        </div>

        ${stats.topKeys.length ? `
        <div class="jv-graph-section">
          <div class="jv-graph-title">Most Common Keys</div>
          <div class="jv-key-list">
            ${stats.topKeys.slice(0,10).map(([k,n]) => `
              <div class="jv-key-row">
                <span class="jv-key-name">"${k}"</span>
                <div class="jv-key-bar-wrap">
                  <div class="jv-key-bar" data-pct="${(n/stats.topKeys[0][1]*100).toFixed(0)}"></div>
                </div>
                <span class="jv-key-count">${n}×</span>
              </div>`).join('')}
          </div>
        </div>` : ''}
      `;

      // Animate bars after paint — start from 0, then set target width
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrap.querySelectorAll('.jv-bar-inner[data-pct]').forEach(el => {
            el.style.width = el.dataset.pct + '%';
          });
          wrap.querySelectorAll('.jv-depth-fill[data-h]').forEach(el => {
            el.style.height = el.dataset.h + 'px';
          });
          wrap.querySelectorAll('.jv-key-bar[data-pct]').forEach(el => {
            el.style.width = el.dataset.pct + '%';
          });
        });
      });
    }

    function _collectStats(val, depth = 0, stats = null) {
      if (!stats) stats = { totalNodes:0, maxDepth:0, nullCount:0, types:{}, depthCounts:{}, keys:{} };
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      stats.depthCounts[depth] = (stats.depthCounts[depth]||0) + 1;
      const t = typeOf(val);
      stats.types[t] = (stats.types[t]||0) + 1;
      if (val === null) stats.nullCount++;
      if (t === 'object') {
        Object.entries(val).forEach(([k,v]) => {
          stats.keys[k] = (stats.keys[k]||0) + 1;
          _collectStats(v, depth+1, stats);
        });
      } else if (t === 'array') {
        val.forEach(v => _collectStats(v, depth+1, stats));
      }
      if (!stats.topKeys) stats.topKeys = Object.entries(stats.keys).sort((a,b)=>b[1]-a[1]);
      return stats;
    }

    // ── Tab switching ──────────────────────────────────────────────────────────
    function setActiveTab(name) {
      container.querySelectorAll('.jv-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
      $('jv-tree-wrap').style.display  = name === 'tree'  ? '' : 'none';
      $('jv-stats-wrap').style.display = name === 'stats' ? '' : 'none';
      const tabActions = container.querySelector('.jv-tab-actions');
      if (tabActions) tabActions.style.display = name === 'tree' ? 'flex' : 'none';
      if (name === 'stats') renderStats();
    }

    container.querySelectorAll('.jv-tab').forEach(tab => {
      tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
    });

    // ── Expand / Collapse all ──────────────────────────────────────────────────
    $('jv-expand-all').addEventListener('click', () => {
      self._collapsed.clear(); renderTree();
    });
    $('jv-collapse-all').addEventListener('click', () => {
      // Collect all node ids by re-traversing
      self._nodeId = 0;
      function collectIds(v) {
        const t = typeOf(v);
        const id = 'jvn' + (self._nodeId++);
        if (t === 'object') { self._collapsed.add(id); Object.values(v).forEach(collectIds); }
        else if (t === 'array') { self._collapsed.add(id); v.forEach(collectIds); }
      }
      collectIds(self._parsed);
      renderTree();
    });

    // ── Actions ────────────────────────────────────────────────────────────────
    $('jv-parse').addEventListener('click', () => {
      parseAndRender($('jv-input').value.trim());
    });
    $('jv-minify').addEventListener('click', () => {
      try {
        const p = JSON.parse($('jv-input').value.trim());
        $('jv-input').value = JSON.stringify(p);
        setStatus('✓ Minified', true);
      } catch(e) { setStatus('✗ ' + e.message, false); }
    });
    $('jv-copy').addEventListener('click', () => {
      const v = $('jv-input').value;
      if (v) { navigator.clipboard.writeText(v); setStatus('Copied!', true); setTimeout(()=>setStatus('',true),1500); }
    });
    $('jv-clear').addEventListener('click', () => {
      $('jv-input').value = '';
      $('jv-tree').innerHTML = '';
      $('jv-tabs').style.display = 'none';
      $('jv-tree-wrap').style.display = 'none';
      $('jv-stats-wrap').style.display = 'none';
      $('jv-status').textContent = '';
      self._parsed = null;
    });

    // File upload
    $('jv-file').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => parseAndRender(ev.target.result);
      reader.readAsText(file);
      e.target.value = '';
    });

    // Auto-parse on paste
    $('jv-input').addEventListener('paste', () => {
      setTimeout(() => {
        const v = $('jv-input').value.trim();
        if (v.startsWith('{') || v.startsWith('[')) parseAndRender(v);
      }, 50);
    });
  }
};
