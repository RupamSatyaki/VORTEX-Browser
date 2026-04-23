const MCPTool_getPageInfo = {
  name: 'get_page_info',
  description: 'Get the title, URL and favicon of the current page',
  parameters: {},
  execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      const tab = Tabs.getAllTabs().find(t => t.id === Tabs.getActiveId());
      return { success: true, result: {
        title:   tab?.title || '',
        url:     wv.src || '',
        favicon: tab?.favicon || '',
      }};
    } catch (e) { return { success: false, error: e.message }; }
  },
};
