const MCPTool_maximizeWindow = {
  name: 'maximize_window',
  description: 'Maximize or restore the browser window',
  parameters: {},
  execute() {
    try {
      vortexAPI.send('window:maximize');
      return { success: true, result: 'Window maximized/restored' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
