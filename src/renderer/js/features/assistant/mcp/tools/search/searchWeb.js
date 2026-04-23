const MCPTool_searchWeb = {
  name: 'search_web',
  description: 'Search the web using a search engine',
  parameters: {
    query:  { type: 'string', description: 'Search query', required: true },
    engine: { type: 'string', description: 'google | bing | duckduckgo | youtube (default: google)', required: false },
  },
  execute({ query, engine = 'google' }) {
    try {
      const engines = {
        google:     `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        bing:       `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        youtube:    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      };
      const url = engines[engine] || engines.google;
      WebView.loadURL(url);
      return { success: true, result: `Searching "${query}" on ${engine}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
