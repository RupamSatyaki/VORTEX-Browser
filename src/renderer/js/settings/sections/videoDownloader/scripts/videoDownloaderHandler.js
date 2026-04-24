/**
 * settings/sections/videoDownloader/scripts/videoDownloaderHandler.js
 */

const VideoDownloaderHandler = (() => {

  async function bind(container, settings) {
    await _loadStatus(container);

    // Install yt-dlp
    container.querySelector('#vdl-settings-install-btn')?.addEventListener('click', () => _startInstall(container, 'ytdlp'));
    // Update yt-dlp
    container.querySelector('#vdl-settings-update-btn')?.addEventListener('click', () => _startInstall(container, 'ytdlp'));
    // Install ffmpeg
    container.querySelector('#vdl-settings-ffmpeg-btn')?.addEventListener('click', () => _startInstall(container, 'ffmpeg'));

    // Default quality
    SettingsSelect.bind(container, 'vdl-settings-quality', async (value) => {
      settings.vdlDefaultQuality = value;
      await SettingsStorage.save(settings);
    });

    // Supported sites modal
    container.querySelector('#vdl-settings-sites-link')?.addEventListener('click', () => {
      _openSitesModal(container);
    });

    container.querySelector('#vdl-sites-modal-close')?.addEventListener('click', () => {
      const modal = container.querySelector('#vdl-sites-modal');
      if (modal) modal.style.display = 'none';
    });

    container.querySelector('#vdl-sites-modal-close2')?.addEventListener('click', () => {
      const modal = container.querySelector('#vdl-sites-modal');
      if (modal) modal.style.display = 'none';
    });

    container.querySelector('#vdl-sites-modal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.style.display = 'none';
      }
    });

    container.querySelector('#vdl-sites-github-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.vortexAPI?.send('shell:openExternal', 'https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md');
    });

    // Search clear button
    const searchInput = container.querySelector('#vdl-sites-search');
    const clearBtn    = container.querySelector('#vdl-sites-search-clear');
    if (searchInput && clearBtn) {
      searchInput.addEventListener('input', () => {
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
        try {
          const sites = JSON.parse(container.querySelector('#vdl-sites-list')?.dataset.sites || '[]');
          if (sites.length) _filterSites(container, sites, searchInput.value);
        } catch {}
      });
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        try {
          const sites = JSON.parse(container.querySelector('#vdl-sites-list')?.dataset.sites || '[]');
          if (sites.length) _renderSiteGrid(container.querySelector('#vdl-sites-list'), sites);
        } catch {}
        searchInput.focus();
      });
    }

    // Install progress — via SettingsIPC.on (settings panel is an iframe)
    SettingsIPC.on('vdl:ytdlpProgress', ({ type: t, percent }) => {
      const fill  = container.querySelector('#vdl-settings-progress-fill');
      const label = container.querySelector('#vdl-settings-progress-label');
      if (fill)  fill.style.width = percent + '%';
      if (label) label.textContent = `${t === 'ffmpeg' ? 'ffmpeg' : 'yt-dlp'} ${percent}%`;
    });
  }

  async function _loadStatus(container) {
    try {
      const status = await SettingsIPC.invoke('vdl:getYtdlpStatus');
      if (!status) return; // IPC not ready yet

      const statusEl   = container.querySelector('#vdl-settings-status') || document.getElementById('vdl-settings-status');
      const installBtn = container.querySelector('#vdl-settings-install-btn');
      const updateBtn  = container.querySelector('#vdl-settings-update-btn');
      const ffmpegBtn  = container.querySelector('#vdl-settings-ffmpeg-btn');
      const ytdlpInput  = container.querySelector('#vdl-settings-ytdlp-path');
      const ffmpegInput = container.querySelector('#vdl-settings-ffmpeg-path');

      if (ytdlpInput)  ytdlpInput.value  = status.path      || '';
      if (ffmpegInput) ffmpegInput.value = status.ffmpegPath || '';

      if (!status.installed) {
        if (statusEl)   statusEl.textContent = 'Not installed';
        if (installBtn) installBtn.style.display = 'block';
        if (updateBtn)  updateBtn.style.display  = 'none';
        if (ffmpegBtn)  ffmpegBtn.style.display  = 'none';
      } else {
        const ffmpegOk = status.ffmpegInstalled;
        if (statusEl)   statusEl.textContent = `yt-dlp v${status.version || '?'} · ffmpeg ${ffmpegOk ? '✓ installed' : '⚠ not installed (needed for 1080p+)'}`;
        if (installBtn) installBtn.style.display = 'none';
        if (updateBtn)  updateBtn.style.display  = 'block';
        if (ffmpegBtn)  ffmpegBtn.style.display  = ffmpegOk ? 'none' : 'block';
      }
    } catch (e) { console.error('[VDL Settings]', e); }
  }

  async function _startInstall(container, type = 'ytdlp') {
    const installBtn   = container.querySelector('#vdl-settings-install-btn');
    const updateBtn    = container.querySelector('#vdl-settings-update-btn');
    const ffmpegBtn    = container.querySelector('#vdl-settings-ffmpeg-btn');
    const progressWrap = container.querySelector('#vdl-settings-progress-wrap');
    const fill         = container.querySelector('#vdl-settings-progress-fill');
    const label        = container.querySelector('#vdl-settings-progress-label');
    const statusEl     = container.querySelector('#vdl-settings-status') || document.getElementById('vdl-settings-status');

    if (installBtn) installBtn.style.display = 'none';
    if (updateBtn)  updateBtn.style.display  = 'none';
    if (ffmpegBtn)  ffmpegBtn.style.display  = 'none';
    if (progressWrap) progressWrap.style.display = 'block';
    if (fill)  fill.style.width = '0%';
    if (label) label.textContent = type === 'ffmpeg' ? 'Downloading ffmpeg (~60MB)...' : 'Downloading yt-dlp...';

    const channel = type === 'ffmpeg' ? 'vdl:downloadFfmpeg' : 'vdl:downloadYtdlp';
    const result  = await SettingsIPC.invoke(channel);

    if (progressWrap) progressWrap.style.display = 'none';

    if (result.success) {
      await _loadStatus(container);
    } else {
      if (statusEl) statusEl.textContent = `Error: ${result.error}`;
      if (type === 'ffmpeg' && ffmpegBtn) ffmpegBtn.style.display = 'block';
      else if (installBtn) installBtn.style.display = 'block';
    }
  }

  // Refresh status — called on every section navigate
  async function refresh(container) {
    await _loadStatus(container);
  }

  // Open all supported sites modal — fetch from GitHub
  async function _openSitesModal(container) {
    const modal = container.querySelector('#vdl-sites-modal');
    const list  = container.querySelector('#vdl-sites-list');
    if (!modal || !list) return;

    modal.style.display = 'flex';
    list.innerHTML = '<div style="font-size:11px;color:#4a8080;text-align:center;padding:20px;">Loading sites list...</div>';

    try {
      const res  = await fetch('https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/supportedsites.md');
      const text = await res.text();

      // Parse markdown — extract site names
      const lines = text.split('\n');
      const sites = [];
      lines.forEach(line => {
        const m = line.match(/^\s*-\s+\*\*([^*]+)\*\*/);
        if (m) sites.push(m[1].trim());
      });

      if (sites.length === 0) {
        list.innerHTML = '<div style="font-size:11px;color:#4a8080;text-align:center;padding:20px;">Could not load sites list.</div>';
        return;
      }

      // Store sites for search
      list.dataset.sites = JSON.stringify(sites);

      // Add search bar
      const searchBar = container.querySelector('#vdl-sites-search');
      if (searchBar) {
        searchBar.value = '';
        searchBar.oninput = () => _filterSites(container, sites, searchBar.value);
      }

      _renderSiteGrid(list, sites);

    } catch {
      list.innerHTML = `
        <div style="font-size:11px;color:#4a8080;text-align:center;padding:20px;">
          Could not load online.
          <a href="#" id="vdl-sites-fallback" style="color:var(--accent);">Open on GitHub →</a>
        </div>
      `;
      list.querySelector('#vdl-sites-fallback')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.vortexAPI?.send('shell:openExternal', 'https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md');
      });
    }
  }

  function _filterSites(container, allSites, query) {
    const list = container.querySelector('#vdl-sites-list');
    if (!list) return;
    const q = query.trim().toLowerCase();
    const filtered = q ? allSites.filter(s => s.toLowerCase().includes(q)) : allSites;
    _renderSiteGrid(list, filtered, q);
  }

  function _renderSiteGrid(list, sites, highlight = '') {
    if (sites.length === 0) {
      list.innerHTML = `<div style="font-size:11px;color:#4a8080;text-align:center;padding:20px;">No sites found for "${highlight}"</div>`;
      return;
    }

    list.innerHTML = `
      <div style="margin-bottom:10px;font-size:11px;color:#4a8080;">
        ${sites.length} site${sites.length !== 1 ? 's' : ''} ${highlight ? `matching "${highlight}"` : 'supported'}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px;">
        ${sites.map(s => {
          // Try to get favicon from Google's favicon service
          const domain = s.toLowerCase().replace(/[^a-z0-9.-]/g, '') + '.com';
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(s)}&sz=16`;
          const displayName = highlight
            ? s.replace(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                '<span style="color:var(--accent);font-weight:700;">$1</span>')
            : s;
          return `
            <div style="background:#122222;border:1px solid #1e3838;border-radius:6px;
                        padding:6px 10px;font-size:11px;color:#7aadad;
                        display:flex;align-items:center;gap:7px;
                        overflow:hidden;cursor:default;transition:border-color 0.15s;"
                 onmouseover="this.style.borderColor='rgba(0,200,180,0.3)'"
                 onmouseout="this.style.borderColor='#1e3838'"
                 title="${s}">
              <img src="${faviconUrl}" width="14" height="14"
                   style="flex-shrink:0;border-radius:2px;opacity:0.8;"
                   onerror="this.style.display='none'"/>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${displayName}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return { bind, refresh };

})();
