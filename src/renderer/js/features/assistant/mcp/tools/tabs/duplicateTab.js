const MCPTool_duplicateTab = {
  name: 'duplicate_tab',
  description: 'Duplicate the current tab or a specific tab',
  parameters: {
    tabId: { type: 'string', description: 'Tab ID to duplicate (omit for current)', required: false },
  },
  execute({ tabId } = {}) {
    try {
      const id  = tabId || Tabs.getActiveId();
      const tab = Tabs.getAllTabs().find(t => t.id === id);
      if (!tab) return { success: false, error: 'Tab not found' };
      WebView.newTab(tab.url || 'vortex://newtab');
      return { success: true, result: `Duplicated: ${tab.title}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
