const MCPTool_getSelectedText = {
  name: 'get_selected_text',
  description: 'Get the text currently selected by the user on the page',
  parameters: {},
  async execute() {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) return { success: false, error: 'No active tab' };
      const text = await wv.executeJavaScript(
        'window.getSelection ? window.getSelection().toString() : ""'
      );
      return { success: true, result: { selectedText: text.trim() } };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
