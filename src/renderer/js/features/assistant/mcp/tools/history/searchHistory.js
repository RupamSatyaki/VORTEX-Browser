const MCPTool_searchHistory = {
  name: 'search_history',
  description: 'Search browsing history by keyword',
  parameters: {
    query: { type: 'string', description: 'Search keyword', required: true },
    limit: { type: 'number', description: 'Max results (default 10)', required: false },
  },
  async execute({ query, limit = 10 }) {
    try {
      const history = await vortexAPI.invoke('storage:read', 'tab_history') || [];
      const q       = query.toLowerCase();
      const results = history
        .filter(h => (h.title || '').toLowerCase().includes(q) || (h.url || '').toLowerCase().includes(q))
        .slice(-limit)
        .reverse()
        .map(h => ({ title: h.title || h.url, url: h.url }));
      return { success: true, result: results };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
