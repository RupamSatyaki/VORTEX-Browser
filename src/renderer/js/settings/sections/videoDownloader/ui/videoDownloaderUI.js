/**
 * settings/sections/videoDownloader/ui/videoDownloaderUI.js
 */

const VideoDownloaderUI = (() => {

  const SUPPORTED_SITES = [
    { name: 'YouTube',     url: 'youtube.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ef4444"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
    { name: 'Instagram',   url: 'instagram.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="url(#ig)" stroke-width="2"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f09433"/><stop offset="25%" stop-color="#e6683c"/><stop offset="50%" stop-color="#dc2743"/><stop offset="75%" stop-color="#cc2366"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#dc2743" stroke="none"/></svg>` },
    { name: 'Twitter/X',   url: 'twitter.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
    { name: 'TikTok',      url: 'tiktok.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>` },
    { name: 'Facebook',    url: 'facebook.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
    { name: 'Reddit',      url: 'reddit.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>` },
    { name: 'Vimeo',       url: 'vimeo.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#1ab7ea"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.48 4.807z"/></svg>` },
    { name: 'Twitch',      url: 'twitch.tv',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#9146ff"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>` },
    { name: 'Dailymotion', url: 'dailymotion.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#0066dc"><path d="M12.003 0C5.374 0 0 5.374 0 12.003 0 18.63 5.374 24 12.003 24 18.63 24 24 18.63 24 12.003 24 5.374 18.63 0 12.003 0zm4.912 15.445c-.636.844-1.56 1.266-2.77 1.266-.76 0-1.397-.19-1.91-.57v.45H10.2V6.868h2.035v3.24c.527-.38 1.164-.57 1.91-.57 1.21 0 2.134.422 2.77 1.266.637.844.955 1.98.955 3.32 0 1.34-.318 2.477-.955 3.32zm-2.77-5.04c-.57 0-1.04.19-1.41.57v2.3c.37.38.84.57 1.41.57.57 0 1.01-.19 1.32-.57.31-.38.465-.9.465-1.56 0-.66-.155-1.18-.465-1.56-.31-.38-.75-.57-1.32-.57z"/></svg>` },
    { name: 'SoundCloud',  url: 'soundcloud.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff5500"><path d="M1.175 12.225c-.015.132-.024.266-.024.401 0 .135.009.268.024.4l-.024-.4zm.899-3.1c-.372.372-.372.975 0 1.347l.674.674-.674-.674c-.372-.372-.372-.975 0-1.347zm21.751 3.1c0-3.314-2.686-6-6-6-.398 0-.787.04-1.163.115C15.98 2.95 13.2 1 10 1 6.134 1 3 4.134 3 8c0 .05.002.1.003.15C1.317 8.517 0 10.113 0 12c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4z"/></svg>` },
    { name: 'Bilibili',    url: 'bilibili.com',
      icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="#00a1d6"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>` },
  ];

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'Video Downloader',
        subtitle: 'yt-dlp powered — download from 1000+ sites',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" stroke-width="2">
                 <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                 <polygon points="10 8 16 12 10 16 10 8" fill="var(--accent)" stroke="none"/>
               </svg>`,
      })}

      <!-- yt-dlp Status Card -->
      ${SettingsCard.render({
        children: `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px 12px;
                      background:rgba(0,200,180,0.04);border-bottom:1px solid #1e3838;">
            <div style="width:38px;height:38px;border-radius:10px;
                        background:rgba(0,200,180,0.12);border:1px solid rgba(0,200,180,0.2);
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;color:#c8e8e5;">yt-dlp Engine</div>
              <div id="vdl-settings-status" style="font-size:11px;color:#4a8080;margin-top:2px;">
                Checking...
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <button id="vdl-settings-install-btn" style="display:none;
                padding:6px 14px;background:var(--accent);border:none;border-radius:7px;
                color:#001a18;font-size:11px;font-weight:700;cursor:pointer;">
                Install yt-dlp
              </button>
              <button id="vdl-settings-update-btn" style="display:none;
                padding:6px 14px;background:rgba(0,200,180,0.1);border:1px solid rgba(0,200,180,0.3);
                border-radius:7px;color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;">
                Update
              </button>
              <button id="vdl-settings-ffmpeg-btn" style="display:none;
                padding:6px 14px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);
                border-radius:7px;color:#eab308;font-size:11px;font-weight:600;cursor:pointer;"
                title="Required for merging video+audio (1080p+)">
                Install ffmpeg
              </button>
            </div>
          </div>

          <!-- Install progress -->
          <div id="vdl-settings-progress-wrap" style="display:none;padding:10px 16px;">
            <div style="font-size:11px;color:#4a8080;margin-bottom:6px;" id="vdl-settings-progress-label">
              Downloading yt-dlp...
            </div>
            <div style="height:4px;background:#1e3838;border-radius:2px;overflow:hidden;">
              <div id="vdl-settings-progress-fill" style="height:100%;background:var(--accent);
                   border-radius:2px;transition:width 0.3s;width:0%"></div>
            </div>
          </div>

          <!-- yt-dlp location -->
          ${SettingsInput.render({
            id:          'vdl-settings-ytdlp-path',
            label:       'yt-dlp Location',
            desc:        'Path to yt-dlp.exe (auto-managed)',
            value:       '',
            placeholder: 'Auto: %APPDATA%\\vortex\\tools\\yt-dlp.exe',
            icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                   </svg>`,
          })}

          <!-- ffmpeg location -->
          ${SettingsInput.render({
            id:          'vdl-settings-ffmpeg-path',
            label:       'ffmpeg Location',
            desc:        'Path to ffmpeg.exe — required for 1080p+ (video+audio merge)',
            value:       '',
            placeholder: 'Auto: %APPDATA%\\vortex\\tools\\ffmpeg.exe',
            icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#eab308" stroke-width="2">
                     <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                   </svg>`,
            extra: `<button id="vdl-settings-ffmpeg-btn" style="display:none;
              padding:5px 12px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);
              border-radius:6px;color:#eab308;font-size:11px;font-weight:600;
              cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.15s;"
              title="Required for merging video+audio (1080p+)">
              Install ffmpeg
            </button>`,
          })}

          <!-- Default quality -->
          ${SettingsSelect.render({
            id:    'vdl-settings-quality',
            label: 'Default Quality',
            desc:  'Preferred video quality when downloading',
            value: settings.vdlDefaultQuality || '1080p',
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>`,
            options: [
              { value: 'best',  label: 'Best available' },
              { value: '2160p', label: '4K (2160p)' },
              { value: '1440p', label: '1440p' },
              { value: '1080p', label: '1080p (recommended)' },
              { value: '720p',  label: '720p' },
              { value: '480p',  label: '480p' },
              { value: 'audio', label: 'Audio only (MP3)' },
            ],
          })}
        `,
      })}

      <!-- Supported Sites -->
      ${SettingsCard.render({
        children: `
          <div style="padding:12px 16px 8px;border-bottom:1px solid #1e3838;
                      display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:12px;font-weight:700;color:#c8e8e5;margin-bottom:2px;">
                Supported Sites
              </div>
              <div style="font-size:11px;color:#4a8080;">
                yt-dlp supports 1000+ video sites
              </div>
            </div>
            <button id="vdl-settings-sites-link" style="
              padding:5px 12px;background:rgba(0,200,180,0.08);
              border:1px solid rgba(0,200,180,0.2);border-radius:6px;
              color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;
              transition:all 0.15s;white-space:nowrap;">
              View all 1000+ →
            </button>
          </div>
          <div style="padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px;">
            ${SUPPORTED_SITES.map(s => `
              <div style="display:flex;align-items:center;gap:7px;
                          background:#122222;border:1px solid #1e3838;border-radius:8px;
                          padding:6px 11px;font-size:11.5px;color:#7aadad;cursor:default;">
                <span style="display:flex;align-items:center;flex-shrink:0;">${s.icon}</span>
                <span>${s.name}</span>
              </div>
            `).join('')}
          </div>
        `,
      })}

      <!-- All Sites Modal -->
      <div id="vdl-sites-modal" style="display:none;position:fixed;inset:0;z-index:99999;
           background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
           align-items:center;justify-content:center;">
        <div style="background:#0d1f1f;border:1px solid #1e3838;border-radius:14px;
                    width:min(700px,92vw);height:min(600px,85vh);display:flex;flex-direction:column;
                    box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;">
          <!-- Modal header -->
          <div style="display:flex;align-items:center;justify-content:space-between;
                      padding:14px 18px 10px;border-bottom:1px solid #1e3838;flex-shrink:0;">
            <div>
              <div style="font-size:14px;font-weight:700;color:#c8e8e5;">All Supported Sites</div>
              <div style="font-size:11px;color:#4a8080;margin-top:2px;">yt-dlp supports 1000+ sites</div>
            </div>
            <button id="vdl-sites-modal-close" style="width:28px;height:28px;border-radius:6px;
              border:none;background:transparent;color:#4a8080;cursor:pointer;
              display:flex;align-items:center;justify-content:center;transition:all 0.15s;"
              onmouseover="this.style.background='rgba(200,60,60,0.15)';this.style.color='#c86060'"
              onmouseout="this.style.background='transparent';this.style.color='#4a8080'">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <!-- Search bar -->
          <div style="padding:10px 18px;border-bottom:1px solid #1e3838;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:8px;background:#122222;
                        border:1px solid #1e3838;border-radius:8px;padding:7px 12px;
                        transition:border-color 0.15s;"
                 onfocusin="this.style.borderColor='rgba(0,200,180,0.4)'"
                 onfocusout="this.style.borderColor='#1e3838'">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#4a8080" stroke-width="2" style="flex-shrink:0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input id="vdl-sites-search" type="text" placeholder="Search sites..."
                style="flex:1;background:transparent;border:none;outline:none;
                       color:#c8e8e5;font-size:12px;"
                spellcheck="false"/>
              <button id="vdl-sites-search-clear" style="background:none;border:none;
                color:#4a8080;cursor:pointer;padding:0;display:none;font-size:14px;line-height:1;">
                ×
              </button>
            </div>
          </div>
          <!-- Sites list — scrollable -->
          <div id="vdl-sites-list" style="flex:1;overflow-y:auto;overflow-x:hidden;
               padding:14px 18px;min-height:0;">
            <div style="font-size:11px;color:#4a8080;text-align:center;padding:20px;">
              Loading...
            </div>
          </div>
          <style>
            #vdl-sites-list::-webkit-scrollbar { width: 6px; }
            #vdl-sites-list::-webkit-scrollbar-track { background: #0a1a1a; }
            #vdl-sites-list::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 3px; }
            #vdl-sites-list::-webkit-scrollbar-thumb:hover { background: var(--accent); }
          </style>
          <!-- Footer -->
          <div style="padding:10px 18px;border-top:1px solid #1e3838;flex-shrink:0;
                      display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;color:#4a8080;">
              Source: <a href="#" id="vdl-sites-github-link"
                style="color:var(--accent);text-decoration:none;">
                github.com/yt-dlp/yt-dlp
              </a>
            </span>
            <button id="vdl-sites-modal-close2" style="padding:6px 16px;background:rgba(0,200,180,0.1);
              border:1px solid rgba(0,200,180,0.2);border-radius:6px;color:var(--accent);
              font-size:11px;font-weight:600;cursor:pointer;">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return { render };

})();
