/**
 * browser/webview/scripts/listeners.js
 * _attachRegularListeners() + _attachVortexListeners() — all webview event bindings.
 */

const WVListeners = (() => {

  const SCROLLBAR_CSS = `
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a1a1a; }
    ::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #00c8b4; }
  `;

  function attachVortex(wv, tabId, vortexUrl, vortexPages, webviewPreloadPath, webviewsRef, activeIdGetter) {
    const isNewtab = vortexUrl === 'vortex://newtab';
    const isIncognito = !!(webviewsRef[tabId]?.dataset?.incognito === '1');

    const _onReady = () => {
      const currentUrl = wv.src || '';
      const isInternal = currentUrl.startsWith('vortex://');
      const meta = vortexPages[currentUrl] || vortexPages[vortexUrl];
      
      if (isInternal && meta) {
        Tabs.updateTab(tabId, { title: meta.title });
        if (activeIdGetter() === tabId) {
          Navigation.setURL(currentUrl);
          document.title = meta.title + ' — Vortex';
        }
      }
      
      // Inject minimal CSS fix instead of invasive JS
      wv.insertCSS(`
        html, body { height: 100vh !important; width: 100vw !important; overflow: auto !important; margin: 0 !important; }
      `).catch(() => {});

      if (currentUrl === 'vortex://downloads') {
        document.dispatchEvent(new CustomEvent('vortex-downloads-ready', { detail: wv }));
      }
    };

    // Use dom-ready for faster, more reliable initialization of internal pages
    wv.addEventListener('dom-ready', _onReady);

    wv.addEventListener('did-start-navigation', (e) => {
      if (!e.isMainFrame) return;
      const url = e.url || '';
      const isInternal = url.startsWith('vortex://');
      if (activeIdGetter() === tabId) {
        Navigation.setURL(url);
        if (isInternal) {
          const placeholderTitle = vortexPages[url]?.title || 'Vortex';
          document.title = placeholderTitle + ' — Vortex';
        }
      }
      const updateData = { url: url };
      if (isInternal) updateData.title = vortexPages[url]?.title || 'New Tab';
      Tabs.updateTab(tabId, updateData);
      if (!isInternal && url) {
        const fav = WVFavicon.getUrl(url);
        if (fav) Tabs.updateTab(tabId, { favicon: fav });
      }
    });

    wv.addEventListener('did-redirect-navigation', (e) => {
      if (!e.isMainFrame) return;
      const url = e.newURL || e.url || '';
      const isInternal = url.startsWith('vortex://');
      if (activeIdGetter() === tabId) {
        Navigation.setURL(url);
        if (isInternal) {
          const placeholderTitle = vortexPages[url]?.title || 'Vortex';
          document.title = placeholderTitle + ' — Vortex';
        }
      }
      const updateData = { url: url };
      if (isInternal) updateData.title = vortexPages[url]?.title || 'New Tab';
      Tabs.updateTab(tabId, updateData);
    });

    wv.addEventListener('will-navigate', (e) => {
      const url = e.url || '';
      const isInternal = url.startsWith('vortex://');
      if (activeIdGetter() === tabId) {
        Navigation.setURL(url);
        if (isInternal) {
          const placeholderTitle = vortexPages[url]?.title || 'Vortex';
          document.title = placeholderTitle + ' — Vortex';
        }
      }
      const updateData = { url: url };
      if (isInternal) updateData.title = vortexPages[url]?.title || 'New Tab';
      Tabs.updateTab(tabId, updateData);
    });

    wv.addEventListener('update-target-url', (e) => {
      if (activeIdGetter() !== tabId) return;
      const preview = document.getElementById('link-preview');
      if (!preview) return;
      if (e.url) { preview.textContent = e.url; preview.classList.add('visible'); }
      else        { preview.classList.remove('visible'); }
    });

    wv.addEventListener('did-navigate', (e) => {
      const url = e.url || wv.src;
      const isInternal = url.startsWith('vortex://');
      if (activeIdGetter() === tabId) Navigation.setURL(url);
      Tabs.updateTab(tabId, { url: url });

      if (!isInternal) {
        const fav = WVFavicon.getUrl(url);
        if (fav) Tabs.updateTab(tabId, { favicon: fav });
        wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
        WVYTAdblock.inject(wv);
        if (!isIncognito && window.TabHistory) TabHistory.onNavigate(tabId, url, null, fav);
        if (Tabs.touchTab) Tabs.touchTab(tabId);
        WVTranslateBar.hide();
      }
    });

    wv.addEventListener('page-title-updated', (e) => {
      Tabs.updateTab(tabId, { title: e.title });
      if (activeIdGetter() === tabId) document.title = e.title + ' — Vortex';
      if (!wv.src.startsWith('vortex://') && !isIncognito && window.TabHistory) {
        TabHistory.onTitleUpdate(tabId, e.title);
      }
    });

    wv.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length && !wv.src.startsWith('vortex://')) {
        const favUrl = e.favicons[0];
        wv.executeJavaScript(`
          fetch(${JSON.stringify(favUrl)}, { cache: 'force-cache' })
            .then(r => r.ok ? r.blob() : Promise.reject())
            .then(blob => new Promise(resolve => { var rd = new FileReader(); rd.onload = () => resolve(rd.result); rd.onerror = () => resolve(null); rd.readAsDataURL(blob); }))
            .catch(() => null)
        `, true).then(base64 => {
          const icon = (base64 && base64.startsWith('data:')) ? base64 : favUrl;
          Tabs.updateTab(tabId, { favicon: icon });
          if (!isIncognito && window.TabHistory) TabHistory.onFaviconUpdate(tabId, icon);
        }).catch(() => { Tabs.updateTab(tabId, { favicon: favUrl }); });
      }
    });

    wv.addEventListener('did-finish-load', () => {
      if (!wv.src.startsWith('vortex://')) {
        WVFavicon.extract(wv, tabId, isIncognito);
        wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
        WVYTAdblock.inject(wv);
      }
      setTimeout(() => WebView._captureTab(tabId, wv), 800);
    });

    wv.addEventListener('context-menu', (e) => { 
      if (!wv.src.startsWith('vortex://')) ContextMenu.show(e.params.x, e.params.y, e.params, wv); 
    });

    if (isNewtab) {
      wv.addEventListener('ipc-message', (e) => {
        if (e.channel === 'newtab:openUrl') WebView.loadURL(e.args[0]);
      });
    }
  }

  function attachRegular(wv, tabId, opts, webviewsRef, activeIdGetter) {
    const isIncognito = !!opts.incognito;
    wv.setMaxListeners && wv.setMaxListeners(30);

    function forceIframeSize() {
      try {
        const iframe = wv.shadowRoot?.querySelector('iframe');
        if (iframe) iframe.style.cssText = 'height:100%!important;width:100%!important;position:absolute!important;top:0!important;left:0!important;border:none!important;';
      } catch (_) {}
    }

    wv.addEventListener('dom-ready', forceIframeSize);
    wv.addEventListener('dom-ready', () => {
      const url = wv.src || '';
      if (url.includes('youtube.com')) WVYTAdblock.inject(wv);
    });

    wv.addEventListener('did-start-loading', () => {
      if (activeIdGetter() === tabId) { Navigation.startProgress(); NetStatus.onLoadStart(wv); }
    });

    wv.addEventListener('did-stop-loading', () => {
      if (activeIdGetter() === tabId) { Navigation.endProgress(); NetStatus.onLoadFinish(wv); }
    });

    // Custom 3D error pages
    wv.addEventListener('did-fail-load', (e) => {
      if (!e.isMainFrame) return;
      if (e.errorCode === -3) return; // ERR_ABORTED — navigation cancelled, ignore

      // Show the failed URL in the address bar
      if (activeIdGetter() === tabId && e.validatedURL) {
        Navigation.setURL(e.validatedURL);
        Tabs.updateTab(tabId, { url: e.validatedURL });
      }

      if (typeof WVErrorPage !== 'undefined') {
        WVErrorPage.show(wv, {
          errorCode:        e.errorCode,
          errorDescription: e.errorDescription,
          url:              e.validatedURL,
        });
      }
    });

    wv.addEventListener('did-start-navigation', (e) => {
      if (e.isMainFrame && activeIdGetter() === tabId) {
        Navigation.setURL(e.url);
      }
      ContextMenu.hide();
    });

    wv.addEventListener('did-redirect-navigation', (e) => {
      if (e.isMainFrame && activeIdGetter() === tabId) {
        Navigation.setURL(e.newURL);
      }
    });

    wv.addEventListener('will-navigate', (e) => {
      if (activeIdGetter() === tabId) {
        Navigation.setURL(e.url);
      }
    });

    wv.addEventListener('did-navigate', (e) => {
      if (activeIdGetter() === tabId) Navigation.setURL(e.url);
      Tabs.updateTab(tabId, { url: e.url });
      const fav = WVFavicon.getUrl(e.url);
      if (fav) Tabs.updateTab(tabId, { favicon: fav });
      wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
      WVYTAdblock.inject(wv);
      if (!isIncognito && window.TabHistory) TabHistory.onNavigate(tabId, e.url, null, fav);
      if (Tabs.touchTab) Tabs.touchTab(tabId);
      WVTranslateBar.hide();
    });

    wv.addEventListener('permission-request', (e) => {
      if (typeof PermissionPopup === 'undefined' || typeof PermissionManager === 'undefined') return;
      try {
        const url    = wv.getURL();
        const domain = new URL(url).hostname.replace(/^www\./, '');
        const permId = e.permission;
        if (activeIdGetter() === tabId) PermissionPopup.onPermissionRequested(domain, permId);
        else PermissionManager.markRequested(domain, permId);
        const stored = PermissionManager.getForDomain(domain)[permId];
        if (stored === 'granted') { e.request.allow(); return; }
        if (stored === 'denied')  { e.request.deny();  return; }
        e.request.deny();
      } catch { e.request.deny(); }
    });

    wv.addEventListener('did-navigate-in-page', (e) => {
      if (activeIdGetter() === tabId) Navigation.setURL(e.url);
      if (!isIncognito && window.TabHistory) TabHistory.onNavigate(tabId, e.url, null, null);
      if (WVYTAdblock.isEnabled()) WVYTAdblock.inject(wv);
      if (activeIdGetter() === tabId && typeof PasswordAutofill !== 'undefined') {
        PasswordAutofill.onNavigate(e.url, wv.src);
      }
    });

    wv.addEventListener('did-finish-load', () => {
      forceIframeSize();
      wv.insertCSS(SCROLLBAR_CSS).catch(() => {});
      if (WVYTAdblock.isEnabled()) WVYTAdblock.inject(wv);
      Prefetch.prefetchPageLinks(wv);
      setTimeout(() => WebView._captureTab(tabId, wv), 800);
      const zoomLevel = WVZoom.get(tabId);
      if (zoomLevel !== 1.0) WVZoom.apply(tabId, zoomLevel, webviewsRef, activeIdGetter());
      const currentUrl = wv.src;
      WVLangDetect.scheduleDetect(tabId, currentUrl, activeIdGetter(), webviewsRef);
      if (activeIdGetter() === tabId && typeof PasswordAutofill !== 'undefined') PasswordAutofill.onPageLoad(currentUrl);
      if (activeIdGetter() === tabId && typeof AddressManager !== 'undefined') AddressManager.checkPageForAddressForm();
      if (activeIdGetter() === tabId && typeof BlocklistBadge !== 'undefined') BlocklistBadge.onNavigate(tabId);
      WVFavicon.extract(wv, tabId, isIncognito);
    });

    wv.addEventListener('page-title-updated', (e) => {
      Tabs.updateTab(tabId, { title: e.title });
      if (activeIdGetter() === tabId) document.title = e.title + ' — Vortex';
      if (!isIncognito && window.TabHistory) TabHistory.onTitleUpdate(tabId, e.title);
      if (typeof FaviconCache !== 'undefined' && wv.src) FaviconCache.saveTitle(wv.src, e.title).catch(() => {});
    });

    wv.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length) {
        const favUrl = e.favicons[0];
        wv.executeJavaScript(`
          fetch(${JSON.stringify(favUrl)}, { cache: 'force-cache' })
            .then(r => r.ok ? r.blob() : Promise.reject())
            .then(blob => new Promise(resolve => { var rd = new FileReader(); rd.onload = () => resolve(rd.result); rd.onerror = () => resolve(null); rd.readAsDataURL(blob); }))
            .catch(() => null)
        `, true).then(base64 => {
          const icon = (base64 && base64.startsWith('data:')) ? base64 : favUrl;
          Tabs.updateTab(tabId, { favicon: icon });
          if (!isIncognito && window.TabHistory) TabHistory.onFaviconUpdate(tabId, icon);
          if (typeof FaviconCache !== 'undefined' && wv.src && base64) FaviconCache.saveBase64(wv.src, base64).catch(() => {});
        }).catch(() => { Tabs.updateTab(tabId, { favicon: favUrl }); });
      }
    });

    wv.addEventListener('context-menu', (e) => { ContextMenu.show(e.params.x, e.params.y, e.params, wv); });

    wv.addEventListener('ipc-message', (e) => {
      if (e.channel === 'webview:mousedown') ContextMenu.hide();
      if (e.channel === 'webview:keydown') {
        const k = e.args[0];
        document.dispatchEvent(new KeyboardEvent('keydown', { key:k.key, ctrlKey:k.ctrlKey, metaKey:k.metaKey, shiftKey:k.shiftKey, altKey:k.altKey, bubbles:true }));
      }
      if (e.channel === 'pip:request') {
        try { window.vortexAPI.invoke('pip:trigger', wv.getWebContentsId()).catch(() => {}); } catch (_) {}
      }
      if (e.channel === 'dialog:show') {
        const d = e.args[0];
        if (typeof VortexDialog !== 'undefined') VortexDialog.show(d.type, d.message, d.origin, d.defaultValue);
      }
    });

    wv.addEventListener('update-target-url', (e) => {
      if (activeIdGetter() !== tabId) return;
      const preview = document.getElementById('link-preview');
      if (!preview) return;
      if (e.url) { preview.textContent = e.url; preview.classList.add('visible'); }
      else        { preview.classList.remove('visible'); }
    });
  }

  return { attachVortex, attachRegular, SCROLLBAR_CSS };

})();
