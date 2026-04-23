/**
 * features/assistant/mcp/mcpRegistry.js
 * Central registry — all 34 tools in one array.
 */

const MCPRegistry = (() => {

  const ALL_TOOLS = [
    // Tabs
    MCPTool_createTab,
    MCPTool_closeTab,
    MCPTool_switchTab,
    MCPTool_getTabs,
    MCPTool_duplicateTab,
    MCPTool_muteTab,
    // Navigation
    MCPTool_navigateTo,
    MCPTool_goBack,
    MCPTool_goForward,
    MCPTool_reloadTab,
    MCPTool_stopLoading,
    // Page
    MCPTool_readPage,
    MCPTool_getPageInfo,
    MCPTool_getSelectedText,
    MCPTool_scrollPage,
    MCPTool_findInPage,
    MCPTool_zoomPage,
    // Window
    MCPTool_newWindow,
    MCPTool_newIncognito,
    MCPTool_minimizeWindow,
    MCPTool_maximizeWindow,
    MCPTool_closeWindow,
    // Bookmarks
    MCPTool_bookmarkPage,
    MCPTool_getBookmarks,
    MCPTool_deleteBookmark,
    // History
    MCPTool_getHistory,
    MCPTool_searchHistory,
    // Media
    MCPTool_takeScreenshot,
    MCPTool_togglePip,
    // Search
    MCPTool_searchWeb,
    MCPTool_searchCurrentSite,
    // Downloads
    MCPTool_getDownloads,
    MCPTool_openDownload,
  ];

  function getAll()    { return ALL_TOOLS; }
  function getSchemas(){ return ALL_TOOLS.map(t => ({ name: t.name, description: t.description, parameters: t.parameters })); }
  function find(name)  { return ALL_TOOLS.find(t => t.name === name); }

  return { getAll, getSchemas, find };

})();
