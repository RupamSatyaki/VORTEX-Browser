// notepad/ui/preview.js - Markdown preview + diff view
var NpPreview = {

  _container: null,
  _mode: 'editor', // 'editor' | 'preview' | 'split' | 'diff'

  init: function(container) { this._container = container; },

  setMode: function(mode) {
    this._mode = mode;
    var ed   = this._container.querySelector('#np-editor-area');
    var prev = this._container.querySelector('#np-preview-area');
    var diff = this._container.querySelector('#np-diff-area');
    if (ed)   ed.style.display   = (mode === 'editor' || mode === 'split') ? '' : 'none';
    if (prev) prev.style.display = (mode === 'preview' || mode === 'split') ? '' : 'none';
    if (diff) diff.style.display = mode === 'diff' ? '' : 'none';
    if (ed)   ed.style.flex      = mode === 'split' ? '1' : '';
    if (prev) prev.style.flex    = mode === 'split' ? '1' : '';
  },

  updatePreview: function(markdown) {
    var el = this._container.querySelector('#np-preview-content');
    if (!el) return;
    el.innerHTML = this._mdToHtml(markdown);
  },

  updateDiff: function(textA, textB) {
    var el = this._container.querySelector('#np-diff-content');
    if (!el) return;
    el.innerHTML = this._computeDiff(textA, textB);
  },

  _mdToHtml: function(md) {
    var html = md
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      // Code blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, function(m,lang,code) {
        return '<pre class="np-md-code"><code>' + code + '</code></pre>';
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="np-md-inline">$1</code>')
      // Headers
      .replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
      // Horizontal rule
      .replace(/^---+$/gm, '<hr/>')
      // Blockquote
      .replace(/^&gt;\s(.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered list
      .replace(/^[\*\-\+]\s(.+)$/gm, '<li>$1</li>')
      // Ordered list
      .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    return '<div class="np-md-body"><p>' + html + '</p></div>';
  },

  _computeDiff: function(a, b) {
    var linesA = a.split('\n');
    var linesB = b.split('\n');
    var html = '';
    var maxLen = Math.max(linesA.length, linesB.length);
    for (var i = 0; i < maxLen; i++) {
      var la = linesA[i];
      var lb = linesB[i];
      if (la === undefined) {
        html += '<div class="np-diff-added">+ ' + this._esc(lb) + '</div>';
      } else if (lb === undefined) {
        html += '<div class="np-diff-removed">- ' + this._esc(la) + '</div>';
      } else if (la !== lb) {
        html += '<div class="np-diff-removed">- ' + this._esc(la) + '</div>';
        html += '<div class="np-diff-added">+ ' + this._esc(lb) + '</div>';
      } else {
        html += '<div class="np-diff-same">  ' + this._esc(la) + '</div>';
      }
    }
    return '<div class="np-diff-view">' + html + '</div>';
  },

  _esc: function(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); },
};
