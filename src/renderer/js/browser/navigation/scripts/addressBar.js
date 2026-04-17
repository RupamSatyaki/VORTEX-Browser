/**
 * browser/navigation/scripts/addressBar.js
 * URL bar focus/blur/input/keydown handlers + clean display URL logic.
 */

const NavAddressBar = (() => {

  let _firstClick = true;
  let _searchEngine = 'google';

  const SEARCH_ENGINES = {
    google:     'https://www.google.com/search?q=',
    bing:       'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    brave:      'https://search.brave.com/search?q=',
    ecosia:     'https://www.ecosia.org/search?q=',
  };

  function setSearchEngine(engine) {
    _searchEngine = engine;
  }

  function bind() {
    const urlBar = document.getElementById('url-bar');
    if (!urlBar) return;

    urlBar.addEventListener('mousedown', () => {
      _firstClick = document.activeElement !== urlBar;
    });

    urlBar.addEventListener('focus', () => {
      const fullUrl = urlBar.dataset.fullUrl || urlBar.value;
      if (fullUrl && fullUrl !== urlBar.value) urlBar.value = fullUrl;
      if (_firstClick) {
        setTimeout(() => urlBar.select(), 0);
        _firstClick = false;
      }
    });

    urlBar.addEventListener('blur', () => {
      _firstClick = true;
      Omnibox.onBlur();
      const fullUrl = urlBar.dataset.fullUrl;
      if (fullUrl) urlBar.value = cleanDisplayUrl(fullUrl);
    });

    urlBar.addEventListener('keydown', (e) => {
      if (Omnibox.onKeydown(e)) return;
      if (e.key === 'Enter') navigate();
      if (e.key === 'Escape') urlBar.blur();
    });

    urlBar.addEventListener('input', (e) => {
      Prefetch.onInput(e.target.value);
      Omnibox.onInput(e.target.value);
      NavSecurityIcon.update('');
    });
  }

  function navigate() {
    const bar = document.getElementById('url-bar');
    if (!bar) return;
    const stored    = bar.dataset.fullUrl || '';
    const displayed = cleanDisplayUrl(stored);
    let url = (stored && bar.value.trim() === displayed) ? stored : bar.value.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url) && !url.startsWith('vortex://') && !url.startsWith('file://')) {
      const base = SEARCH_ENGINES[_searchEngine] || SEARCH_ENGINES.google;
      if (url.includes(' ') || (!url.includes('.') && !_isLocalHostname(url))) {
        url = base + encodeURIComponent(url);
      } else if (_isLocalHostname(url)) {
        url = 'http://' + url;
      } else {
        url = 'https://' + url;
      }
    }
    WebView.loadURL(url);
    bar.blur();
  }

  function setURL(url) {
    const bar = document.getElementById('url-bar');
    if (bar) {
      bar.dataset.fullUrl = url || '';
      bar.value = cleanDisplayUrl(url || '');
    }
  }

  function cleanDisplayUrl(url) {
    if (!url) return '';
    if (url.startsWith('vortex://') || url.startsWith('about:')) return url;
    try {
      const u = new URL(url);
      const host  = u.hostname.replace(/^www\./, '');
      const rest  = u.pathname === '/' ? '' : u.pathname;
      return host + rest + (u.search || '') + (u.hash || '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '');
    }
  }

  function _isLocalHostname(host) {
    const h = host.split(':')[0].toLowerCase();
    return h === 'localhost'
      || /^127\./.test(h) || /^192\.168\./.test(h) || /^10\./.test(h)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || /^0\.0\.0\.0/.test(h)
      || /^\d+\.\d+\.\d+\.\d+$/.test(h)
      || /\.(local|lan|internal|home|corp|intranet|localdomain)$/.test(h);
  }

  return { bind, navigate, setURL, cleanDisplayUrl, setSearchEngine };

})();
