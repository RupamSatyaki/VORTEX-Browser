// Page Summarizer — AI-powered summary drawer
const Summarizer = (() => {
  let _visible = false;
  let _loading = false;

  // ── Extractive summarizer (offline fallback) ───────────────────────────────
  function _extractiveSummary(text, maxSentences = 5) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (!sentences.length) return [text.slice(0, 400)];

    // Score by word frequency
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const scored = sentences.map(s => {
      const sw = s.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const score = sw.reduce((sum, w) => sum + (freq[w] || 0), 0) / (sw.length || 1);
      return { s: s.trim(), score };
    });

    // Pick top sentences, preserve order
    const top = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .map(x => x.s);

    // Re-sort by original position
    return scored.filter(x => top.includes(x.s)).map(x => x.s);
  }

  // ── HuggingFace free inference API ────────────────────────────────────────
  async function _huggingFaceSummary(text, apiKey) {
    const truncated = text.slice(0, 1800); // model input limit
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;

    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: truncated,
          parameters: { max_length: 180, min_length: 60, do_sample: false },
        }),
      }
    );
    if (!res.ok) throw new Error('HuggingFace API error: ' + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const summary = (data[0] && data[0].summary_text) || '';
    // Split into bullet sentences
    return summary.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || [summary];
  }

  // ── Ollama local API ───────────────────────────────────────────────────────
  async function _ollamaSummary(text) {
    const truncated = text.slice(0, 3000);
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `Summarize the following webpage content in 4-5 clear bullet points:\n\n${truncated}`,
        stream: false,
      }),
    });
    if (!res.ok) throw new Error('Ollama not running. Start with: ollama serve');
    const data = await res.json();
    const resp = data.response || '';
    // Parse bullet lines
    const lines = resp.split('\n').map(l => l.replace(/^[-•*\d.]+\s*/, '').trim()).filter(l => l.length > 10);
    return lines.slice(0, 6);
  }

  // ── OpenAI API ─────────────────────────────────────────────────────────────
  async function _openAISummary(text, apiKey) {
    if (!apiKey) throw new Error('OpenAI API key required');
    const truncated = text.slice(0, 4000);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Summarize the webpage content in 4-5 concise bullet points.' },
          { role: 'user', content: truncated },
        ],
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error('OpenAI API error: ' + res.status);
    const data = await res.json();
    const resp = data.choices?.[0]?.message?.content || '';
    const lines = resp.split('\n').map(l => l.replace(/^[-•*\d.]+\s*/, '').trim()).filter(l => l.length > 10);
    return lines.slice(0, 6);
  }

  // ── Get page text via active webview ──────────────────────────────────────
  async function _getPageText() {
    const wv = document.querySelector('.vortex-wv.active');
    if (!wv) throw new Error('No active page');
    const result = await wv.executeJavaScript(`
      (function() {
        // Try to get article/main content first
        var main = document.querySelector('article, main, [role="main"], .post-content, .article-body, .entry-content');
        var el = main || document.body;
        // Remove scripts, styles, nav, footer, ads
        var clone = el.cloneNode(true);
        clone.querySelectorAll('script,style,nav,footer,header,aside,[class*="ad"],[id*="ad"],[class*="menu"],[class*="sidebar"]').forEach(e => e.remove());
        var text = (clone.innerText || clone.textContent || '').replace(/\\s+/g, ' ').trim();
        return { text: text.slice(0, 6000), title: document.title, url: location.href };
      })()
    `);
    return result;
  }

  // ── Render bullets ─────────────────────────────────────────────────────────
  function _renderBullets(bullets) {
    const content = document.getElementById('sum-content');
    content.className = '';
    content.innerHTML = bullets.map(b =>
      `<div class="sum-bullet">${b}</div>`
    ).join('');
  }

  function _renderLoading() {
    const content = document.getElementById('sum-content');
    content.className = 'loading';
    content.innerHTML = `<div class="sum-spinner"></div><span>Summarizing...</span>`;
  }

  function _renderError(msg) {
    const content = document.getElementById('sum-content');
    content.className = '';
    content.innerHTML = `<div class="sum-error">⚠ ${msg}</div>`;
  }

  // ── Main summarize flow ────────────────────────────────────────────────────
  async function summarize() {
    if (_loading) return;
    _loading = true;
    _renderLoading();

    const provider = document.getElementById('sum-provider')?.value || 'extractive';
    const apiKey   = document.getElementById('sum-api-key')?.value?.trim() || '';

    try {
      const { text, title, url } = await _getPageText();

      // Update page info
      const info = document.getElementById('sum-page-info');
      if (info) info.textContent = title || url;

      if (!text || text.length < 100) {
        _renderError('Not enough text content on this page.');
        return;
      }

      let bullets = [];

      if (provider === 'extractive') {
        bullets = _extractiveSummary(text);
      } else if (provider === 'huggingface') {
        bullets = await _huggingFaceSummary(text, apiKey);
      } else if (provider === 'ollama') {
        bullets = await _ollamaSummary(text);
      } else if (provider === 'openai') {
        bullets = await _openAISummary(text, apiKey);
      }

      if (!bullets.length) {
        _renderError('Could not generate summary. Try a different provider.');
        return;
      }

      _renderBullets(bullets);
    } catch (err) {
      _renderError(err.message || 'Summary failed.');
    } finally {
      _loading = false;
    }
  }

  // ── Open / Close ───────────────────────────────────────────────────────────
  function open() {
    const drawer = document.getElementById('summarizer-drawer');
    const btn    = document.getElementById('nav-summarize');
    if (!drawer) return;

    if (_visible) { close(); return; }

    _visible = true;
    drawer.classList.add('visible');
    if (btn) btn.classList.add('active');

    // Auto-summarize on open
    summarize();
  }

  function close() {
    const drawer = document.getElementById('summarizer-drawer');
    const btn    = document.getElementById('nav-summarize');
    _visible = false;
    if (drawer) drawer.classList.remove('visible');
    if (btn) btn.classList.remove('active');
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sum-close')?.addEventListener('click', close);
    document.getElementById('sum-refresh')?.addEventListener('click', summarize);
    document.getElementById('sum-copy')?.addEventListener('click', () => {
      const content = document.getElementById('sum-content');
      if (!content) return;
      const text = [...content.querySelectorAll('.sum-bullet')]
        .map(el => '• ' + el.textContent.trim()).join('\n');
      if (text) navigator.clipboard.writeText(text);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && _visible) close();
    });

    // Re-summarize when tab changes
    document.addEventListener('vortex:tab-changed', () => {
      if (_visible) {
        document.getElementById('sum-content').innerHTML = '';
        summarize();
      }
    });
  });

  return { open, close, summarize };
})();
