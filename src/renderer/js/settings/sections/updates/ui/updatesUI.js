/**
 * settings/sections/updates/ui/updatesUI.js
 * HTML for Updates section — pure HTML, no logic.
 */

const UpdatesUI = (() => {

  function render() {
    return `
      ${SettingsSectionHeader.render({
        title:    'Updates',
        subtitle: 'Check for new releases and manage your Vortex version',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <polyline points="1 4 1 10 7 10"/>
                 <polyline points="23 20 23 14 17 14"/>
                 <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
               </svg>`,
      })}

      <!-- Version status card -->
      ${SettingsCard.render({
        children: `
          <div class="card-row" style="flex-wrap:wrap;gap:10px;">
            <div class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="row-text">
              <div class="row-label">Current Version</div>
              <div class="row-desc" id="upd-current-ver">Loading...</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
              <button class="setting-btn" id="btn-upd-check">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                  stroke-width="2" style="margin-right:4px;vertical-align:middle;">
                  <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
                </svg>
                Check for Updates
              </button>
            </div>
          </div>

          <!-- Installed indicator -->
          <div id="upd-installed-indicator"
            style="display:none;padding:8px 16px 10px;border-top:1px solid #1a3030;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div id="upd-installed-dot"
                style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:#4a8080;"></div>
              <span id="upd-installed-label" style="font-size:11.5px;color:#7aadad;"></span>
            </div>
          </div>

          <!-- Last checked -->
          <div id="upd-last-checked-row"
            style="display:none;padding:6px 16px 10px;border-top:1px solid #1a3030;">
            <div style="display:flex;align-items:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#2e5a5a" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style="font-size:11px;color:#2e5a5a;">Last checked: </span>
              <span id="upd-last-checked-text" style="font-size:11px;color:#4a8080;"></span>
            </div>
          </div>
        `,
      })}

      <!-- Status message + all releases link -->
      <div id="upd-status"
        style="font-size:12px;color:var(--accent);padding:4px 2px;min-height:18px;
               display:flex;align-items:center;justify-content:space-between;">
        <span id="upd-status-text"></span>
        <a href="https://github.com/RupamSatyaki/VORTEX-Browser/releases"
          id="upd-all-releases"
          style="font-size:11px;color:#4a8080;text-decoration:none;
                 display:flex;align-items:center;gap:4px;transition:color 0.15s;flex-shrink:0;"
          onmouseenter="this.style.color='var(--accent)'"
          onmouseleave="this.style.color='#4a8080'"
          target="_blank">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
          All Releases ↗
        </a>
      </div>

      <!-- Release info card -->
      <div class="card" id="upd-release-card" style="display:none;margin-bottom:12px;">
        <!-- Up to date -->
        <div id="upd-uptodate" style="display:none;padding:18px 16px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">✅</div>
          <div style="font-size:14px;font-weight:700;color:#22c55e;">You are up to date!</div>
          <div style="font-size:12px;color:#4a8080;margin-top:4px;" id="upd-latest-label"></div>
        </div>
        <!-- Update available -->
        <div id="upd-available" style="display:none;">
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px 12px;border-bottom:1px solid #1e3838;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,200,180,0.12);
                        border:1px solid rgba(0,200,180,0.25);display:flex;align-items:center;
                        justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:700;color:#c8e8e5;">New version available!</div>
              <div style="font-size:12px;color:var(--accent);margin-top:2px;" id="upd-new-tag"></div>
            </div>
          </div>
          <!-- Release notes -->
          <div style="padding:12px 16px;border-bottom:1px solid #1e3838;">
            <div style="font-size:11px;color:#4a8080;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
              Release Notes
            </div>
            <div id="upd-release-notes"
              style="font-size:12px;color:#7aadad;line-height:1.7;max-height:140px;overflow-y:auto;padding-right:4px;">
            </div>
          </div>
          <!-- Download -->
          <div style="padding:12px 16px;" id="upd-download-section">
            <div id="upd-asset-wrap" style="display:none;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span id="upd-asset-name" style="font-size:12px;color:#7aadad;flex:1;"></span>
                <span id="upd-asset-size" style="font-size:11px;color:#4a8080;"></span>
              </div>
              <button class="setting-btn" id="btn-upd-download"
                style="width:100%;justify-content:center;padding:10px;font-size:13px;font-weight:600;
                       background:rgba(0,200,180,0.12);border-color:rgba(0,200,180,0.3);color:var(--accent);">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                  stroke-width="2" style="margin-right:6px;vertical-align:middle;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Installer
              </button>
            </div>
            <div id="upd-no-asset"
              style="display:none;font-size:12px;color:#4a8080;text-align:center;padding:8px 0;">
              No installer found in this release.
              <a id="upd-manual-link" href="#" style="color:var(--accent);text-decoration:none;" target="_blank">
                Download manually ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div id="upd-progress" style="display:none;margin-bottom:12px;">
        ${SettingsCard.render({
          children: `
            <div class="card-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
              <div style="display:flex;align-items:center;gap:10px;width:100%;">
                <div class="row-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                </div>
                <div class="row-text">
                  <div class="row-label" id="upd-progress-title">Downloading...</div>
                  <div class="row-desc" id="upd-progress-desc"></div>
                </div>
              </div>
              <div style="width:100%;height:4px;background:#1a3838;border-radius:2px;overflow:hidden;">
                <div class="upd-install-bar"
                  style="height:100%;background:var(--accent);width:0%;
                         transition:width 0.3s ease;border-radius:2px;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;width:100%;">
                <span class="upd-install-info" style="font-size:10px;color:#4a8080;"></span>
                <span class="upd-install-pct" style="font-size:10px;color:var(--accent);font-weight:700;"></span>
              </div>
            </div>
          `,
        })}
      </div>

      <!-- All releases list card — shown after check -->
      <div class="card" id="upd-releases-list-card" style="display:none;margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:10px 14px;border-bottom:1px solid #1e3838;">
          <span style="font-size:12px;font-weight:700;color:#7aadad;">All Releases</span>
          <span id="upd-releases-count" style="font-size:11px;color:#4a8080;"></span>
        </div>
        <div id="upd-releases-list"></div>
      </div>

      <!-- Delete applied commits card -->
      <div class="card" id="upd-delete-card" style="display:none;margin-bottom:12px;">
        <div class="card-row">
          <div class="row-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </div>
          <div class="row-text">
            <div class="row-label" style="color:#ef4444;">Delete Applied Commits</div>
            <div class="row-desc" id="upd-applied-sha-label">Revert to bundled version</div>
          </div>
          <button class="setting-btn danger" id="btn-upd-delete-applied">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
              stroke-width="2" style="margin-right:4px;vertical-align:middle;">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- Advanced: commit-based updater -->
      <div style="border:1px solid #1e3838;border-radius:10px;overflow:hidden;">
        <div id="upd-advanced-toggle"
          style="display:flex;align-items:center;gap:10px;padding:11px 14px;
                 cursor:pointer;user-select:none;transition:background 0.15s;"
          onmouseenter="this.style.background='#162828'"
          onmouseleave="this.style.background=''">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4a8080" stroke-width="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
          <span style="font-size:12px;font-weight:600;color:#7aadad;flex:1;">
            Advanced — Commit-based Update
          </span>
          <span id="upd-local-sha" style="font-size:10px;color:#4a8080;font-family:monospace;"></span>
          <svg id="upd-adv-chevron" viewBox="0 0 24 24" width="13" height="13"
            fill="none" stroke="#4a8080" stroke-width="2.5"
            style="transition:transform 0.2s;flex-shrink:0;">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div id="upd-advanced-body" style="display:none;border-top:1px solid #1e3838;">
          <div style="padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #1a3030;">
            <span style="font-size:11.5px;color:#4a8080;flex:1;">
              Apply any commit directly from GitHub repository
            </span>
            <button class="setting-btn" id="btn-upd-refresh" style="font-size:11px;padding:5px 12px;">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
                stroke-width="2" style="margin-right:4px;vertical-align:middle;">
                <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83"/>
              </svg>
              Fetch Commits
            </button>
          </div>
          <div class="card" id="upd-commits-card"
            style="display:none;border-radius:0;border:none;border-top:1px solid #1a3030;">
            <div id="upd-commits-list"></div>
          </div>
        </div>
      </div>`;
  }

  return { render };

})();
