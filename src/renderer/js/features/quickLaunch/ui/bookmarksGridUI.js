/**
 * features/quickLaunch/ui/bookmarksGridUI.js
 * Bookmarks grid item builder — pure DOM, no data loading.
 */

const QLBookmarksGridUI = (() => {

  const GLOBE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#4a9090" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

  function buildItem(url, title, onOpen) {
    const item = document.createElement('div');
    item.className = 'ql-bm-item';
    item.title = url;

    const iconDiv = document.createElement('div');
    iconDiv.className = 'ql-bm-icon';

    const img = document.createElement('img');
    img.width = 22; img.height = 22;
    try { img.src = new URL(url).origin + '/favicon.ico'; } catch (_) { img.src = ''; }
    img.onerror = () => { img.remove(); iconDiv.innerHTML = GLOBE_ICON; };
    iconDiv.appendChild(img);

    const titleEl = document.createElement('span');
    titleEl.className   = 'ql-bm-title';
    titleEl.textContent = title.length > 14 ? title.slice(0, 13) + '…' : title;

    item.appendChild(iconDiv);
    item.appendChild(titleEl);
    item.addEventListener('click', () => onOpen(url));
    return item;
  }

  function buildAddBtn(onAdd) {
    const btn = document.createElement('div');
    btn.className = 'ql-bm-item ql-bm-add';
    btn.title = 'Add bookmark';
    btn.innerHTML = `
      <div class="ql-bm-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="ql-bm-title">Add</span>`;
    btn.addEventListener('click', onAdd);
    return btn;
  }

  return { buildItem, buildAddBtn };

})();
