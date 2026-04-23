const MCPTool_navigateTo = {
  name: 'navigate',
  description: 'Navigate the current tab to a URL',
  parameters: {
    url: { type: 'string', description: 'Full URL to navigate to', required: true },
  },
  execute({ url }) {
    try {
      if (!url.startsWith('http')) url = 'https://' + url;
      WebView.loadURL(url);
      return { success: true, result: `Navigating to: ${url}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
