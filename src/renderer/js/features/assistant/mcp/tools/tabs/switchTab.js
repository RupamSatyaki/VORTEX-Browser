const MCPTool_switchTab = {
  name: 'switch_tab',
  description: 'Switch focus to a specific tab by ID or index',
  parameters: {
    tabId: { type: 'string', description: 'Tab ID to switch to', required: false },
    index: { type: 'number', description: 'Tab index (0-based) to switch to', required: false },
  },
  execute({ tabId, index }) {
    try {
      if (tabId) {
        Tabs.switchTab(tabId);
        return { success: true, result: `Switched to tab: ${tabId}` };
      }
      if (typeof index === 'number') {
        const all = Tabs.getAllTabs();
        const tab = all[index];
        if (!tab) return { success: false, error: `No tab at index ${index}` };
        Tabs.switchTab(tab.id);
        return { success: true, result: `Switched to tab ${index}: ${tab.title}` };
      }
      return { success: false, error: 'Provide tabId or index' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
