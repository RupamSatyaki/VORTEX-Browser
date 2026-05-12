/**
 * features/videoDownloader/ui/formatSelector.js
 * Quality/format dropdown — render options from video info.
 */

const VDLFormatSelector = (() => {

  function populate(qualities) {
    const select = document.getElementById('vdl-quality-select');
    if (!select) return;
    select.innerHTML = qualities.map((q, i) => {
      const size = q.filesize ? ` · ${_formatSize(q.filesize)}` : '';
      const fps  = q.fps && q.fps !== 30 ? ` ${q.fps}fps` : '';
      return `<option value="${i}">${q.label}${fps}${size}</option>`;
    }).join('');
  }

  function getSelected(qualities) {
    const select = document.getElementById('vdl-quality-select');
    if (!select) return null;
    const idx = parseInt(select.value);
    return isNaN(idx) ? null : qualities[idx] || null;
  }

  function _formatSize(bytes) {
    if (!bytes) return '';
    if (bytes > 1024 * 1024 * 1024) return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
    if (bytes > 1024 * 1024)        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  return { populate, getSelected };

})();
