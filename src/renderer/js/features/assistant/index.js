/**
 * features/assistant/index.js
 * Entry point — panel toggle, webview resize, chat orchestration.
 */

const Assistant = (() => {

  let _open        = false;
  let _streaming   = false;
  let _pageContext = null;

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    _injectPanel();
    _bindEvents();

    // Wait for panel DOM to be ready before init
    const _waitAndInit = () => {
      const selectEl = document.getElementById('ast-model-select');
      const dotEl    = document.getElementById('ast-ollama-dot');
      const chatArea = document.getElementById('ast-chat-area');

      if (!selectEl || !dotEl || !chatArea) {
        // Retry until elements exist
        setTimeout(_waitAndInit, 100);
        return;
      }

      ModelManager.init(selectEl, dotEl);
      ChatHistory.init(chatArea);
      ModelManager.refresh();
    };

    _waitAndInit();
  }

  function _injectPanel() {
    if (document.getElementById('assistant-panel')) return;

    // Wrap webview-container + panel in a flex row wrapper
    const container = document.getElementById('webview-container');
    if (!container) return;

    // Create wrapper that holds webview + panel side by side
    const wrapper = document.createElement('div');
    wrapper.id = 'ast-wrapper';
    wrapper.style.cssText = 'display:flex;flex-direction:row;flex:1;min-height:0;overflow:hidden;margin:5px;border-radius:12px;';

    // Move webview-container into wrapper
    container.parentNode.insertBefore(wrapper, container);
    container.style.margin = '0';
    container.style.borderRadius = '12px 0 0 12px';
    container.style.flex = '1';
    container.style.minWidth = '0';
    wrapper.appendChild(container);

    // Inject panel after webview-container (right side)
    wrapper.insertAdjacentHTML('beforeend', AssistantPanel.render());
  }

  // ── Toggle ────────────────────────────────────────────────────────────────
  function toggle() {
    _open ? close() : open();
  }

  function open() {
    _open = true;
    const panel     = document.getElementById('assistant-panel');
    const container = document.getElementById('webview-container');
    if (panel)     panel.classList.add('open');
    if (container) container.style.borderRadius = '12px 0 0 12px';
    setTimeout(() => document.getElementById('ast-textarea')?.focus(), 300);
  }

  function close() {
    _open = false;
    const panel     = document.getElementById('assistant-panel');
    const container = document.getElementById('webview-container');
    if (panel)     panel.classList.remove('open');
    if (container) container.style.borderRadius = '12px';
  }

  // ── Events ────────────────────────────────────────────────────────────────
  function _bindEvents() {
    // Toolbar assistant button
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-assistant');
      if (btn) toggle();
    });

    // Close button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ast-close-btn')) close();
    });

    // Model refresh
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ast-model-refresh')) {
        const btn = document.getElementById('ast-model-refresh');
        btn?.classList.add('spinning');
        ModelManager.refresh().finally(() => btn?.classList.remove('spinning'));
      }
    });

    // Send button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ast-send-btn')) {
        if (_streaming) {
          OllamaClient.abort();
        } else {
          _sendMessage();
        }
      }
    });

    // Textarea — Enter to send, Shift+Enter newline
    document.addEventListener('keydown', (e) => {
      const ta = document.getElementById('ast-textarea');
      if (e.target !== ta) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!_streaming) _sendMessage();
      }
    });

    // Auto-resize textarea
    document.addEventListener('input', (e) => {
      if (e.target.id !== 'ast-textarea') return;
      const ta = e.target;
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    });

    // Clear chat
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ast-clear-btn')) {
        ChatHistory.clear();
        _pageContext = null;
        _updatePageBadge();
      }
    });

    // Read page button
    document.addEventListener('click', async (e) => {
      if (!e.target.closest('#ast-read-page-btn')) return;
      try {
        const data = await PageReader.readCurrentPage();
        _pageContext = data;
        _updatePageBadge();
      } catch (err) {
        ChatHistory.addErrorBanner(`Could not read page: ${err.message}`);
      }
    });

    // Remove page context badge
    document.addEventListener('click', (e) => {
      if (e.target.closest('#ast-page-badge-close')) {
        _pageContext = null;
        _updatePageBadge();
      }
    });

    // Suggestion chips
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.ast-chip');
      if (!chip) return;
      const prompt = chip.dataset.prompt;
      if (prompt) {
        const ta = document.getElementById('ast-textarea');
        if (ta) { ta.value = prompt; ta.focus(); }
      }
    });

    // Keyboard shortcut Ctrl+Shift+A
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggle();
      }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _open) {
        const panel = document.getElementById('assistant-panel');
        if (panel?.contains(document.activeElement)) close();
      }
    });
  }

  // ── Send Message ──────────────────────────────────────────────────────────
  async function _sendMessage() {
    const ta    = document.getElementById('ast-textarea');
    const text  = ta?.value.trim();
    if (!text) return;

    const model = ModelManager.getSelected();
    if (!model) {
      ChatHistory.addErrorBanner('No model selected. Start Ollama and refresh models.');
      return;
    }

    // Clear input
    ta.value = '';
    ta.style.height = 'auto';

    // Auto-detect page context need
    if (!_pageContext && ContextBuilder.needsPageContext(text)) {
      try {
        _pageContext = await PageReader.readCurrentPage();
        _updatePageBadge();
      } catch {}
    }

    // Add user message
    ChatHistory.addUserMessage(text);

    // Build context
    const pageCtxStr = _pageContext
      ? PageReader.formatForContext(_pageContext)
      : null;

    const messages = ContextBuilder.build({
      userMessage:  text,
      history:      ChatHistory.getMessages().slice(0, -1), // exclude just-added user msg
      pageContext:  pageCtxStr,
      toolSchemas:  MCPRegistry.getSchemas(),
    });

    // Start streaming
    _setStreaming(true);

    let thinkingBlock  = null;
    let assistantBubble = ChatHistory.addAssistantMessage(true);
    let contentText    = '';

    await OllamaClient.chat({
      model,
      messages,

      onThinkToken: (token) => {
        if (!thinkingBlock) {
          thinkingBlock = ChatHistory.addThinkingBlock();
          // Insert thinking block BEFORE assistant bubble
          const chatArea = document.getElementById('ast-chat-area');
          chatArea?.insertBefore(thinkingBlock, assistantBubble);
        }
        thinkingBlock.appendToken(token);
        ChatHistory.scrollToBottom();
      },

      onThinkDone: () => {
        thinkingBlock?.finalize();
      },

      onToken: (token) => {
        contentText += token;
        // Don't show <tool>...</tool> tags in chat bubble
        const cleanToken = token.replace(/<tool>[\s\S]*?<\/tool>/g, '').replace(/<tool>[\s\S]*/g, '');
        if (cleanToken) assistantBubble.appendToken(cleanToken);
        ChatHistory.scrollToBottom();
      },

      onToolCall: async (toolName, args) => {
        const card = ChatHistory.addToolCard(toolName, args);
        const result = await MCPExecutor.execute(toolName, args);
        if (result.success) {
          card.setSuccess(result.result);
          // Inject tool result into content for follow-up
          const resultStr = MCPExecutor.formatResult(result);
          contentText += `\n[Tool ${toolName} result: ${resultStr}]\n`;
        } else {
          card.setError(result.error);
          contentText += `\n[Tool ${toolName} failed: ${result.error}]\n`;
        }
        ChatHistory.scrollToBottom();
      },

      onDone: async () => {
        // Clean tool tags from displayed content
        const cleanContent = contentText
          .replace(/<tool>[\s\S]*?<\/tool>/g, '')
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/\{[\s\S]*?"tool"\s*:\s*"[^"]+?"[\s\S]*?\}/g, '')
          .trim();
        assistantBubble.finalize(cleanContent);
        ChatHistory.updateLastAssistantContent(cleanContent);

        // If tools were called, generate a follow-up summary response
        if (contentText.includes('[Tool ') && cleanContent.length < 20) {
          await _generateToolFollowUp(text, contentText, model);
        }

        _setStreaming(false);
        if (_pageContext) {
          _pageContext = null;
          _updatePageBadge();
        }
      },

      onError: (err) => {
        assistantBubble.finalize();
        ChatHistory.addErrorBanner(
          err.includes('Ollama') || err.includes('fetch')
            ? `Ollama not reachable. Run: <code>ollama serve</code>`
            : err
        );
        _setStreaming(false);
      },
    });
  }

  // ── Tool Follow-up ────────────────────────────────────────────────────────
  async function _generateToolFollowUp(originalQuery, toolResults, model) {
    const followUpBubble = ChatHistory.addAssistantMessage(true);
    let followText = '';

    const followMessages = [
      { role: 'system', content: 'You are Vortex Browser Assistant. Based on the tool results below, give a brief helpful response to the user. Be concise. Do NOT call any more tools.' },
      { role: 'user',   content: `Original request: "${originalQuery}"\n\nTool results:${toolResults}\n\nBriefly confirm what was done or summarize the results.` },
    ];

    await OllamaClient.chat({
      model,
      messages: followMessages,
      onToken: (token) => {
        followText += token;
        followUpBubble.appendToken(token);
        ChatHistory.scrollToBottom();
      },
      onDone: () => {
        followUpBubble.finalize(followText.trim());
        ChatHistory.updateLastAssistantContent(followText.trim());
      },
      onError: () => {
        followUpBubble.finalize('Done.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _setStreaming(val) {
    _streaming = val;
    const sendBtn = document.getElementById('ast-send-btn');
    const ta      = document.getElementById('ast-textarea');
    if (!sendBtn) return;

    if (val) {
      sendBtn.classList.add('stop');
      sendBtn.title = 'Stop generation';
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
      </svg>`;
      if (ta) ta.disabled = true;
    } else {
      sendBtn.classList.remove('stop');
      sendBtn.title = 'Send (Enter)';
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>`;
      if (ta) { ta.disabled = false; ta.focus(); }
    }
  }

  function _updatePageBadge() {
    const badge     = document.getElementById('ast-page-badge');
    const badgeTitle = document.getElementById('ast-page-badge-title');
    if (!badge) return;
    if (_pageContext) {
      badge.classList.add('visible');
      if (badgeTitle) badgeTitle.textContent = _pageContext.title || 'Current page attached';
    } else {
      badge.classList.remove('visible');
    }
  }

  return { init, toggle, open, close };

})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Assistant.init());
} else {
  Assistant.init();
}
