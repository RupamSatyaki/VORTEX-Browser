/**
 * settings/sections/youtube/ui/youtubeUI.js
 * HTML for YouTube section — pure HTML, no logic.
 */

const YoutubeUI = (() => {

  function render(settings) {
    return `
      ${SettingsSectionHeader.render({
        title: 'YouTube',
        subtitle: 'Ad blocking and content filtering for YouTube',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#ef4444">
                 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          <!-- Master toggle header -->
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px 12px;
                      background:rgba(239,68,68,0.05);border-bottom:1px solid #1e3838;">
            <div style="width:38px;height:38px;border-radius:10px;
                        background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#ef4444">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:700;color:#c8e8e5;
                          display:flex;align-items:center;gap:8px;">
                YouTube Ad Blocker
                <span style="font-size:10px;background:rgba(34,197,94,0.12);color:#22c55e;
                             border:1px solid rgba(34,197,94,0.2);padding:1px 7px;border-radius:10px;">
                  3 Layers
                </span>
              </div>
              <div style="font-size:11px;color:#4a8080;margin-top:2px;">
                Network block + DOM removal + Speed skip
              </div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="yt-adblock-enabled" ${settings.ytAdblock !== false ? 'checked' : ''}/>
              <div class="toggle-track"></div>
            </label>
          </div>

          <!-- Ad skip speed -->
          ${SettingsSelect.render({
            id:    'yt-ad-speed',
            label: 'Ad Skip Speed',
            desc:  'Speed for unskippable ads — higher = faster skip',
            value: String(settings.ytAdSpeed || 16),
            icon:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>`,
            options: [
              { value: '4',   label: '4x' },
              { value: '8',   label: '8x' },
              { value: '16',  label: '16x' },
              { value: '32',  label: '32x' },
              { value: '64',  label: '64x' },
              { value: '256', label: '256x' },
            ],
          })}

          <!-- Layer badges -->
          <div style="display:flex;gap:8px;padding:8px 16px 10px;flex-wrap:wrap;">
            ${['Layer 1: Network Block (IMA SDK)', 'Layer 2: DOM Removal', 'Layer 3: Speed Skip'].map(l => `
              <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#22c55e;
                          background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);
                          padding:3px 9px;border-radius:5px;">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                ${l}
              </div>`).join('')}
          </div>

          <!-- Remove sponsored cards -->
          ${SettingsToggle.render({
            id:      'yt-remove-cards',
            label:   'Remove Sponsored Cards',
            desc:    'Hide promoted videos in sidebar and search',
            checked: settings.ytRemoveCards !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                      </svg>`,
          })}

          <!-- Remove homepage promotions -->
          ${SettingsToggle.render({
            id:      'yt-remove-homepage',
            label:   'Remove Homepage Promotions',
            desc:    'Hide promoted content on YouTube home page',
            checked: settings.ytRemoveHomepageAds !== false,
            icon:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <line x1="9" y1="22" x2="9" y2="12"/>
                        <line x1="15" y1="22" x2="15" y2="12"/>
                      </svg>`,
          })}

          <!-- Warning note -->
          <div style="margin:4px 12px 12px;padding:8px 12px;background:#0a1a1a;
                      border-radius:8px;border-left:3px solid #eab308;
                      display:flex;align-items:flex-start;gap:8px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#eab308"
              stroke-width="2" style="flex-shrink:0;margin-top:1px;">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style="font-size:11px;color:#a08040;line-height:1.5;">
              On low-end PCs, set speed to <strong style="color:#eab308;">16x or lower</strong>
              to avoid video freezing after the ad ends.
            </span>
          </div>
        `,
      })}`;
  }

  return { render };

})();
