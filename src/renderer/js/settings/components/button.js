/**
 * settings/components/button.js
 * Renders a button card-row.
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsButton.render({
 *     id:      'btn-clear-data',
 *     label:   'Clear Browsing Data',
 *     desc:    'Delete cookies, cache and history',
 *     btnText: 'Clear Now',
 *     variant: 'danger',   // 'default' | 'danger' | 'success'
 *     icon:    '<svg>...</svg>',
 *   })
 */

const SettingsButton = (() => {

  /**
   * @param {object}  opts
   * @param {string}  opts.id       - button element id
   * @param {string}  opts.label    - row label text
   * @param {string}  [opts.desc]   - row description text
   * @param {string}  opts.btnText  - button label
   * @param {string}  [opts.variant]- 'default' | 'danger' | 'success' | 'warn'
   * @param {string}  [opts.icon]   - SVG string for row icon (optional)
   * @param {string}  [opts.btnIcon]- SVG string inside button (optional)
   * @param {string}  [opts.extra]  - extra HTML after button (optional)
   * @returns {string} HTML string
   */
  function render({
    id,
    label,
    desc    = '',
    btnText = 'Action',
    variant = 'default',
    icon    = '',
    btnIcon = '',
    extra   = '',
  }) {
    const iconHTML = icon
      ? `<div class="row-icon">${icon}</div>`
      : `<div class="row-icon">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="10"/>
             <line x1="12" y1="8" x2="12" y2="12"/>
             <line x1="12" y1="16" x2="12.01" y2="16"/>
           </svg>
         </div>`;

    const variantClass = variant !== 'default' ? ` ${variant}` : '';
    const btnIconHTML  = btnIcon ? `${btnIcon} ` : '';

    return `
      <div class="card-row">
        ${iconHTML}
        <div class="row-text">
          <div class="row-label">${label}</div>
          ${desc ? `<div class="row-desc">${desc}</div>` : ''}
        </div>
        <button class="setting-btn${variantClass}" id="${id}">
          ${btnIconHTML}${btnText}
        </button>
        ${extra}
      </div>`;
  }

  /**
   * Render a standalone full-width action button (not inside card-row).
   */
  function renderStandalone({
    id,
    btnText = 'Action',
    variant = 'default',
    btnIcon = '',
    style   = '',
  }) {
    const variantClass = variant !== 'default' ? ` ${variant}` : '';
    const btnIconHTML  = btnIcon ? `${btnIcon} ` : '';
    return `
      <button class="setting-btn${variantClass}" id="${id}" style="${style}">
        ${btnIconHTML}${btnText}
      </button>`;
  }

  /**
   * Bind click listener.
   * @param {HTMLElement} container
   * @param {string}      id
   * @param {function}    onClick
   */
  function bind(container, id, onClick) {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('click', onClick);
  }

  /**
   * Set button loading state.
   */
  function setLoading(container, id, loading, loadingText = 'Loading...') {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.disabled = loading;
    if (loading) {
      el.dataset.originalText = el.textContent;
      el.textContent = loadingText;
    } else {
      el.textContent = el.dataset.originalText || el.textContent;
    }
  }

  return { render, renderStandalone, bind, setLoading };

})();
