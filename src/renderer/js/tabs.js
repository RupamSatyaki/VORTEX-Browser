// Tab management — each tab has its own webview
const Tabs = (() => {
  let tabs = [];
  let activeTabId = null;

  function createTabBackground(url) {
    const id = Date.now().toString();
    tabs.push({ id, url, title: 'New Tab', favicon: null });
    WebView.createWebview(id, url);
    render(); // don't switch — stays in background
    return id;
  }

  function createTab(url = 'https://www.google.com') {
    const id = Date.now().toString();
    tabs.push({ id, url, title: 'New Tab', favicon: null });
    activeTabId = id;
    WebView.createWebview(id, url);
    WebView.switchTo(id);
    render();
    _notifyChanged();
    return id;
  }

  function closeTab(id) {
    if (tabs.length === 1) return;
    WebView.destroyWebview(id);
    tabs = tabs.filter(t => t.id !== id);
    if (activeTabId === id) {
      activeTabId = tabs[tabs.length - 1].id;
      WebView.switchTo(activeTabId);
    }
    render();
    _notifyChanged();
  }

  function setActiveTab(id) {
    activeTabId = id;
    WebView.switchTo(id);
    render();
    _notifyChanged();
  }

  function updateTab(id, data) {
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;

    // If only favicon changed, update the img in-place without full re-render
    if (Object.keys(data).length === 1 && data.favicon !== undefined && tab.favicon !== data.favicon) {
      tab.favicon = data.favicon;
      const el = document.querySelector(`.tab[data-id="${id}"] .tab-icon`);
      if (el) {
        el.innerHTML = '';
        const img = document.createElement('img');
        img.width = 14; img.height = 14;
        img.style.borderRadius = '2px';
        img.src = data.favicon;
        img.onerror = () => {
          img.remove();
          el.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        };
        el.appendChild(img);
        return; // skip full render
      }
    }

    Object.assign(tab, data);
    render();
  }

  function getActiveTab() {
    return tabs.find(t => t.id === activeTabId) || null;
  }

  function getAllTabs() { return [...tabs]; }

  function getActiveId() { return activeTabId; }

  function _notifyChanged() {
    document.dispatchEvent(new CustomEvent('vortex:tab-changed'));
  }

  function render() {
    const container = document.getElementById('tabbar-container');
    container.innerHTML = '';

    tabs.forEach(tab => {
      const el = document.createElement('div');
      el.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
      el.dataset.id = tab.id;

      // favicon
      const iconEl = document.createElement('div');
      iconEl.className = 'tab-icon';

      if (tab.favicon) {
        const img = document.createElement('img');
        img.width = 14;
        img.height = 14;
        img.style.borderRadius = '2px';
        img.src = tab.favicon;
        img.onerror = () => {
          img.remove();
          iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
        };
        iconEl.appendChild(img);
      } else {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7aadad" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      }

      const titleEl = document.createElement('span');
      titleEl.className = 'tab-title';
      titleEl.textContent = tab.title;

      const closeBtn = document.createElement('div');
      closeBtn.className = 'tab-close';
      closeBtn.title = 'Close tab';
      closeBtn.innerHTML = `<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>`;
      closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeTab(tab.id); });

      el.appendChild(iconEl);
      el.appendChild(titleEl);
      el.appendChild(closeBtn);
      el.addEventListener('click', () => setActiveTab(tab.id));
      el.addEventListener('mouseenter', () => TabPreview.show(el, tab.id, tab.title));
      el.addEventListener('mouseleave', () => TabPreview.hide());
      container.appendChild(el);
    });

    // New tab button
    const newBtn = document.createElement('button');
    newBtn.className = 'tab-add';
    newBtn.title = 'New Tab';
    newBtn.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
    newBtn.addEventListener('click', () => createTab('https://www.google.com'));
    container.appendChild(newBtn);

    // Window controls — right side of tabbar
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    controls.innerHTML = `
      <button class="wc-btn wc-minimize" title="Minimize">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button class="wc-btn wc-maximize" title="Maximize">
        <svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
      </button>
      <button class="wc-btn wc-close" title="Close">
        <svg viewBox="0 0 12 12" width="12" height="12"><line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
    `;
    controls.querySelector('.wc-minimize').addEventListener('click', () => window.vortexAPI.send('window:minimize'));
    controls.querySelector('.wc-maximize').addEventListener('click', () => window.vortexAPI.send('window:maximize'));
    controls.querySelector('.wc-close').addEventListener('click',    () => window.vortexAPI.send('window:close'));
    container.appendChild(controls);
  }

  return { createTab, createTabBackground, closeTab, setActiveTab, updateTab, getActiveTab, getAllTabs, getActiveId, render };
})();
