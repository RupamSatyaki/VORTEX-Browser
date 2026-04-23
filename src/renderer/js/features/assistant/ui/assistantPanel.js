/**
 * features/assistant/ui/assistantPanel.js
 * Main panel HTML skeleton — pure HTML, no logic.
 */

const AssistantPanel = (() => {

  function render() {
    return `
      <div id="assistant-panel">

        <!-- Header -->
        <div id="ast-header">
          <div id="ast-header-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="1" fill="var(--accent)" stroke="none"/>
            </svg>
          </div>
          <div style="flex:1;min-width:0;">
            <div id="ast-header-title">Vortex Assistant</div>
            <div id="ast-header-subtitle">Powered by Ollama · Local AI</div>
          </div>
          <button id="ast-close-btn" title="Close Assistant (Ctrl+Shift+A)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Model Bar -->
        <div id="ast-model-bar">
          <span id="ast-model-label">Model</span>
          <select id="ast-model-select">
            <option value="">Loading models...</option>
          </select>
          <button id="ast-model-refresh" title="Refresh models">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2-8.83"/>
            </svg>
          </button>
          <div id="ast-ollama-status" title="Ollama connection status">
            <div id="ast-ollama-dot" class="loading"></div>
          </div>
        </div>

        <!-- Chat Area -->
        <div id="ast-chat-area">
          <!-- Welcome screen shown when no messages -->
          <div id="ast-welcome">
            <div id="ast-welcome-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--accent)" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1" fill="var(--accent)" stroke="none"/>
                <circle cx="12" cy="10" r="1" fill="var(--accent)" stroke="none"/>
                <circle cx="15" cy="10" r="1" fill="var(--accent)" stroke="none"/>
              </svg>
            </div>
            <h3>Ask me anything</h3>
            <p>I can browse, summarize pages,<br>open tabs, and control your browser.</p>
            <div class="ast-suggestion-chips">
              <div class="ast-chip" data-prompt="Summarize this page">📄 Summarize page</div>
              <div class="ast-chip" data-prompt="Open a new tab with Google">🔗 New tab</div>
              <div class="ast-chip" data-prompt="What tabs do I have open?">📑 List tabs</div>
              <div class="ast-chip" data-prompt="Search YouTube for lo-fi music">🔍 Search web</div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div id="ast-input-area">
          <!-- Page context badge (shown when page is attached) -->
          <div id="ast-page-badge">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span id="ast-page-badge-title">Current page attached</span>
            <button id="ast-page-badge-close" title="Remove page context">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Input row -->
          <div id="ast-input-row">
            <textarea
              id="ast-textarea"
              placeholder="Ask anything... (Enter to send)"
              rows="1"
              spellcheck="false"
            ></textarea>
            <div id="ast-input-actions">
              <button class="ast-input-btn" id="ast-read-page-btn" title="Attach current page content">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </button>
              <button id="ast-send-btn" title="Send (Enter)">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Hints row -->
          <div id="ast-input-hints">
            <span id="ast-input-hint-left">Enter ↵ send · Shift+Enter newline</span>
            <button id="ast-clear-btn" title="Clear chat">Clear</button>
          </div>
        </div>

      </div>
    `;
  }

  return { render };

})();
