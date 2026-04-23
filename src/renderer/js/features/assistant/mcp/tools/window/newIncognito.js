const MCPTool_newIncognito = {
  name: 'new_incognito',
  description: 'Open a new incognito (private) window',
  parameters: {
    url: { type: 'string', description: 'URL to open in incognito (optional)', required: false },
  },
  execute({ url } = {}) {
    try {
      vortexAPI.send('window:incognito', url || null);
      return { success: true, result: 'Incognito window opened' };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
