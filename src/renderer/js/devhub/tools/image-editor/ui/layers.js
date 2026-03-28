// image-editor/ui/layers.js - Layers panel: text + overlay items management
var EditorLayers = {

  _layers: [],   // [{ id, type:'text'|'overlay', label, visible, opacity, data }]
  _idCounter: 0,
  _onUpdate: null,
  _panel: null,

  init: function(panel, onUpdate) {
    this._panel    = panel;
    this._onUpdate = onUpdate;
    this._layers   = [];
    this.render();
  },

  addLayer: function(type, label, data) {
    var id = ++this._idCounter;
    this._layers.unshift({ id: id, type: type, label: label || (type + ' ' + id), visible: true, opacity: 1, data: data });
    this.render();
    return id;
  },

  removeLayer: function(id) {
    this._layers = this._layers.filter(function(l) { return l.id !== id; });
    this.render();
    if (this._onUpdate) this._onUpdate(this._layers);
  },

  toggleVisible: function(id) {
    var l = this._layers.find(function(l) { return l.id === id; });
    if (l) { l.visible = !l.visible; this.render(); if (this._onUpdate) this._onUpdate(this._layers); }
  },

  setOpacity: function(id, opacity) {
    var l = this._layers.find(function(l) { return l.id === id; });
    if (l) { l.opacity = opacity; if (this._onUpdate) this._onUpdate(this._layers); }
  },

  moveUp: function(id) {
    var idx = this._layers.findIndex(function(l) { return l.id === id; });
    if (idx > 0) { var tmp = this._layers[idx]; this._layers[idx] = this._layers[idx-1]; this._layers[idx-1] = tmp; this.render(); }
  },

  moveDown: function(id) {
    var idx = this._layers.findIndex(function(l) { return l.id === id; });
    if (idx < this._layers.length-1) { var tmp = this._layers[idx]; this._layers[idx] = this._layers[idx+1]; this._layers[idx+1] = tmp; this.render(); }
  },

  getLayers: function() { return this._layers; },

  render: function() {
    if (!this._panel) return;
    var self = this;
    if (!this._layers.length) {
      this._panel.innerHTML = '<div class="ie-layers-empty">No layers yet.<br>Add text or image overlays.</div>';
      return;
    }
    this._panel.innerHTML = this._layers.map(function(l) {
      var typeIcon = l.type === 'text'
        ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
        : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
      return '<div class="ie-layer-row" data-id="' + l.id + '">' +
        '<button class="ie-layer-vis" data-id="' + l.id + '" title="Toggle visibility">' +
        (l.visible ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
                   : '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>') +
        '</button>' +
        '<span class="ie-layer-icon">' + typeIcon + '</span>' +
        '<span class="ie-layer-label">' + l.label.replace(/</g,'&lt;') + '</span>' +
        '<div class="ie-layer-actions">' +
        '<button class="ie-layer-btn" data-action="up"   data-id="' + l.id + '" title="Move up">\u2191</button>' +
        '<button class="ie-layer-btn" data-action="down" data-id="' + l.id + '" title="Move down">\u2193</button>' +
        '<button class="ie-layer-btn ie-layer-del" data-action="del" data-id="' + l.id + '" title="Delete">\u2715</button>' +
        '</div>' +
        '</div>' +
        '<div class="ie-layer-opacity-row">' +
        '<span class="ie-layer-op-label">Opacity</span>' +
        '<input type="range" class="ie-slider ie-layer-op-slider" min="0" max="100" value="' + Math.round(l.opacity*100) + '" data-id="' + l.id + '"/>' +
        '<span class="ie-layer-op-val">' + Math.round(l.opacity*100) + '%</span>' +
        '</div>';
    }).join('');

    this._panel.querySelectorAll('.ie-layer-vis').forEach(function(btn) {
      btn.addEventListener('click', function() { self.toggleVisible(+btn.dataset.id); });
    });
    this._panel.querySelectorAll('.ie-layer-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = +btn.dataset.id;
        if (btn.dataset.action === 'up')   self.moveUp(id);
        if (btn.dataset.action === 'down') self.moveDown(id);
        if (btn.dataset.action === 'del')  self.removeLayer(id);
      });
    });
    this._panel.querySelectorAll('.ie-layer-op-slider').forEach(function(inp) {
      inp.addEventListener('input', function() {
        var row = inp.closest('.ie-layer-opacity-row');
        var valEl = row ? row.querySelector('.ie-layer-op-val') : null;
        if (valEl) valEl.textContent = inp.value + '%';
        self.setOpacity(+inp.dataset.id, +inp.value/100);
      });
    });
  },
};
