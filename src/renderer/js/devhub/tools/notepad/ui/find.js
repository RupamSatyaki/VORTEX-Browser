// notepad/ui/find.js - Find & Replace panel
var NpFind = {

  _container: null,
  _getEditor: null,
  _matches: [],
  _matchIdx: -1,
  _visible: false,

  init: function(container, getEditor) {
    this._container = container;
    this._getEditor = getEditor;
    this._bindKeys();
  },

  show: function(mode) {
    this._visible = true;
    var panel = this._container.querySelector('#np-find-panel');
    if (panel) {
      panel.style.display = '';
      var inp = panel.querySelector('#np-find-inp');
      if (inp) { inp.focus(); inp.select(); }
      var replRow = panel.querySelector('#np-replace-row');
      if (replRow) replRow.style.display = mode === 'replace' ? '' : 'none';
    }
  },

  hide: function() {
    this._visible = false;
    var panel = this._container.querySelector('#np-find-panel');
    if (panel) panel.style.display = 'none';
    this._clearHighlights();
    this._getEditor().focus();
  },

  _bindKeys: function() {
    var self = this;
    document.addEventListener('keydown', function(e) {
      if (!self._container.contains(document.activeElement) && !self._visible) return;
      if ((e.ctrlKey||e.metaKey) && e.key === 'f') { e.preventDefault(); self.show('find'); }
      if ((e.ctrlKey||e.metaKey) && e.key === 'h') { e.preventDefault(); self.show('replace'); }
      if (e.key === 'Escape' && self._visible) self.hide();
      if (e.key === 'F3' || (e.key === 'Enter' && self._visible)) { e.preventDefault(); e.shiftKey ? self.prev() : self.next(); }
    });
  },

  buildHTML: function() {
    return '<div class="np-find-panel" id="np-find-panel" style="display:none">' +
      '<div class="np-find-row">' +
      '<input class="dh-input np-find-inp" id="np-find-inp" type="text" placeholder="Find\u2026" spellcheck="false"/>' +
      '<span class="np-find-count" id="np-find-count"></span>' +
      '<button class="np-find-btn" id="np-find-prev" title="Previous (Shift+Enter)">\u2191</button>' +
      '<button class="np-find-btn" id="np-find-next" title="Next (Enter)">\u2193</button>' +
      '<label class="np-find-opt"><input type="checkbox" id="np-find-regex"/> Regex</label>' +
      '<label class="np-find-opt"><input type="checkbox" id="np-find-case"/> Aa</label>' +
      '<button class="np-find-btn" id="np-find-close">\u2715</button>' +
      '</div>' +
      '<div class="np-find-row" id="np-replace-row" style="display:none">' +
      '<input class="dh-input np-find-inp" id="np-replace-inp" type="text" placeholder="Replace with\u2026" spellcheck="false"/>' +
      '<button class="np-find-btn" id="np-replace-one">Replace</button>' +
      '<button class="np-find-btn" id="np-replace-all">All</button>' +
      '</div>' +
      '</div>';
  },

  bind: function() {
    var self = this;
    var c = this._container;
    var $ = function(id) { return c.querySelector('#' + id); };

    $('np-find-inp').addEventListener('input', function() { self._doFind(); });
    $('np-find-regex').addEventListener('change', function() { self._doFind(); });
    $('np-find-case').addEventListener('change',  function() { self._doFind(); });
    $('np-find-prev').addEventListener('click', function() { self.prev(); });
    $('np-find-next').addEventListener('click', function() { self.next(); });
    $('np-find-close').addEventListener('click', function() { self.hide(); });
    $('np-replace-one').addEventListener('click', function() { self._replaceOne(); });
    $('np-replace-all').addEventListener('click', function() { self._replaceAll(); });
  },

  _doFind: function() {
    var c = this._container;
    var query = c.querySelector('#np-find-inp').value;
    var useRe = c.querySelector('#np-find-regex').checked;
    var caseSensitive = c.querySelector('#np-find-case').checked;
    var countEl = c.querySelector('#np-find-count');
    this._matches = [];
    this._matchIdx = -1;
    if (!query) { if (countEl) countEl.textContent = ''; return; }
    var text = this._getEditor().getValue();
    try {
      var flags = 'g' + (caseSensitive ? '' : 'i');
      var re = useRe ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), flags);
      var m;
      while ((m = re.exec(text)) !== null) {
        this._matches.push({ start: m.index, end: m.index + m[0].length });
        if (re.lastIndex === m.index) re.lastIndex++;
      }
    } catch(e) {}
    if (countEl) countEl.textContent = this._matches.length ? (this._matchIdx+1) + '/' + this._matches.length : 'no match';
    if (this._matches.length) this.next();
  },

  next: function() {
    if (!this._matches.length) return;
    this._matchIdx = (this._matchIdx + 1) % this._matches.length;
    this._selectMatch();
  },

  prev: function() {
    if (!this._matches.length) return;
    this._matchIdx = (this._matchIdx - 1 + this._matches.length) % this._matches.length;
    this._selectMatch();
  },

  _selectMatch: function() {
    var m = this._matches[this._matchIdx];
    if (!m) return;
    var ta = this._container.querySelector('#np-textarea');
    if (ta) { ta.focus(); ta.setSelectionRange(m.start, m.end); }
    var countEl = this._container.querySelector('#np-find-count');
    if (countEl) countEl.textContent = (this._matchIdx+1) + '/' + this._matches.length;
  },

  _replaceOne: function() {
    var m = this._matches[this._matchIdx];
    if (!m) return;
    var repl = this._container.querySelector('#np-replace-inp').value;
    var ed   = this._getEditor();
    var val  = ed.getValue();
    ed.setValue(val.slice(0,m.start) + repl + val.slice(m.end), null);
    this._doFind();
  },

  _replaceAll: function() {
    var query = this._container.querySelector('#np-find-inp').value;
    var repl  = this._container.querySelector('#np-replace-inp').value;
    var useRe = this._container.querySelector('#np-find-regex').checked;
    var caseSensitive = this._container.querySelector('#np-find-case').checked;
    if (!query) return;
    var ed  = this._getEditor();
    var val = ed.getValue();
    try {
      var flags = 'g' + (caseSensitive ? '' : 'i');
      var re = useRe ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), flags);
      ed.setValue(val.replace(re, repl), null);
    } catch(e) {}
    this._doFind();
  },

  _clearHighlights: function() { this._matches = []; this._matchIdx = -1; },
};
