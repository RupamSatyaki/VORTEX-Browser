const MCPTool_bookmarkPage = {
  name: 'bookmark_page',
  description: 'Bookmark the current page',
  parameters: {
    title: { type: 'string', description: 'Custom title (uses page title if omitted)', required: false },
    url:   { type: 'string', description: 'URL to bookmark (uses current page if omitted)', required: false },
  },
  execute({ title, url } = {}) {
    try {
      const wv  = document.querySelector('webview.vortex-wv.active');
      const tab = Tabs.getAllTabs().find(t => t.id === Tabs.getActiveId());
      const finalUrl   = url   || wv?.src || '';
      const finalTitle = title || tab?.title || finalUrl;
      if (typeof BookmarkStore !== 'undefined') {
        BookmarkStore.add({ title: finalTitle, url: finalUrl });
      }
      return { success: true, result: `Bookmarked: ${finalTitle}` };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
