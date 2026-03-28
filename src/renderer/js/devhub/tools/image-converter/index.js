// image-converter/index.js - Image Converter Tool
var ImageConverterTool = {
  id: 'image-converter',
  name: 'Image Converter',
  desc: 'Convert JPG \u2194 PNG \u2194 WebP \u2194 BMP \u2194 GIF \u2022 Resize \u2022 Quality \u2022 Batch',
  icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><path d="M14 10l2 2"/></svg>',

  _cssInjected: false,

  _injectCSS: function() {
    if (this._cssInjected || document.getElementById('imgconv-styles')) return;
    var base = window.location.href.replace(/\/index\.html.*$/, '/');
    var link = document.createElement('link');
    link.id = 'imgconv-styles'; link.rel = 'stylesheet';
    link.href = base + 'js/devhub/tools/image-converter/styles.css';
    document.head.appendChild(link);
    this._cssInjected = true;
  },

  render: function(container) {
    this._injectCSS();
    ImageConverter.render(container);
  },
};
