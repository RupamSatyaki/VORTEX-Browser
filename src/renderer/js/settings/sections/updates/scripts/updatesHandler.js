/**
 * settings/sections/updates/scripts/updatesHandler.js
 * GitHub releases updater — check, download installer, commit-based advanced updater.
 */

const UpdatesHandler = (() => {

  let _currentVer  = '0.0.0';
  let _allReleases = [];
  let _container   = null;

  // ── Init ───────────────────────────────────────────────────────────────────
  async function bind(container, _settings) {
    _container = container;

    // Load version
    try {
      _currentVer = await SettingsIPC.invoke('app:version') || '0.0.0';
      const verEl = container.querySelector('#upd-current-ver');
      if (verEl) verEl.textContent = 'v' + _currentVer;
    } catch {}

    // Load last checked + local SHA
    _loadLastChecked();
    await _loadLocalSha();

    // Check for updates on section open
    checkForUpdates();

    // Bind buttons
    SettingsButton.bind(container, 'btn-upd-check', checkForUpdates);

    // Delete applied commits
    SettingsButton.bind(container, 'btn-upd-delete-applied', async () => {
      if (!confirm('Delete all applied commits?\n\nThis will revert to the bundled version. App will restart.')) return;
      const btn = container.querySelector('#btn-upd-delete-applied');
      if (btn) { btn.disabled = true; btn.textContent = 'Deleting...'; }
      const result = await SettingsIPC.invoke('updater:deleteApplied');
      if (result?.success) {
        _setStatus('Applied commits deleted. Restarting...');
        setTimeout(() => SettingsIPC.send('app:relaunch'), 1500);
      } else {
        _setStatus('Delete failed: ' + (result?.error || 'Unknown'), true);
        if (btn) { btn.disabled = false; btn.textContent = 'Delete'; }
      }
    });

    // Advanced accordion toggle
    container.querySelector('#upd-advanced-toggle')
      ?.addEventListener('click', () => {
        const body    = container.querySelector('#upd-advanced-body');
        const chevron = container.querySelector('#upd-adv-chevron');
        const open    = body?.style.display === 'block';
        if (body)    body.style.display    = open ? 'none' : 'block';
        if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)';
      });

    // Fetch commits button (advanced)
    SettingsButton.bind(container, 'btn-upd-refresh', _fetchCommits);

    // Listen for install progress from parent
    window.addEventListener('message', (e) => {
      if (!e.data || !e.data.__vortexIPC) return;
      if (e.data.channel === 'updater:installProgress') {
        _onInstallProgress(e.data.data);
      }
    });
  }

  // ── Check for updates ──────────────────────────────────────────────────────
  async function checkForUpdates() {
    const btn      = _container?.querySelector('#btn-upd-check');
    const relCard  = _container?.querySelector('#upd-release-card');
    const relList  = _container?.querySelector('#upd-releases-list-card');
    const uptodate = _container?.querySelector('#upd-uptodate');
    const available = _container?.querySelector('#upd-available');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
        stroke-width="2" style="margin-right:4px;vertical-align:middle;animation:spin 0.8s linear infinite">
        <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>Checking...`;
    }
    _setStatus('Fetching releases from GitHub...');

    try {
      _currentVer = await SettingsIPC.invoke('app:version') || _currentVer;
      const verEl = _container?.querySelector('#upd-current-ver');
      if (verEl) verEl.textContent = 'v' + _currentVer;

      const releases = await SettingsIPC.invoke('updater:fetchAllReleases');
      if (!releases || releases.error) {
        _setStatus('Failed: ' + (releases?.error || 'Network error'), true);
        return;
      }

      _allReleases = releases;
      const latest = releases[0];
      if (!latest) { _setStatus('No releases found.', true); return; }

      const cmp = _compareVersions(_currentVer, latest.tag);

      if (relCard) relCard.style.display = 'block';
      if (cmp >= 0) {
        if (uptodate) uptodate.style.display = 'block';
        if (available) available.style.display = 'none';
        const lbl = _container?.querySelector('#upd-latest-label');
        if (lbl) lbl.textContent = 'Latest: ' + latest.tag + ' — ' + latest.name;
      } else {
        if (uptodate) uptodate.style.display = 'none';
        if (available) available.style.display = 'block';
        const tagEl = _container?.querySelector('#upd-new-tag');
        const notesEl = _container?.querySelector('#upd-release-notes');
        if (tagEl)   tagEl.textContent = latest.tag + ' — ' + latest.name;
        if (notesEl) notesEl.innerHTML = _renderReleaseNotes(latest.body);

        // Download section
        const dlSection = _container?.querySelector('#upd-download-section');
        if (dlSection) {
          dlSection.innerHTML = _makeDownloadBtn(latest.asset, latest.tag, false);
          // Bind install button directly
          const installBtn = dlSection.querySelector('.upd-install-btn');
          if (installBtn) {
            installBtn.addEventListener('click', function() {
              _handleInstallClick(this, dlSection);
            });
          }
        }
      }

      // All releases list
      _renderAllReleases(releases);
      if (relList) {
        relList.style.display = 'block';
        const countEl = _container?.querySelector('#upd-releases-count');
        if (countEl) countEl.textContent = releases.length + ' releases';
      }

      _updateLastChecked();
      _showInstalledIndicator();
      _setStatus('');

    } catch (e) {
      _setStatus('Error: ' + e.message, true);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
          stroke-width="2" style="margin-right:4px;vertical-align:middle">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/></svg>Check for Updates`;
      }
    }
  }

  // ── All releases list ──────────────────────────────────────────────────────
  function _renderAllReleases(releases) {
    const list = _container?.querySelector('#upd-releases-list');
    if (!list) return;

    list.innerHTML = releases.map((r, i) => {
      const isCurrent = _compareVersions(_currentVer, r.tag) === 0;
      const isNewer   = _compareVersions(_currentVer, r.tag) < 0;
      const tagColor  = isCurrent ? 'var(--accent)' : isNewer ? '#22c55e' : '#4a8080';
      const tagBg     = isCurrent ? 'rgba(0,200,180,0.12)' : isNewer ? 'rgba(34,197,94,0.1)' : '#0f2222';
      const tagBorder = isCurrent ? 'rgba(0,200,180,0.3)' : isNewer ? 'rgba(34,197,94,0.25)' : '#1e3838';
      const dateStr   = r.publishedAt
        ? new Date(r.publishedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
        : '';

      return `
        <div style="border-bottom:1px solid #1a3030;${i === releases.length-1 ? 'border-bottom:none;' : ''}">
          <div class="upd-rel-toggle" data-idx="${i}"
            style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.12s;"
            onmouseenter="this.style.background='#162828'" onmouseleave="this.style.background=''">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:12px;font-weight:700;color:${tagColor};background:${tagBg};
                             border:1px solid ${tagBorder};padding:2px 8px;border-radius:6px;">${r.tag}</span>
                ${isCurrent ? '<span style="font-size:10px;color:var(--accent);background:rgba(0,200,180,0.1);border:1px solid rgba(0,200,180,0.2);padding:1px 6px;border-radius:4px;">Current</span>' : ''}
                ${r.prerelease ? '<span style="font-size:10px;color:#f59e0b;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);padding:1px 6px;border-radius:4px;">Pre-release</span>' : ''}
                <span style="font-size:11px;color:#4a8080;">${r.name !== r.tag ? r.name : ''}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap;">
                <span style="font-size:10px;color:#2e5a5a;">${dateStr}</span>
                ${r.asset ? `<span style="font-size:10px;color:#2e5a5a;">${_formatBytes(r.asset.size)}</span>` : ''}
              </div>
            </div>
            <svg class="upd-rel-chevron" viewBox="0 0 24 24" width="13" height="13"
              fill="none" stroke="#4a8080" stroke-width="2.5"
              style="transition:transform 0.2s;flex-shrink:0;pointer-events:none;">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div class="upd-rel-body" data-idx="${i}"
            style="display:none;padding:0 14px 12px;border-top:1px solid #1a3030;">
            ${r.body ? `<div class="upd-rel-desc">${_renderReleaseNotes(r.body)}</div>` : ''}
            ${_makeDownloadBtn(r.asset, r.tag, isCurrent)}
          </div>
        </div>`;
    }).join('');

    // Use event delegation — more reliable than per-element binding
    list.addEventListener('click', (e) => {
      // Find toggle row by walking up
      let node = e.target;
      while (node && node !== list) {
        if (node.classList && node.classList.contains('upd-rel-toggle')) {
          const idx     = node.dataset.idx;
          const body    = list.querySelector(`.upd-rel-body[data-idx="${idx}"]`);
          const chevron = node.querySelector('.upd-rel-chevron');
          if (!body) return;
          const open = body.style.display === 'block';
          body.style.display     = open ? 'none' : 'block';
          if (chevron) chevron.style.transform = open ? '' : 'rotate(90deg)';
          return;
        }
        // Install button
        if (node.classList && node.classList.contains('upd-install-btn')) {
          _handleInstallClick(node, list);
          return;
        }
        node = node.parentElement;
      }
    });
  }

  // ── Download button HTML ───────────────────────────────────────────────────
  function _makeDownloadBtn(asset, tag, isCurrent) {
    if (!asset) {
      return `<div style="font-size:12px;color:#4a8080;text-align:center;padding:8px 0;">
        No installer found.
        <a href="https://github.com/RupamSatyaki/VORTEX-Browser/releases/tag/${tag}"
          style="color:var(--accent);text-decoration:none;" target="_blank">Download manually ↗</a>
      </div>`;
    }
    const sizeStr = _formatBytes(asset.size);
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a8080" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span style="font-size:12px;color:#7aadad;flex:1;">${asset.name}</span>
        <span style="font-size:11px;color:#4a8080;">${sizeStr}</span>
      </div>
      <button class="setting-btn upd-install-btn" data-url="${asset.downloadUrl}" data-tag="${tag}"
        style="width:100%;justify-content:center;padding:9px;font-size:12px;font-weight:600;
               background:rgba(0,200,180,0.12);border-color:rgba(0,200,180,0.3);color:var(--accent);">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
          stroke-width="2" style="margin-right:5px;vertical-align:middle;">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        ${isCurrent ? 'Reinstall ' : 'Install '} ${tag}
      </button>
      <div class="upd-install-progress" style="display:none;margin-top:8px;">
        <div style="height:3px;background:#1a3838;border-radius:2px;overflow:hidden;">
          <div class="upd-install-bar" style="height:100%;background:var(--accent);width:0%;transition:width 0.3s;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span class="upd-install-info" style="font-size:10px;color:#4a8080;"></span>
          <span class="upd-install-pct" style="font-size:10px;color:var(--accent);font-weight:700;"></span>
        </div>
      </div>`;
  }

  function _bindDownloadBtns(root) {
    // Now handled by event delegation in _renderAllReleases
    // This function kept for the top-level download section only
    root.querySelectorAll('.upd-install-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        _handleInstallClick(this, root);
      });
    });
  }

  let _activeProgressEl = null; // track which progress bar is active

  async function _handleInstallClick(btn, root) {
    const url = btn.dataset.url;
    const tag = btn.dataset.tag;
    if (!url) return;
    const isOlder = _compareVersions(_currentVer, tag) > 0;
    const msg = isOlder
      ? `⚠️ Rollback to ${tag}?\n\nThis is an OLDER version than your current v${_currentVer}.\n\nThe app will close and the installer will launch.`
      : `Install ${tag}?\n\nThe app will close and the installer will launch automatically.`;
    if (!confirm(msg)) return;

    // Find and show the progress bar closest to this button
    const progressEl = btn.closest('.upd-rel-body, #upd-download-section')?.querySelector('.upd-install-progress');
    if (progressEl) {
      progressEl.style.display = 'block';
      _activeProgressEl = progressEl; // track for live updates
    }

    root.querySelectorAll('.upd-install-btn').forEach(b => b.disabled = true);
    _setStatus('Downloading installer for ' + tag + '...');
    const result = await SettingsIPC.invoke('updater:installRelease', url, tag);
    if (!result?.success) {
      const errMsg = result === null
        ? 'Request timed out — download may still be running.'
        : (result?.error || 'Unknown error');
      _setStatus('Install failed: ' + errMsg, true);
      if (progressEl) progressEl.style.display = 'none';
      _activeProgressEl = null;
      root.querySelectorAll('.upd-install-btn').forEach(b => b.disabled = false);
    }
  }

  // ── Advanced: fetch commits ────────────────────────────────────────────────
  async function _fetchCommits() {
    const btn = _container?.querySelector('#btn-upd-refresh');
    if (btn) { btn.disabled = true; btn.textContent = 'Fetching...'; }
    _setStatus('Fetching commits from GitHub...');
    try {
      const commits = await SettingsIPC.invoke('updater:fetchCommits');
      if (!commits || commits.error) {
        _setStatus('Failed: ' + (commits?.error || 'Network error'), true);
        return;
      }
      const card = _container?.querySelector('#upd-commits-card');
      const list = _container?.querySelector('#upd-commits-list');
      if (!card || !list) return;
      card.style.display = 'block';
      list.innerHTML = commits.map(c => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-bottom:1px solid #1a3030;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;color:#c8e8e5;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${c.message || 'No message'}
            </div>
            <div style="font-size:10px;color:#4a8080;margin-top:2px;font-family:monospace;display:flex;gap:8px;align-items:center;">
              <span>${(c.sha || '').slice(0,7)}</span>
              ${c.author ? `<span style="color:#3a6060;">· ${c.author}</span>` : ''}
              ${c.date ? `<span>· ${new Date(c.date).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
          <button class="setting-btn upd-apply-btn" data-sha="${c.sha}" data-msg="${(c.message||'').replace(/"/g,'&quot;')}"
            style="font-size:11px;padding:4px 10px;flex-shrink:0;">Apply</button>
        </div>`).join('');
      list.querySelectorAll('.upd-apply-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const sha = this.dataset.sha;
          const msg = this.dataset.msg;
          if (!confirm(`Apply commit ${sha.slice(0,7)}?\n\n"${msg}"\n\nApp will restart after applying.`)) return;
          this.disabled = true; this.textContent = 'Applying...';
          _setStatus('Applying commit ' + sha.slice(0,7) + '...');
          const result = await SettingsIPC.invoke('updater:applyCommit', sha);
          if (result?.success) {
            _setStatus('Applied! Restarting...');
            setTimeout(() => SettingsIPC.send('app:relaunch'), 1500);
          } else {
            _setStatus('Apply failed: ' + (result?.error || 'Unknown'), true);
            this.disabled = false; this.textContent = 'Apply';
          }
        });
      });
      _setStatus('');
    } catch (e) {
      _setStatus('Error: ' + e.message, true);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Fetch Commits'; }
    }
  }

  // ── Install progress ───────────────────────────────────────────────────────
  function _onInstallProgress(data) {
    // Use active progress element (tracked when install started)
    const progressEl = _activeProgressEl || _container?.querySelector('.upd-install-progress[style*="block"]');
    if (!progressEl) return;

    const bar  = progressEl.querySelector('.upd-install-bar');
    const pct  = progressEl.querySelector('.upd-install-pct');
    const info = progressEl.querySelector('.upd-install-info');

    if (bar)  bar.style.width = (data.pct || 0) + '%';
    if (pct)  pct.textContent = (data.pct || 0) + '%';
    if (info) {
      info.textContent = data.done
        ? 'Launching installer...'
        : data.totalMB && data.totalMB !== '?'
          ? `${data.receivedMB} MB / ${data.totalMB} MB`
          : `${data.receivedMB || 0} MB downloaded...`;
    }

    if (data.done) _activeProgressEl = null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function _setStatus(msg, isError = false) {
    const el = _container?.querySelector('#upd-status-text');
    if (el) { el.textContent = msg; el.style.color = isError ? '#ef4444' : 'var(--accent)'; }
  }

  function _compareVersions(a, b) {
    const pa = String(a).replace(/^v/, '').split('.').map(Number);
    const pb = String(b).replace(/^v/, '').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i]||0) > (pb[i]||0)) return 1;
      if ((pa[i]||0) < (pb[i]||0)) return -1;
    }
    return 0;
  }

  function _formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function _renderReleaseNotes(body) {
    if (!body) return '';
    return body
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:#0d2a2a;padding:1px 5px;border-radius:3px;color:#00c8b4;font-size:11px;">$1</code>')
      .replace(/^#{1,3}\s+(.+)$/gm, '<div style="font-size:11px;font-weight:700;color:#4a8080;text-transform:uppercase;letter-spacing:0.5px;margin:8px 0 4px;">$1</div>')
      .replace(/^[-*]\s+(.+)$/gm, '<div style="display:flex;gap:6px;margin:2px 0;"><span style="color:#00c8b4;flex-shrink:0;">•</span><span>$1</span></div>')
      .replace(/\n/g, '');
  }

  function _updateLastChecked() {
    const now = Date.now();
    try { localStorage.setItem('vx_upd_last_checked', String(now)); } catch {}
    _showLastChecked(now);
  }

  function _loadLastChecked() {
    try {
      const ts = parseInt(localStorage.getItem('vx_upd_last_checked') || '0');
      if (ts) _showLastChecked(ts);
    } catch {}
  }

  function _showLastChecked(ts) {
    const row = _container?.querySelector('#upd-last-checked-row');
    const txt = _container?.querySelector('#upd-last-checked-text');
    if (!row || !txt) return;
    row.style.display = 'block';
    txt.textContent = new Date(ts).toLocaleString();
  }

  function _showInstalledIndicator() {
    const ind = _container?.querySelector('#upd-installed-indicator');
    const dot = _container?.querySelector('#upd-installed-dot');
    const lbl = _container?.querySelector('#upd-installed-label');
    if (!ind || !dot || !lbl) return;
    ind.style.display = 'block';
    dot.style.background = '#22c55e';
    lbl.textContent = 'Running v' + _currentVer;
  }

  async function _loadLocalSha() {
    try {
      const shaObj = await SettingsIPC.invoke('updater:localSha');
      const sha = shaObj && typeof shaObj === 'object' ? shaObj.sha : shaObj;
      const el = _container?.querySelector('#upd-local-sha');
      if (el && sha) el.textContent = sha.slice(0, 7);
    } catch {}
  }

  return { bind };

})();
