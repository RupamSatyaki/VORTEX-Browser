const MCPTool_minimizeWindow = {
  name: 'minimize_window',
  description: 'Minimize the browser window',
  parameters: {},
  execute() {
    try {
      vortexAPI.send('window:minimize');
      return { success: true, result: 'Window minimized' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
