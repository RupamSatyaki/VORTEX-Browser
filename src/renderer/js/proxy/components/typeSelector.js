// Proxy Type Selector — None / HTTP / SOCKS5 / Tor
// Stateless — creates fresh DOM each render call
const ProxyTypeSelector = {
  render(container, currentType, onChange) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="px-card-label">Proxy Type</div>
      <div class="px-type-grid">
        ${this._btn('none',   'None',   this._iconNone())}
        ${this._btn('http',   'HTTP',   this._iconHttp())}
        ${this._btn('socks5', 'SOCKS5', this._iconSocks())}
        ${this._btn('tor',    'Tor',    this._iconTor())}
      </div>
    `;
    container.appendChild(wrap);

    const _setActive = (type) => {
      wrap.querySelectorAll('.px-type-btn').forEach(btn => {
        btn.classList.remove('active', 'active-tor');
        if (btn.dataset.type === type) {
          btn.classList.add(type === 'tor' ? 'active-tor' : 'active');
        }
      });
    };

    _setActive(currentType || 'none');

    wrap.querySelectorAll('.px-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _setActive(btn.dataset.type);
        if (onChange) onChange(btn.dataset.type);
      });
    });
  },

  _btn(type, label, icon) {
    return `<button class="px-type-btn" data-type="${type}">${icon}<span>${label}</span></button>`;
  },

  _iconNone() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>`;
  },
  _iconHttp() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`;
  },
  _iconSocks() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`;
  },
  _iconTor() {
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`;
  },
};
