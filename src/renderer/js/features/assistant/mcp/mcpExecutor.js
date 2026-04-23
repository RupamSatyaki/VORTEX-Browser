/**
 * features/assistant/mcp/mcpExecutor.js
 * Dispatch tool calls + format results.
 */

const MCPExecutor = (() => {

  async function execute(toolName, args = {}) {
    const tool = MCPRegistry.find(toolName);
    if (!tool) {
      return { success: false, error: `Unknown tool: ${toolName}` };
    }
    try {
      const result = await Promise.resolve(tool.execute(args));
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function formatResult(result) {
    if (!result.success) return `Error: ${result.error}`;
    if (typeof result.result === 'string') return result.result;
    return JSON.stringify(result.result, null, 2);
  }

  return { execute, formatResult };

})();
