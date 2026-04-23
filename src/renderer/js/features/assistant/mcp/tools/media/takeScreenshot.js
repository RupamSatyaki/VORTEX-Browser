const MCPTool_takeScreenshot = {
  name: 'take_screenshot',
  description: 'Take a screenshot of the current page',
  parameters: {},
  async execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      const wcId = wv.getWebContentsId();
      const dataUrl = await vortexAPI.invoke('screenshot:capture', wcId);
      return { success: true, result: { message: 'Screenshot taken', preview: dataUrl?.slice(0, 50) + '...' } };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
