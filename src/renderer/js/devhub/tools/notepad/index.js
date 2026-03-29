// notepad/index.js - Notepad Tool entry point
var NotepadTool = {
  id: 'notepad',
  name: 'Notepad',
  desc: 'Syntax highlight \u00b7 Tabs \u00b7 Find/Replace \u00b7 Markdown \u00b7 Snippets',
  icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',

  _cssInjected: false,
  _settings: null,
  _autoSaveTimer: null,

  _injectCSS: function() {
    if (this._cssInjected || document.getElementById('np-styles')) return;
    var base = window.location.href.replace(/\/index\.html.*$/, '/');
    var link = document.createElement('link');
    link.id = 'np-styles'; link.rel = 'stylesheet';
    link.href = base + 'js/devhub/tools/notepad/styles.css';
    document.head.appendChild(link);
    this._cssInjected = true;
  },

  render: function(container) {
    this._injectCSS();
    this._settings = NpStorage.getSettings();
    var self = this;

    container.innerHTML = [
      '<div class="np-wrap" id="np-wrap">',

      // ── Toolbar ──
      '<div class="np-toolbar">',
      '<div class="np-toolbar-left">',
      // File ops
      '<div class="np-dd-wrap">',
      '<button class="np-tb-btn" id="np-file-btn" title="File">',
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      ' File \u25be</button>',
      '<div class="np-dropdown" id="np-file-menu">',
      '<button class="np-dd-item" id="np-new-file">New (Ctrl+N)</button>',
      '<button class="np-dd-item" id="np-open-file-btn">Open File\u2026</button>',
      '<input type="file" id="np-open-file-inp" style="display:none" accept=".txt,.js,.ts,.py,.html,.css,.json,.md,.sql,.sh,.bash,.xml,.yaml,.yml,.toml,.csv"/>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" id="np-save-file">Save (Ctrl+S)</button>',
      '<button class="np-dd-item" id="np-save-as">Save As\u2026</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" id="np-recent-btn">Recent Files \u25be</button>',
      '</div>',
      '</div>',
      // Edit ops
      '<div class="np-dd-wrap">',
      '<button class="np-tb-btn" id="np-edit-btn">Edit \u25be</button>',
      '<div class="np-dropdown" id="np-edit-menu">',
      '<button class="np-dd-item" id="np-undo-btn">Undo (Ctrl+Z)</button>',
      '<button class="np-dd-item" id="np-redo-btn">Redo (Ctrl+Y)</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" id="np-find-btn">Find (Ctrl+F)</button>',
      '<button class="np-dd-item" id="np-replace-btn">Replace (Ctrl+H)</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" id="np-trim-btn">Trim Whitespace</button>',
      '</div>',
      '</div>',
      // Text tools
      '<div class="np-dd-wrap">',
      '<button class="np-tb-btn" id="np-text-btn">Text \u25be</button>',
      '<div class="np-dropdown" id="np-text-menu">',
      '<button class="np-dd-item" data-case="upper">UPPERCASE</button>',
      '<button class="np-dd-item" data-case="lower">lowercase</button>',
      '<button class="np-dd-item" data-case="title">Title Case</button>',
      '<button class="np-dd-item" data-case="camel">camelCase</button>',
      '<button class="np-dd-item" data-case="snake">snake_case</button>',
      '<button class="np-dd-item" data-case="kebab">kebab-case</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" data-sort="asc">Sort Lines A\u2192Z</button>',
      '<button class="np-dd-item" data-sort="desc">Sort Lines Z\u2192A</button>',
      '<button class="np-dd-item" data-sort="len">Sort by Length</button>',
      '<button class="np-dd-item" data-sort="dedup">Remove Duplicates</button>',
      '<button class="np-dd-item" data-sort="shuffle">Shuffle Lines</button>',
      '</div>',
      '</div>',
      // View
      '<div class="np-dd-wrap">',
      '<button class="np-tb-btn" id="np-view-btn">View \u25be</button>',
      '<div class="np-dropdown" id="np-view-menu">',
      '<button class="np-dd-item" data-view="editor">Editor only</button>',
      '<button class="np-dd-item" data-view="preview">Preview only</button>',
      '<button class="np-dd-item" data-view="split">Split view</button>',
      '<button class="np-dd-item" data-view="diff">Diff view</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" id="np-toggle-wrap">Word Wrap</button>',
      '<button class="np-dd-item" id="np-toggle-lines">Line Numbers</button>',
      '<div class="np-dd-sep"></div>',
      '<button class="np-dd-item" data-theme="dark">Theme: Dark</button>',
      '<button class="np-dd-item" data-theme="light">Theme: Light</button>',
      '<button class="np-dd-item" data-theme="monokai">Theme: Monokai</button>',
      '<button class="np-dd-item" data-theme="dracula">Theme: Dracula</button>',
      '</div>',
      '</div>',
      '<button class="np-tb-btn" id="np-snippets-btn" title="Snippets">Snippets</button>',
      '</div>',
      '<div class="np-toolbar-right">',
      // Language selector
      '<select class="np-lang-select" id="np-lang-select">',
      NpHighlight.LANGUAGES.map(function(l) { return '<option value="' + l + '">' + l.charAt(0).toUpperCase()+l.slice(1) + '</option>'; }).join(''),
      '</select>',
      // Font size
      '<button class="np-tb-btn" id="np-font-dec" title="Decrease font (Ctrl+-)">A-</button>',
      '<span class="np-font-size" id="np-font-size">14px</span>',
      '<button class="np-tb-btn" id="np-font-inc" title="Increase font (Ctrl+=)">A+</button>',
      '</div>',
      '</div>',

      // ── Tab bar ──
      '<div class="np-tab-bar" id="np-tab-bar"></div>',

      // ── Find panel ──
      NpFind.buildHTML(),

      // ── Snippets panel ──
      NpSnippets.buildHTML(),

      // ── Main area ──
      '<div class="np-main">',

      // Editor area
      '<div class="np-editor-area" id="np-editor-area">',
      '<div class="np-editor-wrap" id="np-editor-wrap">',
      '<div class="np-line-nums" id="np-line-nums"></div>',
      '<div class="np-highlight-layer" id="np-highlight" aria-hidden="true"></div>',
      '<textarea class="np-textarea" id="np-textarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>',
      '</div>',
      '</div>',

      // Preview area
      '<div class="np-preview-area" id="np-preview-area" style="display:none">',
      '<div class="np-preview-content" id="np-preview-content"></div>',
      '</div>',

      // Diff area
      '<div class="np-diff-area" id="np-diff-area" style="display:none">',
      '<div class="np-diff-inputs">',
      '<div class="np-diff-col"><div class="np-diff-label">Text A</div><textarea class="np-textarea np-diff-ta" id="np-diff-a" spellcheck="false" placeholder="Paste text A\u2026"></textarea></div>',
      '<div class="np-diff-col"><div class="np-diff-label">Text B</div><textarea class="np-textarea np-diff-ta" id="np-diff-b" spellcheck="false" placeholder="Paste text B\u2026"></textarea></div>',
      '</div>',
      '<button class="dh-btn primary" id="np-diff-run" style="margin:6px 12px;">Compare</button>',
      '<div id="np-diff-content" class="np-diff-result"></div>',
      '</div>',

      '</div>',

      // ── Status bar ──
      '<div class="np-statusbar">',
      '<span id="np-stats">0 words \u00b7 0 chars \u00b7 1 line</span>',
      '<span class="np-status-sep">\u00b7</span>',
      '<span id="np-autosave-status">Auto-save on</span>',
      '<span class="np-status-sep">\u00b7</span>',
      '<span id="np-encoding">UTF-8</span>',
      '</div>',

      '</div>',
    ].join('');

    // Init modules
    NpEditor.init(container, this._settings, function(val) {
      var tab = NpTabs.getActive();
      if (tab) NpTabs.updateContent(tab.id, val);
      if (NpPreview._mode === 'preview' || NpPreview._mode === 'split') NpPreview.updatePreview(val);
      self._scheduleAutoSave();
    });

    NpTabs.init(container, function(tab) {
      if (!tab) return;
      NpEditor.setValue(tab.content, tab.lang);
      var sel = container.querySelector('#np-lang-select');
      if (sel) sel.value = tab.lang;
    }, null);

    NpFind.init(container, function() { return NpEditor; });
    NpFind.bind();

    NpPreview.init(container);
    NpSnippets.init(container, function() { return NpEditor; });
    NpSnippets.bind();

    // Restore or create default tab
    var saved = NpStorage.loadTabs();
    if (saved && saved.tabs && saved.tabs.length) {
      NpTabs.restore(saved);
    } else {
      NpTabs.createTab('Untitled 1', '', 'plain');
    }

    this._bindAll(container);
  },

  _scheduleAutoSave: function() {
    var self = this;
    clearTimeout(this._autoSaveTimer);
    if (!this._settings.autoSave) return;
    this._autoSaveTimer = setTimeout(function() {
      var data = NpTabs.serialize();
      NpStorage.saveTabs(data.tabs, data.activeId);
      var el = document.getElementById('np-autosave-status');
      if (el) { el.textContent = 'Saved \u2713'; setTimeout(function() { if(el) el.textContent='Auto-save on'; }, 1500); }
    }, 1000);
  },

  _bindAll: function(c) {
    var self = this;
    var $ = function(id) { return c.querySelector('#' + id); };

    // Dropdown toggles
    c.querySelectorAll('.np-dd-wrap').forEach(function(wrap) {
      var btn = wrap.querySelector('.np-tb-btn');
      var menu = wrap.querySelector('.np-dropdown');
      if (!btn || !menu) return;
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        c.querySelectorAll('.np-dropdown').forEach(function(m) { if(m!==menu) m.style.display='none'; });
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      });
    });
    document.addEventListener('click', function() { c.querySelectorAll('.np-dropdown').forEach(function(m) { m.style.display='none'; }); });

    // File ops
    $('np-new-file').addEventListener('click', function() { NpTabs.createTab(); });
    $('np-open-file-btn').addEventListener('click', function() { $('np-open-file-inp').click(); });
    $('np-open-file-inp').addEventListener('change', function(e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var lang = NpHighlight.detect(ev.target.result, file.name);
        NpTabs.createTab(file.name, ev.target.result, lang);
        NpStorage.addRecent(file.name, ev.target.result);
      };
      reader.readAsText(file);
      e.target.value = '';
    });
    $('np-save-file').addEventListener('click', function() { self._saveFile(); });
    $('np-save-as').addEventListener('click', function() { self._saveFileAs(); });

    // Edit ops
    $('np-undo-btn').addEventListener('click', function() { NpEditor.undo(); });
    $('np-redo-btn').addEventListener('click', function() { NpEditor.redo(); });
    $('np-find-btn').addEventListener('click', function() { NpFind.show('find'); });
    $('np-replace-btn').addEventListener('click', function() { NpFind.show('replace'); });
    $('np-trim-btn').addEventListener('click', function() { NpEditor.trimWhitespace(); });

    // Case convert
    c.querySelectorAll('[data-case]').forEach(function(btn) {
      btn.addEventListener('click', function() { NpEditor.caseConvert(btn.dataset.case); });
    });
    // Sort lines
    c.querySelectorAll('[data-sort]').forEach(function(btn) {
      btn.addEventListener('click', function() { NpEditor.sortLines(btn.dataset.sort); });
    });

    // View
    c.querySelectorAll('[data-view]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        NpPreview.setMode(btn.dataset.view);
        if (btn.dataset.view === 'preview' || btn.dataset.view === 'split') {
          NpPreview.updatePreview(NpEditor.getValue());
        }
      });
    });
    $('np-toggle-wrap').addEventListener('click', function() {
      self._settings.wordWrap = !self._settings.wordWrap;
      NpEditor.setSettings(self._settings);
      NpStorage.saveSettings(self._settings);
    });
    $('np-toggle-lines').addEventListener('click', function() {
      self._settings.lineNumbers = !self._settings.lineNumbers;
      NpEditor.setSettings(self._settings);
      NpStorage.saveSettings(self._settings);
    });
    c.querySelectorAll('[data-theme]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self._settings.theme = btn.dataset.theme;
        NpEditor.setSettings(self._settings);
        NpStorage.saveSettings(self._settings);
      });
    });

    // Snippets
    $('np-snippets-btn').addEventListener('click', function() { NpSnippets.toggle(); });

    // Language select
    $('np-lang-select').addEventListener('change', function() {
      var lang = $('np-lang-select').value;
      NpEditor.setLang(lang);
      var tab = NpTabs.getActive();
      if (tab) NpTabs.setLang(tab.id, lang);
    });

    // Font size
    $('np-font-inc').addEventListener('click', function() {
      self._settings.fontSize = Math.min(32, self._settings.fontSize + 1);
      NpEditor.setSettings(self._settings);
      NpStorage.saveSettings(self._settings);
      $('np-font-size').textContent = self._settings.fontSize + 'px';
    });
    $('np-font-dec').addEventListener('click', function() {
      self._settings.fontSize = Math.max(8, self._settings.fontSize - 1);
      NpEditor.setSettings(self._settings);
      NpStorage.saveSettings(self._settings);
      $('np-font-size').textContent = self._settings.fontSize + 'px';
    });
    $('np-font-size').textContent = self._settings.fontSize + 'px';

    // Diff
    $('np-diff-run').addEventListener('click', function() {
      NpPreview.updateDiff($('np-diff-a').value, $('np-diff-b').value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (!c.contains(document.activeElement)) return;
      var ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'n') { e.preventDefault(); NpTabs.createTab(); }
      if (ctrl && e.key === 's') { e.preventDefault(); self._saveFile(); }
      if (ctrl && e.key === 'z') { e.preventDefault(); NpEditor.undo(); }
      if (ctrl && (e.key === 'y' || (e.key==='z'&&e.shiftKey))) { e.preventDefault(); NpEditor.redo(); }
      if (ctrl && e.key === '=') { e.preventDefault(); $('np-font-inc').click(); }
      if (ctrl && e.key === '-') { e.preventDefault(); $('np-font-dec').click(); }
      if (ctrl && e.key === 'w') { e.preventDefault(); var t=NpTabs.getActive(); if(t) NpTabs.closeTab(t.id); }
    });
  },

  _saveFile: function() {
    var tab = NpTabs.getActive();
    if (!tab) return;
    var ext = tab.lang === 'plain' ? 'txt' : tab.lang === 'javascript' ? 'js' : tab.lang === 'typescript' ? 'ts' : tab.lang === 'python' ? 'py' : tab.lang === 'markdown' ? 'md' : tab.lang;
    var filename = tab.name.includes('.') ? tab.name : tab.name + '.' + ext;
    var blob = new Blob([tab.content], {type:'text/plain'});
    var a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
    NpTabs.markSaved(tab.id);
    NpStorage.addRecent(filename, tab.content);
  },

  _saveFileAs: function() {
    var tab = NpTabs.getActive();
    if (!tab) return;
    var name = prompt('Save as:', tab.name) || tab.name;
    NpTabs.renameTab(tab.id, name);
    this._saveFile();
  },
};
