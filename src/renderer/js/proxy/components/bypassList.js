// Bypass List — chip-style editor
const ProxyBypassList = {
  _el: null,
  _list: [],
  _onChange: null,

  render(container, list, onChange) {
    this._list = [...(list || ['localhost', '127.0.0.1', '::1'])];
    this._onChange = onChange;
    const el = document.createElement('div');
    el.id = 'px-bypass-section';
    el.innerHTML = `
      <div class="px-card-label">Bypass List <span style="color:#2e5050;font-weight:400;text-transform:none;font-size:10px">(don't proxy these)</span></div>
      <div class="px-bypass-chips" id="px-bypass-chips"></div>
      <div class="px-bypass-add">
        <input class="px-input" id="px-bypass-input" type="text" placeholder="e.g. *.local or 10.0.0.0/8" spellcheck="false" />
        <button class="px-btn px-btn-secondary px-btn-sm" id="px-bypass-add-btn">+ Add</button>
      </div>
    `;
    container.appendChild(el);
    this._el = el;
    this._renderChips();

    el.querySelector('#px-bypass-add-btn').addEventListener('click', () => this._add());
    el.querySelector('#px-bypass-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._add();
    });
  },

  _add() {
    const inp = this._el.querySelector('#px-bypass-input');
    const val = inp.value.trim();
    if (!val || this._list.includes(val)) { inp.value = ''; return; }
    this._list.push(val);
    inp.value = '';
    this._renderChips();
    if (this._onChange) this._onChange(this._list);
  },

  _remove(item) {
    this._list = this._list.filter(x => x !== item);
    this._renderChips();
    if (this._onChange) this._onChange(this._list);
  },

  _renderChips() {
    const chips = this._el.querySelector('#px-bypass-chips');
    chips.innerHTML = this._list.map(item => `
      <div class="px-chip">
        <span>${item}</span>
        <button class="px-chip-remove" data-item="${item}" title="Remove">×</button>
      </div>
    `).join('');
    chips.querySelectorAll('.px-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => this._remove(btn.dataset.item));
    });
  },

  getList() { return [...this._list]; },
};
