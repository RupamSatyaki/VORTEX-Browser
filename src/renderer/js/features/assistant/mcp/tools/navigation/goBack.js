const MCPTool_goBack = {
  name: 'go_back',
  description: 'Go back in the current tab browser history',
  parameters: {},
  execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      if (!wv.canGoBack()) return { success: false, error: 'No history to go back to' };
      wv.goBack();
      return { success: true, result: 'Went back' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
