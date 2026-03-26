/**
 * regex-tester.js — Full-featured Regex Tester
 * Features: live highlight, replace, named groups, match table, pattern library,
 *           explainer, multi-line, split, code gen, test cases, saved patterns,
 *           all flags (g/i/m/s/u/y), char class helper
 */
const RegexTesterTool = {
  id: 'regex-tester',
  name: 'Regex Tester',
  desc: 'Live match · Replace · Explainer · Code Gen · Library · 12 features',
  icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,

  _saved: [],
  _testCases: [],
  _history: [],
  _navIdx: 0,

  // ── Common pattern library ─────────────────────────────────────────────────
  _library: [
    { name:'Email',        pat:'^[\\w.+-]+@[\\w-]+\\.[\\w.]+$',          flags:'i' },
    { name:'URL',          pat:'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+', flags:'gi' },
    { name:'IPv4',         pat:'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',       flags:'g' },
    { name:'IPv6',         pat:'([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}',       flags:'gi' },
    { name:'Phone (IN)',   pat:'[6-9]\\d{9}',                             flags:'g' },
    { name:'Phone (US)',   pat:'\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags:'g' },
    { name:'Date (YYYY-MM-DD)', pat:'\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags:'g' },
    { name:'Date (DD/MM/YYYY)', pat:'(?:0[1-9]|[12]\\d|3[01])\\/(?:0[1-9]|1[0-2])\\/\\d{4}', flags:'g' },
    { name:'Time (HH:MM)', pat:'(?:[01]\\d|2[0-3]):[0-5]\\d',            flags:'g' },
    { name:'UUID',         pat:'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags:'gi' },
    { name:'Hex Color',    pat:'#(?:[0-9a-f]{3}){1,2}\\b',               flags:'gi' },
    { name:'Credit Card',  pat:'\\b(?:\\d{4}[\\s-]?){3}\\d{4}\\b',       flags:'g' },
    { name:'Postal (IN)',  pat:'[1-9][0-9]{5}',                           flags:'g' },
    { name:'HTML Tag',     pat:'<([a-z][a-z0-9]*)(?:[^>]*)>',            flags:'gi' },
    { name:'JSON Key',     pat:'"([^"]+)"\\s*:',                          flags:'g' },
    { name:'Slug',         pat:'^[a-z0-9]+(?:-[a-z0-9]+)*$',             flags:'i' },
    { name:'Username',     pat:'^[a-zA-Z0-9_]{3,20}$',                   flags:'' },
    { name:'Password (strong)', pat:'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags:'' },
    { name:'Whitespace',   pat:'\\s+',                                    flags:'g' },
    { name:'Numbers only', pat:'^\\d+$',                                  flags:'' },
    { name:'Decimal',      pat:'-?\\d+\\.\\d+',                           flags:'g' },
    { name:'Word boundary','pat':'\\b\\w+\\b',                            flags:'g' },
  ],

  // ── Char class helpers ─────────────────────────────────────────────────────
  _chars: [
    { label:'\\d', title:'Digit [0-9]' },
    { label:'\\D', title:'Non-digit' },
    { label:'\\w', title:'Word char [a-zA-Z0-9_]' },
    { label:'\\W', title:'Non-word' },
    { label:'\\s', title:'Whitespace' },
    { label:'\\S', title:'Non-whitespace' },
    { label:'\\b', title:'Word boundary' },
    { label:'\\B', title:'Non-boundary' },
    { label:'^',   title:'Start of string/line' },
    { label:'$',   title:'End of string/line' },
    { label:'.',   title:'Any char except newline' },
    { label:'.*',  title:'Greedy any' },
    { label:'.+',  title:'One or more any' },
    { label:'.?',  title:'Zero or one any' },
    { label:'(?:)', title:'Non-capturing group' },
    { label:'(?=)', title:'Positive lookahead' },
    { label:'(?!)', title:'Negative lookahead' },
    { label:'(?<=)', title:'Positive lookbehind' },
    { label:'(?<!)', title:'Negative lookbehind' },
    { label:'(?<name>)', title:'Named capture group' },
  ],

  render(container) {
    this._saved = JSON.parse(localStorage.getItem('vx_rx_saved') || '[]');
    this._testCases = [];
    this._history = [];
    this._navIdx = 0;
    const self = this;

    container.innerHTML = `<div class="rx-wrap">

      <!-- Pattern row -->
      <div class="rx-pattern-row">
        <span class="rx-slash">/</span>
        <input class="dh-input rx-pattern-input" id="rx-pattern" type="text" placeholder="pattern" spellcheck="false" autocomplete="off"/>
        <span class="rx-slash">/</span>
        <div class="rx-flags-row">
          <label class="rx-flag" title="Global — find all matches"><input type="checkbox" id="rx-g" checked>g</label>
          <label class="rx-flag" title="Case insensitive"><input type="checkbox" id="rx-i">i</label>
          <label class="rx-flag" title="Multiline — ^ and $ match line boundaries"><input type="checkbox" id="rx-m">m</label>
          <label class="rx-flag" title="Dot-all — . matches newline too"><input type="checkbox" id="rx-s">s</label>
          <label class="rx-flag" title="Unicode — full Unicode support"><input type="checkbox" id="rx-u">u</label>
          <label class="rx-flag" title="Sticky — match from lastIndex only"><input type="checkbox" id="rx-y">y</label>
        </div>
      </div>

      <!-- Status + char helpers -->
      <div class="rx-status-row">
        <span class="dh-status" id="rx-status"></span>
        <span class="rx-match-count" id="rx-match-count"></span>
      </div>

      <!-- Char class helper buttons -->
      <div class="rx-char-helpers" id="rx-char-helpers"></div>

      <!-- Tabs -->
      <div class="rx-tabs">
        <button class="rx-tab active" data-tab="test">Test</button>
        <button class="rx-tab" data-tab="nav">Navigator</button>
        <button class="rx-tab" data-tab="replace">Replace</button>
        <button class="rx-tab" data-tab="split">Split</button>
        <button class="rx-tab" data-tab="multiline">Multi-line</button>
        <button class="rx-tab" data-tab="table">Table</button>
        <button class="rx-tab" data-tab="cases">Cases</button>
        <button class="rx-tab" data-tab="codegen">Code</button>
        <button class="rx-tab" data-tab="explain">Explain</button>
        <button class="rx-tab" data-tab="visual">Visual</button>
        <button class="rx-tab" data-tab="bench">Bench</button>
        <button class="rx-tab" data-tab="library">Library</button>
        <button class="rx-tab" data-tab="saved">Saved</button>
        <button class="rx-tab" data-tab="history">History</button>
        <button class="rx-tab" data-tab="share">Share</button>
        <button class="rx-tab" data-tab="escape">Escape</button>
        <button class="rx-tab" data-tab="quant">Quant</button>
        <button class="rx-tab" data-tab="unicode">Unicode</button>
      </div>

      <!-- Test tab -->
      <div class="rx-tab-content" id="rx-tab-test">
        <textarea class="dh-textarea rx-textarea" id="rx-input" placeholder="Enter test string here…" spellcheck="false"></textarea>
        <div class="dh-output rx-highlighted" id="rx-highlighted"></div>
        <div class="rx-groups" id="rx-groups"></div>
      </div>

      <!-- Replace tab -->
      <div class="rx-tab-content" id="rx-tab-replace" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-rep-input" placeholder="Test string…" spellcheck="false"></textarea>
        <div class="rx-rep-row">
          <input class="dh-input" id="rx-rep-str" type="text" placeholder="Replacement ($1, $2, $&, $\`, $' supported)" style="flex:1;" spellcheck="false"/>
          <button class="dh-btn primary" id="rx-rep-run">Replace</button>
          <button class="dh-btn" id="rx-rep-copy">Copy</button>
        </div>
        <div class="dh-output" id="rx-rep-out" style="min-height:60px;white-space:pre-wrap;"></div>
      </div>

      <!-- Split tab -->
      <div class="rx-tab-content" id="rx-tab-split" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-split-input" placeholder="String to split…" spellcheck="false"></textarea>
        <button class="dh-btn primary" id="rx-split-run" style="margin-top:6px">Split</button>
        <div id="rx-split-out" style="margin-top:8px;display:flex;flex-direction:column;gap:4px;"></div>
      </div>

      <!-- Multi-line tab -->
      <div class="rx-tab-content" id="rx-tab-multiline" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-ml-input" placeholder="One test per line…" spellcheck="false" style="min-height:100px;"></textarea>
        <button class="dh-btn primary" id="rx-ml-run" style="margin-top:6px">Test All Lines</button>
        <div id="rx-ml-out" style="margin-top:8px;display:flex;flex-direction:column;gap:3px;"></div>
      </div>

      <!-- Match Table tab -->
      <div class="rx-tab-content" id="rx-tab-table" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-tbl-input" placeholder="Test string…" spellcheck="false"></textarea>
        <button class="dh-btn primary" id="rx-tbl-run" style="margin-top:6px">Build Table</button>
        <div id="rx-tbl-out" style="margin-top:8px;overflow-x:auto;"></div>
      </div>

      <!-- Test Cases tab -->
      <div class="rx-tab-content" id="rx-tab-cases" style="display:none">
        <div class="rx-cases-add">
          <input class="dh-input" id="rx-case-input" type="text" placeholder="Test string…" style="flex:1;" spellcheck="false"/>
          <select class="dh-input" id="rx-case-expect" style="width:90px;font-size:11.5px;">
            <option value="match">Should match</option>
            <option value="nomatch">Should NOT match</option>
          </select>
          <button class="dh-btn primary" id="rx-case-add">Add</button>
        </div>
        <button class="dh-btn" id="rx-cases-run" style="margin-top:6px">Run All</button>
        <div id="rx-cases-list" style="margin-top:8px;display:flex;flex-direction:column;gap:4px;"></div>
      </div>

      <!-- Code Gen tab -->
      <div class="rx-tab-content" id="rx-tab-codegen" style="display:none">
        <div class="rx-codegen-langs">
          <button class="rx-lang-btn active" data-lang="js">JavaScript</button>
          <button class="rx-lang-btn" data-lang="py">Python</button>
          <button class="rx-lang-btn" data-lang="java">Java</button>
          <button class="rx-lang-btn" data-lang="go">Go</button>
          <button class="rx-lang-btn" data-lang="php">PHP</button>
          <button class="rx-lang-btn" data-lang="rust">Rust</button>
        </div>
        <pre class="rx-code-out" id="rx-code-out"></pre>
        <button class="dh-btn" id="rx-code-copy" style="margin-top:6px">Copy Code</button>
      </div>

      <!-- Explainer tab -->
      <div class="rx-tab-content" id="rx-tab-explain" style="display:none">
        <div id="rx-explain-out" class="rx-explain-out"></div>
      </div>

      <!-- Library tab -->
      <div class="rx-tab-content" id="rx-tab-library" style="display:none">
        <input class="dh-input" id="rx-lib-search" type="text" placeholder="Search patterns…" style="width:100%;margin-bottom:8px;" spellcheck="false"/>
        <div id="rx-lib-list" class="rx-lib-list"></div>
      </div>

      <!-- Saved tab -->
      <div class="rx-tab-content" id="rx-tab-saved" style="display:none">
        <div class="rx-saved-add-row">
          <input class="dh-input" id="rx-save-name" type="text" placeholder="Pattern name…" style="flex:1;" maxlength="30"/>
          <button class="dh-btn primary" id="rx-save-btn">Save Current</button>
          <button class="dh-btn" id="rx-export-btn" title="Export all saved patterns">↓ Export</button>
          <label class="dh-btn" title="Import patterns from JSON" style="cursor:pointer">↑ Import<input type="file" id="rx-import-file" accept=".json" style="display:none"/></label>
        </div>
        <div id="rx-saved-list" style="margin-top:8px;display:flex;flex-direction:column;gap:4px;"></div>
      </div>

      <!-- Visualizer tab -->
      <div class="rx-tab-content" id="rx-tab-visual" style="display:none">
        <div id="rx-visual-out" class="rx-visual-out"></div>
      </div>

      <!-- Navigator tab -->
      <div class="rx-tab-content" id="rx-tab-nav" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-nav-input" placeholder="Test string…" spellcheck="false"></textarea>
        <div class="rx-nav-controls">
          <button class="dh-btn" id="rx-nav-prev">← Prev</button>
          <span class="rx-nav-info" id="rx-nav-info">—</span>
          <button class="dh-btn" id="rx-nav-next">Next →</button>
          <button class="dh-btn" id="rx-nav-copy-match" title="Copy current match">Copy</button>
        </div>
        <div class="dh-output rx-nav-display" id="rx-nav-display" style="white-space:pre-wrap;font-family:monospace;font-size:12px;"></div>
        <div class="rx-nav-detail" id="rx-nav-detail"></div>
      </div>

      <!-- Benchmark tab -->
      <div class="rx-tab-content" id="rx-tab-bench" style="display:none">
        <textarea class="dh-textarea rx-textarea" id="rx-bench-input" placeholder="Test string for benchmark…" spellcheck="false"></textarea>
        <div class="rx-bench-controls">
          <div class="rx-bench-field">
            <label>Iterations</label>
            <select class="dh-input" id="rx-bench-iter" style="font-size:11.5px;padding:5px 8px;">
              <option value="1000">1,000</option>
              <option value="10000" selected>10,000</option>
              <option value="100000">100,000</option>
              <option value="1000000">1,000,000</option>
            </select>
          </div>
          <button class="dh-btn primary" id="rx-bench-run">▶ Run Benchmark</button>
        </div>
        <div id="rx-bench-out" class="rx-bench-out"></div>
      </div>

      <!-- History tab -->
      <div class="rx-tab-content" id="rx-tab-history" style="display:none">
        <div class="rx-history-header">
          <span style="font-size:11px;color:#4a8080">Last 20 patterns (session)</span>
          <button class="dh-btn jv-sm-btn danger" id="rx-history-clear">Clear</button>
        </div>
        <div id="rx-history-list" style="margin-top:8px;display:flex;flex-direction:column;gap:4px;"></div>
      </div>

      <!-- Share tab -->
      <div class="rx-tab-content" id="rx-tab-share" style="display:none">
        <div class="rx-share-preview" id="rx-share-preview"></div>
        <div class="rx-share-actions">
          <button class="dh-btn primary" id="rx-share-copy">Copy Share Link</button>
          <button class="dh-btn" id="rx-share-copy-json">Copy as JSON</button>
        </div>
        <div class="rx-share-import-row">
          <input class="dh-input" id="rx-share-import-inp" type="text" placeholder="Paste share link to import…" style="flex:1;" spellcheck="false"/>
          <button class="dh-btn" id="rx-share-import-btn">Import</button>
        </div>
      </div>

      <!-- Escape Helper tab -->
      <div class="rx-tab-content" id="rx-tab-escape" style="display:none">
        <label style="font-size:11px;color:#4a8080;margin-bottom:4px;display:block;">Paste a raw string to escape for use in regex</label>
        <textarea class="dh-textarea rx-textarea" id="rx-esc-input" placeholder="e.g. https://example.com/path?q=1&r=2" spellcheck="false" style="min-height:60px;"></textarea>
        <div class="rx-esc-actions">
          <button class="dh-btn primary" id="rx-esc-run">Escape</button>
          <button class="dh-btn" id="rx-esc-copy">Copy</button>
          <button class="dh-btn" id="rx-esc-load">Load into Pattern</button>
        </div>
        <div class="dh-output" id="rx-esc-out" style="font-family:monospace;font-size:12.5px;min-height:36px;word-break:break-all;"></div>
        <div class="rx-esc-chars">
          <div style="font-size:10px;color:#2e6060;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Characters that get escaped</div>
          <div class="rx-esc-char-list" id="rx-esc-char-list"></div>
        </div>
      </div>

      <!-- Quantifier Helper tab -->
      <div class="rx-tab-content" id="rx-tab-quant" style="display:none">
        <div class="rx-quant-grid">
          <div class="rx-quant-card" data-q="*"><div class="rx-quant-sym">*</div><div class="rx-quant-name">Zero or more</div><div class="rx-quant-ex">a* → "", "a", "aaa"</div></div>
          <div class="rx-quant-card" data-q="+"><div class="rx-quant-sym">+</div><div class="rx-quant-name">One or more</div><div class="rx-quant-ex">a+ → "a", "aaa"</div></div>
          <div class="rx-quant-card" data-q="?"><div class="rx-quant-sym">?</div><div class="rx-quant-name">Zero or one</div><div class="rx-quant-ex">a? → "", "a"</div></div>
          <div class="rx-quant-card" data-q="*?"><div class="rx-quant-sym">*?</div><div class="rx-quant-name">Lazy zero+</div><div class="rx-quant-ex">a*? → minimal match</div></div>
          <div class="rx-quant-card" data-q="+?"><div class="rx-quant-sym">+?</div><div class="rx-quant-name">Lazy one+</div><div class="rx-quant-ex">a+? → minimal match</div></div>
        </div>
        <div class="rx-quant-custom">
          <div class="rx-quant-custom-label">Custom quantifier</div>
          <div class="rx-quant-custom-row">
            <input class="dh-input rx-quant-num" id="rx-q-min" type="number" min="0" placeholder="min" />
            <span style="color:#4a8080">to</span>
            <input class="dh-input rx-quant-num" id="rx-q-max" type="number" min="0" placeholder="max (blank=∞)" />
            <label class="rx-flag"><input type="checkbox" id="rx-q-lazy"> lazy</label>
            <button class="dh-btn primary" id="rx-q-insert">Insert</button>
          </div>
          <div class="rx-quant-preview" id="rx-q-preview"></div>
        </div>
      </div>

      <!-- Unicode tab -->
      <div class="rx-tab-content" id="rx-tab-unicode" style="display:none">
        <div style="font-size:11px;color:#4a8080;margin-bottom:8px;">Unicode property escapes — requires <code style="color:#00c8b4">u</code> flag</div>
        <div class="rx-unicode-grid" id="rx-unicode-grid"></div>
      </div>

    </div>`;

    const $ = id => container.querySelector('#' + id);

    // ── Helpers ────────────────────────────────────────────────────────────────
    function getFlags() {
      return ['g','i','m','s','u','y'].filter(f => {
        const el = $('rx-'+f); return el && el.checked;
      }).join('');
    }

    function getPat() { return $('rx-pattern').value; }

    function buildRe(pat, flags) {
      try { return new RegExp(pat, flags); } catch { return null; }
    }

    function setStatus(msg, ok) {
      const el=$('rx-status');
      el.textContent = msg;
      el.style.color = ok ? '#22c55e' : '#ef4444';
    }

    function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    // ── Char helpers ───────────────────────────────────────────────────────────
    const helpersEl = $('rx-char-helpers');
    self._chars.forEach(({label, title}) => {
      const btn = document.createElement('button');
      btn.className = 'rx-char-btn';
      btn.textContent = label;
      btn.title = title;
      btn.addEventListener('click', () => {
        const inp = $('rx-pattern');
        const pos = inp.selectionStart;
        const val = inp.value;
        inp.value = val.slice(0, pos) + label + val.slice(inp.selectionEnd);
        inp.setSelectionRange(pos + label.length, pos + label.length);
        inp.focus();
        runTest();
      });
      helpersEl.appendChild(btn);
    });

    // ── Test tab ───────────────────────────────────────────────────────────────
    function runTest() {
      const pat = getPat(), text = $('rx-input').value, flags = getFlags();
      const hiEl = $('rx-highlighted'), grpEl = $('rx-groups'), countEl = $('rx-match-count');
      hiEl.innerHTML = ''; grpEl.innerHTML = ''; countEl.textContent = '';

      if (!pat) { hiEl.textContent = text; setStatus('', true); return; }

      const re = buildRe(pat, flags.includes('g') ? flags : flags + 'g');
      if (!re) { setStatus('✗ Invalid regex', false); hiEl.textContent = text; return; }
      setStatus('✓ Valid', true);

      const matches = [...text.matchAll(re)];
      countEl.textContent = matches.length
        ? `${matches.length} match${matches.length !== 1 ? 'es' : ''}`
        : 'no matches';

      // Highlight
      let last = 0, html = '';
      matches.forEach((m, mi) => {
        html += escHtml(text.slice(last, m.index));
        html += `<mark class="rx-mark" title="Match ${mi+1}: index ${m.index}">${escHtml(m[0])}</mark>`;
        last = m.index + m[0].length;
      });
      html += escHtml(text.slice(last));
      hiEl.innerHTML = html || `<span style="color:#2e6060">No matches</span>`;

      // Named + numbered groups
      if (matches.length) {
        const first = matches[0];
        let groupHtml = '';
        if (first.groups) {
          groupHtml += '<div class="rx-group-section">Named Groups (match 1)</div>';
          Object.entries(first.groups).forEach(([k,v]) => {
            groupHtml += `<div class="rx-group-row"><span class="rx-group-idx">?&lt;${k}&gt;</span><span class="rx-group-val">${v ?? '<em>undefined</em>'}</span></div>`;
          });
        }
        if (first.length > 1) {
          groupHtml += '<div class="rx-group-section">Capture Groups (match 1)</div>';
          first.slice(1).forEach((g, i) => {
            groupHtml += `<div class="rx-group-row"><span class="rx-group-idx">$${i+1}</span><span class="rx-group-val">${g ?? '<em>undefined</em>'}</span></div>`;
          });
        }
        grpEl.innerHTML = groupHtml;
      }
    }

    // ── Replace tab ────────────────────────────────────────────────────────────
    function runReplace() {
      const pat = getPat(), flags = getFlags();
      const text = $('rx-rep-input').value;
      const rep  = $('rx-rep-str').value;
      const out  = $('rx-rep-out');
      if (!pat) { out.textContent = text; return; }
      const re = buildRe(pat, flags.includes('g') ? flags : flags + 'g');
      if (!re) { out.textContent = '✗ Invalid regex'; return; }
      try { out.textContent = text.replace(re, rep); }
      catch(e) { out.textContent = '✗ ' + e.message; }
    }

    // ── Split tab ──────────────────────────────────────────────────────────────
    function runSplit() {
      const pat = getPat(), flags = getFlags();
      const text = $('rx-split-input').value;
      const out  = $('rx-split-out');
      if (!pat || !text) { out.innerHTML=''; return; }
      const re = buildRe(pat, flags);
      if (!re) { out.innerHTML='<span style="color:#ef4444">✗ Invalid regex</span>'; return; }
      const parts = text.split(re).filter(p => p !== undefined);
      out.innerHTML = parts.map((p, i) =>
        `<div class="rx-split-item"><span class="rx-split-idx">${i}</span><span class="rx-split-val">${escHtml(p)}</span></div>`
      ).join('') + `<div style="font-size:10.5px;color:#4a8080;margin-top:4px">${parts.length} part${parts.length!==1?'s':''}</div>`;
    }

    // ── Multi-line tab ─────────────────────────────────────────────────────────
    function runMultiline() {
      const pat = getPat(), flags = getFlags();
      const lines = $('rx-ml-input').value.split('\n');
      const out   = $('rx-ml-out');
      if (!pat) { out.innerHTML=''; return; }
      const re = buildRe(pat, flags.includes('g') ? flags : flags + 'g');
      if (!re) { out.innerHTML='<span style="color:#ef4444">✗ Invalid regex</span>'; return; }
      out.innerHTML = lines.map((line, i) => {
        const matches = [...line.matchAll(new RegExp(pat, flags.includes('g')?flags:flags+'g'))];
        const ok = matches.length > 0;
        return `<div class="rx-ml-row ${ok?'rx-ml-pass':'rx-ml-fail'}">
          <span class="rx-ml-badge">${ok?'✓':'✗'}</span>
          <span class="rx-ml-line">${escHtml(line)||'<em>(empty)</em>'}</span>
          <span class="rx-ml-cnt">${ok?matches.length+' match':'no match'}</span>
        </div>`;
      }).join('');
    }

    // ── Match Table tab ────────────────────────────────────────────────────────
    function runTable() {
      const pat = getPat(), flags = getFlags();
      const text = $('rx-tbl-input').value;
      const out  = $('rx-tbl-out');
      if (!pat || !text) { out.innerHTML=''; return; }
      const re = buildRe(pat, flags.includes('g') ? flags : flags + 'g');
      if (!re) { out.innerHTML='<span style="color:#ef4444">✗ Invalid regex</span>'; return; }
      const matches = [...text.matchAll(re)];
      if (!matches.length) { out.innerHTML='<span style="color:#4a8080">No matches</span>'; return; }

      const hasGroups = matches[0].length > 1;
      const hasNamed  = !!matches[0].groups;
      const groupNames = hasNamed ? Object.keys(matches[0].groups) : [];

      let html = `<table class="rx-table">
        <thead><tr>
          <th>#</th><th>Match</th><th>Index</th><th>Length</th><th>Line</th>
          ${hasGroups ? matches[0].slice(1).map((_,i)=>`<th>$${i+1}</th>`).join('') : ''}
          ${groupNames.map(n=>`<th>&lt;${n}&gt;</th>`).join('')}
        </tr></thead><tbody>`;

      // Build line index
      const lineStarts = [0];
      for (let i=0; i<text.length; i++) if (text[i]==='\n') lineStarts.push(i+1);
      function lineOf(idx) { let l=0; for(let i=0;i<lineStarts.length;i++){if(lineStarts[i]>idx)break;l=i+1;} return l; }

      matches.forEach((m, i) => {
        html += `<tr>
          <td>${i+1}</td>
          <td><code>${escHtml(m[0])}</code></td>
          <td>${m.index}</td>
          <td>${m[0].length}</td>
          <td>${lineOf(m.index)}</td>
          ${hasGroups ? m.slice(1).map(g=>`<td>${g!=null?escHtml(String(g)):'<em>—</em>'}</td>`).join('') : ''}
          ${groupNames.map(n=>`<td>${m.groups[n]!=null?escHtml(String(m.groups[n])):'<em>—</em>'}</td>`).join('')}
        </tr>`;
      });
      html += '</tbody></table>';
      out.innerHTML = html;
    }

    // ── Test Cases tab ─────────────────────────────────────────────────────────
    function renderCases() {
      const list = $('rx-cases-list');
      list.innerHTML = self._testCases.map((tc, i) =>
        `<div class="rx-case-row" id="rx-case-${i}">
          <span class="rx-case-expect ${tc.expect==='match'?'rx-case-green':'rx-case-red'}">${tc.expect==='match'?'MATCH':'NO MATCH'}</span>
          <span class="rx-case-val">${escHtml(tc.input)}</span>
          <span class="rx-case-result" id="rx-cr-${i}"></span>
          <button class="dh-btn jv-sm-btn rx-case-del" data-i="${i}">✕</button>
        </div>`
      ).join('');
      list.querySelectorAll('.rx-case-del').forEach(btn => {
        btn.addEventListener('click', e => {
          self._testCases.splice(+e.target.dataset.i, 1);
          renderCases();
        });
      });
    }

    function runCases() {
      const pat = getPat(), flags = getFlags();
      const re = buildRe(pat, flags.includes('g') ? flags : flags + 'g');
      self._testCases.forEach((tc, i) => {
        const el = document.getElementById('rx-cr-'+i);
        if (!el) return;
        if (!re) { el.textContent='✗ invalid'; el.style.color='#ef4444'; return; }
        const matched = re.test(tc.input);
        re.lastIndex = 0;
        const pass = tc.expect==='match' ? matched : !matched;
        el.textContent = pass ? '✓ PASS' : '✗ FAIL';
        el.style.color = pass ? '#22c55e' : '#ef4444';
      });
    }

    // ── Code Gen tab ───────────────────────────────────────────────────────────
    let _activeLang = 'js';
    function renderCode() {
      const pat = getPat(), flags = getFlags();
      const out = $('rx-code-out');
      const esc = pat.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"');
      const codes = {
        js:   `// JavaScript\nconst re = /${pat}/${flags};\nconst str = "your string here";\n\n// Test\nconsole.log(re.test(str));\n\n// Find all matches\nconst matches = [...str.matchAll(/${pat}/${flags.includes('g')?flags:flags+'g'})];\nconsole.log(matches);`,
        py:   `# Python\nimport re\n\npattern = r'${esc}'\nflags = ${flags.includes('i')?'re.IGNORECASE':'0'}${flags.includes('m')?' | re.MULTILINE':''}\n\n# Test\nif re.search(pattern, "your string", flags):\n    print("Match found")\n\n# Find all\nmatches = re.findall(pattern, "your string", flags)\nprint(matches)`,
        java: `// Java\nimport java.util.regex.*;\n\nString pattern = "${esc}";\nString input = "your string here";\n\nPattern p = Pattern.compile(pattern${flags.includes('i')?', Pattern.CASE_INSENSITIVE':''});\nMatcher m = p.matcher(input);\n\nwhile (m.find()) {\n    System.out.println("Match: " + m.group() + " at " + m.start());\n}`,
        go:   `// Go\nimport "regexp"\n\nre := regexp.MustCompile(\`(?${flags})${esc}\`)\nmatches := re.FindAllString("your string", -1)\nfmt.Println(matches)`,
        php:  `<?php\n// PHP\n$pattern = '/${esc}/${flags}';\n$subject = "your string here";\n\nif (preg_match($pattern, $subject)) {\n    echo "Match found\\n";\n}\n\npreg_match_all($pattern, $subject, $matches);\nprint_r($matches[0]);`,
        rust: `// Rust\nuse regex::Regex;\n\nlet re = Regex::new(r"${esc}").unwrap();\nlet text = "your string here";\n\nfor cap in re.captures_iter(text) {\n    println!("Match: {}", &cap[0]);\n}`,
      };
      out.textContent = codes[_activeLang] || '';
    }

    // ── Explainer tab ──────────────────────────────────────────────────────────
    function explainRegex(pat) {
      const rules = [
        [/^\^/,           'Matches the START of the string/line'],
        [/\$$/,           'Matches the END of the string/line'],
        [/\\d/g,          '\\d — matches any digit [0-9]'],
        [/\\D/g,          '\\D — matches any NON-digit'],
        [/\\w/g,          '\\w — matches word character [a-zA-Z0-9_]'],
        [/\\W/g,          '\\W — matches NON-word character'],
        [/\\s/g,          '\\s — matches whitespace (space, tab, newline)'],
        [/\\S/g,          '\\S — matches NON-whitespace'],
        [/\\b/g,          '\\b — word boundary (between \\w and \\W)'],
        [/\\B/g,          '\\B — NOT a word boundary'],
        [/\\\./g,         '\\. — literal dot character'],
        [/\./,            '. — matches ANY character except newline'],
        [/\*/,            '* — zero or more of the preceding'],
        [/\+/,            '+ — one or more of the preceding'],
        [/\?(?!=)/,       '? — zero or one of the preceding (optional)'],
        [/\{(\d+),(\d+)\}/g, '{n,m} — between n and m repetitions'],
        [/\{(\d+)\}/g,    '{n} — exactly n repetitions'],
        [/\[([^\]]+)\]/g, '[...] — character class, matches any listed char'],
        [/\[^\^([^\]]+)\]/g,'[^...] — negated class, matches any NOT listed'],
        [/\((?!\?)/,      '(...) — capturing group'],
        [/\(\?:/,         '(?:...) — non-capturing group'],
        [/\(\?=/,         '(?=...) — positive lookahead'],
        [/\(\?!/,         '(?!...) — negative lookahead'],
        [/\(\?<=/,        '(?<=...) — positive lookbehind'],
        [/\(\?<!/,        '(?<!...) — negative lookbehind'],
        [/\(\?<(\w+)>/,   '(?<name>...) — named capture group'],
        [/\|/,            '| — alternation (OR)'],
        [/\\n/g,          '\\n — newline character'],
        [/\\t/g,          '\\t — tab character'],
        [/\\r/g,          '\\r — carriage return'],
        [/https?/,        'https? — matches "http" or "https" (s is optional)'],
      ];

      const found = [];
      rules.forEach(([re, desc]) => {
        if (typeof re === 'object' && re.test(pat)) found.push(desc);
      });

      // Token-by-token breakdown
      const tokens = [];
      let i = 0;
      while (i < pat.length) {
        const ch = pat[i];
        if (ch === '\\' && i+1 < pat.length) {
          tokens.push({ tok: ch+pat[i+1], desc: _tokenDesc(ch+pat[i+1]) });
          i += 2;
        } else if (ch === '(' ) {
          const ahead = pat.slice(i);
          const m = ahead.match(/^\(\?<(\w+)>/) || ahead.match(/^\(\?[:=!]/) || ahead.match(/^\(\?<[=!]/);
          const tok = m ? m[0] : '(';
          tokens.push({ tok, desc: _tokenDesc(tok) });
          i += tok.length;
        } else if (ch === '[') {
          const end = pat.indexOf(']', i);
          const tok = end>-1 ? pat.slice(i, end+1) : ch;
          tokens.push({ tok, desc: `Character class: matches any of ${tok}` });
          i += tok.length;
        } else if (ch === '{') {
          const end = pat.indexOf('}', i);
          const tok = end>-1 ? pat.slice(i, end+1) : ch;
          tokens.push({ tok, desc: _tokenDesc(tok) });
          i += tok.length;
        } else {
          tokens.push({ tok: ch, desc: _tokenDesc(ch) });
          i++;
        }
      }

      const out = $('rx-explain-out');
      if (!pat) { out.innerHTML='<span style="color:#4a8080">Enter a pattern to explain</span>'; return; }

      out.innerHTML = `
        <div class="rx-explain-tokens">
          ${tokens.map(t=>`<div class="rx-explain-token">
            <code class="rx-explain-tok">${escHtml(t.tok)}</code>
            <span class="rx-explain-desc">${t.desc}</span>
          </div>`).join('')}
        </div>
        ${found.length ? `<div class="rx-explain-summary">
          <div class="rx-explain-sum-title">Pattern Summary</div>
          ${found.map(f=>`<div class="rx-explain-sum-item">• ${f}</div>`).join('')}
        </div>` : ''}`;
    }

    function _tokenDesc(tok) {
      const map = {
        '\\d':'digit [0-9]','\\D':'non-digit','\\w':'word char','\\W':'non-word char',
        '\\s':'whitespace','\\S':'non-whitespace','\\b':'word boundary','\\B':'non-boundary',
        '\\n':'newline','\\t':'tab','\\r':'carriage return','\\0':'null char',
        '\\.':'literal dot','\\(':'literal (','\\)':'literal )','\\[':'literal [',
        '\\]':'literal ]','\\{':'literal {','\\}':'literal }','\\*':'literal *',
        '\\+':'literal +','\\?':'literal ?','\\^':'literal ^','\\$':'literal $',
        '\\|':'literal |','\\\\':'literal backslash',
        '.':'any char except newline','*':'0 or more','+'  :'1 or more',
        '?':'0 or 1 (optional)','^':'start of string','$':'end of string',
        '|':'OR (alternation)','(':'start capture group',')':'end group',
        '(?:':'non-capturing group','(?=':'positive lookahead','(?!':'negative lookahead',
        '(?<=':'positive lookbehind','(?<!':'negative lookbehind',
      };
      if (map[tok]) return map[tok];
      if (/^\{(\d+),(\d+)\}$/.test(tok)) { const [,a,b]=tok.match(/\{(\d+),(\d+)\}/); return `between ${a} and ${b} repetitions`; }
      if (/^\{(\d+)\}$/.test(tok)) { const [,n]=tok.match(/\{(\d+)\}/); return `exactly ${n} repetitions`; }
      if (/^\(\?<(\w+)>$/.test(tok)) { const [,n]=tok.match(/\(\?<(\w+)>/); return `named capture group "${n}"`; }
      if (/^[a-zA-Z0-9]$/.test(tok)) return `literal character "${tok}"`;
      return `"${tok}"`;
    }

    // ── Library tab ────────────────────────────────────────────────────────────
    function renderLibrary(q) {
      const list = $('rx-lib-list');
      const items = self._library.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
      list.innerHTML = items.map(p => `
        <div class="rx-lib-item">
          <div class="rx-lib-name">${p.name}</div>
          <code class="rx-lib-pat">/${escHtml(p.pat)}/${p.flags}</code>
          <button class="dh-btn jv-sm-btn rx-lib-load" data-pat="${escHtml(p.pat)}" data-flags="${p.flags}">Load</button>
        </div>`).join('');
      list.querySelectorAll('.rx-lib-load').forEach(btn => {
        btn.addEventListener('click', e => {
          $('rx-pattern').value = e.target.dataset.pat;
          ['g','i','m','s','u','y'].forEach(f => {
            const el=$('rx-'+f); if(el) el.checked=e.target.dataset.flags.includes(f);
          });
          // Switch to test tab
          switchTab('test');
          runTest();
        });
      });
    }

    // ── Saved tab ──────────────────────────────────────────────────────────────
    function renderSaved() {
      const list = $('rx-saved-list');
      if (!self._saved.length) { list.innerHTML='<span style="font-size:11px;color:#4a8080">No saved patterns</span>'; return; }
      list.innerHTML = self._saved.map((s, i) => `
        <div class="rx-lib-item">
          <div class="rx-lib-name">${escHtml(s.name)}</div>
          <code class="rx-lib-pat">/${escHtml(s.pat)}/${s.flags}</code>
          <button class="dh-btn jv-sm-btn rx-sv-load" data-i="${i}">Load</button>
          <button class="dh-btn jv-sm-btn danger rx-sv-del" data-i="${i}">✕</button>
        </div>`).join('');
      list.querySelectorAll('.rx-sv-load').forEach(btn => {
        btn.addEventListener('click', e => {
          const s = self._saved[+e.target.dataset.i];
          $('rx-pattern').value = s.pat;
          ['g','i','m','s','u','y'].forEach(f => { const el=$('rx-'+f); if(el) el.checked=s.flags.includes(f); });
          switchTab('test'); runTest();
        });
      });
      list.querySelectorAll('.rx-sv-del').forEach(btn => {
        btn.addEventListener('click', e => {
          self._saved.splice(+e.target.dataset.i, 1);
          localStorage.setItem('vx_rx_saved', JSON.stringify(self._saved));
          renderSaved();
        });
      });
    }

    // ── Tab switching ──────────────────────────────────────────────────────────
    function switchTab(name) {
      container.querySelectorAll('.rx-tab').forEach(t => t.classList.toggle('active', t.dataset.tab===name));
      container.querySelectorAll('.rx-tab-content').forEach(c => c.style.display='none');
      $('rx-tab-'+name).style.display='';
      if (name==='explain')  explainRegex(getPat());
      if (name==='codegen')  renderCode();
      if (name==='library')  renderLibrary('');
      if (name==='saved')    renderSaved();
      if (name==='visual')   renderVisual();
      if (name==='nav')      initNav();
      if (name==='history')  renderHistoryTab();
      if (name==='share')    renderShare();
      if (name==='escape')   initEscape();
      if (name==='quant')    initQuant();
      if (name==='unicode')  renderUnicode();
    }

    container.querySelectorAll('.rx-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // ── Code gen lang buttons ──────────────────────────────────────────────────
    container.querySelectorAll('.rx-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.rx-lang-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        _activeLang = btn.dataset.lang;
        renderCode();
      });
    });

    // ── Wire up all events ─────────────────────────────────────────────────────
    $('rx-pattern').addEventListener('input', () => {
      runTest();
      const pat = getPat();
      // Track history
      if (pat && (self._history.length === 0 || self._history[0] !== pat)) {
        self._history.unshift(pat);
        if (self._history.length > 20) self._history.pop();
      }
      const activeTab = container.querySelector('.rx-tab.active')?.dataset.tab;
      if (activeTab==='explain') explainRegex(pat);
      if (activeTab==='codegen') renderCode();
      if (activeTab==='visual')  renderVisual();
    });
    $('rx-input').addEventListener('input', runTest);
    container.querySelectorAll('.rx-flag input').forEach(cb => cb.addEventListener('change', runTest));

    $('rx-rep-run').addEventListener('click', runReplace);
    $('rx-rep-input').addEventListener('input', runReplace);
    $('rx-rep-str').addEventListener('input', runReplace);
    $('rx-rep-copy').addEventListener('click', () => {
      navigator.clipboard.writeText($('rx-rep-out').textContent);
    });

    $('rx-split-run').addEventListener('click', runSplit);
    $('rx-ml-run').addEventListener('click', runMultiline);
    $('rx-tbl-run').addEventListener('click', runTable);
    $('rx-cases-run').addEventListener('click', runCases);
    $('rx-code-copy').addEventListener('click', () => navigator.clipboard.writeText($('rx-code-out').textContent));

    $('rx-case-add').addEventListener('click', () => {
      const val = $('rx-case-input').value.trim();
      if (!val) return;
      self._testCases.push({ input: val, expect: $('rx-case-expect').value });
      $('rx-case-input').value = '';
      renderCases();
    });
    $('rx-case-input').addEventListener('keydown', e => { if(e.key==='Enter') $('rx-case-add').click(); });

    $('rx-lib-search').addEventListener('input', e => renderLibrary(e.target.value));

    $('rx-save-btn').addEventListener('click', () => {
      const name = $('rx-save-name').value.trim() || 'Pattern '+(self._saved.length+1);
      const pat = getPat(), flags = getFlags();
      if (!pat) return;
      self._saved.unshift({ name, pat, flags });
      localStorage.setItem('vx_rx_saved', JSON.stringify(self._saved));
      $('rx-save-name').value = '';
      renderSaved();
    });

    // Export saved patterns
    $('rx-export-btn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(self._saved, null, 2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'regex-patterns.json'; a.click();
    });

    // Import saved patterns
    $('rx-import-file').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            self._saved = [...imported, ...self._saved].slice(0, 100);
            localStorage.setItem('vx_rx_saved', JSON.stringify(self._saved));
            renderSaved();
          }
        } catch { /* ignore */ }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // ── Visualizer ─────────────────────────────────────────────────────────────
    function renderVisual() {
      const pat = getPat();
      const out = $('rx-visual-out');
      if (!pat) { out.innerHTML = '<span style="color:#4a8080">Enter a pattern to visualize</span>'; return; }

      // Tokenize pattern into visual nodes
      const nodes = [];
      let i = 0;
      while (i < pat.length) {
        const ch = pat[i];
        if (ch === '\\' && i+1 < pat.length) {
          nodes.push({ type:'escape', val: ch+pat[i+1] }); i+=2;
        } else if (ch === '(') {
          const ahead = pat.slice(i);
          const m = ahead.match(/^\(\?<(\w+)>/) || ahead.match(/^\(\?[:=!<]/) ;
          const tok = m ? m[0] : '(';
          const t = tok==='(' ? 'group' : tok.startsWith('(?<') && !tok.startsWith('(?<=') && !tok.startsWith('(?<!') ? 'named' : 'special';
          nodes.push({ type:t, val:tok }); i+=tok.length;
        } else if (ch === ')') {
          nodes.push({ type:'group-end', val:')' }); i++;
        } else if (ch === '[') {
          const end = pat.indexOf(']', i);
          const tok = end>-1 ? pat.slice(i, end+1) : ch;
          nodes.push({ type:'class', val:tok }); i+=tok.length;
        } else if (ch === '{') {
          const end = pat.indexOf('}', i);
          const tok = end>-1 ? pat.slice(i, end+1) : ch;
          nodes.push({ type:'quant', val:tok }); i+=tok.length;
        } else if ('*+?'.includes(ch)) {
          const lazy = pat[i+1]==='?' ? '?' : '';
          nodes.push({ type:'quant', val:ch+lazy }); i+=1+lazy.length;
        } else if (ch === '|') {
          nodes.push({ type:'alt', val:'|' }); i++;
        } else if (ch === '^' || ch === '$') {
          nodes.push({ type:'anchor', val:ch }); i++;
        } else if (ch === '.') {
          nodes.push({ type:'any', val:'.' }); i++;
        } else {
          nodes.push({ type:'literal', val:ch }); i++;
        }
      }

      const colors = {
        literal:'#c8e8e5', escape:'#00c8b4', group:'#38bdf8', named:'#a78bfa',
        'group-end':'#38bdf8', special:'#67e8f9', class:'#86efac', quant:'#fdba74',
        alt:'#f472b6', anchor:'#fb923c', any:'#a5b4fc',
      };
      const labels = {
        literal:'char', escape:'escape', group:'group', named:'named group',
        'group-end':'end', special:'special', class:'class', quant:'quantifier',
        alt:'OR', anchor:'anchor', any:'any char',
      };

      out.innerHTML = `
        <div class="rx-visual-flow">
          <div class="rx-visual-start">START</div>
          <div class="rx-visual-arrow">→</div>
          ${nodes.map(n => `
            <div class="rx-visual-node rx-vn-${n.type}" style="border-color:${colors[n.type]}22;background:${colors[n.type]}11" title="${labels[n.type]||n.type}">
              <div class="rx-vn-val" style="color:${colors[n.type]}">${escHtml(n.val)}</div>
              <div class="rx-vn-type">${labels[n.type]||n.type}</div>
            </div>
            <div class="rx-visual-arrow">→</div>`).join('')}
          <div class="rx-visual-end">END</div>
        </div>
        <div class="rx-visual-legend">
          ${Object.entries(colors).map(([t,c])=>`<span class="rx-vl-item" style="border-color:${c}44;color:${c}">${labels[t]||t}</span>`).join('')}
        </div>`;
    }

    // ── Navigator ──────────────────────────────────────────────────────────────
    function initNav() {
      const text = $('rx-nav-input').value;
      _renderNav(text);
    }

    function _renderNav(text) {
      const pat = getPat(), flags = getFlags();
      const infoEl = $('rx-nav-info'), dispEl = $('rx-nav-display'), detEl = $('rx-nav-detail');
      if (!pat || !text) { infoEl.textContent='—'; dispEl.innerHTML=''; detEl.innerHTML=''; return; }
      const re = buildRe(pat, flags.includes('g') ? flags : flags+'g');
      if (!re) { infoEl.textContent='invalid'; return; }
      const matches = [...text.matchAll(re)];
      if (!matches.length) { infoEl.textContent='no matches'; dispEl.textContent=text; detEl.innerHTML=''; return; }
      self._navIdx = Math.max(0, Math.min(self._navIdx, matches.length-1));
      const m = matches[self._navIdx];
      infoEl.textContent = `${self._navIdx+1} / ${matches.length}`;

      // Highlight current match
      let html = escHtml(text.slice(0, m.index));
      html += `<mark class="rx-mark rx-nav-current">${escHtml(m[0])}</mark>`;
      html += escHtml(text.slice(m.index + m[0].length));
      dispEl.innerHTML = html;

      // Detail
      detEl.innerHTML = `
        <div class="rx-nav-detail-row"><span class="rx-nav-dk">Match</span><code class="rx-nav-dv">${escHtml(m[0])}</code></div>
        <div class="rx-nav-detail-row"><span class="rx-nav-dk">Index</span><code class="rx-nav-dv">${m.index}</code></div>
        <div class="rx-nav-detail-row"><span class="rx-nav-dk">Length</span><code class="rx-nav-dv">${m[0].length}</code></div>
        ${m.length>1 ? m.slice(1).map((g,i)=>`<div class="rx-nav-detail-row"><span class="rx-nav-dk">$${i+1}</span><code class="rx-nav-dv">${g??'—'}</code></div>`).join('') : ''}
        ${m.groups ? Object.entries(m.groups).map(([k,v])=>`<div class="rx-nav-detail-row"><span class="rx-nav-dk">&lt;${k}&gt;</span><code class="rx-nav-dv">${v??'—'}</code></div>`).join('') : ''}`;
    }

    $('rx-nav-input').addEventListener('input', () => { self._navIdx=0; _renderNav($('rx-nav-input').value); });
    $('rx-nav-prev').addEventListener('click', () => { self._navIdx = Math.max(0, self._navIdx-1); _renderNav($('rx-nav-input').value); });
    $('rx-nav-next').addEventListener('click', () => {
      const pat=getPat(), flags=getFlags(), text=$('rx-nav-input').value;
      const re=buildRe(pat,flags.includes('g')?flags:flags+'g');
      if(!re) return;
      const n=[...text.matchAll(re)].length;
      self._navIdx=Math.min(n-1,self._navIdx+1);
      _renderNav(text);
    });
    $('rx-nav-copy-match').addEventListener('click', () => {
      const pat=getPat(), flags=getFlags(), text=$('rx-nav-input').value;
      const re=buildRe(pat,flags.includes('g')?flags:flags+'g');
      if(!re) return;
      const matches=[...text.matchAll(re)];
      if(matches[self._navIdx]) navigator.clipboard.writeText(matches[self._navIdx][0]);
    });

    // ── Benchmark ──────────────────────────────────────────────────────────────
    $('rx-bench-run').addEventListener('click', () => {
      const pat=getPat(), flags=getFlags(), text=$('rx-bench-input').value;
      const iter=+$('rx-bench-iter').value;
      const out=$('rx-bench-out');
      if(!pat||!text){out.innerHTML='<span style="color:#4a8080">Enter pattern and test string</span>';return;}
      const re=buildRe(pat,flags);
      if(!re){out.innerHTML='<span style="color:#ef4444">✗ Invalid regex</span>';return;}

      out.innerHTML='<span style="color:#4a8080">Running…</span>';
      setTimeout(()=>{
        const t0=performance.now();
        let matchCount=0;
        for(let i=0;i<iter;i++){
          const r=new RegExp(pat,flags);
          const m=text.match(r);
          if(m) matchCount++;
        }
        const elapsed=performance.now()-t0;
        const perOp=(elapsed/iter*1000).toFixed(2);
        const opsPerSec=Math.round(iter/elapsed*1000);
        const slow=elapsed>500;
        out.innerHTML=`
          <div class="rx-bench-result">
            <div class="rx-bench-stat"><div class="rx-bench-num">${elapsed.toFixed(1)}<span class="rx-bench-unit">ms</span></div><div class="rx-bench-label">Total time</div></div>
            <div class="rx-bench-stat"><div class="rx-bench-num">${perOp}<span class="rx-bench-unit">µs</span></div><div class="rx-bench-label">Per operation</div></div>
            <div class="rx-bench-stat"><div class="rx-bench-num">${opsPerSec.toLocaleString()}</div><div class="rx-bench-label">Ops/second</div></div>
            <div class="rx-bench-stat"><div class="rx-bench-num">${iter.toLocaleString()}</div><div class="rx-bench-label">Iterations</div></div>
          </div>
          ${slow?`<div class="rx-bench-warn">⚠ Slow regex detected — possible catastrophic backtracking. Check for nested quantifiers like <code>(a+)+</code></div>`:'<div class="rx-bench-ok">✓ Performance looks good</div>'}`;
      }, 10);
    });

    // ── History tab ────────────────────────────────────────────────────────────
    function renderHistoryTab() {
      const list=$('rx-history-list');
      if(!self._history.length){list.innerHTML='<span style="font-size:11px;color:#4a8080">No history yet — start typing patterns</span>';return;}
      list.innerHTML=self._history.map((p,i)=>`
        <div class="rx-lib-item">
          <code class="rx-lib-pat" style="flex:1">/${escHtml(p)}/</code>
          <button class="dh-btn jv-sm-btn rx-hist-load" data-i="${i}">Load</button>
        </div>`).join('');
      list.querySelectorAll('.rx-hist-load').forEach(btn=>{
        btn.addEventListener('click',e=>{
          $('rx-pattern').value=self._history[+e.target.dataset.i];
          switchTab('test'); runTest();
        });
      });
    }
    $('rx-history-clear').addEventListener('click',()=>{self._history=[];renderHistoryTab();});

    // ── Share tab ──────────────────────────────────────────────────────────────
    function renderShare() {
      const pat=getPat(), flags=getFlags();
      const data={pat,flags,test:$('rx-input').value||''};
      const encoded=btoa(encodeURIComponent(JSON.stringify(data)));
      const link=`vortex://devhub/regex?v=${encoded}`;
      $('rx-share-preview').innerHTML=`
        <div class="rx-share-card">
          <div class="rx-share-row"><span class="rx-share-k">Pattern</span><code class="rx-share-v">/${escHtml(pat)||'(empty)'}/${flags}</code></div>
          <div class="rx-share-row"><span class="rx-share-k">Test</span><code class="rx-share-v">${escHtml(data.test.slice(0,60))||'(none)'}</code></div>
          <div class="rx-share-row"><span class="rx-share-k">Link</span><code class="rx-share-v rx-share-link">${link.slice(0,60)}…</code></div>
        </div>`;
      $('rx-share-copy').onclick=()=>{ navigator.clipboard.writeText(link); };
      $('rx-share-copy-json').onclick=()=>{ navigator.clipboard.writeText(JSON.stringify(data,null,2)); };
    }
    $('rx-share-import-btn').addEventListener('click',()=>{
      const raw=$('rx-share-import-inp').value.trim();
      try {
        const encoded=raw.includes('?v=') ? raw.split('?v=')[1] : raw;
        const data=JSON.parse(decodeURIComponent(atob(encoded)));
        if(data.pat) $('rx-pattern').value=data.pat;
        if(data.flags) ['g','i','m','s','u','y'].forEach(f=>{const el=$('rx-'+f);if(el)el.checked=data.flags.includes(f);});
        if(data.test) $('rx-input').value=data.test;
        switchTab('test'); runTest();
      } catch { /* ignore bad input */ }
    });

    // ── Escape Helper ──────────────────────────────────────────────────────────
    function initEscape() {
      const SPECIAL = /[.*+?^${}()|[\]\\]/g;
      const charList=$('rx-esc-char-list');
      charList.innerHTML=['.','*','+','?','^','$','{','}','(',')',')','[',']','\\','|'].map(c=>
        `<code class="rx-esc-char">${escHtml(c)}</code>`).join('');

      function doEscape() {
        const raw=$('rx-esc-input').value;
        const escaped=raw.replace(SPECIAL,'\\$&');
        $('rx-esc-out').textContent=escaped;
      }
      $('rx-esc-input').addEventListener('input',doEscape);
      $('rx-esc-run').addEventListener('click',doEscape);
      $('rx-esc-copy').addEventListener('click',()=>navigator.clipboard.writeText($('rx-esc-out').textContent));
      $('rx-esc-load').addEventListener('click',()=>{
        const v=$('rx-esc-out').textContent;
        if(v){$('rx-pattern').value=v;switchTab('test');runTest();}
      });
    }

    // ── Quantifier Helper ──────────────────────────────────────────────────────
    function initQuant() {
      container.querySelectorAll('.rx-quant-card').forEach(card=>{
        card.addEventListener('click',()=>{
          const q=card.dataset.q;
          const inp=$('rx-pattern');
          const pos=inp.selectionStart;
          inp.value=inp.value.slice(0,pos)+q+inp.value.slice(inp.selectionEnd);
          inp.setSelectionRange(pos+q.length,pos+q.length);
          inp.focus(); runTest();
        });
      });
      function updateQuantPreview() {
        const min=$('rx-q-min').value, max=$('rx-q-max').value, lazy=$('rx-q-lazy').checked;
        let q='';
        if(min!==''&&max!=='') q=`{${min},${max}}`;
        else if(min!==''&&max==='') q=`{${min},}`;
        else if(min===''&&max!=='') q=`{0,${max}}`;
        $('rx-q-preview').textContent=q?(q+(lazy?'?':'')):'';
      }
      $('rx-q-min').addEventListener('input',updateQuantPreview);
      $('rx-q-max').addEventListener('input',updateQuantPreview);
      $('rx-q-lazy').addEventListener('change',updateQuantPreview);
      $('rx-q-insert').addEventListener('click',()=>{
        const q=$('rx-q-preview').textContent;
        if(!q) return;
        const inp=$('rx-pattern'), pos=inp.selectionStart;
        inp.value=inp.value.slice(0,pos)+q+inp.value.slice(inp.selectionEnd);
        inp.setSelectionRange(pos+q.length,pos+q.length);
        inp.focus(); runTest();
      });
    }

    // ── Unicode Properties ─────────────────────────────────────────────────────
    function renderUnicode() {
      const cats=[
        {cat:'Letter',     props:['L','Lu','Ll','Lt','Lm','Lo'],  color:'#00c8b4'},
        {cat:'Number',     props:['N','Nd','Nl','No'],             color:'#fdba74'},
        {cat:'Punctuation',props:['P','Pc','Pd','Pe','Pf','Pi','Po','Ps'], color:'#f472b6'},
        {cat:'Symbol',     props:['S','Sc','Sk','Sm','So'],        color:'#a78bfa'},
        {cat:'Separator',  props:['Z','Zl','Zp','Zs'],            color:'#38bdf8'},
        {cat:'Mark',       props:['M','Mc','Me','Mn'],             color:'#86efac'},
        {cat:'Other',      props:['C','Cc','Cf','Co','Cs'],        color:'#fb923c'},
        {cat:'Scripts',    props:['Script=Latin','Script=Cyrillic','Script=Greek','Script=Arabic','Script=Devanagari','Script=Han','Script=Hiragana','Script=Katakana'], color:'#67e8f9'},
      ];
      const grid=$('rx-unicode-grid'); grid.innerHTML='';
      cats.forEach(({cat,props,color})=>{
        const section=document.createElement('div'); section.className='rx-uni-section';
        section.innerHTML=`<div class="rx-uni-cat" style="color:${color}">${cat}</div>
          <div class="rx-uni-props">${props.map(p=>`
            <button class="rx-uni-btn" data-p="${p}" style="border-color:${color}33;color:${color}" title="\\p{${p}}">\\p{${p}}</button>`).join('')}
          </div>`;
        section.querySelectorAll('.rx-uni-btn').forEach(btn=>{
          btn.addEventListener('click',()=>{
            const inp=$('rx-pattern'), pos=inp.selectionStart;
            const tok=`\\p{${btn.dataset.p}}`;
            inp.value=inp.value.slice(0,pos)+tok+inp.value.slice(inp.selectionEnd);
            inp.setSelectionRange(pos+tok.length,pos+tok.length);
            // Auto-enable u flag
            const uFlag=$('rx-u'); if(uFlag&&!uFlag.checked) uFlag.checked=true;
            inp.focus(); runTest();
          });
        });
        grid.appendChild(section);
      });
    }

    // Init
    runTest();
  }
};
