// notepad/core/storage.js - Auto-save, recent files, snippets persistence
var NpStorage = {

  _KEY_TABS:    'vx_np_tabs',
  _KEY_RECENT:  'vx_np_recent',
  _KEY_SNIPPETS:'vx_np_snippets',
  _KEY_SETTINGS:'vx_np_settings',

  // ── Tabs ──────────────────────────────────────────────────────────────────
  saveTabs: function(tabs, activeId) {
    try {
      localStorage.setItem(this._KEY_TABS, JSON.stringify({ tabs: tabs, activeId: activeId }));
    } catch(e) {}
  },

  loadTabs: function() {
    try { return JSON.parse(localStorage.getItem(this._KEY_TABS) || 'null'); } catch(e) { return null; }
  },

  // ── Recent files ──────────────────────────────────────────────────────────
  addRecent: function(name, content) {
    var list = this.getRecent();
    list = list.filter(function(r) { return r.name !== name; });
    list.unshift({ name: name, preview: content.slice(0, 80), time: Date.now() });
    if (list.length > 10) list.pop();
    try { localStorage.setItem(this._KEY_RECENT, JSON.stringify(list)); } catch(e) {}
  },

  getRecent: function() {
    try { return JSON.parse(localStorage.getItem(this._KEY_RECENT) || '[]'); } catch(e) { return []; }
  },

  // ── Snippets ──────────────────────────────────────────────────────────────
  getSnippets: function() {
    try { return JSON.parse(localStorage.getItem(this._KEY_SNIPPETS) || '[]'); } catch(e) { return []; }
  },

  saveSnippets: function(snippets) {
    try { localStorage.setItem(this._KEY_SNIPPETS, JSON.stringify(snippets)); } catch(e) {}
  },

  addSnippet: function(name, code, lang) {
    var list = this.getSnippets();
    list.unshift({ id: Date.now(), name: name, code: code, lang: lang || 'plain' });
    this.saveSnippets(list);
  },

  deleteSnippet: function(id) {
    var list = this.getSnippets().filter(function(s) { return s.id !== id; });
    this.saveSnippets(list);
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings: function() {
    var defaults = { theme:'dark', fontSize:14, wordWrap:true, lineNumbers:true, autoSave:true };
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(this._KEY_SETTINGS) || '{}')); }
    catch(e) { return defaults; }
  },

  saveSettings: function(s) {
    try { localStorage.setItem(this._KEY_SETTINGS, JSON.stringify(s)); } catch(e) {}
  },
};
