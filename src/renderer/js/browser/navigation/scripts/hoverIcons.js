/**
 * browser/navigation/scripts/hoverIcons.js
 * Address bar hover icons — inject on mouseenter, remove on mouseleave.
 */

const NavHoverIcons = (() => {

  let _injected = false;
  let _domain   = '';

  function setDomain(domain) {
    _domain = domain || '';
  }

  function bind() {
    const addrBar = document.getElementById('address-bar-wrap');
    if (!addrBar) return;

    addrBar.addEventListener('mouseenter', _inject);
    addrBar.addEventListener('focusin',    _inject);
    addrBar.addEventListener('mouseleave', _remove);
    addrBar.addEventListener('focusout', (e) => {
      if (!addrBar.contains(e.relatedTarget)) _remove();
    });
  }

  function _inject() {
    if (_injected) return;
    _injected = true;
    const wrap = document.getElementById('address-bar-icons');
    if (!wrap) return;

    wrap.innerHTML = `
      <div class="address-icon" id="btn-permissions" title="Site Permissions (Ctrl+Shift+I)" style="position:relative;color:#4a8080;display:none;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span id="perm-addr-badge" style="position:absolute;top:2px;right:2px;width:6px;height:6px;border-radius:50%;display:none;"></span>
      </div>
      <div class="address-icon" id="btn-autofill" title="Autofill Password" style="position:relative;color:#4a8080;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
        <span class="pm-autofill-badge" id="pm-af-badge" style="display:none;"></span>
      </div>
      <div class="address-icon" id="btn-blocklist-badge" title="Ad & Tracker Blocking" style="position:relative;color:#4a8080;opacity:0.5;cursor:default;pointer-events:none;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <span class="bl-badge-count" id="bl-badge-num" style="display:none;position:absolute;top:0;right:0;background:var(--accent,#00c8b4);color:#001a18;font-size:8px;font-weight:700;border-radius:6px;padding:0 3px;min-width:12px;text-align:center;line-height:14px;"></span>
      </div>
      <div class="address-icon" id="btn-bookmark" title="Bookmark" style="color:#4a8080;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="address-icon" id="btn-copy-url" title="Copy URL" style="color:#4a8080;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>`;

    // Permissions
    const permBtn = document.getElementById('btn-permissions');
    if (permBtn && typeof PermissionPopup !== 'undefined') {
      PermissionPopup.updateBadge(_domain);
      permBtn.addEventListener('click', (e) => { e.stopPropagation(); PermissionPopup.toggle(); });
    }

    // Autofill
    const autofillBtn = document.getElementById('btn-autofill');
    if (autofillBtn && typeof PasswordAutofill !== 'undefined') {
      PasswordAutofill.updateBadge(_domain);
      autofillBtn.addEventListener('click', (e) => { e.stopPropagation(); PasswordAutofill._toggleDropdown(); });
    }

    // Blocklist badge — refresh count
    if (typeof BlocklistBadge !== 'undefined') BlocklistBadge._refreshBadge && BlocklistBadge._refreshBadge();

    // Bookmark
    const bookmarkBtn = document.getElementById('btn-bookmark');
    if (bookmarkBtn) {
      if (window._bookmarkState) { bookmarkBtn.classList.add('bookmarked'); bookmarkBtn.title = 'Remove bookmark'; }
      else                       { bookmarkBtn.classList.remove('bookmarked'); bookmarkBtn.title = 'Bookmark this page'; }
      if (window._updateBookmarkIcon) window._updateBookmarkIcon();
      bookmarkBtn.addEventListener('click', async () => {
        const urlBar = document.getElementById('url-bar');
        const url = urlBar.dataset.fullUrl || urlBar.value;
        if (!url || url.startsWith('vortex://')) return;
        const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
        if (isBookmarked) {
          const list = await BookmarkStore.load();
          const bm = list.find(b => b.url === url);
          if (bm) { await BookmarkStore.remove(bm.id); window._forwardToBookmarksFrame?.('bookmark:removed', bm.id); }
          bookmarkBtn.classList.remove('bookmarked'); bookmarkBtn.title = 'Bookmark this page';
        } else {
          const title = document.title.replace(' — Vortex', '') || url;
          const entry = { id: Date.now().toString(), url, title, addedAt: Date.now() };
          const added = await BookmarkStore.add(entry);
          if (added) window._forwardToBookmarksFrame?.('bookmark:added', entry);
          bookmarkBtn.classList.add('bookmarked'); bookmarkBtn.title = 'Remove bookmark';
        }
      });
    }

    // Copy URL
    const copyBtn = document.getElementById('btn-copy-url');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const urlBar = document.getElementById('url-bar');
        const url = urlBar.dataset.fullUrl || urlBar.value;
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.title = 'Copied!';
          setTimeout(() => { copyBtn.title = 'Copy URL'; }, 1500);
        });
      });
    }

    // Animate in
    requestAnimationFrame(() => {
      wrap.querySelectorAll('.address-icon').forEach((el, i) => {
        el.style.opacity   = '0';
        el.style.transform = 'scale(0.8)';
        el.style.transition = `opacity 0.12s ease ${i * 25}ms, transform 0.12s ease ${i * 25}ms`;
        requestAnimationFrame(() => {
          el.style.opacity   = el.id === 'btn-blocklist-badge' ? '0.5' : '1';
          el.style.transform = 'scale(1)';
        });
      });
    });
  }

  function _remove() {
    if (document.getElementById('pm-autofill-dropdown')?.classList.contains('visible')) return;
    if (document.getElementById('url-security-popup')) return;
    if (document.getElementById('perm-popup')) return;

    const wrap    = document.getElementById('address-bar-icons');
    const addrBar = document.getElementById('address-bar-wrap');
    if (!wrap || !_injected) return;

    wrap.querySelectorAll('.address-icon').forEach(el => {
      el.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
      el.style.opacity    = '0';
      el.style.transform  = 'scale(0.8)';
    });
    setTimeout(() => {
      if (!addrBar?.matches(':hover') && !addrBar?.matches(':focus-within')) {
        wrap.innerHTML = '';
        _injected = false;
      }
    }, 120);
  }

  return { bind, setDomain };

})();
