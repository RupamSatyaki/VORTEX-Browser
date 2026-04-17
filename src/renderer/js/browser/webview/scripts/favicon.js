/**
 * browser/webview/scripts/favicon.js
 * Favicon URL resolution + DOM extraction (works for HTTP sites).
 */

const WVFavicon = (() => {

  function getUrl(url) {
    try {
      const u = new URL(url);
      const { hostname, protocol } = u;
      if (protocol === 'http:' ||
          /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) ||
          /\.(local|lan|internal|home|corp|intranet)$/.test(hostname) ||
          /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return `${u.protocol}//${u.host}/favicon.ico`;
      }
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch (_) { return null; }
  }

  async function extract(wv, tabId, isIncognito) {
    try {
      const pageUrl = wv.src || '';
      if (!pageUrl || pageUrl.startsWith('vortex://') || pageUrl.startsWith('about:')) return;

      const base64 = await wv.executeJavaScript(`
        (function() {
          var selectors = ['link[rel="icon"]','link[rel="shortcut icon"]','link[rel="apple-touch-icon"]','link[rel="apple-touch-icon-precomposed"]'];
          var faviconUrl = null;
          for (var i = 0; i < selectors.length; i++) {
            var el = document.querySelector(selectors[i]);
            if (el && el.href) { faviconUrl = el.href; break; }
          }
          if (!faviconUrl) faviconUrl = location.protocol + '//' + location.host + '/favicon.ico';
          return fetch(faviconUrl, { cache: 'force-cache' })
            .then(function(r) { if (!r.ok) throw new Error('not ok'); return r.blob(); })
            .then(function(blob) {
              return new Promise(function(resolve) {
                var reader = new FileReader();
                reader.onload = function() { resolve(reader.result); };
                reader.onerror = function() { resolve(null); };
                reader.readAsDataURL(blob);
              });
            })
            .catch(function() { return null; });
        })()
      `, true);

      if (base64 && typeof base64 === 'string' && base64.startsWith('data:')) {
        Tabs.updateTab(tabId, { favicon: base64 });
        if (!isIncognito && window.TabHistory) TabHistory.onFaviconUpdate(tabId, base64);
        if (typeof FaviconCache !== 'undefined') FaviconCache.saveBase64(pageUrl, base64).catch(() => {});
      }
    } catch {
      if (typeof FaviconCache !== 'undefined') {
        const cached = await FaviconCache.getFavicon(wv.src || '').catch(() => null);
        if (cached) Tabs.updateTab(tabId, { favicon: cached });
      }
    }
  }

  return { getUrl, extract };

})();
