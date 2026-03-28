// image-editor/ui/shortcuts.js - Shortcut cheatsheet + Before/After toggle
var EditorShortcuts = {

  _beforeSnapshot: null,
  _showingBefore: false,
  _canvas: null,
  _ctx: null,

  init: function(canvas) {
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');
  },

  // ── Before / After ────────────────────────────────────────────────────────
  saveBeforeSnapshot: function() {
    if (!this._canvas) return;
    this._beforeSnapshot = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
  },

  toggleBeforeAfter: function() {
    if (!this._beforeSnapshot || !this._canvas) return;
    if (this._showingBefore) {
      // Restore current (after)
      if (this._afterSnapshot) {
        this._canvas.width  = this._afterSnapshot.width;
        this._canvas.height = this._afterSnapshot.height;
        this._ctx.putImageData(this._afterSnapshot, 0, 0);
      }
      this._showingBefore = false;
      this._showBadge('After');
    } else {
      // Save current as "after", show "before"
      this._afterSnapshot = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
      this._canvas.width  = this._beforeSnapshot.width;
      this._canvas.height = this._beforeSnapshot.height;
      this._ctx.putImageData(this._beforeSnapshot, 0, 0);
      this._showingBefore = true;
      this._showBadge('Before');
    }
  },

  _showBadge: function(text) {
    var existing = document.getElementById('ie-ba-badge');
    if (existing) existing.remove();
    var badge = document.createElement('div');
    badge.id = 'ie-ba-badge';
    badge.className = 'ie-ba-badge';
    badge.textContent = text;
    document.body.appendChild(badge);
    setTimeout(function() { if (badge.parentNode) badge.parentNode.removeChild(badge); }, 1500);
  },

  // ── Shortcut cheatsheet ───────────────────────────────────────────────────
  SHORTCUTS: [
    { key:'V',           desc:'Select / Move tool' },
    { key:'C',           desc:'Crop tool' },
    { key:'R',           desc:'Rotate tool' },
    { key:'S',           desc:'Resize tool' },
    { key:'A',           desc:'Adjustments tool' },
    { key:'F',           desc:'Filters tool' },
    { key:'B',           desc:'Brush / Draw tool' },
    { key:'E',           desc:'Eraser tool' },
    { key:'T',           desc:'Text tool' },
    { key:'O',           desc:'Image Overlay tool' },
    { key:'H',           desc:'Flip Horizontal' },
    { key:'Enter',       desc:'Confirm crop' },
    { key:'Esc',         desc:'Cancel operation' },
    { key:'\\',          desc:'Toggle Before / After' },
    { key:'?',           desc:'Show this cheatsheet' },
    { key:'Ctrl+Z',      desc:'Undo' },
    { key:'Ctrl+Y',      desc:'Redo' },
    { key:'Ctrl+S',      desc:'Save as PNG' },
    { key:'Ctrl+=',      desc:'Zoom In' },
    { key:'Ctrl+-',      desc:'Zoom Out' },
    { key:'Ctrl+0',      desc:'Zoom 100%' },
    { key:'Ctrl+Shift+0',desc:'Fit to window' },
    { key:'[',           desc:'Decrease brush size' },
    { key:']',           desc:'Increase brush size' },
  ],

  showCheatsheet: function() {
    var existing = document.getElementById('ie-shortcuts-modal');
    if (existing) { existing.remove(); return; }
    var modal = document.createElement('div');
    modal.id = 'ie-shortcuts-modal';
    modal.className = 'ie-shortcuts-modal';
    modal.innerHTML = '<div class="ie-shortcuts-inner">' +
      '<div class="ie-shortcuts-header"><span>Keyboard Shortcuts</span><button class="ie-hdr-btn" id="ie-sc-close">\u2715</button></div>' +
      '<div class="ie-shortcuts-grid">' +
      this.SHORTCUTS.map(function(s) {
        return '<div class="ie-sc-row"><kbd class="ie-kbd">' + s.key + '</kbd><span class="ie-sc-desc">' + s.desc + '</span></div>';
      }).join('') +
      '</div></div>';
    document.body.appendChild(modal);
    modal.querySelector('#ie-sc-close').addEventListener('click', function() { modal.remove(); });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  },
};
