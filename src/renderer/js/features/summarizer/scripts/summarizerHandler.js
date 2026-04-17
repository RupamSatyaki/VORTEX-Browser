/**
 * features/summarizer/scripts/summarizerHandler.js
 * Summarize flow — get page text, call provider, render result.
 * Also binds copy/refresh/close button events.
 */

const SummarizerHandler = (() => {

  let _loading = false;

  // ── Get page text from active webview ──────────────────────────────────────
  async function _getPageText() {
    const wv = document.querySelector('.vortex-wv.active');
    if (!wv) throw new Error('No active page');
    return wv.executeJavaScript(`
      (function() {
        var main = document.querySelector('article,main,[role="main"],.post-content,.article-body,.entry-content');
        var el   = main || document.body;
        var clone = el.cloneNode(true);
        clone.querySelectorAll('script,style,nav,footer,header,aside,[class*="ad"],[id*="ad"],[class*="menu"],[class*="sidebar"]')
          .forEach(e => e.remove());
        var text = (clone.innerText || clone.textContent || '').replace(/\\s+/g, ' ').trim();
        return { text: text.slice(0, 6000), title: document.title, url: location.href };
      })()
    `);
  }

  // ── Main summarize flow ────────────────────────────────────────────────────
  async function summarize() {
    if (_loading) return;
    _loading = true;
    SummarizerUI.renderLoading();

    const provider = SummarizerUI.getProvider();
    const apiKey   = SummarizerUI.getApiKey();

    try {
      const { text, title, url } = await _getPageText();
      SummarizerUI.setPageInfo(title, url);

      if (!text || text.length < 100) {
        SummarizerUI.renderError('Not enough text content on this page.');
        return;
      }

      let bullets = [];

      switch (provider) {
        case 'extractive':  bullets = SummarizerExtractive.summarize(text); break;
        case 'huggingface': bullets = await SummarizerHuggingFace.summarize(text, apiKey); break;
        case 'ollama':      bullets = await SummarizerOllama.summarize(text); break;
        case 'openai':      bullets = await SummarizerOpenAI.summarize(text, apiKey); break;
        default:            bullets = SummarizerExtractive.summarize(text);
      }

      if (!bullets.length) {
        SummarizerUI.renderError('Could not generate summary. Try a different provider.');
        return;
      }

      SummarizerUI.renderBullets(bullets);
    } catch (err) {
      SummarizerUI.renderError(err.message || 'Summary failed.');
    } finally {
      _loading = false;
    }
  }

  // ── Bind drawer buttons ────────────────────────────────────────────────────
  function bindButtons(onClose) {
    document.getElementById('sum-close')?.addEventListener('click', onClose);

    document.getElementById('sum-refresh')?.addEventListener('click', summarize);

    document.getElementById('sum-copy')?.addEventListener('click', () => {
      const text = SummarizerUI.getBulletText();
      if (text) navigator.clipboard.writeText(text);
    });
  }

  return { summarize, bindButtons };

})();
