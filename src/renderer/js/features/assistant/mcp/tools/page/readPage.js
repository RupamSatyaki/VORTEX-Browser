const MCPTool_readPage = {
  name: 'read_page',
  description: 'Read and extract the text content of the current page',
  parameters: {},
  async execute() {
    try {
      const data = await PageReader.readCurrentPage();
      return { success: true, result: data };
    } catch (e) { return { success: false, error: e.message }; }
  },
};
