const MCPTool_getTabs = {
  name: 'get_tabs',
  description: 'Get a list of all currently open tabs',
  parameters: {},
  execute() {
    try {
      const tabs = Tabs.getAllTabs().map((t, i) => ({
        index: i,
        id: t.id,
        title: t.title || 'Untitled',
        url: t.url || '',
        active: t.id === Tabs.getActiveId(),
      }));
      return { success: true, result: tabs };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
