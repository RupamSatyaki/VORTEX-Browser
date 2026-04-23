const MCPTool_reloadTab = {
  name: 'reload_tab',
  description: 'Reload the current tab',
  parameters: {
    hard: { type: 'boolean', description: 'Hard reload (clear cache)', required: false },
  },
  execute({ hard = false } = {}) {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      hard ? wv.reloadIgnoringCache() : wv.reload();
      return { success: true, result: `Tab ${hard ? 'hard ' : ''}reloaded` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
