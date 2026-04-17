/**
 * settings/components/card.js
 * Renders a settings card container (bordered group).
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsCard.render({
 *     children: `
 *       ${SettingsToggle.render({...})}
 *       ${SettingsSelect.render({...})}
 *     `,
 *     style: 'margin-bottom:20px;',  // optional
 *   })
 *
 *   // Or with a card title:
 *   SettingsCard.render({
 *     title:    'Privacy',
 *     children: `...`,
 *   })
 */

const SettingsCard = (() => {

  /**
   * @param {object}  opts
   * @param {string}  opts.children  - inner HTML (card-row items)
   * @param {string}  [opts.title]   - optional card title above rows
   * @param {string}  [opts.id]      - optional id on card element
   * @param {string}  [opts.style]   - optional inline style override
   * @returns {string} HTML string
   */
  function render({ children = '', title = '', id = '', style = '' }) {
    const idAttr    = id    ? `id="${id}"`       : '';
    const styleAttr = style ? `style="${style}"` : '';

    const titleHTML = title
      ? `<div style="
           font-size:11px; font-weight:700; text-transform:uppercase;
           letter-spacing:0.6px; color:#2a5050;
           padding:12px 18px 0; user-select:none;">
           ${title}
         </div>`
      : '';

    return `
      <div class="card" ${idAttr} ${styleAttr}>
        ${titleHTML}
        ${children}
      </div>`;
  }

  /**
   * Render an info/notice card (no border, tinted background).
   * @param {string} text
   * @param {string} [variant] - 'info' | 'warn' | 'danger' | 'success'
   * @returns {string} HTML string
   */
  function renderNotice(text, variant = 'info') {
    const COLORS = {
      info:    { bg: 'rgba(0,200,180,0.07)',   border: 'rgba(0,200,180,0.2)',   color: '#4a8080' },
      warn:    { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
      danger:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  color: '#ef4444' },
      success: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',  color: '#22c55e' },
    };
    const c = COLORS[variant] || COLORS.info;
    return `
      <div style="
        background:${c.bg}; border:1px solid ${c.border};
        border-radius:10px; padding:12px 16px;
        font-size:12px; color:${c.color};
        margin-bottom:12px; line-height:1.6;">
        ${text}
      </div>`;
  }

  /**
   * Render a divider line between card sections.
   * @returns {string} HTML string
   */
  function renderDivider() {
    return `<div style="height:1px;background:#1a3030;margin:0 18px;"></div>`;
  }

  return { render, renderNotice, renderDivider };

})();
