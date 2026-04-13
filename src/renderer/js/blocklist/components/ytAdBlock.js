/**
 * blocklist/components/ytAdBlock.js
 * YouTube Ad Blocker — DOM manipulation component for settings panel
 * Actual blocking happens in webviewPreload.js (Layer 2) + engine.js (Layer 1)
 */

const YtAdBlockCard = {
  render(container, settings, onToggle) {
    const {
      ytAdblock    = true,
      ytAdSpeed    = 16,
      ytRemoveCards = true,
      ytRemoveHomepageAds = true,
    } = settings || {};

    container.innerHTML = `
      <div style="background:#0f2222;border:1px solid #1e3838;border-radius:10px;overflow:hidden;margin-bottom:8px;">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #1a3030;">
          <div style="width:36px;height:36px;border-radius:9px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#ef4444">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;color:#c8e8e5;display:flex;align-items:center;gap:8px;">
              YouTube Ad Blocker
              <span style="font-size:10px;background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.2);padding:1px 6px;border-radius:4px;">3 Layers</span>
            </div>
            <div style="font-size:11px;color:#4a8080;margin-top:2px;">Network + DOM + Speed — complete ad removal</div>
          </div>
        </div>

        <!-- Layer info -->
        <div style="padding:10px 14px;border-bottom:1px solid #1a3030;display:flex;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#22c55e;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);padding:3px 8px;border-radius:5px;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Layer 1: Network Block
          </div>
          <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#22c55e;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);padding:3px 8px;border-radius:5px;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Layer 2: DOM Removal
          </div>
          <div style="display:flex;align-items:center;gap:5px;font-size:10px;color:#22c55e;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);padding:3px 8px;border-radius:5px;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Layer 3: Speed Skip
          </div>
        </div>

        <!-- Toggles -->
        <div style="padding:4px 0;">

          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #1a3030;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#c8e8e5;">Block YouTube Ads</div>
              <div style="font-size:11px;color:#4a8080;margin-top:1px;">Network-level + DOM removal</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="yt-adblock-toggle" ${ytAdblock ? 'checked' : ''}/>
              <div class="toggle-track"></div>
            </label>
          </div>

          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #1a3030;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#c8e8e5;">Auto-Skip with Speed</div>
              <div style="font-size:11px;color:#4a8080;margin-top:1px;">Speed up unskippable ads then skip</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <select id="yt-speed-select" style="background:#162828;border:1px solid #2e4a4c;border-radius:6px;color:#c8e8e5;font-size:11px;padding:4px 8px;cursor:pointer;outline:none;">
                <option value="4"  ${ytAdSpeed==4  ?'selected':''}>4x</option>
                <option value="8"  ${ytAdSpeed==8  ?'selected':''}>8x</option>
                <option value="16" ${ytAdSpeed==16 ?'selected':''}>16x</option>
                <option value="32" ${ytAdSpeed==32 ?'selected':''}>32x</option>
                <option value="64" ${ytAdSpeed==64 ?'selected':''}>64x</option>
              </select>
              <label class="toggle">
                <input type="checkbox" id="yt-speed-toggle" ${ytAdblock ? 'checked' : ''}/>
                <div class="toggle-track"></div>
              </label>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #1a3030;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#c8e8e5;">Remove Sponsored Cards</div>
              <div style="font-size:11px;color:#4a8080;margin-top:1px;">Hide promoted videos in sidebar</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="yt-cards-toggle" ${ytRemoveCards ? 'checked' : ''}/>
              <div class="toggle-track"></div>
            </label>
          </div>

          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;">
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:600;color:#c8e8e5;">Remove Homepage Promotions</div>
              <div style="font-size:11px;color:#4a8080;margin-top:1px;">Hide promoted content on YouTube home</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="yt-homepage-toggle" ${ytRemoveHomepageAds ? 'checked' : ''}/>
              <div class="toggle-track"></div>
            </label>
          </div>

        </div>
      </div>`;

    // Bind events
    container.querySelector('#yt-adblock-toggle').addEventListener('change', e => {
      onToggle('ytAdblock', e.target.checked);
    });
    container.querySelector('#yt-speed-toggle').addEventListener('change', e => {
      onToggle('ytAdblock', e.target.checked);
    });
    container.querySelector('#yt-speed-select').addEventListener('change', e => {
      onToggle('ytAdSpeed', parseInt(e.target.value));
    });
    container.querySelector('#yt-cards-toggle').addEventListener('change', e => {
      onToggle('ytRemoveCards', e.target.checked);
    });
    container.querySelector('#yt-homepage-toggle').addEventListener('change', e => {
      onToggle('ytRemoveHomepageAds', e.target.checked);
    });
  },
};
