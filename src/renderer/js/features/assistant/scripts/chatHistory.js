/**
 * features/assistant/scripts/chatHistory.js
 * Messages array management + render + scroll.
 */

const ChatHistory = (() => {

  let _messages = []; // { role, content, thinking? }
  let _chatArea = null;

  function init(chatAreaEl) {
    _chatArea = chatAreaEl;
  }

  function getMessages() {
    return _messages.map(m => ({ role: m.role, content: m.content }));
  }

  function addUserMessage(text) {
    _messages.push({ role: 'user', content: text });
    const el = ChatBubble.renderUser(text);
    _appendAndScroll(el);
    _hideWelcome();
    return el;
  }

  function addAssistantMessage(streaming = false) {
    const el = ChatBubble.renderAssistant('', streaming);
    _messages.push({ role: 'assistant', content: '', _el: el });
    _appendAndScroll(el);
    _hideWelcome();
    return el;
  }

  function addThinkingBlock() {
    const block = ThinkingBlock.create();
    _appendAndScroll(block);
    return block;
  }

  function addToolCard(toolName, args) {
    const card = ToolResultCard.create(toolName, args);
    _appendAndScroll(card);
    return card;
  }

  function addErrorBanner(msg) {
    const el = document.createElement('div');
    el.className = 'ast-banner error';
    el.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
      <span>${msg}</span>
    `;
    _appendAndScroll(el);
    return el;
  }

  function updateLastAssistantContent(text) {
    const last = _messages[_messages.length - 1];
    if (last && last.role === 'assistant') {
      last.content = text;
    }
  }

  function clear() {
    _messages = [];
    if (!_chatArea) return;
    // Remove all children except welcome screen
    const welcome = _chatArea.querySelector('#ast-welcome');
    _chatArea.innerHTML = '';
    if (welcome) {
      welcome.style.display = 'flex';
      _chatArea.appendChild(welcome);
    }
  }

  function _appendAndScroll(el) {
    if (!_chatArea) return;
    _chatArea.appendChild(el);
    requestAnimationFrame(() => {
      _chatArea.scrollTop = _chatArea.scrollHeight;
    });
  }

  function _hideWelcome() {
    const welcome = _chatArea?.querySelector('#ast-welcome');
    if (welcome) welcome.style.display = 'none';
  }

  function scrollToBottom() {
    if (_chatArea) _chatArea.scrollTop = _chatArea.scrollHeight;
  }

  return {
    init,
    getMessages,
    addUserMessage,
    addAssistantMessage,
    addThinkingBlock,
    addToolCard,
    addErrorBanner,
    updateLastAssistantContent,
    clear,
    scrollToBottom,
  };

})();
