/**
 * features/assistant/scripts/ollamaClient.js
 * Ollama API client — streaming chat + model list.
 */

const OllamaClient = (() => {

  let _baseUrl = 'http://localhost:11434';
  let _abortController = null;

  function setBaseUrl(url) {
    _baseUrl = url.replace(/\/$/, '');
  }

  // AbortSignal.timeout not supported in all Electron versions — use manual timeout
  function _timeoutSignal(ms) {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), ms);
    return ctrl.signal;
  }

  // Check if Ollama is running
  async function ping() {
    try {
      const res = await fetch(`${_baseUrl}/api/tags`, {
        signal: _timeoutSignal(3000),
        mode: 'cors',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Get list of local models
  async function getModels() {
    const res = await fetch(`${_baseUrl}/api/tags`, {
      signal: _timeoutSignal(5000),
      mode: 'cors',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.models || []).map(m => ({
      name: m.name,
      size: m.size,
      modified: m.modified_at,
    }));
  }

  // Streaming chat
  // onToken(token) — called for each content token
  // onThinkToken(token) — called for each thinking token
  // onThinkDone() — called when </think> detected
  // onToolCall(name, args) — called when tool JSON detected
  // onDone() — called when stream ends
  // onError(err) — called on error
  async function chat({ model, messages, onToken, onThinkToken, onThinkDone, onToolCall, onDone, onError }) {
    try {
      _abortController = new AbortController();

      const res = await fetch(`${_baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: _abortController.signal,
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: { temperature: 0.7 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama error ${res.status}: ${errText}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      // Collect full response then parse — more reliable than char-by-char
      let fullContent = '';

      // Thinking state
      let inThink    = false;
      let thinkDone  = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          let parsed;
          try { parsed = JSON.parse(line); } catch { continue; }
          if (parsed.done) { _finalize(fullContent, onToken, onThinkToken, onThinkDone, onToolCall, onDone); return; }

          const token = parsed.message?.content || '';
          if (!token) continue;

          fullContent += token;

          // Stream thinking tokens live
          if (!thinkDone) {
            const thinkEnd = fullContent.indexOf('</think>');
            if (fullContent.startsWith('<think>')) {
              inThink = true;
              if (thinkEnd !== -1) {
                // Thinking complete
                const thinkText = fullContent.slice(7, thinkEnd);
                if (onThinkToken) onThinkToken(thinkText);
                if (onThinkDone) onThinkDone();
                thinkDone = true;
                inThink   = false;
              } else {
                // Still thinking — stream token
                if (onThinkToken) onThinkToken(token);
              }
              continue;
            }
          }

          // Stream content tokens (non-thinking, non-tool parts)
          if (!inThink) {
            // Don't stream tool call lines — they'll be processed at end
            if (!token.includes('<tool>')) {
              if (onToken) onToken(token);
            }
          }
        }
      }

      _finalize(fullContent, onToken, onThinkToken, onThinkDone, onToolCall, onDone);

    } catch (err) {
      if (err.name === 'AbortError') { if (onDone) onDone(); return; }
      if (onError) onError(err.message);
    } finally {
      _abortController = null;
    }
  }

  // Parse full response after streaming — extract tool calls
  function _finalize(fullContent, onToken, onThinkToken, onThinkDone, onToolCall, onDone) {
    // Format 1: <tool>{"tool":"name","args":{}}</tool>
    const tagRegex = /<tool>([\s\S]*?)<\/tool>/g;
    let match;
    let foundTool = false;
    while ((match = tagRegex.exec(fullContent)) !== null) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.tool && onToolCall) { onToolCall(parsed.tool, parsed.args || {}); foundTool = true; }
      } catch (e) { console.warn('[OllamaClient] tool tag parse fail:', match[1]); }
    }

    // Format 2: plain JSON {"tool":"name","args":{}} anywhere in response
    if (!foundTool) {
      const jsonRegex = /\{[\s\S]*?"tool"\s*:\s*"([^"]+)"[\s\S]*?\}/g;
      while ((match = jsonRegex.exec(fullContent)) !== null) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed.tool && onToolCall) { onToolCall(parsed.tool, parsed.args || {}); foundTool = true; }
        } catch {}
      }
    }

    if (onDone) onDone();
  }

  function abort() {
    if (_abortController) {
      _abortController.abort();
      _abortController = null;
    }
  }

  return { setBaseUrl, ping, getModels, chat, abort };

})();
