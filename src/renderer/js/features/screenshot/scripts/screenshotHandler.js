/**
 * features/screenshot/scripts/screenshotHandler.js
 * Screenshot panel button bindings — copy, save, close.
 */

const ScreenshotHandler = (() => {

  function bindButtons(panel, dataURL, name, onClose) {
    document.getElementById('ssp-close')?.addEventListener('click', onClose);
    document.getElementById('ssp-backdrop')?.addEventListener('click', onClose);

    // Copy to clipboard
    document.getElementById('ssp-copy')?.addEventListener('click', async () => {
      try {
        const res  = await fetch(dataURL);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        const btn  = document.getElementById('ssp-copy');
        const orig = btn.innerHTML;
        btn.textContent = '✓ Copied';
        setTimeout(() => { if (btn) btn.innerHTML = orig; }, 2000);
      } catch (_) {}
    });

    // Save
    document.getElementById('ssp-save')?.addEventListener('click', async () => {
      const btn = document.getElementById('ssp-save');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        const savedPath = await window.vortexAPI.invoke('screenshot:save', dataURL, name);
        if (savedPath) {
          btn.textContent = '✓ Saved';
          setTimeout(onClose, 1200);
        } else {
          btn.disabled = false;
          btn.textContent = 'Save PNG';
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = 'Save PNG';
      }
    });

    // Escape key
    const _onKeydown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', _onKeydown);

    // Return cleanup function
    return () => document.removeEventListener('keydown', _onKeydown);
  }

  return { bindButtons };

})();
