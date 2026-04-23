const MCPTool_goForward = {
  name: 'go_forward',
  description: 'Go forward in the current tab browser history',
  parameters: {},
  execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      if (!wv.canGoForward()) return { success: false, error: 'No history to go forward to' };
      wv.goForward();
      return { success: true, result: 'Went forward' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
