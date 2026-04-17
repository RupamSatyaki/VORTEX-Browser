/**
 * browser/tabs/scripts/tabDrag.js
 * Tab drag-and-drop reordering.
 */

const TabDrag = (() => {

  let _drag = null;

  function init(el, tabId, tabsRef, setActiveTabFn, renderFn, notifyFn) {
    let _holdTimer  = null;
    let _dragActive = false;
    let _downEvent  = null;
    let _pointerId  = null;

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.tab-close')) return;
      _downEvent  = e;
      _dragActive = false;
      _pointerId  = e.pointerId;
      _holdTimer  = setTimeout(() => {
        _dragActive = true;
        _start(el, tabId, _downEvent, tabsRef);
        try { el.setPointerCapture(_pointerId); } catch(_) {}
      }, 300);
    });

    el.addEventListener('pointermove', (e) => {
      if (!_dragActive || !_drag || _drag.tabId !== tabId) return;
      _move(e, tabsRef, renderFn);
    });

    el.addEventListener('pointerup', (e) => {
      clearTimeout(_holdTimer);
      if (e.target.closest('.tab-close')) { _dragActive = false; _pointerId = null; return; }
      if (_dragActive && _drag?.tabId === tabId) _end(renderFn, notifyFn);
      else if (!_dragActive) setActiveTabFn(tabId);
      _dragActive = false; _pointerId = null;
    });

    el.addEventListener('pointercancel', () => {
      clearTimeout(_holdTimer);
      if (_drag?.tabId === tabId) _end(renderFn, notifyFn, true);
      _dragActive = false; _pointerId = null;
    });
  }

  function bindGlobal(renderFn, notifyFn) {
    document.addEventListener('pointerup',     () => { if (_drag) _end(renderFn, notifyFn); });
    document.addEventListener('pointercancel', () => { if (_drag) _end(renderFn, notifyFn, true); });
  }

  function _start(el, tabId, e, tabsRef) {
    const rect  = el.getBoundingClientRect();
    const ghost = el.cloneNode(true);
    ghost.id = 'tab-drag-ghost';
    ghost.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;pointer-events:none;z-index:99999;opacity:0.88;transform:scale(1.05);box-shadow:0 8px 28px rgba(0,0,0,0.55);border-radius:8px;transition:transform 0.08s ease;`;
    document.body.appendChild(ghost);
    el.classList.add('tab-dragging');
    _drag = {
      tabId, ghost, el,
      offsetX:     e.clientX - rect.left,
      originIndex: tabsRef.findIndex(t => t.id === tabId),
      lastIndex:   tabsRef.findIndex(t => t.id === tabId),
    };
  }

  function _move(e, tabsRef, renderFn) {
    const { ghost } = _drag;
    const container = document.getElementById('tabbar-container');
    const cr = container.getBoundingClientRect();
    ghost.style.left = Math.max(cr.left, Math.min(cr.right - ghost.offsetWidth, e.clientX - _drag.offsetX)) + 'px';

    const tabEls = [...container.querySelectorAll('.tab:not(.tab-dragging)')];
    let targetIndex = tabEls.length;
    for (let i = 0; i < tabEls.length; i++) {
      const mid = tabEls[i].getBoundingClientRect().left + tabEls[i].offsetWidth / 2;
      if (e.clientX < mid) { targetIndex = i; break; }
    }

    if (targetIndex !== _drag.lastIndex) {
      const [moved] = tabsRef.splice(_drag.originIndex, 1);
      tabsRef.splice(targetIndex, 0, moved);
      _drag.originIndex = targetIndex;
      _drag.lastIndex   = targetIndex;
      _renderDragging(tabsRef);
    }
  }

  function _renderDragging(tabsRef) {
    const container = document.getElementById('tabbar-container');
    const tabEls    = [...container.querySelectorAll('.tab')];
    const newBtn    = container.querySelector('.tab-add');
    tabsRef.forEach(tab => {
      const el = tabEls.find(e => e.dataset.id === tab.id);
      if (el) container.insertBefore(el, newBtn);
    });
  }

  function _end(renderFn, notifyFn, cancel = false) {
    if (!_drag) return;
    try { _drag.ghost.remove(); } catch(_) {}
    document.getElementById('tab-drag-ghost')?.remove();
    document.querySelector('.tab-dragging')?.classList.remove('tab-dragging');
    _drag = null;
    renderFn();
    if (!cancel) notifyFn();
  }

  return { init, bindGlobal };

})();
