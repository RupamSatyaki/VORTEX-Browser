// notepad/core/editor.js - Core editor: textarea, line numbers, highlight, word count
var NpEditor = {

  _container: null,
  _textarea: null,
  _highlight: null,
  _lineNums: null,
  _settings: null,
  _lang: 'plain',
  _onInput: null,
  _undoStack: [],
  _redoStack: [],
  _lastValue: '',

  init: function(container, settings, onInput) {
    this._container = container;
    this._settings  = settings;
    this._onInput   = onInput;
    this._textarea  = container.querySelector('#np-textarea');
    this._highlight = container.querySelector('#np-highlight');
    this._lineNums  = container.querySelector('#np-line-nums');
    this._applySettings();
    this._bindEvents();
  },

  _applySettings: function() {
    var s = this._settings;
    var ta = this._textarea;
    ta.style.fontSize   = s.fontSize + 'px';
    ta.style.whiteSpace = s.wordWrap ? 'pre-wrap' : 'pre';
    ta.style.overflowX  = s.wordWrap ? 'hidden' : 'auto';
    if (this._highlight) {
      this._highlight.style.fontSize   = s.fontSize + 'px';
      this._highlight.style.whiteSpace = s.wordWrap ? 'pre-wrap' : 'pre';
    }
    this._container.querySelector('#np-editor-wrap').className =
      'np-editor-wrap np-theme-' + (s.theme || 'dark') + (s.lineNumbers ? ' np-show-lines' : '');
  },

  _bindEvents: function() {
    var self = this;
    var ta   = this._textarea;

    ta.addEventListener('input', function() {
      self._pushUndo();
      self._update();
      if (self._onInput) self._onInput(ta.value);
    });

    ta.addEventListener('scroll', function() {
      if (self._highlight) {
        self._highlight.scrollTop  = ta.scrollTop;
        self._highlight.scrollLeft = ta.scrollLeft;
      }
      if (self._lineNums) self._lineNums.scrollTop = ta.scrollTop;
    });

    ta.addEventListener('keydown', function(e) {
      // Tab → insert spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = ta.selectionStart, end = ta.selectionEnd;
        if (e.shiftKey) {
          // Dedent
          var before = ta.value.slice(0, start);
          var lineStart = before.lastIndexOf('\n') + 1;
          if (ta.value.slice(lineStart, lineStart+2) === '  ') {
            ta.value = ta.value.slice(0, lineStart) + ta.value.slice(lineStart+2);
            ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start-2);
          }
        } else {
          ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
          ta.selectionStart = ta.selectionEnd = start + 2;
        }
        self._update();
        if (self._onInput) self._onInput(ta.value);
      }
      // Auto-close brackets
      var pairs = { '(':')', '[':']', '{':'}', '"':'"', "'":"'" };
      if (pairs[e.key] && ta.selectionStart === ta.selectionEnd) {
        e.preventDefault();
        var s2 = ta.selectionStart;
        ta.value = ta.value.slice(0,s2) + e.key + pairs[e.key] + ta.value.slice(s2);
        ta.selectionStart = ta.selectionEnd = s2+1;
        self._update();
      }
    });
  },

  _pushUndo: function() {
    var val = this._textarea.value;
    if (val === this._lastValue) return;
    this._undoStack.push(this._lastValue);
    if (this._undoStack.length > 200) this._undoStack.shift();
    this._redoStack = [];
    this._lastValue = val;
  },

  undo: function() {
    if (!this._undoStack.length) return;
    this._redoStack.push(this._textarea.value);
    var prev = this._undoStack.pop();
    this._textarea.value = prev;
    this._lastValue = prev;
    this._update();
    if (this._onInput) this._onInput(prev);
  },

  redo: function() {
    if (!this._redoStack.length) return;
    this._undoStack.push(this._textarea.value);
    var next = this._redoStack.pop();
    this._textarea.value = next;
    this._lastValue = next;
    this._update();
    if (this._onInput) this._onInput(next);
  },

  _update: function() {
    var val = this._textarea.value;
    this._updateLineNums(val);
    this._updateHighlight(val);
    this._updateStats(val);
  },

  _updateLineNums: function(val) {
    if (!this._lineNums || !this._settings.lineNumbers) return;
    var lines = val.split('\n').length;
    var nums  = [];
    for (var i = 1; i <= lines; i++) nums.push(i);
    this._lineNums.textContent = nums.join('\n');
  },

  _updateHighlight: function(val) {
    if (!this._highlight) return;
    var html = NpHighlight.tokenize(val, this._lang);
    this._highlight.innerHTML = html + '\n'; // trailing newline for scroll sync
  },

  _updateStats: function(val) {
    var words = val.trim() ? val.trim().split(/\s+/).length : 0;
    var chars = val.length;
    var lines = val.split('\n').length;
    var el = this._container.querySelector('#np-stats');
    if (el) el.textContent = words + ' words · ' + chars + ' chars · ' + lines + ' lines';
  },

  setValue: function(val, lang) {
    this._textarea.value = val;
    this._lastValue = val;
    this._undoStack = [];
    this._redoStack = [];
    if (lang) this._lang = lang;
    this._update();
  },

  getValue: function() { return this._textarea.value; },

  setLang: function(lang) {
    this._lang = lang;
    this._updateHighlight(this._textarea.value);
  },

  setSettings: function(s) {
    this._settings = s;
    this._applySettings();
    this._update();
  },

  focus: function() { this._textarea.focus(); },

  insertAtCursor: function(text) {
    var ta = this._textarea;
    var s  = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0,s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    this._update();
    if (this._onInput) this._onInput(ta.value);
  },

  getSelection: function() {
    var ta = this._textarea;
    return ta.value.slice(ta.selectionStart, ta.selectionEnd);
  },

  replaceSelection: function(text) {
    var ta = this._textarea;
    var s  = ta.selectionStart;
    ta.value = ta.value.slice(0,s) + text + ta.value.slice(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    this._update();
    if (this._onInput) this._onInput(ta.value);
  },

  // ── Text tools ────────────────────────────────────────────────────────────
  caseConvert: function(type) {
    var val = this._textarea.value;
    var result;
    if (type === 'upper')   result = val.toUpperCase();
    else if (type === 'lower') result = val.toLowerCase();
    else if (type === 'title') result = val.replace(/\b\w/g, function(c) { return c.toUpperCase(); });
    else if (type === 'camel') result = val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(m,c) { return c.toUpperCase(); });
    else if (type === 'snake') result = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    else if (type === 'kebab') result = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    else result = val;
    this.setValue(result, this._lang);
    if (this._onInput) this._onInput(result);
  },

  sortLines: function(type) {
    var lines = this._textarea.value.split('\n');
    if (type === 'asc')    lines.sort();
    else if (type === 'desc')   lines.sort().reverse();
    else if (type === 'len')    lines.sort(function(a,b) { return a.length - b.length; });
    else if (type === 'dedup')  lines = lines.filter(function(l,i,a) { return a.indexOf(l) === i; });
    else if (type === 'shuffle') lines.sort(function() { return Math.random()-0.5; });
    var result = lines.join('\n');
    this.setValue(result, this._lang);
    if (this._onInput) this._onInput(result);
  },

  trimWhitespace: function() {
    var result = this._textarea.value.split('\n').map(function(l) { return l.trimEnd(); }).join('\n').trim();
    this.setValue(result, this._lang);
    if (this._onInput) this._onInput(result);
  },
};
