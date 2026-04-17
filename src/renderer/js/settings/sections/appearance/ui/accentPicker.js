/**
 * settings/sections/appearance/ui/accentPicker.js
 * HTML for accent color picker row — pure HTML, no logic.
 */

const AccentPickerUI = (() => {

  const PRESETS = [
    { name: 'Teal',   color: '#00c8b4' },
    { name: 'Blue',   color: '#3b82f6' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Pink',   color: '#ec4899' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Red',    color: '#ef4444' },
    { name: 'Green',  color: '#22c55e' },
    { name: 'Yellow', color: '#eab308' },
  ];

  function render(settings) {
    const current = settings.accentColor || '#00c8b4';

    const swatches = PRESETS.map(p => `
      <button class="accent-swatch ${p.color === current ? 'active' : ''}"
        data-color="${p.color}" title="${p.name}"
        style="width:26px;height:26px;border-radius:50%;
               background:${p.color};
               border:2px solid ${p.color === current ? '#fff' : 'transparent'};
               cursor:pointer;transition:all 0.15s;flex-shrink:0;outline:none;">
      </button>`).join('');

    return `
      <div class="card-row" style="align-items:flex-start;padding-top:14px;padding-bottom:14px;">
        <div class="row-icon" style="margin-top:2px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="13.5" cy="6.5" r="2.5" fill="#ef4444" stroke="none"/>
            <circle cx="17.5" cy="10.5" r="2.5" fill="#f97316" stroke="none"/>
            <circle cx="8.5" cy="7.5" r="2.5" fill="#3b82f6" stroke="none"/>
            <circle cx="6.5" cy="12.5" r="2.5" fill="#8b5cf6" stroke="none"/>
            <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"
              stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <div class="row-text">
          <div class="row-label">Accent Color</div>
          <div class="row-desc">Browser highlight and interactive color</div>
        </div>
        <div id="accent-picker-wrap"
          style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
          <div id="accent-swatches"
            style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
            ${swatches}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;color:#4a8080;">Custom</span>
            <div style="position:relative;width:32px;height:32px;">
              <input type="color" id="set-accent-custom"
                value="${current}"
                style="position:absolute;inset:0;width:100%;height:100%;
                       opacity:0;cursor:pointer;border:none;padding:0;"/>
              <div id="accent-custom-preview"
                style="width:32px;height:32px;border-radius:8px;
                       border:2px solid #2e4a4c;cursor:pointer;
                       transition:border-color 0.2s;
                       background:${current};">
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  return { render, PRESETS };

})();
