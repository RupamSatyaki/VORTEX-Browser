const MCPTool_newWindow = {
  name: 'new_window',
  description: 'Open a new browser window',
  parameters: {
    url: { type: 'string', description: 'URL to open in new window (optional)', required: false },
  },
  execute({ url } = {}) {
    try {
      vortexAPI.send('window:new', url || null);
      return { success: true, result: 'New window opened' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
