/**
 * features/summarizer/ui/summarizerUI.js
 * Summarizer drawer UI — render bullets, loading, error states.
 */

const SummarizerUI = (() => {

  function renderBullets(bullets) {
    const content = document.getElementById('sum-content');
    if (!content) return;
    content.className = '';
    content.innerHTML = bullets.map(b => `<div class="sum-bullet">${b}</div>`).join('');
  }

  function renderLoading() {
    const content = document.getElementById('sum-content');
    if (!content) return;
    content.className = 'loading';
    content.innerHTML = `<div class="sum-spinner"></div><span>Summarizing...</span>`;
  }

  function renderError(msg) {
    const content = document.getElementById('sum-content');
    if (!content) return;
    content.className = '';
    content.innerHTML = `<div class="sum-error">⚠ ${msg}</div>`;
  }

  function setPageInfo(title, url) {
    const info = document.getElementById('sum-page-info');
    if (info) info.textContent = title || url || '';
  }

  function getBulletText() {
    const content = document.getElementById('sum-content');
    if (!content) return '';
    return [...content.querySelectorAll('.sum-bullet')]
      .map(el => '• ' + el.textContent.trim())
      .join('\n');
  }

  function getProvider() {
    return document.getElementById('sum-provider')?.value || 'extractive';
  }

  function getApiKey() {
    return document.getElementById('sum-api-key')?.value?.trim() || '';
  }

  return { renderBullets, renderLoading, renderError, setPageInfo, getBulletText, getProvider, getApiKey };

})();
