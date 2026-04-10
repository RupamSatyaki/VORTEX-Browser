/**
 * passwords/index.js — Password Manager core + Settings panel renderer
 */

const PasswordManager = (() => {

  // ── Session state ─────────────────────────────────────────────────────────
  let _session = null;
  let _entries = [];          // manually saved (encrypted vault)
  let _importedEntries = [];  // imported (plain JSON, separate file)
  let _autofillVaultEntries = []; // decrypted vault cache for autofill (no UI unlock)
  let _container = null;
  let _activeTab = 'vault';
  let _searchQ = '';
  let _breachedIds = new Set();

  // ── IPC helpers ───────────────────────────────────────────────────────────
  function _invoke(channel, ...args) {
    return new Promise(resolve => {
      const reqId = '__pm_' + Date.now() + '_' + Math.random();
      function handler(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', handler);
        resolve(ev.data.result);
      }
      window.addEventListener('message', handler);
      setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 8000);
      window.parent.postMessage({ __vortexAction: true, channel: '__invoke', payload: { reqId, channel, args } }, '*');
    });
  }

  // ── Vault load/save ───────────────────────────────────────────────────────
  async function _loadVault() {
    const data = await _invoke('passwords:read');
    return data || null;
  }

  async function _saveVault() {
    if (!_session) return;
    const plain = JSON.stringify(_entries);
    const encrypted = await VaultCrypto.encrypt(plain, _session.masterPassword, _session.salt);
    await _invoke('passwords:write', { masterHash: _session.masterHash, salt: _session.salt, vault: encrypted });
  }

  async function _loadImported() {
    const data = await _invoke('passwords:readImported');
    _importedEntries = Array.isArray(data) ? data : [];
  }

  async function _saveImported() {
    await _invoke('passwords:writeImported', _importedEntries);
  }

  // All entries combined (for autofill matching)
  function _allEntries() {
    return [
      ..._entries.map(e => ({ ...e, _source: 'vault' })),
      ..._importedEntries.map(e => ({ ...e, _source: 'imported' })),
    ];
  }

  // ── UUID ──────────────────────────────────────────────────────────────────
  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function _domain(url) {
    try { return new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace(/^www\./, ''); }
    catch { return url; }
  }

  function _escHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Clipboard copy with auto-clear ───────────────────────────────────────
  function _copyTemp(text, label, statusEl) {
    navigator.clipboard.writeText(text).then(() => {
      if (statusEl) { statusEl.textContent = (label || 'Copied') + '!'; statusEl.style.color = '#22c55e'; }
      setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => { });
        if (statusEl) { statusEl.textContent = ''; }
      }, 30000);
    });
  }

  // ── Breach check (HaveIBeenPwned k-anonymity) ─────────────────────────────
  async function _checkBreach(password) {
    try {
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-1', enc.encode(password));
      const hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      if (!res.ok) return false;
      const text = await res.text();
      return text.split('\n').some(line => line.split(':')[0] === suffix);
    } catch { return false; }
  }

  // ── Render entry ──────────────────────────────────────────────────────────
  function _renderEntry(e) {
    const domain = e.site || _domain(e.url || '');
    const letter = (e.title || domain || '?')[0].toUpperCase();
    const breached = _breachedIds.has(e.id);
    const src = e._source || 'vault';
    const srcBadge = src === 'imported'
      ? `<span style="font-size:9px;background:rgba(139,92,246,0.15);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);padding:1px 5px;border-radius:4px;flex-shrink:0;">Imported</span>`
      : '';
    return `
      <div class="pm-entry" data-id="${_escHtml(e.id)}" data-source="${src}">
        <div class="pm-entry-favicon">
          <img src="https://www.google.com/s2/favicons?domain=${_escHtml(domain)}&sz=32"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy"/>
          <div class="pm-entry-favicon-letter" style="display:none;">${_escHtml(letter)}</div>
        </div>
        <div class="pm-entry-info">
          <div class="pm-entry-title" style="display:flex;align-items:center;gap:6px;">${_escHtml(e.title || domain)} ${srcBadge}</div>
          <div class="pm-entry-user">${_escHtml(e.username)}</div>
        </div>
        ${breached ? '<div class="pm-entry-breach" title="Password found in data breach!"></div>' : ''}
        <div class="pm-entry-actions">
          <button class="pm-entry-btn" data-action="copy-user" data-id="${_escHtml(e.id)}" data-source="${src}" title="Copy username">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button class="pm-entry-btn" data-action="copy-pw" data-id="${_escHtml(e.id)}" data-source="${src}" title="Copy password">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>
          <button class="pm-entry-btn" data-action="edit" data-id="${_escHtml(e.id)}" data-source="${src}" title="Edit">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="pm-entry-btn danger" data-action="delete" data-id="${_escHtml(e.id)}" data-source="${src}" title="Delete">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>`;
  }

  // ── Vault tab render ──────────────────────────────────────────────────────
  function _renderVault() {
    const el = _container.querySelector('#pm-tab-vault');
    if (!el) return;
    const q = _searchQ.toLowerCase();

    // Combine both sources
    const allVault = _entries.map(e => ({ ...e, _source: 'vault' }));
    const allImport = _importedEntries.map(e => ({ ...e, _source: 'imported' }));
    const combined = [...allVault, ...allImport];

    const filtered = q
      ? combined.filter(e => (e.title || '').toLowerCase().includes(q) || (e.username || '').toLowerCase().includes(q) || (e.site || '').toLowerCase().includes(q) || (e.url || '').toLowerCase().includes(q))
      : combined;

    // Group: vault first, then imported
    const vaultFiltered = filtered.filter(e => e._source === 'vault');
    const importedFiltered = filtered.filter(e => e._source === 'imported');

    function _section(entries, label, color) {
      if (!entries.length) return '';
      return `
        <div style="padding:6px 14px 4px;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.6px;display:flex;align-items:center;gap:6px;">
          <span>${label}</span><span style="font-size:10px;color:#2e5a5a;">(${entries.length})</span>
        </div>
        ${entries.map(_renderEntry).join('')}`;
    }

    const listHTML = filtered.length === 0
      ? `<div class="pm-empty"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><p>${q ? 'No results found' : 'No passwords saved yet'}</p></div>`
      : _section(vaultFiltered, '🔐 Saved', 'var(--accent)') + _section(importedFiltered, '📥 Imported', '#8b5cf6');

    el.innerHTML = `
      <div class="pm-search-wrap" style="background:#0a1818;border-bottom:1px solid #1a3030;">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="pm-search-inp" id="pm-search" type="text" placeholder="Search passwords…" value="${_escHtml(_searchQ)}" spellcheck="false"/>
        <button class="pm-add-btn" id="pm-add-btn">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add
        </button>
      </div>
      <div class="pm-entry-list" id="pm-entry-list">${listHTML}</div>
      <div id="pm-copy-status" style="font-size:11px;padding:4px 16px;min-height:18px;"></div>`;

    el.querySelector('#pm-search').addEventListener('input', e => { _searchQ = e.target.value; _renderVault(); });
    el.querySelector('#pm-add-btn').addEventListener('click', () => _showDetail(null));

    el.querySelector('#pm-entry-list').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) {
        const entry = e.target.closest('.pm-entry');
        if (entry) {
          // Find in both sources
          const id = entry.dataset.id;
          const src = entry.dataset.source;
          const found = src === 'imported'
            ? _importedEntries.find(x => x.id === id)
            : _entries.find(x => x.id === id);
          if (found) _showDetail(id, src === 'imported');
        }
        return;
      }
      e.stopPropagation();
      const id = btn.dataset.id;
      const src = btn.dataset.source;
      const isImported = src === 'imported';
      const entry = isImported ? _importedEntries.find(x => x.id === id) : _entries.find(x => x.id === id);
      if (!entry) return;
      const statusEl = el.querySelector('#pm-copy-status');
      if (btn.dataset.action === 'copy-user') _copyTemp(entry.username, 'Username', statusEl);
      if (btn.dataset.action === 'copy-pw') _copyTemp(entry.password, 'Password', statusEl);
      if (btn.dataset.action === 'edit') _showDetail(id, isImported);
      if (btn.dataset.action === 'delete') {
        if (!confirm(`Delete "${entry.title || entry.site}"?`)) return;
        if (isImported) { _importedEntries = _importedEntries.filter(x => x.id !== id); _saveImported(); }
        else { _entries = _entries.filter(x => x.id !== id); _saveVault(); }
        _renderVault();
        _updateStats();
      }
    });
  }

  // ── Detail / Edit panel ───────────────────────────────────────────────────
  function _showDetail(id, isImported) {
    const isNew = !id;
    let entry;
    if (isNew) {
      entry = { id: _uuid(), title: '', site: '', url: '', username: '', password: '', notes: '', createdAt: Date.now(), updatedAt: Date.now() };
    } else if (isImported) {
      entry = { ..._importedEntries.find(e => e.id === id) };
    } else {
      entry = { ..._entries.find(e => e.id === id) };
    }
    if (!entry || !entry.id) return;

    const wrap = _container.querySelector('.pm-main-wrap');
    const detail = document.createElement('div');
    detail.className = 'pm-detail';

    const str = PasswordGenerator.strength(entry.password);

    detail.innerHTML = `
      <div class="pm-detail-header">
        <button class="pm-detail-back" id="pm-detail-back">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span class="pm-detail-title">${isNew ? 'Add Password' : 'Edit Password'}</span>
        <button class="pm-detail-save" id="pm-detail-save">Save</button>
      </div>
      <div class="pm-detail-body">
        <div class="pm-field">
          <div class="pm-field-label">Title / Site Name</div>
          <input class="pm-field-input" id="pd-title" type="text" value="${_escHtml(entry.title)}" placeholder="e.g. GitHub"/>
        </div>
        <div class="pm-field">
          <div class="pm-field-label">URL</div>
          <input class="pm-field-input" id="pd-url" type="text" value="${_escHtml(entry.url)}" placeholder="https://github.com"/>
        </div>
        <div class="pm-field">
          <div class="pm-field-label">Username / Email</div>
          <input class="pm-field-input" id="pd-username" type="text" value="${_escHtml(entry.username)}" placeholder="user@email.com"/>
        </div>
        <div class="pm-field">
          <div class="pm-field-label">Password</div>
          <div class="pm-pw-wrap">
            <input class="pm-field-input" id="pd-password" type="password" value="${_escHtml(entry.password)}" placeholder="Password"/>
            <div class="pm-pw-actions">
              <button class="pm-pw-action-btn" id="pd-pw-eye" title="Show/Hide">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="pm-pw-action-btn" id="pd-pw-gen" title="Generate">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>
              </button>
              <button class="pm-pw-action-btn" id="pd-pw-copy" title="Copy">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
          <div class="pm-strength-wrap">
            <div class="pm-strength-bar-bg"><div class="pm-strength-bar" id="pd-str-bar" style="width:${str.pct || 0}%;background:${str.color};"></div></div>
            <div class="pm-strength-label" id="pd-str-label" style="color:${str.color};">${str.label}</div>
          </div>
        </div>
        <div class="pm-field">
          <div class="pm-field-label">Notes</div>
          <textarea class="pm-field-input textarea" id="pd-notes" placeholder="Optional notes...">${_escHtml(entry.notes)}</textarea>
        </div>
        <div id="pd-breach-result" style="font-size:12px;min-height:16px;margin-top:4px;"></div>
        <button id="pd-breach-check" style="background:transparent;border:1px solid #2e4a4c;border-radius:7px;color:#7aadad;font-size:12px;padding:7px 14px;cursor:pointer;margin-top:8px;transition:all 0.15s;width:100%;">
          🔍 Check for Data Breach
        </button>
      </div>`;

    wrap.appendChild(detail);

    // Back
    detail.querySelector('#pm-detail-back').addEventListener('click', () => detail.remove());

    // Eye toggle
    const pwInp = detail.querySelector('#pd-password');
    detail.querySelector('#pd-pw-eye').addEventListener('click', () => {
      pwInp.type = pwInp.type === 'password' ? 'text' : 'password';
    });

    // Generate
    detail.querySelector('#pd-pw-gen').addEventListener('click', () => {
      const pw = PasswordGenerator.generate({ length: 16, upper: true, lower: true, numbers: true, symbols: true });
      pwInp.value = pw; pwInp.type = 'text';
      _updateStrength(pw, detail);
    });

    // Copy password
    detail.querySelector('#pd-pw-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(pwInp.value);
    });

    // Strength live update
    pwInp.addEventListener('input', () => _updateStrength(pwInp.value, detail));

    // URL → auto-fill site
    detail.querySelector('#pd-url').addEventListener('blur', e => {
      const titleInp = detail.querySelector('#pd-title');
      if (!titleInp.value) titleInp.value = _domain(e.target.value);
    });

    // Breach check
    detail.querySelector('#pd-breach-check').addEventListener('click', async () => {
      const btn = detail.querySelector('#pd-breach-check');
      const res = detail.querySelector('#pd-breach-result');
      btn.disabled = true; btn.textContent = 'Checking...';
      const breached = await _checkBreach(pwInp.value);
      btn.disabled = false; btn.textContent = '🔍 Check for Data Breach';
      if (breached) {
        res.innerHTML = '<span style="color:#ef4444;">⚠️ This password was found in a data breach! Change it immediately.</span>';
      } else {
        res.innerHTML = '<span style="color:#22c55e;">✓ Password not found in known breaches.</span>';
      }
    });

    // Save
    detail.querySelector('#pm-detail-save').addEventListener('click', async () => {
      entry.title = detail.querySelector('#pd-title').value.trim();
      entry.url = detail.querySelector('#pd-url').value.trim();
      entry.site = _domain(entry.url); // always hostname only, no path
      entry.username = detail.querySelector('#pd-username').value.trim();
      entry.password = pwInp.value;
      entry.notes = detail.querySelector('#pd-notes').value.trim();
      entry.updatedAt = Date.now();
      if (!entry.title) entry.title = entry.site || 'Untitled';

      if (isNew) {
        _entries.unshift(entry);
        await _saveVault();
      } else if (isImported) {
        const idx = _importedEntries.findIndex(e => e.id === entry.id);
        if (idx >= 0) _importedEntries[idx] = entry;
        await _saveImported();
      } else {
        const idx = _entries.findIndex(e => e.id === entry.id);
        if (idx >= 0) _entries[idx] = entry;
        await _saveVault();
      }
      detail.remove();
      _renderVault();
      _updateStats();
    });
  }

  function _updateStrength(pw, detail) {
    const str = PasswordGenerator.strength(pw);
    const bar = detail.querySelector('#pd-str-bar');
    const lbl = detail.querySelector('#pd-str-label');
    if (bar) { bar.style.width = (str.pct || 0) + '%'; bar.style.background = str.color; }
    if (lbl) { lbl.textContent = str.label; lbl.style.color = str.color; }
  }

  // ── Generator tab ─────────────────────────────────────────────────────────
  function _renderGenerator() {
    const el = _container.querySelector('#pm-tab-generator');
    if (!el) return;
    let opts = { length: 16, upper: true, lower: true, numbers: true, symbols: true };
    let pw = PasswordGenerator.generate(opts);

    function _html() {
      const str = PasswordGenerator.strength(pw);
      return `
        <div class="pm-gen-wrap">
          <div class="pm-gen-output">
            <div class="pm-gen-password" id="gen-pw-display">${_escHtml(pw)}</div>
            <button class="pm-gen-copy-btn" id="gen-copy">Copy</button>
          </div>
          <div class="pm-strength-wrap" style="padding:0 2px;">
            <div class="pm-strength-bar-bg"><div class="pm-strength-bar" style="width:${str.pct}%;background:${str.color};"></div></div>
            <div class="pm-strength-label" style="color:${str.color};">${str.label}</div>
          </div>
          <div class="pm-gen-option">
            <div><div class="pm-gen-option-label">Length</div></div>
            <div style="display:flex;align-items:center;gap:8px;">
              <input type="range" class="pm-gen-slider" id="gen-len" min="8" max="64" value="${opts.length}"/>
              <span class="pm-gen-len-val" id="gen-len-val">${opts.length}</span>
            </div>
          </div>
          <div class="pm-gen-option">
            <div class="pm-gen-option-label">Uppercase (A-Z)</div>
            <label class="toggle"><input type="checkbox" id="gen-upper" ${opts.upper ? 'checked' : ''}><div class="toggle-track"></div></label>
          </div>
          <div class="pm-gen-option">
            <div class="pm-gen-option-label">Lowercase (a-z)</div>
            <label class="toggle"><input type="checkbox" id="gen-lower" ${opts.lower ? 'checked' : ''}><div class="toggle-track"></div></label>
          </div>
          <div class="pm-gen-option">
            <div class="pm-gen-option-label">Numbers (0-9)</div>
            <label class="toggle"><input type="checkbox" id="gen-numbers" ${opts.numbers ? 'checked' : ''}><div class="toggle-track"></div></label>
          </div>
          <div class="pm-gen-option">
            <div class="pm-gen-option-label">Symbols (!@#$…)</div>
            <label class="toggle"><input type="checkbox" id="gen-symbols" ${opts.symbols ? 'checked' : ''}><div class="toggle-track"></div></label>
          </div>
          <button class="pm-gen-refresh" id="gen-refresh">↻ Generate New Password</button>
        </div>`;
    }

    function _bind() {
      el.querySelector('#gen-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(pw);
        const btn = el.querySelector('#gen-copy');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
      el.querySelector('#gen-len').addEventListener('input', e => {
        opts.length = parseInt(e.target.value);
        el.querySelector('#gen-len-val').textContent = opts.length;
        pw = PasswordGenerator.generate(opts);
        el.querySelector('#gen-pw-display').textContent = pw;
      });
      ['upper', 'lower', 'numbers', 'symbols'].forEach(k => {
        el.querySelector(`#gen-${k}`).addEventListener('change', e => {
          opts[k] = e.target.checked;
          pw = PasswordGenerator.generate(opts);
          el.querySelector('#gen-pw-display').textContent = pw;
        });
      });
      el.querySelector('#gen-refresh').addEventListener('click', () => {
        pw = PasswordGenerator.generate(opts);
        el.innerHTML = _html(); _bind();
      });
    }

    el.innerHTML = _html();
    _bind();
  }

  // ── Import/Export tab ─────────────────────────────────────────────────────
  function _renderImportExport() {
    const el = _container.querySelector('#pm-tab-ie');
    if (!el) return;
    el.innerHTML = `
      <div class="pm-ie-wrap">
        <div class="pm-ie-card">
          <div class="pm-ie-card-icon" style="background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.2);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="pm-ie-card-info">
            <div class="pm-ie-card-title">Import from Chrome / Firefox</div>
            <div class="pm-ie-card-desc">CSV file from browser password export</div>
          </div>
          <label class="pm-ie-btn" style="cursor:pointer;">
            Import CSV
            <input type="file" id="pm-import-file" accept=".csv" style="display:none"/>
          </label>
        </div>
        <div class="pm-ie-card">
          <div class="pm-ie-card-icon" style="background:rgba(0,200,180,0.1);border:1px solid rgba(0,200,180,0.2);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div class="pm-ie-card-info">
            <div class="pm-ie-card-title">Export as JSON</div>
            <div class="pm-ie-card-desc">Encrypted backup of your vault</div>
          </div>
          <button class="pm-ie-btn" id="pm-export-json">Export JSON</button>
        </div>
        <div class="pm-ie-card">
          <div class="pm-ie-card-icon" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="pm-ie-card-info">
            <div class="pm-ie-card-title">Export as CSV</div>
            <div class="pm-ie-card-desc">Plain text — import into other browsers</div>
          </div>
          <button class="pm-ie-btn" id="pm-export-csv">Export CSV</button>
        </div>
        <div id="pm-ie-status" style="font-size:12px;color:var(--accent);min-height:16px;padding:4px 0;"></div>
      </div>`;

    const status = el.querySelector('#pm-ie-status');

    el.querySelector('#pm-import-file').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      const text = await file.text();
      const imported = PasswordImporter.parseCSV(text);
      if (!imported.length) { status.textContent = 'No entries found in CSV.'; status.style.color = '#ef4444'; return; }
      let added = 0;
      imported.forEach(entry => {
        entry.site = _domain(entry.site || entry.url || '');
        // Check duplicates across both sources
        const exists = _importedEntries.find(x => x.url === entry.url && x.username === entry.username)
          || _entries.find(x => x.url === entry.url && x.username === entry.username);
        if (!exists) { _importedEntries.push(entry); added++; }
      });
      await _saveImported();
      status.textContent = `Imported ${added} entries (${imported.length - added} duplicates skipped).`;
      status.style.color = '#22c55e';
      _updateStats();
      e.target.value = '';
    });

    el.querySelector('#pm-export-json').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(_entries, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'vortex-passwords-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
      status.textContent = `Exported ${_entries.length} entries.`; status.style.color = '#22c55e';
    });

    el.querySelector('#pm-export-csv').addEventListener('click', () => {
      const rows = ['name,url,username,password', ..._entries.map(e =>
        `"${(e.title || '').replace(/"/g, '""')}","${(e.url || '').replace(/"/g, '""')}","${(e.username || '').replace(/"/g, '""')}","${(e.password || '').replace(/"/g, '""')}"`
      )];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'vortex-passwords-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
      status.textContent = `Exported ${_entries.length} entries as CSV.`; status.style.color = '#22c55e';
    });
  }

  // ── Stats update ──────────────────────────────────────────────────────────
  function _updateStats() {
    const total = _entries.length;
    const weak = _entries.filter(e => PasswordGenerator.strength(e.password).score <= 2).length;
    const breached = _breachedIds.size;
    const el = _container.querySelector('#pm-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="pm-stat"><div class="pm-stat-num">${total}</div><div class="pm-stat-label">Saved</div></div>
      <div class="pm-stat"><div class="pm-stat-num warn">${weak}</div><div class="pm-stat-label">Weak</div></div>
      <div class="pm-stat"><div class="pm-stat-num danger">${breached}</div><div class="pm-stat-label">Breached</div></div>`;
  }

  // ── Lock screen ───────────────────────────────────────────────────────────
  function _renderLockScreen(container, vaultData) {
    const isSetup = !vaultData;
    container.innerHTML = `
      <div class="pm-lock-screen">
        <div class="pm-lock-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="pm-lock-title">${isSetup ? 'Set Up Password Manager' : 'Vault Locked'}</div>
        <div class="pm-lock-desc">${isSetup ? 'Create a master password to protect your vault' : 'Enter your master password to unlock'}</div>
        ${isSetup ? `
          <div class="pm-master-input-wrap">
            <input class="pm-master-input" id="pm-mp1" type="password" placeholder="Create master password" autocomplete="new-password"/>
            <button class="pm-eye-btn" id="pm-mp1-eye">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div class="pm-master-input-wrap">
            <input class="pm-master-input" id="pm-mp2" type="password" placeholder="Confirm master password" autocomplete="new-password"/>
          </div>` : `
          <div class="pm-master-input-wrap">
            <input class="pm-master-input" id="pm-mp1" type="password" placeholder="Master password" autocomplete="current-password"/>
            <button class="pm-eye-btn" id="pm-mp1-eye">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>`}
        <div class="pm-error-msg" id="pm-lock-err"></div>
        <button class="pm-unlock-btn" id="pm-unlock-btn">${isSetup ? 'Create Vault' : 'Unlock'}</button>
      </div>`;

    const mp1 = container.querySelector('#pm-mp1');
    const errEl = container.querySelector('#pm-lock-err');
    mp1.focus();

    container.querySelector('#pm-mp1-eye')?.addEventListener('click', () => {
      mp1.type = mp1.type === 'password' ? 'text' : 'password';
    });

    container.querySelector('#pm-unlock-btn').addEventListener('click', async () => {
      const btn = container.querySelector('#pm-unlock-btn');
      const password = mp1.value;
      if (!password) { errEl.textContent = 'Please enter a password.'; return; }

      if (isSetup) {
        const mp2 = container.querySelector('#pm-mp2');
        if (password !== mp2.value) { errEl.textContent = 'Passwords do not match.'; mp1.classList.add('error'); return; }
        if (password.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; return; }
        btn.disabled = true; btn.textContent = 'Creating vault...';
        const salt = VaultCrypto.generateSalt();
        const masterHash = await VaultCrypto.hashPassword(password, salt);
        _session = { masterPassword: password, salt, masterHash };
        _entries = [];
        await _saveVault();
        _renderMain(container);
      } else {
        btn.disabled = true; btn.textContent = 'Unlocking...';
        try {
          const hash = await VaultCrypto.hashPassword(password, vaultData.salt);
          if (hash !== vaultData.masterHash) {
            errEl.textContent = 'Incorrect master password.';
            mp1.classList.add('error');
            btn.disabled = false; btn.textContent = 'Unlock';
            return;
          }
          const plain = await VaultCrypto.decrypt(vaultData.vault, password, vaultData.salt);
          _entries = JSON.parse(plain) || [];
          // Migrate: ensure site field is always hostname only
          let migrated = false;
          _entries.forEach(e => {
            const clean = _domain(e.site || e.url || '');
            if (clean && clean !== e.site) { e.site = clean; migrated = true; }
          });
          if (migrated) _saveVault();
          _session = { masterPassword: password, salt: vaultData.salt, masterHash: vaultData.masterHash };
          // Cache session for autofill across page loads
          try { sessionStorage.setItem('vx_pm_session', JSON.stringify(_session)); } catch { }
          // Update autofill cache
          _autofillVaultEntries = [..._entries];
          _renderMain(container);
          // Refresh autofill badge after unlock
          setTimeout(() => notifyUnlock(), 100);
        } catch {
          errEl.textContent = 'Failed to decrypt vault.';
          btn.disabled = false; btn.textContent = 'Unlock';
        }
      }
    });

    mp1.addEventListener('keydown', e => { if (e.key === 'Enter') container.querySelector('#pm-unlock-btn').click(); });
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  function _renderMain(container) {
    container.innerHTML = `
      <div class="pm-wrap">
        <div class="pm-header">
          <div class="pm-header-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <span class="pm-header-title">Password Manager</span>
          <span class="pm-header-count" id="pm-header-count"></span>
          <button class="pm-lock-btn" id="pm-lock-btn">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Lock
          </button>
        </div>
        <div class="pm-stats" id="pm-stats"></div>
        <div class="pm-tabs">
          <button class="pm-tab active" data-tab="vault">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Vault
          </button>
          <button class="pm-tab" data-tab="generator">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Generator
          </button>
          <button class="pm-tab" data-tab="ie">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Import/Export
          </button>
          <button class="pm-tab" data-tab="addresses">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Addresses
          </button>
        </div>
        <div class="pm-tab-content active" id="pm-tab-vault" style="position:relative;"></div>
        <div class="pm-tab-content" id="pm-tab-generator"></div>
        <div class="pm-tab-content" id="pm-tab-ie"></div>
        <div class="pm-tab-content" id="pm-tab-addresses" style="position:relative;overflow-y:auto;padding:14px;"></div>
        <div class="pm-main-wrap" style="position:absolute;inset:0;pointer-events:none;"></div>
      </div>`;

    _container = container;

    // Tab switching
    container.querySelectorAll('.pm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.pm-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        _activeTab = tab.dataset.tab;
        container.querySelector(`#pm-tab-${_activeTab}`).classList.add('active');
        if (_activeTab === 'vault') _renderVault();
        if (_activeTab === 'generator') _renderGenerator();
        if (_activeTab === 'ie') _renderImportExport();
        if (_activeTab === 'addresses' && typeof AddressManager !== 'undefined') {
          AddressManager.render(container.querySelector('#pm-tab-addresses'));
        }
      });
    });

    // Lock button
    container.querySelector('#pm-lock-btn').addEventListener('click', () => {
      _session = null; _entries = []; _breachedIds.clear();
      render(container);
    });

    // Fix main-wrap pointer events
    const mainWrap = container.querySelector('.pm-main-wrap');
    const observer = new MutationObserver(() => {
      mainWrap.style.pointerEvents = mainWrap.children.length ? 'all' : 'none';
    });
    observer.observe(mainWrap, { childList: true });

    _updateStats();
    _renderVault();
  }

  // ── Public render ─────────────────────────────────────────────────────────
  async function render(container) {
    _container = container;
    // Inject CSS
    if (!document.getElementById('pm-styles-link')) {
      const link = document.createElement('link');
      link.id = 'pm-styles-link'; link.rel = 'stylesheet';
      const base = location.href.replace(/[^/]*$/, '');
      link.href = base + 'js/passwords/styles.css';
      document.head.appendChild(link);
    }
    // Always load imported entries (not encrypted, always available)
    await _loadImported();

    const vaultData = await _invoke('passwords:read');
    if (!vaultData || !vaultData.masterHash) {
      _renderLockScreen(container, null);
    } else if (_session) {
      _renderMain(container);
    } else {
      _renderLockScreen(container, vaultData);
    }
  }

  // ── Autofill public API ───────────────────────────────────────────────────
  function getMatchingEntries(domain) {
    if (!domain) return [];
    const d = domain.toLowerCase().replace(/^www\./, '');

    function _matches(e) {
      const rawSite = e.site || e.url || '';
      const eSite = _domain(rawSite).toLowerCase().replace(/^www\./, '');
      if (!eSite) return false;
      return eSite === d || d.endsWith('.' + eSite) || eSite.endsWith('.' + d);
    }

    // Vault: use unlocked _entries if available, else autofill cache
    const vaultSrc = _session ? _entries : _autofillVaultEntries;
    const fromVault = vaultSrc.filter(_matches).map(e => ({ ...e, _source: 'vault' }));
    const fromImported = _importedEntries.filter(_matches).map(e => ({ ...e, _source: 'imported' }));

    return [...fromVault, ...fromImported];
  }

  // ── Autofill-only cache (no UI unlock needed) ─────────────────────────────
  // Called from app.js on startup — tries to decrypt vault silently
  async function initAutofill() {
    // Use direct IPC (preload API) — not postMessage bridge
    const _directInvoke = (ch, ...args) => {
      if (window.vortexAPI && window.vortexAPI.invoke) return window.vortexAPI.invoke(ch, ...args);
      return Promise.resolve(null);
    };

    // Load imported always
    try {
      const imported = await _directInvoke('passwords:readImported');
      _importedEntries = Array.isArray(imported) ? imported : [];
    } catch { _importedEntries = []; }

    // Try cached session for vault autofill
    const cached = sessionStorage.getItem('vx_pm_session');
    if (!cached) return;
    try {
      const { masterPassword, salt, masterHash } = JSON.parse(cached);
      const vaultData = await _directInvoke('passwords:read');
      if (!vaultData || !vaultData.masterHash) return;
      const hash = await VaultCrypto.hashPassword(masterPassword, salt);
      if (hash !== masterHash) { sessionStorage.removeItem('vx_pm_session'); return; }
      const plain = await VaultCrypto.decrypt(vaultData.vault, masterPassword, salt);
      _autofillVaultEntries = JSON.parse(plain) || [];
    } catch { sessionStorage.removeItem('vx_pm_session'); }
  }

  // Called after unlock to refresh autofill badge
  function notifyUnlock() {
    const bar = document.getElementById('url-bar');
    if (!bar || !bar.value) return;
    try {
      const domain = new URL(bar.value.startsWith('http') ? bar.value : 'https://' + bar.value).hostname.replace(/^www\./, '');
      if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.updateBadge(domain);
    } catch { }
  }

  // Save entry from autofill save prompt
  async function saveFromAutofill({ domain, username, password }) {
    const entry = {
      id: _uuid(), title: domain, site: domain, url: 'https://' + domain,
      username, password, notes: '', createdAt: Date.now(), updatedAt: Date.now(),
    };
    if (_session) {
      _entries.unshift(entry);
      _autofillVaultEntries = [..._entries];
      await _saveVault();
    } else {
      _importedEntries.unshift(entry);
      await _saveImported();
    }
    if (typeof PasswordAutofill !== 'undefined') PasswordAutofill.updateBadge(domain);
  }

  return { render, getMatchingEntries, notifyUnlock, initAutofill, saveFromAutofill, _setImported: (data) => { _importedEntries = data || []; } };
})();
