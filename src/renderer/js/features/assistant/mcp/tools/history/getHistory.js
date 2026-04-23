const MCPTool_getHistory = {
  name: 'get_history',
  description: 'Get recent browsing history',
  parameters: {
    limit: { type: 'number', description: 'Max entries to return (default 10)', required: false },
  },
  async execute({ limit = 10 } = {}) {
    try {
      const history = await vortexAPI.invoke('storage:read', 'tab_history') || [];
      const recent  = history.slice(-limit).reverse().map(h => ({
        title: h.title || h.url,
        url:   h.url,
        time:  h.timestamp ? new Date(h.timestamp).toLocaleString() : '',
      }));
      return { success: true, result: recent };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
