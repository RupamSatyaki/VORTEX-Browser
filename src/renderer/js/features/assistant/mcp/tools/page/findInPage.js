const MCPTool_findInPage = {
  name: 'find_in_page',
  description: 'Find and highlight text in the current page',
  parameters: {
    query: { type: 'string', description: 'Text to search for', required: true },
  },
  execute({ query }) {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      wv.findInPage(query);
      return { success: true, result: `Searching for: "${query}"` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
