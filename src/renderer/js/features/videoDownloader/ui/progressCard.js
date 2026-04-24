/**
 * features/videoDownloader/ui/progressCard.js
 * Download progress card — create, update, remove.
 */

const VDLProgressCard = (() => {

  function create(id, title) {
    const card = document.createElement('div');
    card.className = 'vdl-dl-card';
    card.id = `vdl-dl-${id}`;
    card.innerHTML = `
      <div class="vdl-dl-title" title="${title}">${title}</div>
      <div class="vdl-dl-progress-bar">
        <div class="vdl-dl-progress-fill" style="width:0%"></div>
      </div>
      <div class="vdl-dl-meta">
        <span class="vdl-dl-status">Starting...</span>
        <div class="vdl-dl-actions">
          <button class="vdl-dl-btn cancel" data-id="${id}" title="Cancel">✕</button>
        </div>
      </div>
    `;
    return card;
  }

  function update(id, { percent, speed, eta, status, filePath, error }) {
    const card = document.getElementById(`vdl-dl-${id}`);
    if (!card) return;

    if (percent !== undefined) {
      const fill = card.querySelector('.vdl-dl-progress-fill');
      if (fill) fill.style.width = Math.min(100, percent) + '%';
    }

    const statusEl = card.querySelector('.vdl-dl-status');
    if (!statusEl) return;

    if (status === 'downloading') {
      const pct = percent ? Math.round(percent) + '%' : '';
      const spd = speed || '';
      const e   = eta ? `ETA ${eta}` : '';
      statusEl.textContent = [pct, spd, e].filter(Boolean).join(' · ');
      statusEl.className = 'vdl-dl-status';
    } else if (status === 'done') {
      statusEl.textContent = '✓ Done';
      statusEl.className = 'vdl-dl-status done';
      card.classList.add('done');  // for "clear done" button
      const fill = card.querySelector('.vdl-dl-progress-fill');
      if (fill) fill.style.width = '100%';
      // Replace cancel with open-folder button
      const actions = card.querySelector('.vdl-dl-actions');
      if (actions && filePath) {
        actions.innerHTML = `
          <button class="vdl-dl-btn open" data-path="${filePath}" title="Show in folder">📂 Open</button>
        `;
      }
    } else if (status === 'error') {
      statusEl.textContent = `✗ ${error || 'Failed'}`;
      statusEl.className = 'vdl-dl-status error';
    }
  }

  function remove(id) {
    document.getElementById(`vdl-dl-${id}`)?.remove();
  }

  return { create, update, remove };

})();
