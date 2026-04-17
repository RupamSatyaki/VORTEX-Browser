// Session persistence — save/restore tabs across app restarts
const Session = (() => {
  const KEY = 'browser_session';

  // Collect current state and persist it
  async function save() {
    const tabs = Tabs.getAllTabs().filter(t => t.url && t.url.startsWith('http'));
    if (!tabs.length) return;

    const activeTab = Tabs.getActiveTab();
    const data = {
      activeUrl: activeTab?.url || tabs[0].url,
      tabs: tabs.map(t => ({ url: t.url, title: t.title, favicon: t.favicon || null })),
      savedAt: Date.now(),
    };

    // Sync write to localStorage (works in beforeunload)
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
    // Also persist to disk via storage API
    Storage.write(KEY, data).catch(() => {});
  }

  // Returns true if session was restored, false if fresh start needed
  async function restore() {
    // Prefer disk storage (more reliable), fall back to localStorage
    let data = await Storage.read(KEY).catch(() => null);
    if (!data) {
      try { data = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
    }

    if (!data || !Array.isArray(data.tabs) || !data.tabs.length) return false;

    const validTabs = data.tabs.filter(t => t.url && t.url.startsWith('http'));
    if (!validTabs.length) return false;

    const activeUrl = data.activeUrl || validTabs[0].url;

    // Open all tabs — active one gets focus, rest open in background
    let activatedOne = false;
    for (const t of validTabs) {
      const isActive = !activatedOne && t.url === activeUrl;
      if (isActive) {
        Tabs.createTab(t.url);
        activatedOne = true;
      } else {
        Tabs.createTabBackground(t.url);
      }
    }

    // Fallback: if activeUrl wasn't found in list, activate first tab
    if (!activatedOne) {
      Tabs.createTab(validTabs[0].url);
    }

    return true;
  }

  function initAutoSave() {
    // Save on close (sync via localStorage)
    window.addEventListener('beforeunload', () => { save(); });

    // Periodic save every 30s
    setInterval(() => save(), 30_000);

    // Save when tab changes or closes
    document.addEventListener('vortex:tab-changed', () => save());
  }

  return { save, restore, initAutoSave };
})();
