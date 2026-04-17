/**
 * settings/components/sectionHeader.js
 * Renders a section title + optional subtitle.
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsSectionHeader.render({
 *     title:    'Appearance',
 *     subtitle: 'Customize the look and feel of Vortex',  // optional
 *     icon:     '<svg>...</svg>',                          // optional
 *   })
 */

const SettingsSectionHeader = (() => {

  /**
   * @param {object}  opts
   * @param {string}  opts.title      - section title
   * @param {string}  [opts.subtitle] - optional subtitle below title
   * @param {string}  [opts.icon]     - optional SVG icon beside title
   * @returns {string} HTML string
   */
  function render({ title, subtitle = '', icon = '' }) {
    const iconHTML = icon
      ? `<div style="
           width:36px; height:36px; border-radius:10px;
           background:rgba(0,200,180,0.1); border:1px solid rgba(0,200,180,0.2);
           display:flex; align-items:center; justify-content:center;
           color:var(--accent,#00c8b4); flex-shrink:0;">
           ${icon}
         </div>`
      : '';

    const subtitleHTML = subtitle
      ? `<div style="font-size:12px;color:#4a8080;margin-top:4px;">${subtitle}</div>`
      : '';

    return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        ${iconHTML}
        <div>
          <div class="section-title" style="margin-bottom:0;">${title}</div>
          ${subtitleHTML}
        </div>
      </div>`;
  }

  /**
   * Render a sub-group label (smaller, used inside sections).
   * @param {string} label
   * @returns {string} HTML string
   */
  function renderGroup(label) {
    return `
      <div style="
        font-size:10px; font-weight:700; text-transform:uppercase;
        letter-spacing:0.8px; color:#2a5050;
        padding:16px 0 8px; user-select:none;">
        ${label}
      </div>`;
  }

  return { render, renderGroup };

})();
