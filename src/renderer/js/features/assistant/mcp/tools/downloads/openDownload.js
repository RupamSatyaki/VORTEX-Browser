const MCPTool_openDownload = {
  name: 'open_download',
  description: 'Open a downloaded file',
  parameters: {
    filename: { type: 'string', description: 'Filename to open', required: true },
  },
  async execute({ filename }) {
    try {
      const downloads = await vortexAPI.invoke('storage:read', 'downloads_history') || [];
      const item = downloads.find(d =>
        (d.filename || d.savePath || '').toLowerCase().includes(filename.toLowerCase())
      );
      if (!item) return { success: false, error: `File not found: ${filename}` };
      vortexAPI.send('download:openFile', item.savePath || item.filename);
      return { success: true, result: `Opening: ${filename}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
