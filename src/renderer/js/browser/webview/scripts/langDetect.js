/**
 * browser/webview/scripts/langDetect.js
 * Page language detection + translate bar trigger.
 */

const WVLangDetect = (() => {

  const LANG_NAMES = {
    af:'Afrikaans',ar:'Arabic',bg:'Bulgarian',bn:'Bengali',ca:'Catalan',
    cs:'Czech',cy:'Welsh',da:'Danish',de:'German',el:'Greek',
    en:'English',es:'Spanish',et:'Estonian',fa:'Persian',fi:'Finnish',
    fr:'French',gu:'Gujarati',he:'Hebrew',hi:'Hindi',hr:'Croatian',
    hu:'Hungarian',id:'Indonesian',it:'Italian',ja:'Japanese',kn:'Kannada',
    ko:'Korean',lt:'Lithuanian',lv:'Latvian',mk:'Macedonian',ml:'Malayalam',
    mr:'Marathi',ms:'Malay',mt:'Maltese',nl:'Dutch',no:'Norwegian',
    pl:'Polish',pt:'Portuguese',ro:'Romanian',ru:'Russian',sk:'Slovak',
    sl:'Slovenian',sq:'Albanian',sr:'Serbian',sv:'Swedish',sw:'Swahili',
    ta:'Tamil',te:'Telugu',th:'Thai',tl:'Filipino',tr:'Turkish',
    uk:'Ukrainian',ur:'Urdu',vi:'Vietnamese',
    'zh-CN':'Chinese (Simplified)','zh-TW':'Chinese (Traditional)',
  };

  let _timer = null;

  function scheduleDetect(tabId, url, activeId, webviews) {
    clearTimeout(_timer);
    _timer = setTimeout(() => _detect(tabId, url, activeId, webviews), 1200);
  }

  function cancelDetect() {
    clearTimeout(_timer);
  }

  async function _detect(tabId, url, activeId, webviews) {
    if (!url || url.startsWith('vortex://') || url.startsWith('file://')) return;
    if (url.includes('translate.google') || url.includes('translate.goog')) return;
    if (WVTranslateBar.isDismissed(url)) return;
    if (tabId !== activeId) return;

    const wv = webviews[tabId];
    if (!wv) return;

    let sample = '', htmlLang = '';
    try {
      const result = await wv.executeJavaScript(`
        (function() {
          var lang = document.documentElement.lang || document.querySelector('meta[http-equiv="content-language"]')?.content || '';
          var text = (document.body && document.body.innerText || '').trim().slice(0, 300);
          return { lang: lang.toLowerCase().split('-')[0], text: text };
        })()
      `);
      htmlLang = (result.lang || '').trim();
      sample   = (result.text || '').trim();
    } catch (_) { return; }

    if (!sample && !htmlLang) return;

    let userLang = 'en';
    try {
      const s = await window.vortexAPI.invoke('storage:read', 'settings');
      userLang = (s && s.lang) || 'en';
    } catch (_) {}

    let detectedLang = htmlLang;
    if (!detectedLang && sample.length > 20) {
      try {
        const encoded = encodeURIComponent(sample.slice(0, 200));
        const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encoded}`);
        if (resp.ok) {
          const data = await resp.json();
          detectedLang = (data && data[2]) ? data[2] : '';
        }
      } catch (_) {}
    }

    if (!detectedLang) return;
    if (detectedLang === 'zh') detectedLang = 'zh-CN';

    const userLangBase    = userLang.split('-')[0];
    const detectedBase    = detectedLang.split('-')[0];
    if (detectedBase === userLangBase) return;
    if (tabId !== activeId) return;

    WVTranslateBar.show({ detectedLang, pageUrl: url, userLang, langNames: LANG_NAMES });
  }

  return { scheduleDetect, cancelDetect, LANG_NAMES };

})();
