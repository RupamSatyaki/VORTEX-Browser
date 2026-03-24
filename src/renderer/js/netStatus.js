// Network Status Bar — load time, latency, speed
const NetStatus = (() => {
  let _loadStart = 0;
  let _hideTimer = null;
  let _activeWv  = null; // reference to current webview

  function _bar()       { return document.getElementById('net-status-bar'); }
  function _loadEl()    { return document.getElementById('net-load-time'); }
  function _latencyEl() { return document.getElementById('net-latency'); }
  function _sizeEl()    { return document.getElementById('net-size'); }
  function _speedEl()   { return document.getElementById('net-speed'); }

  function _colorClass(ms) {
    if (ms < 500)  return 'fast';
    if (ms < 2000) return 'medium';
    return 'slow';
  }

  function _fmtMs(ms) {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(2) + 's';
  }

  function _fmtBytes(bytes) {
    if (!bytes || bytes <= 0) return null;
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
  }

  function _show(html) {
    const bar = _bar();
    if (!bar) { console.warn('[NetStatus] bar element not found!'); return; }
    bar.innerHTML = html;
    bar.classList.add('visible');
    clearTimeout(_hideTimer);
    _hideTimer = setTimeout(() => bar.classList.remove('visible'), 7000);
  }

  // Called when a page starts loading
  function onLoadStart(wv) {
    _loadStart = Date.now();
    _activeWv  = wv || null;
    clearTimeout(_hideTimer);
    const bar = _bar();
    if (!bar) return;
    bar.innerHTML = `<span class="net-stat">⏳ loading…</span>`;
    bar.classList.add('visible');
  }

  // Called when a page finishes loading
  async function onLoadFinish(wv) {
    const totalMs = _loadStart ? Date.now() - _loadStart : 0;
    _activeWv = null;

    // Build display immediately with what we have
    let html = '';
    if (totalMs > 0) {
      const cls = _colorClass(totalMs);
      html += `<span class="net-stat ${cls}" title="Total load time">${_fmtMs(totalMs)}</span>`;
    }

    // Try to get detailed timing from the page
    try {
      const timing = await wv.executeJavaScript(`
        (() => {
          try {
            var nav = performance.getEntriesByType('navigation')[0];
            if (nav) return {
              dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
              tcp: Math.round(nav.connectEnd - nav.connectStart),
              ttfb: Math.round(nav.responseStart - nav.requestStart),
              transfer: Math.round(nav.transferSize || 0),
              duration: Math.round(nav.duration || 0)
            };
          } catch(e) {}
          return null;
        })()
      `);

      if (timing) {
        const latency = (timing.dns || 0) + (timing.tcp || 0) + (timing.ttfb || 0);
        if (latency > 0) {
          const cls = _colorClass(latency);
          html += `<span class="net-sep">·</span><span class="net-stat ${cls}" title="DNS:${timing.dns}ms TCP:${timing.tcp}ms TTFB:${timing.ttfb}ms">${_fmtMs(latency)} latency</span>`;
        }

        const sizeStr = _fmtBytes(timing.transfer);
        if (sizeStr) {
          html += `<span class="net-sep">·</span><span class="net-stat" title="Transfer size">${sizeStr}</span>`;
        }

        const durSec = (timing.duration || totalMs) / 1000;
        if (timing.transfer > 0 && durSec > 0) {
          const bps = timing.transfer / durSec;
          const spd = _fmtBytes(bps);
          if (spd) html += `<span class="net-sep">·</span><span class="net-stat" title="Avg speed">↓${spd}/s</span>`;
        }
      }
    } catch (_) { /* timing not available — show just load time */ }

    if (html) _show(html);
  }

  // Wire click-to-dismiss
  document.addEventListener('DOMContentLoaded', () => {
    const bar = _bar();
    if (!bar) return;
    bar.addEventListener('click', () => {
      clearTimeout(_hideTimer);
      bar.classList.remove('visible');
    });
  });

  return { onLoadStart, onLoadFinish };
})();
