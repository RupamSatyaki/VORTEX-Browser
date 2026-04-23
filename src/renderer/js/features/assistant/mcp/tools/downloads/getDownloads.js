const MCPTool_getDownloads = {
  name: 'get_downloads',
  description: 'Get recent download history',
  parameters: {
    limit: { type: 'number', description: 'Max entries (default 10)', required: false },
  },
  async execute({ limit = 10 } = {}) {
    try {
      const downloads = await vortexAPI.invoke('storage:read', 'downloads_history') || [];
      const recent = downloads.slice(-limit).reverse().map(d => ({
        filename: d.filename || d.savePath?.split(/[\\/]/).pop() || 'Unknown',
        url:      d.url || '',
        size:     d.totalBytes ? `${(d.totalBytes / 1024 / 1024).toFixed(1)} MB` : '',
        state:    d.state || '',
      }));
      return { success: true, result: recent };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
