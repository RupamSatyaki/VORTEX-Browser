// image-editor/index.js - Image Editor Tool entry point
var ImageEditorTool = {
  id: 'image-editor',
  name: 'Image Editor',
  desc: 'Crop \u00b7 Rotate \u00b7 Adjust \u00b7 Filters \u00b7 Draw \u00b7 Text \u00b7 Overlay',
  icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><path d="M14 10l2 2"/></svg>',

  _cssInjected: false,

  _injectCSS: function() {
    if (this._cssInjected || document.getElementById('ie-styles')) return;
    var base = window.location.href.replace(/\/index\.html.*$/, '/');
    var link = document.createElement('link');
    link.id = 'ie-styles'; link.rel = 'stylesheet';
    link.href = base + 'js/devhub/tools/image-editor/styles.css';
    document.head.appendChild(link);
    this._cssInjected = true;
  },

  render: function(container) {
    this._injectCSS();
    ImageEditor.render(container);
  },
};
