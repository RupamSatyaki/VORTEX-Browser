const MCPTool_createTab = {
  name: 'create_tab',
  description: 'Open a new browser tab with the given URL',
  parameters: {
    url:        { type: 'string',  description: 'Full URL to open (e.g. https://google.com)', required: true },
    background: { type: 'boolean', description: 'Open in background without switching focus', required: false },
  },
  execute({ url, background = false }) {
    try {
      if (!url.startsWith('http')) url = 'https://' + url;
      WebView.newTab(url, { background });
      return { success: true, result: `Opened: ${url}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
