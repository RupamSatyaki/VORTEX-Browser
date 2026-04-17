/**
 * features/quickLaunch/scripts/bookmarksHandler.js
 * Bookmarks grid render + add bookmark panel logic.
 */

const QLBookmarksHandler = (() => {

  async function renderGrid(onOpen, onAddClick) {
    const grid = document.getElementById('ql-bookmarks-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let bookmarks = [];
    try { bookmarks = (await BookmarkStore.load()) || []; } catch (_) {}

    bookmarks.slice(0, 11).forEach(bm => {
      grid.appendChild(QLBookmarksGridUI.buildItem(bm.url, bm.title, onOpen));
    });

    grid.appendChild(QLBookmarksGridUI.buildAddBtn(onAddClick));
  }

  function openAddPanel(onSaved) {
    document.getElementById('ql-add-bm-panel')?.remove();

    let prefillUrl = '', prefillTitle = '';
    const tab = Tabs.getActiveTab();
    if (tab) { prefillUrl = tab.url || ''; prefillTitle = tab.title || ''; }

    const panel = QLAddBookmarkUI.create(prefillUrl, prefillTitle);
    document.body.appendChild(panel);

    // Auto-fetch icon on URL change
    const urlInput = panel.querySelector('#ql-abm-url');
    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      try {
        const origin = new URL(val.startsWith('http') ? val : 'https://' + val).origin;
        const img      = panel.querySelector('#ql-abm-favicon');
        const fallback = panel.querySelector('#ql-abm-icon-fallback');
        if (img) {
          img.src = origin + '/favicon.ico';
          img.style.display = '';
          if (fallback) fallback.style.display = 'none';
          img.onerror = () => { img.style.display = 'none'; if (fallback) fallback.style.display = 'flex'; };
        } else {
          const newImg = document.createElement('img');
          newImg.id = 'ql-abm-favicon';
          newImg.width = 28; newImg.height = 28;
          newImg.style.borderRadius = '6px';
          newImg.src = origin + '/favicon.ico';
          newImg.onerror = () => { newImg.style.display = 'none'; if (fallback) fallback.style.display = 'flex'; };
          panel.querySelector('#ql-abm-icon-preview')?.insertBefore(newImg, panel.querySelector('#ql-abm-icon-preview').firstChild);
          if (fallback) fallback.style.display = 'none';
        }
      } catch (_) {}
    });

    const _close = () => panel.remove();
    panel.querySelector('#ql-abm-close').addEventListener('click', _close);
    panel.querySelector('#ql-abm-cancel').addEventListener('click', _close);
    panel.querySelector('#ql-abm-backdrop').addEventListener('click', _close);

    panel.querySelector('#ql-abm-save').addEventListener('click', async () => {
      let url = urlInput.value.trim();
      const title = panel.querySelector('#ql-abm-title').value.trim() || url;
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      await BookmarkStore.add({ id: Date.now().toString(), url, title, addedAt: Date.now() });
      _close();
      if (onSaved) onSaved();
    });

    requestAnimationFrame(() => panel.classList.add('visible'));
  }

  return { renderGrid, openAddPanel };

})();
