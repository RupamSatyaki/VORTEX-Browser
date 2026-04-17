/**
 * settings/components/toggle.js
 * Renders a toggle switch card-row.
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsToggle.render({
 *     id:      'set-tabpreview',
 *     label:   'Show Tab Previews',
 *     desc:    'Thumbnail preview on tab hover',
 *     checked: settings.tabpreview,
 *     icon:    '<svg>...</svg>',   // optional
 *   })
 */

const SettingsToggle = (() => {

  /**
   * @param {object} opts
   * @param {string}  opts.id       - input element id
   * @param {string}  opts.label    - row label text
   * @param {string}  [opts.desc]   - row description text
   * @param {boolean} opts.checked  - initial checked state
   * @param {string}  [opts.icon]   - SVG string for row icon (optional)
   * @param {string}  [opts.extra]  - extra HTML appended after toggle (optional)
   * @returns {string} HTML string
   */
  function render({ id, label, desc = '', checked = false, icon = '', extra = '' }) {
    const iconHTML = icon
      ? `<div class="row-icon">${icon}</div>`
      : `<div class="row-icon">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="3"/>
             <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42
                      M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
           </svg>
         </div>`;

    return `
      <div class="card-row">
        ${iconHTML}
        <div class="row-text">
          <div class="row-label">${label}</div>
          ${desc ? `<div class="row-desc">${desc}</div>` : ''}
        </div>
        <label class="toggle">
          <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}/>
          <div class="toggle-track"></div>
        </label>
        ${extra}
      </div>`;
  }

  /**
   * Bind a change listener to a rendered toggle.
   * @param {HTMLElement} container - parent element containing the toggle
   * @param {string}      id        - input element id
   * @param {function}    onChange  - callback(checked: boolean)
   */
  function bind(container, id, onChange) {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => onChange(el.checked));
  }

  /**
   * Update checked state programmatically.
   * @param {HTMLElement} container
   * @param {string}      id
   * @param {boolean}     checked
   */
  function setValue(container, id, checked) {
    const el = container.querySelector(`#${id}`);
    if (el) el.checked = checked;
  }

  return { render, bind, setValue };

})();
