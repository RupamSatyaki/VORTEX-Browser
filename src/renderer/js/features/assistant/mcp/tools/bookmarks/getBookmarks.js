const MCPTool_getBookmarks = {
  name: 'get_bookmarks',
  description: 'Get all saved bookmarks',
  parameters: {},
  async execute() {
    try {
      const bookmarks = await vortexAPI.invoke('storage:read', 'bookmarks') || [];
      return { success: true, result: bookmarks.slice(0, 20) };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
