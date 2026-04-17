/**
 * browser/tabs/scripts/tabSleep.js
 * Tab sleep — suspend inactive background tabs to save memory.
 */

const TabSleep = (() => {

  let _enabled  = true;
  let _timeout  = 30 * 60 * 1000; // 30 min default
  let _timer    = null;
  const _lastActive = new Map();

  function touch(id) {
    _lastActive.set(id, Date.now());
  }

  function sleep(id, tabs, activeTabId, renderFn) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || tab._sleeping || id === activeTabId || !tab._webviewReady) return;
    const wv = document.querySelector(`.vortex-wv[data-tab-id="${id}"]`);
    if (wv && wv.src && wv.src !== 'about:blank') tab.url = wv.src;
    WebView.destroyWebview(id);
    tab._webviewReady = false;
    tab._sleeping     = true;
    renderFn();
  }

  function wake(id, tabs) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab._sleeping) return;
    tab._sleeping = false;
    touch(id);
  }

  function runCheck(tabs, activeTabId, renderFn) {
    if (!_enabled) return;
    const now = Date.now();
    tabs.forEach(tab => {
      if (tab.id === activeTabId || tab._sleeping) return;
      const last = _lastActive.get(tab.id) || 0;
      if (now - last >= _timeout) sleep(tab.id, tabs, activeTabId, renderFn);
    });
  }

  function startTimer(tabs, activeTabIdGetter, renderFn) {
    clearInterval(_timer);
    _timer = setInterval(() => runCheck(tabs, activeTabIdGetter(), renderFn), 60 * 1000);
  }

  function setEnabled(val, tabs, renderFn) {
    _enabled = val;
    if (!val) { tabs.forEach(t => { if (t._sleeping) t._sleeping = false; }); renderFn(); }
  }

  function setTimeout_(minutes) {
    _timeout = minutes * 60 * 1000;
  }

  return { touch, sleep, wake, startTimer, setEnabled, setTimeout: setTimeout_ };

})();
