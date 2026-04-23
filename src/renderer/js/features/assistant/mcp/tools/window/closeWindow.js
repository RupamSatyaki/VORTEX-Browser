const MCPTool_closeWindow = {
  name: 'close_window',
  description: 'Close the browser window',
  parameters: {},
  execute() {
    try {
      vortexAPI.send('window:close');
      return { success: true, result: 'Window closing' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
