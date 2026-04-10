/**
 * passwords/address.js — Address Manager + Autofill
 */

const AddressManager = (() => {

  let _addresses = [];
  let _container = null;

  // ── IPC (direct preload API) ──────────────────────────────────────────────
  function _invoke(ch, ...args) {
    if (window.vortexAPI && window.vortexAPI.invoke) return window.vortexAPI.invoke(ch, ...args);
    return new Promise(resolve => {
      const reqId = '__addr_' + Date.now() + '_' + Math.random();
      function h(ev) {
        if (!ev.data || ev.data.__vortexInvokeReply !== reqId) return;
        window.removeEventListener('message', h);
        resolve(ev.data.result);
      }
      window.addEventListener('message', h);
      setTimeout(() => { window.removeEventListener('message', h); resolve(null); }, 5000);
      window.parent.postMessage({ __vortexAction: true, channel: '__invoke', payload: { reqId, channel: ch, args } }, '*');
    });
  }

  // ── Load / Save ───────────────────────────────────────────────────────────
  async function load() {
    const data = await _invoke('addresses:read');
    _addresses = Array.isArray(data) ? data : [];
  }

  async function _save() {
    await _invoke('addresses:write', _addresses);
  }

  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Address fields definition ─────────────────────────────────────────────
  const FIELDS = [
    { id: 'label',      label: 'Label',           placeholder: 'e.g. Home, Work', type: 'text' },
    { id: 'fullName',   label: 'Full Name',        placeholder: 'John Doe',        type: 'text' },
    { id: 'firstName',  label: 'First Name',       placeholder: 'John',            type: 'text' },
    { id: 'lastName',   label: 'Last Name',        placeholder: 'Doe',             type: 'text' },
    { id: 'email',      label: 'Email',            placeholder: 'john@email.com',  type: 'email' },
    { id: 'phone',      label: 'Phone',            placeholder: '+91 9876543210',  type: 'tel' },
    { id: 'address1',   label: 'Address Line 1',   placeholder: '123 Main Street', type: 'text' },
    { id: 'address2',   label: 'Address Line 2',   placeholder: 'Apt 4B',          type: 'text' },
    { id: 'city',       label: 'City',             placeholder: 'Mumbai',          type: 'text' },
    { id: 'state',      label: 'State / Province', placeholder: 'Maharashtra',     type: 'text' },
    { id: 'zip',        label: 'PIN / ZIP / Postal Code', placeholder: '400001',   type: 'text' },
    { id: 'country',    label: 'Country',          placeholder: 'India',           type: 'text' },
    { id: 'company',    label: 'Company',          placeholder: 'Acme Corp',       type: 'text' },
  ];

  // ── Render settings panel ─────────────────────────────────────────────────
  function render(container) {
    _container = container;
    load().then(() => _renderList());
  }

  function _renderList() {
    if (!_container) return;
    _container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="font-size:12px;color:#4a8080;">${_addresses.length} saved address${_addresses.length !== 1 ? 'es' : ''}</div>
        <button class="pm-add-btn" id="addr-add-btn">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Address
        </button>
      </div>
      <div id="addr-list">
        ${!_addresses.length ? `
          <div class="pm-empty">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p>No addresses saved yet</p>
          </div>` :
          _addresses.map(a => `
            <div class="pm-entry" data-id="${_esc(a.id)}" style="align-items:flex-start;">
              <div class="pm-entry-favicon" style="margin-top:2px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="pm-entry-info">
                <div class="pm-entry-title">${_esc(a.label || a.fullName || 'Address')}</div>
                <div class="pm-entry-user" style="white-space:normal;line-height:1.5;">
                  ${[a.fullName, a.address1, a.city, a.state, a.zip, a.country].filter(Boolean).join(', ')}
                </div>
              </div>
              <div class="pm-entry-actions">
                <button class="pm-entry-btn" data-action="edit" data-id="${_esc(a.id)}" title="Edit">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="pm-entry-btn danger" data-action="delete" data-id="${_esc(a.id)}" title="Delete">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </div>`).join('')}
      </div>`;

    _container.querySelector('#addr-add-btn').addEventListener('click', () => _showForm(null));
    _container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (btn.dataset.action === 'edit') _showForm(id);
        if (btn.dataset.action === 'delete') {
          if (!confirm('Delete this address?')) return;
          _addresses = _addresses.filter(a => a.id !== id);
          _save(); _renderList();
        }
      });
    });
    _container.querySelectorAll('.pm-entry').forEach(row => {
      row.addEventListener('click', e => {
        if (!e.target.closest('[data-action]')) _showForm(row.dataset.id);
      });
    });
  }

  function _showForm(id) {
    const isNew = !id;
    const addr = isNew ? { id: _uuid() } : { ..._addresses.find(a => a.id === id) };
    if (!addr) return;

    const wrap = _container.closest('[style*="position"]') || _container.parentElement;
    const detail = document.createElement('div');
    detail.className = 'pm-detail';
    detail.style.position = 'absolute';

    detail.innerHTML = `
      <div class="pm-detail-header">
        <button class="pm-detail-back" id="addr-back">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span class="pm-detail-title">${isNew ? 'Add Address' : 'Edit Address'}</span>
        <button class="pm-detail-save" id="addr-save">Save</button>
      </div>
      <div class="pm-detail-body">
        ${FIELDS.map(f => `
          <div class="pm-field">
            <div class="pm-field-label">${f.label}</div>
            <input class="pm-field-input" id="addr-${f.id}" type="${f.type}"
              value="${_esc(addr[f.id] || '')}" placeholder="${_esc(f.placeholder)}"/>
          </div>`).join('')}
      </div>`;

    _container.style.position = 'relative';
    _container.appendChild(detail);

    detail.querySelector('#addr-back').addEventListener('click', () => detail.remove());
    detail.querySelector('#addr-save').addEventListener('click', async () => {
      FIELDS.forEach(f => { addr[f.id] = detail.querySelector(`#addr-${f.id}`).value.trim(); });
      addr.updatedAt = Date.now();
      if (!addr.createdAt) addr.createdAt = Date.now();
      if (isNew) _addresses.unshift(addr);
      else { const i = _addresses.findIndex(a => a.id === addr.id); if (i >= 0) _addresses[i] = addr; }
      await _save();
      detail.remove();
      _renderList();
    });
  }

  // ── Autofill address into webview ─────────────────────────────────────────
  function autofillAddress(addr) {
    const activeWv = document.querySelector('webview.vortex-wv.active');
    if (!activeWv || !addr) return;

    const script = `
      (function() {
        var a = ${JSON.stringify(addr)};
        var MAPS = [
          { keys: ['firstname','first_name','fname','given-name','given_name'], val: a.firstName || a.fullName.split(' ')[0] },
          { keys: ['lastname','last_name','lname','family-name','family_name','surname'], val: a.lastName || a.fullName.split(' ').slice(1).join(' ') },
          { keys: ['fullname','full_name','name','your-name'], val: a.fullName },
          { keys: ['email','e-mail','mail'], val: a.email },
          { keys: ['phone','tel','mobile','phonenumber','phone_number'], val: a.phone },
          { keys: ['address','address1','addr1','street','address-line1','address_line_1'], val: a.address1 },
          { keys: ['address2','addr2','address-line2','address_line_2','apt','suite'], val: a.address2 },
          { keys: ['city','town','locality'], val: a.city },
          { keys: ['state','province','region','state_province'], val: a.state },
          { keys: ['zip','postal','postcode','pincode','pin','zipcode','postal_code','zip_code'], val: a.zip },
          { keys: ['country','nation'], val: a.country },
          { keys: ['company','organization','organisation','employer'], val: a.company },
        ];
        function fill(el, val) {
          if (!el || !val) return;
          var desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          desc.set.call(el, val);
          ['input','change'].forEach(function(ev){ el.dispatchEvent(new Event(ev,{bubbles:true})); });
          el.style.outline = '2px solid #00c8b4';
          setTimeout(function(){ el.style.outline=''; }, 1500);
        }
        function findInput(keys) {
          for (var i=0; i<keys.length; i++) {
            var k = keys[i];
            var el = document.querySelector(
              'input[name="'+k+'"],input[id="'+k+'"],input[autocomplete="'+k+'"],' +
              'input[name*="'+k+'" i],input[id*="'+k+'" i],input[placeholder*="'+k+'" i]'
            );
            if (el) return el;
          }
          return null;
        }
        MAPS.forEach(function(m){ fill(findInput(m.keys), m.val); });
        // Also handle select for country/state
        ['country','state'].forEach(function(field) {
          var val = field === 'country' ? a.country : a.state;
          if (!val) return;
          var sel = document.querySelector('select[name*="'+field+'" i],select[id*="'+field+'" i]');
          if (!sel) return;
          var opts = Array.from(sel.options);
          var opt = opts.find(function(o){ return o.text.toLowerCase().includes(val.toLowerCase()) || o.value.toLowerCase().includes(val.toLowerCase()); });
          if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change',{bubbles:true})); }
        });
      })();`;
    activeWv.executeJavaScript(script).catch(() => {});
  }

  // ── Address autofill banner ───────────────────────────────────────────────
  function showAutofillBanner() {
    if (!_addresses.length) return;
    const existing = document.getElementById('pm-addr-banner');
    if (existing) return;

    const banner = document.createElement('div');
    banner.id = 'pm-addr-banner';
    banner.style.cssText = `
      position:fixed; bottom:60px; right:16px; z-index:99996;
      background:var(--bg-panel,#0f2222); border:1px solid #2e4a4c;
      border-radius:12px; padding:10px 14px; min-width:220px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5); font-size:12px;
      color:var(--text-main,#c8e8e5);
      animation:pmBannerIn 0.2s ease;
    `;
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent,#00c8b4)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style="flex:1;font-weight:600;">Fill Address</span>
        <button id="pm-addr-dismiss" style="background:none;border:none;color:#4a8080;cursor:pointer;font-size:14px;padding:0;">✕</button>
      </div>
      ${_addresses.map((a, i) => `
        <div class="pm-af-item" data-idx="${i}" style="padding:7px 8px;border-radius:7px;cursor:pointer;transition:background 0.1s;"
          onmouseenter="this.style.background='#162828'" onmouseleave="this.style.background=''">
          <div style="font-size:12px;font-weight:600;color:#c8e8e5;">${a.label || a.fullName || 'Address'}</div>
          <div style="font-size:10px;color:#4a8080;">${[a.city, a.state, a.country].filter(Boolean).join(', ')}</div>
        </div>`).join('')}`;

    document.body.appendChild(banner);
    const timer = setTimeout(() => banner.remove(), 12000);
    banner.querySelector('#pm-addr-dismiss').addEventListener('click', () => { clearTimeout(timer); banner.remove(); });
    banner.querySelectorAll('[data-idx]').forEach(item => {
      item.addEventListener('click', () => {
        autofillAddress(_addresses[parseInt(item.dataset.idx)]);
        clearTimeout(timer); banner.remove();
      });
    });
  }

  // Check if page has address form fields
  async function checkPageForAddressForm() {
    const activeWv = document.querySelector('webview.vortex-wv.active');
    if (!activeWv || !_addresses.length) return;
    try {
      const has = await activeWv.executeJavaScript(`
        (function(){
          var keys = ['address','postal','zip','pincode','city','state','country'];
          return keys.some(function(k){
            return !!document.querySelector('input[name*="'+k+'" i],input[id*="'+k+'" i],input[placeholder*="'+k+'" i]');
          });
        })()`);
      if (has) showAutofillBanner();
    } catch {}
  }

  return { render, load, autofillAddress, checkPageForAddressForm, getAll: () => _addresses };
})();
