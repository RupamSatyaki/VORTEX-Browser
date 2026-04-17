/**
 * browser/webview/scripts/find.js
 * Find in page — bar open/close, search, navigation.
 */

const WVFind = (() => {

  let _active = false;

  function open(webviews, activeId) {
    const bar   = document.getElementById('find-bar');
    const input = document.getElementById('find-input');
    if (!bar || !input) return;
    if (!_active) {
      _active = true;
      bar.classList.add('visible');
      input.value = '';
      document.getElementById('find-count').textContent = '';
      input.classList.remove('no-match');
    }
    input.focus();
    input.select();
  }

  function close(webviews, activeId) {
    const bar = document.getElementById('find-bar');
    if (!bar) return;
    _active = false;
    bar.classList.remove('visible');
    const wv = webviews[activeId];
    if (wv) { try { wv.stopFindInPage('clearSelection'); } catch (_) {} }
    document.getElementById('find-count').textContent = '';
    document.getElementById('find-input')?.classList.remove('no-match');
  }

  function _doFind(forward, webviews, activeId) {
    const wv    = webviews[activeId];
    const input = document.getElementById('find-input');
    if (!wv || !input) return;
    const query = input.value.trim();
    if (!query) { document.getElementById('find-count').textContent = ''; return; }
    wv.findInPage(query, { forward, findNext: true, matchCase: false });
  }

  function bindBar(webviewsGetter, activeIdGetter) {
    document.addEventListener('DOMContentLoaded', () => {
      const input = document.getElementById('find-input');
      if (!input) return;

      input.addEventListener('input', () => {
        const wv = webviewsGetter()[activeIdGetter()];
        const q  = input.value.trim();
        input.classList.remove('no-match');
        if (!q) {
          document.getElementById('find-count').textContent = '';
          if (wv) { try { wv.stopFindInPage('clearSelection'); } catch(_){} }
          return;
        }
        if (wv) wv.findInPage(q, { forward: true, findNext: false, matchCase: false });
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  { e.preventDefault(); _doFind(!e.shiftKey, webviewsGetter(), activeIdGetter()); }
        if (e.key === 'Escape') { e.preventDefault(); close(webviewsGetter(), activeIdGetter()); }
      });

      document.getElementById('find-next')?.addEventListener('click',  () => _doFind(true,  webviewsGetter(), activeIdGetter()));
      document.getElementById('find-prev')?.addEventListener('click',  () => _doFind(false, webviewsGetter(), activeIdGetter()));
      document.getElementById('find-close')?.addEventListener('click', () => close(webviewsGetter(), activeIdGetter()));
    });
  }

  function attachListener(wv) {
    wv.addEventListener('found-in-page', (e) => {
      const count = document.getElementById('find-count');
      const input = document.getElementById('find-input');
      if (!count) return;
      const { activeMatchOrdinal, matches } = e.result;
      if (matches === 0) {
        count.textContent = 'No results';
        input?.classList.add('no-match');
      } else {
        count.textContent = `${activeMatchOrdinal}/${matches}`;
        input?.classList.remove('no-match');
      }
    });
  }

  return { open, close, bindBar, attachListener };

})();
