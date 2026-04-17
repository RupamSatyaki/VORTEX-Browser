/**
 * settings/components/select.js
 * Renders a select dropdown card-row.
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsSelect.render({
 *     id:      'set-engine',
 *     label:   'Default Search Engine',
 *     desc:    'Used in address bar searches',
 *     value:   settings.engine,
 *     icon:    '<svg>...</svg>',
 *     options: [
 *       { value: 'google',     label: 'Google' },
 *       { value: 'bing',       label: 'Bing' },
 *       { value: 'duckduckgo', label: 'DuckDuckGo' },
 *     ],
 *   })
 */

const SettingsSelect = (() => {

  /**
   * @param {object}   opts
   * @param {string}   opts.id       - select element id
   * @param {string}   opts.label    - row label text
   * @param {string}   [opts.desc]   - row description text
   * @param {string}   opts.value    - currently selected value
   * @param {string}   [opts.icon]   - SVG string for row icon (optional)
   * @param {Array}    opts.options  - [{ value, label }]
   * @param {string}   [opts.extra]  - extra HTML after select (optional)
   * @returns {string} HTML string
   */
  function render({ id, label, desc = '', value = '', icon = '', options = [], extra = '' }) {
    const iconHTML = icon
      ? `<div class="row-icon">${icon}</div>`
      : `<div class="row-icon">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2">
             <polyline points="6 9 12 15 18 9"/>
           </svg>
         </div>`;

    const optionsHTML = options.map(opt =>
      `<option value="${_esc(opt.value)}" ${opt.value === value ? 'selected' : ''}>
         ${_esc(opt.label)}
       </option>`
    ).join('');

    return `
      <div class="card-row">
        ${iconHTML}
        <div class="row-text">
          <div class="row-label">${label}</div>
          ${desc ? `<div class="row-desc">${desc}</div>` : ''}
        </div>
        <select class="setting-select" id="${id}">
          ${optionsHTML}
        </select>
        ${extra}
      </div>`;
  }

  /**
   * Bind a change listener.
   * @param {HTMLElement} container
   * @param {string}      id
   * @param {function}    onChange  - callback(value: string)
   */
  function bind(container, id, onChange) {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', () => onChange(el.value));
  }

  /**
   * Update selected value programmatically.
   */
  function setValue(container, id, value) {
    const el = container.querySelector(`#${id}`);
    if (el) el.value = value;
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, bind, setValue };

})();
