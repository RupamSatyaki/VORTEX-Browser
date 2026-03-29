// notepad/ui/snippets.js - Snippets manager panel
var NpSnippets = {

  _container: null,
  _getEditor: null,
  _visible: false,

  init: function(container, getEditor) {
    this._container = container;
    this._getEditor = getEditor;
  },

  toggle: function() {
    this._visible = !this._visible;
    var panel = this._container.querySelector('#np-snippets-panel');
    if (panel) {
      panel.style.display = this._visible ? '' : 'none';
      if (this._visible) this._render();
    }
  },

  buildHTML: function() {
    return '<div class="np-snippets-panel" id="np-snippets-panel" style="display:none">' +
      '<div class="np-snippets-header">' +
      '<span class="np-panel-title">Snippets</span>' +
      '<button class="np-find-btn" id="np-snippets-close">\u2715</button>' +
      '</div>' +
      '<div class="np-snippets-add">' +
      '<input class="dh-input np-snip-name" id="np-snip-name" type="text" placeholder="Snippet name\u2026" maxlength="40" spellcheck="false"/>' +
      '<button class="dh-btn primary np-snip-save-btn" id="np-snip-save">Save Selection</button>' +
      '</div>' +
      '<div id="np-snippets-list"></div>' +
      '</div>';
  },

  bind: function() {
    var self = this;
    var c = this._container;
    c.querySelector('#np-snippets-close').addEventListener('click', function() { self.toggle(); });
    c.querySelector('#np-snip-save').addEventListener('click', function() {
      var name = c.querySelector('#np-snip-name').value.trim();
      if (!name) return;
      var sel = self._getEditor().getSelection() || self._getEditor().getValue();
      NpStorage.addSnippet(name, sel, 'plain');
      c.querySelector('#np-snip-name').value = '';
      self._render();
    });
  },

  _render: function() {
    var self = this;
    var list = this._container.querySelector('#np-snippets-list');
    if (!list) return;
    var snippets = NpStorage.getSnippets();
    if (!snippets.length) { list.innerHTML = '<div class="np-snip-empty">No snippets yet.<br>Select text and click Save Selection.</div>'; return; }
    list.innerHTML = snippets.map(function(s) {
      return '<div class="np-snip-item">' +
        '<div class="np-snip-name-row">' +
        '<span class="np-snip-label">' + s.name.replace(/</g,'&lt;') + '</span>' +
        '<button class="np-find-btn np-snip-insert" data-id="' + s.id + '" title="Insert">Insert</button>' +
        '<button class="np-find-btn np-snip-del" data-id="' + s.id + '" title="Delete">\u2715</button>' +
        '</div>' +
        '<pre class="np-snip-preview">' + s.code.slice(0,80).replace(/</g,'&lt;') + (s.code.length>80?'\u2026':'') + '</pre>' +
        '</div>';
    }).join('');
    list.querySelectorAll('.np-snip-insert').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var s = NpStorage.getSnippets().find(function(s) { return s.id === +btn.dataset.id; });
        if (s) self._getEditor().insertAtCursor(s.code);
      });
    });
    list.querySelectorAll('.np-snip-del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        NpStorage.deleteSnippet(+btn.dataset.id);
        self._render();
      });
    });
  },
};
