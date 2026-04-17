/**
 * browser/tabs/scripts/tabAudio.js
 * Tab mute/unmute + audible state polling.
 */

const TabAudio = (() => {

  async function toggleMute(id, tabs, renderFn) {
    const tab = tabs.find(t => t.id === id);
    if (!tab || !tab._webviewReady) return;
    const wv = document.querySelector(`.vortex-wv[data-tab-id="${id}"]`);
    if (!wv) return;
    try {
      const wcId = wv.getWebContentsId();
      tab._muted = !tab._muted;
      await window.vortexAPI.invoke('tab:setMuted', wcId, tab._muted);
      renderFn();
    } catch (_) {}
  }

  function startAudiblePoll(tabs, renderFn) {
    setInterval(async () => {
      let changed = false;
      for (const tab of tabs) {
        if (!tab._webviewReady) continue;
        const wv = document.querySelector(`.vortex-wv[data-tab-id="${tab.id}"]`);
        if (!wv) continue;
        try {
          const wcId    = wv.getWebContentsId();
          const audible = await window.vortexAPI.invoke('tab:isAudible', wcId);
          if (tab._audible !== audible) { tab._audible = audible; changed = true; }
        } catch (_) {}
      }
      if (changed) renderFn();
    }, 2000);
  }

  return { toggleMute, startAudiblePoll };

})();
