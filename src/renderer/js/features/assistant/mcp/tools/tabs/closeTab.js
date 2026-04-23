const MCPTool_closeTab = {
  name: 'close_tab',
  description: 'Close the current tab or a specific tab by ID',
  parameters: {
    tabId: { type: 'string', description: 'Tab ID to close (omit for current tab)', required: false },
  },
  execute({ tabId } = {}) {
    try {
      const id = tabId || Tabs.getActiveId();
      Tabs.closeTab(id);
      return { success: true, result: `Closed tab: ${id}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
