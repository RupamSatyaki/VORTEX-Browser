const MCPTool_deleteBookmark = {
  name: 'delete_bookmark',
  description: 'Delete a bookmark by URL',
  parameters: {
    url: { type: 'string', description: 'URL of the bookmark to delete', required: true },
  },
  async execute({ url }) {
    try {
      const bookmarks = await vortexAPI.invoke('storage:read', 'bookmarks') || [];
      const filtered  = bookmarks.filter(b => b.url !== url);
      await vortexAPI.invoke('storage:write', 'bookmarks', filtered);
      return { success: true, result: `Deleted bookmark: ${url}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
