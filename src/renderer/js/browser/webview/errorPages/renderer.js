/**
 * errorPages/renderer.js
 * Injects the error page HTML into a webview using executeJavaScript.
 * Called by WVErrorPage.show() — kept separate so index.js stays clean.
 */

const WVErrorRenderer = {

  /**
   * Write a full HTML document into the webview.
   * Uses document.open/write/close which replaces the current page entirely.
   */
  inject(wv, html) {
    return wv.executeJavaScript(`
      (function() {
        document.open('text/html', 'replace');
        document.write(${JSON.stringify(html)});
        document.close();
      })();
    `).catch(() => {});
  },

};
