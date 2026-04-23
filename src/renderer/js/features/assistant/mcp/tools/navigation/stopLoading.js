const MCPTool_stopLoading = {
  name: 'stop_loading',
  description: 'Stop the current page from loading',
  parameters: {},
  execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      wv.stop();
      return { success: true, result: 'Loading stopped' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
