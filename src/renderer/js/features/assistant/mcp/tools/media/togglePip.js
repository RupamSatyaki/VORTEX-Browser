const MCPTool_togglePip = {
  name: 'toggle_pip',
  description: 'Toggle Picture-in-Picture mode for the current video',
  parameters: {},
  async execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      await vortexAPI.invoke('pip:trigger', wv.getWebContentsId());
      return { success: true, result: 'PiP toggled' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
