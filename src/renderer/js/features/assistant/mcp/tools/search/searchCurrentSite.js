const MCPTool_searchCurrentSite = {
  name: 'search_current_site',
  description: 'Search within the current website using Google site: search',
  parameters: {
    query: { type: 'string', description: 'Search query', required: true },
  },
  execute({ query }) {
    try {
      const wv = document.querySelector('webview.vortex-wv.active');
      const url = wv?.src || '';
      let domain = '';
      try { domain = new URL(url).hostname; } catch {}
      const searchUrl = domain
        ? `https://www.google.com/search?q=site:${domain}+${encodeURIComponent(query)}`
        : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      WebView.loadURL(searchUrl);
      return { success: true, result: `Searching "${query}" on ${domain || 'web'}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
