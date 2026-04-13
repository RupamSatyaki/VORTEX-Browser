/**
 * blocklist/components/statsCard.js
 */

const StatsCard = {
  render(container, stats) {
    const { total = 0, today = 0, domainsLoaded = 0 } = stats || {};
    container.innerHTML = `
      <div class="bl-stats-row">
        <div class="bl-stat">
          <div class="bl-stat-num secure">${_fmt(today)}</div>
          <div class="bl-stat-label">Blocked Today</div>
        </div>
        <div class="bl-stat">
          <div class="bl-stat-num">${_fmt(total)}</div>
          <div class="bl-stat-label">Total Blocked</div>
        </div>
        <div class="bl-stat">
          <div class="bl-stat-num warn">${_fmt(domainsLoaded)}</div>
          <div class="bl-stat-label">Domains Loaded</div>
        </div>
      </div>`;
  },
};

function _fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
