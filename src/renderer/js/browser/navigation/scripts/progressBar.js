/**
 * browser/navigation/scripts/progressBar.js
 * URL bar loading progress bar — start, end, simulate.
 */

const NavProgressBar = (() => {

  let _timer = null;
  let _val   = 0;

  function start() {
    const fill = document.getElementById('url-progress-fill');
    if (!fill) return;
    clearInterval(_timer);
    _val = 0;
    fill.style.transition = 'none';
    fill.style.width      = '0%';
    fill.style.opacity    = '1';
    _timer = setInterval(() => {
      if (_val < 70)      _val += 6;
      else if (_val < 90) _val += 0.8;
      fill.style.transition = 'width 0.3s ease';
      fill.style.width      = _val + '%';
    }, 200);
  }

  function end() {
    const fill = document.getElementById('url-progress-fill');
    if (!fill) return;
    clearInterval(_timer);
    fill.style.transition = 'width 0.2s ease';
    fill.style.width      = '100%';
    setTimeout(() => {
      fill.style.transition = 'opacity 0.3s ease';
      fill.style.opacity    = '0';
      setTimeout(() => { fill.style.width = '0%'; }, 350);
    }, 200);
  }

  return { start, end };

})();
