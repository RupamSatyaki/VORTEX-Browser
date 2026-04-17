/**
 * browser/webview/ui/translateBar.js
 * Translate bar show/hide + button bindings.
 */

const WVTranslateBar = (() => {

  const _dismissed = new Set();
  let _bar = null;

  function getBar() {
    if (!_bar) _bar = document.getElementById('translate-bar');
    return _bar;
  }

  function hide() {
    getBar()?.classList.remove('visible');
  }

  function show({ detectedLang, pageUrl, userLang, langNames }) {
    const bar = getBar();
    if (!bar) return;

    const langNameEl = document.getElementById('translate-lang-name');
    const targetSel  = document.getElementById('translate-target');

    if (langNameEl) langNameEl.textContent = langNames[detectedLang] || detectedLang;

    if (targetSel) {
      const userLangBase = userLang.split('-')[0];
      const opt = targetSel.querySelector(`option[value="${userLang}"]`) ||
                  targetSel.querySelector(`option[value="${userLangBase}"]`);
      if (opt) targetSel.value = opt.value;
    }

    bar.dataset.detectedLang = detectedLang;
    bar.dataset.pageUrl      = pageUrl;
    bar.classList.add('visible');
  }

  function isDismissed(url) { return _dismissed.has(url); }
  function dismiss(url)     { _dismissed.add(url); }

  function bindButtons() {
    const bar = document.getElementById('translate-bar');
    if (!bar) return;

    document.getElementById('translate-btn')?.addEventListener('click', () => {
      const url    = bar.dataset.pageUrl;
      const target = document.getElementById('translate-target')?.value;
      if (!url || !target) return;
      WebView.loadURL(`https://translate.google.com/translate?sl=auto&tl=${target}&u=${encodeURIComponent(url)}`);
      hide();
      _dismissed.add(url);
    });

    document.getElementById('translate-close')?.addEventListener('click', () => {
      const url = bar.dataset.pageUrl;
      if (url) _dismissed.add(url);
      hide();
    });
  }

  return { show, hide, isDismissed, dismiss, bindButtons };

})();
