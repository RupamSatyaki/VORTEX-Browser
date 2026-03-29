// notepad/ui/tabs.js - Multiple tabs management
var NpTabs = {

  _tabs: [],
  _activeId: null,
  _idCounter: 0,
  _container: null,
  _onSwitch: null,
  _onChange: null,

  init: function(container, onSwitch, onChange) {
    this._container = container;
    this._onSwitch  = onSwitch;
    this._onChange  = onChange;
  },

  createTab: function(name, content, lang) {
    var id = ++this._idCounter;
    this._tabs.push({ id: id, name: name || 'Untitled ' + id, content: content || '', lang: lang || 'plain', saved: true });
    this._activeId = id;
    this._render();
    return id;
  },

  closeTab: function(id) {
    var idx = this._tabs.findIndex(function(t) { return t.id === id; });
    if (idx === -1) return;
    this._tabs.splice(idx, 1);
    if (!this._tabs.length) this.createTab();
    else if (this._activeId === id) {
      this._activeId = this._tabs[Math.min(idx, this._tabs.length-1)].id;
      if (this._onSwitch) this._onSwitch(this.getActive());
    }
    this._render();
  },

  switchTo: function(id) {
    this._activeId = id;
    this._render();
    if (this._onSwitch) this._onSwitch(this.getActive());
  },

  getActive: function() {
    return this._tabs.find(function(t) { return t.id === this._activeId; }, this) || this._tabs[0];
  },

  updateContent: function(id, content) {
    var t = this._tabs.find(function(t) { return t.id === id; });
    if (t) { t.content = content; t.saved = false; this._render(); }
  },

  markSaved: function(id) {
    var t = this._tabs.find(function(t) { return t.id === id; });
    if (t) { t.saved = true; this._render(); }
  },

  renameTab: function(id, name) {
    var t = this._tabs.find(function(t) { return t.id === id; });
    if (t) { t.name = name; this._render(); }
  },

  setLang: function(id, lang) {
    var t = this._tabs.find(function(t) { return t.id === id; });
    if (t) t.lang = lang;
  },

  getTabs: function() { return this._tabs; },

  serialize: function() {
    return { tabs: this._tabs.map(function(t) { return { id:t.id, name:t.name, content:t.content, lang:t.lang }; }), activeId: this._activeId };
  },

  restore: function(data) {
    if (!data || !data.tabs || !data.tabs.length) return;
    this._tabs = data.tabs.map(function(t) { return Object.assign({ saved:true }, t); });
    this._idCounter = Math.max.apply(null, this._tabs.map(function(t) { return t.id; }));
    this._activeId  = data.activeId || this._tabs[0].id;
    this._render();
    if (this._onSwitch) this._onSwitch(this.getActive());
  },

  _render: function() {
    var bar = this._container.querySelector('#np-tab-bar');
    if (!bar) return;
    var self = this;
    bar.innerHTML = this._tabs.map(function(t) {
      var active = t.id === self._activeId;
      return '<div class="np-tab' + (active?' active':'') + '" data-id="' + t.id + '">' +
        '<span class="np-tab-name" data-id="' + t.id + '">' + t.name.replace(/</g,'&lt;') + (t.saved?'':'<span class="np-unsaved">\u25cf</span>') + '</span>' +
        '<button class="np-tab-close" data-id="' + t.id + '">\u2715</button>' +
        '</div>';
    }).join('') +
    '<button class="np-tab-new" id="np-new-tab" title="New tab (Ctrl+T)">+</button>';

    bar.querySelectorAll('.np-tab').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (e.target.classList.contains('np-tab-close')) return;
        self.switchTo(+el.dataset.id);
      });
      // Double-click to rename
      el.querySelector('.np-tab-name').addEventListener('dblclick', function() {
        var id = +el.dataset.id;
        var t  = self._tabs.find(function(t) { return t.id === id; });
        if (!t) return;
        var inp = document.createElement('input');
        inp.className = 'np-tab-rename-inp';
        inp.value = t.name;
        el.querySelector('.np-tab-name').replaceWith(inp);
        inp.focus(); inp.select();
        inp.addEventListener('blur', function() { self.renameTab(id, inp.value || t.name); });
        inp.addEventListener('keydown', function(e) { if (e.key==='Enter'||e.key==='Escape') inp.blur(); });
      });
    });
    bar.querySelectorAll('.np-tab-close').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); self.closeTab(+btn.dataset.id); });
    });
    var newBtn = bar.querySelector('#np-new-tab');
    if (newBtn) newBtn.addEventListener('click', function() { self.createTab(); });
  },
};
