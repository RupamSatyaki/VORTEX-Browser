/**
 * features/assistant/scripts/contextBuilder.js
 * Assembles final messages array for Ollama.
 */

const ContextBuilder = (() => {

  const MAX_HISTORY = 20;

  function build({ userMessage, history, pageContext, toolSchemas }) {
    const messages = [];

    // System prompt
    messages.push({
      role: 'system',
      content: SystemPrompt.build(toolSchemas),
    });

    // Page context as system message (if provided)
    if (pageContext) {
      messages.push({
        role: 'system',
        content: pageContext,
      });
    }

    // Chat history (last N messages)
    const recent = history.slice(-MAX_HISTORY);
    for (const msg of recent) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  // Auto-detect if user message needs page context
  function needsPageContext(text) {
    const keywords = [
      'this page', 'is page', 'current page', 'summarize', 'summary',
      'explain this', 'what does this', 'translate this', 'what is this',
      'read this', 'analyze this', 'yeh page', 'is website', 'page ka',
    ];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  return { build, needsPageContext };

})();
