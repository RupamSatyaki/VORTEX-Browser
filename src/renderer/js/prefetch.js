// DNS Prefetch + Preconnect — speeds up page load by resolving DNS early
const Prefetch = (() => {
  let lastPrefetched = '';
  let debounceTimer = null;

  function getURL(input) {
    input = input.trim();
    if (!input) return null;
    try {
      if (/^https?:\/\//i.test(input)) return new URL(input).origin;
      if (input.includes('.') && !input.includes(' ')) return new URL('https://' + input).origin;
    } catch (_) {}
    return null;
  }

  function inject(origin) {
    if (!origin || origin === lastPrefetched) return;
    lastPrefetched = origin;

    // Remove old hints
    document.querySelectorAll('link[data-vortex-prefetch]').forEach(el => el.remove());

    // DNS prefetch — resolves hostname early
    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = origin;
    dns.dataset.vortexPrefetch = '1';
    document.head.appendChild(dns);

    // Preconnect — establishes TCP + TLS connection early
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = origin;
    pre.crossOrigin = 'anonymous';
    pre.dataset.vortexPrefetch = '1';
    document.head.appendChild(pre);
  }

  let _enabled = true;
  let _suggestionsEnabled = true;

  function setEnabled(val) { _enabled = val; }
  function setSuggestionsEnabled(val) { _suggestionsEnabled = val; }

  // Call this when user types in URL bar
  function onInput(value) {
    if (!_suggestionsEnabled) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const origin = getURL(value);
      if (origin) inject(origin);
    }, 200);
  }

  // Call this when a page finishes loading — prefetch links + inject speculative hover loader
  function prefetchPageLinks(wv) {
    if (!_enabled || !wv) return;

    // DNS prefetch for top origins on page
    wv.executeJavaScript(`
      (function() {
        const links = [...document.querySelectorAll('a[href]')]
          .map(a => { try { return new URL(a.href).origin; } catch(_) { return null; } })
          .filter(Boolean);
        return [...new Set(links)].slice(0, 10);
      })()
    `).then(origins => {
      origins.forEach(origin => {
        if (document.querySelector(`link[href="${origin}"][data-vortex-page]`)) return;
        const dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = origin;
        dns.dataset.vortexPage = '1';
        document.head.appendChild(dns);
      });
    }).catch(() => {});

    // Inject speculative hover preloader into the webview page itself
    wv.executeJavaScript(`
      (function() {
        if (window.__vortexSpeculative) return;
        window.__vortexSpeculative = true;

        let hoverTimer = null;
        let lastHref = '';
        const prerendered = new Set();

        document.addEventListener('mouseover', (e) => {
          const a = e.target.closest('a[href]');
          if (!a) return;
          const href = a.href;
          if (!href || href === lastHref || href.startsWith('javascript') || href.startsWith('#')) return;

          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => {
            lastHref = href;
            try {
              const origin = new URL(href).origin;

              // dns-prefetch
              if (!document.querySelector('link[rel="dns-prefetch"][href="' + origin + '"]')) {
                const d = document.createElement('link');
                d.rel = 'dns-prefetch';
                d.href = origin;
                document.head.appendChild(d);
              }

              // preconnect — TCP + TLS handshake
              if (!document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) {
                const c = document.createElement('link');
                c.rel = 'preconnect';
                c.href = origin;
                c.crossOrigin = 'anonymous';
                document.head.appendChild(c);
              }

              // prefetch the actual page (downloads into cache)
              if (!prerendered.has(href) && prerendered.size < 3) {
                prerendered.add(href);
                const p = document.createElement('link');
                p.rel = 'prefetch';
                p.href = href;
                p.as = 'document';
                document.head.appendChild(p);
              }
            } catch(_) {}
          }, 120);
        });

        document.addEventListener('mouseout', (e) => {
          const a = e.target.closest('a[href]');
          if (a) clearTimeout(hoverTimer);
        });
      })();
    `).catch(() => {});
  }

  return { onInput, prefetchPageLinks, setEnabled, setSuggestionsEnabled };
})();
