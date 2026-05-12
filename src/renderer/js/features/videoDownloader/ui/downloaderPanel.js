/**
 * features/videoDownloader/ui/downloaderPanel.js
 * Sidebar panel HTML — same pattern as Assistant panel.
 */

const VDLPanel = (() => {

  function render() {
    return `
      <div id="vdl-panel">

        <!-- Header -->
        <div id="vdl-header">
          <div id="vdl-header-icon">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div id="vdl-header-title">Video Downloader</div>
            <div id="vdl-header-subtitle">yt-dlp · 1000+ sites</div>
          </div>
          <button id="vdl-close-btn" title="Close (Ctrl+Shift+D)">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div id="vdl-body">

          <!-- yt-dlp not installed -->
          <div id="vdl-install-section" style="display:none">
            <div id="vdl-install-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div id="vdl-install-title">Install yt-dlp</div>
            <div id="vdl-install-desc">
              yt-dlp is required to download videos from YouTube, Instagram, Twitter and 1000+ sites.<br><br>
              It will be downloaded once (~10MB) and stored locally.
            </div>
            <div id="vdl-install-progress">
              <div id="vdl-install-progress-fill"></div>
            </div>
            <button id="vdl-install-btn">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Install yt-dlp
            </button>
          </div>

          <!-- Error message -->
          <div id="vdl-error"></div>

          <!-- URL input -->
          <div id="vdl-url-section">
            <div id="vdl-url-label">Video URL</div>
            <div id="vdl-url-row">
              <input id="vdl-url-input" type="text"
                placeholder="Paste URL or auto-detected from page..."
                spellcheck="false"/>
              <button id="vdl-fetch-btn">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Fetch
              </button>
            </div>
            <div id="vdl-auto-badge">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Auto-detected from current page
            </div>
          </div>

          <!-- Video info + format selector -->
          <div id="vdl-info-section">
            <div id="vdl-info-row">
              <img id="vdl-thumbnail" src="" alt="" style="display:none"/>
              <div id="vdl-info-text">
                <div id="vdl-video-title">—</div>
                <div id="vdl-video-meta">—</div>
                <div id="vdl-site-badge"></div>
              </div>
            </div>
            <div id="vdl-format-row">
              <select id="vdl-quality-select" class="vdl-select">
                <option value="">Select quality...</option>
              </select>
              <button id="vdl-download-btn" disabled>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
            </div>
            <!-- ffmpeg warning — shown when high quality selected but ffmpeg missing -->
            <div id="vdl-ffmpeg-warn" style="display:none;margin-top:8px;padding:8px 10px;
                 background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);
                 border-radius:7px;font-size:11px;color:#a08040;line-height:1.5;">
              <div style="display:flex;align-items:flex-start;gap:7px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#eab308" stroke-width="2" style="flex-shrink:0;margin-top:1px">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#eab308" stroke="none"/>
                </svg>
                <span>High quality requires <strong style="color:#eab308;">ffmpeg</strong> to merge video+audio.
                  <button id="vdl-ffmpeg-settings-btn" style="background:none;border:none;color:var(--accent);
                    font-size:11px;cursor:pointer;padding:0;text-decoration:underline;">
                    Install from Settings →
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Downloads section -->
          <div id="vdl-downloads-section">
            <div id="vdl-downloads-header">
              <div id="vdl-downloads-label">Downloads</div>
              <button id="vdl-clear-done-btn" title="Clear completed">Clear done</button>
            </div>
            <div id="vdl-downloads-list">
              <div id="vdl-downloads-empty">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                No downloads yet
              </div>
            </div>
          </div>

          <!-- Shortcut hint -->
          <div id="vdl-shortcut-hint">Ctrl+Shift+D to toggle</div>

        </div>
      </div>
    `;
  }

  return { render };

})();
