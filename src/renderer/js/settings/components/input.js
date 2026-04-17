/**
 * settings/components/input.js
 * Renders a text input card-row.
 * Pure HTML — no event listeners.
 *
 * Usage:
 *   SettingsInput.render({
 *     id:          'set-homepage',
 *     label:       'Homepage URL',
 *     desc:        'Used when startup is set to homepage',
 *     value:       settings.homepage,
 *     placeholder: 'https://www.google.com',
 *     icon:        '<svg>...</svg>',
 *     type:        'text',   // 'text' | 'password' | 'number' | 'url'
 *   })
 */

const SettingsInput = (() => {

  /**
   * @param {object}  opts
   * @param {string}  opts.id           - input element id
   * @param {string}  opts.label        - row label text
   * @param {string}  [opts.desc]       - row description text
   * @param {string}  [opts.value]      - current value
   * @param {string}  [opts.placeholder]
   * @param {string}  [opts.icon]       - SVG string (optional)
   * @param {string}  [opts.type]       - input type (default: 'text')
   * @param {string}  [opts.extra]      - extra HTML after input (optional)
   * @param {boolean} [opts.fullWidth]  - if true, input takes full row width
   * @returns {string} HTML string
   */
  function render({
    id,
    label,
    desc        = '',
    value       = '',
    placeholder = '',
    icon        = '',
    type        = 'text',
    extra       = '',
    fullWidth   = false,
  }) {
    const iconHTML = icon
      ? `<div class="row-icon">${icon}</div>`
      : `<div class="row-icon">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2">
             <line x1="4" y1="9" x2="20" y2="9"/>
             <line x1="4" y1="15" x2="20" y2="15"/>
             <line x1="10" y1="3" x2="8" y2="21"/>
             <line x1="16" y1="3" x2="14" y2="21"/>
           </svg>
         </div>`;

    const inputStyle = fullWidth ? 'width:100%;' : '';

    return `
      <div class="card-row" ${fullWidth ? 'style="flex-wrap:wrap;gap:10px;"' : ''}>
        ${iconHTML}
        <div class="row-text">
          <div class="row-label">${label}</div>
          ${desc ? `<div class="row-desc">${desc}</div>` : ''}
        </div>
        <input
          class="setting-input"
          id="${id}"
          type="${type}"
          value="${_esc(value)}"
          placeholder="${_esc(placeholder)}"
          style="${inputStyle}"
          spellcheck="false"
          autocomplete="off"
        />
        ${extra}
      </div>`;
  }

  /**
   * Bind input/change listener.
   * @param {HTMLElement} container
   * @param {string}      id
   * @param {function}    onChange  - callback(value: string)
   * @param {string}      [event]   - 'input' | 'change' | 'blur' (default: 'change')
   */
  function bind(container, id, onChange, event = 'change') {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener(event, () => onChange(el.value));
  }

  /**
   * Update value programmatically.
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
