/**
 * features/assistant/scripts/pageReader.js
 * Extract readable text from current active webview.
 */

const PageReader = (() => {

  const MAX_CHARS = 8000;

  async function readCurrentPage() {
    try {
      // Get active webview
      const wv = document.querySelector('webview.vortex-wv.active');
      if (!wv) throw new Error('No active page');

      const url   = wv.src || wv.getURL?.() || '';
      const title = await wv.executeJavaScript('document.title').catch(() => '');

      // Extract clean text
      const text = await wv.executeJavaScript(`
        (function() {
          // Clone to avoid modifying live DOM
          var clone = document.body.cloneNode(true);
          // Remove noise elements
          ['script','style','nav','footer','header','noscript',
           'iframe','svg','aside','[role="banner"]','[role="navigation"]',
           '.ad','#ad','.advertisement','#cookie-banner'].forEach(function(sel) {
            try { clone.querySelectorAll(sel).forEach(function(el){ el.remove(); }); } catch(e){}
          });
          var text = clone.innerText || clone.textContent || '';
          // Clean up whitespace
          text = text.replace(/\\n{3,}/g, '\\n\\n').replace(/[ \\t]{2,}/g, ' ').trim();
          return text.slice(0, ${MAX_CHARS});
        })()
      `).catch(() => '');

      // Get selected text
      const selectedText = await wv.executeJavaScript(
        'window.getSelection ? window.getSelection().toString() : ""'
      ).catch(() => '');

      return { url, title, text, selectedText: selectedText.trim() };

    } catch (err) {
      throw new Error(`Could not read page: ${err.message}`);
    }
  }

  function formatForContext({ url, title, text, selectedText }) {
    let ctx = `Current Page:\nTitle: ${title}\nURL: ${url}\n\n`;
    if (selectedText) {
      ctx += `Selected Text:\n${selectedText}\n\n`;
    }
    ctx += `Page Content:\n${text}`;
    return ctx;
  }

  return { readCurrentPage, formatForContext };

})();
