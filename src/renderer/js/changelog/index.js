/**
 * changelog/index.js — Loads all version JSON files and renders the changelog.
 *
 * Directory structure:
 *   changelog/
 *     v1/  v1.0.0.json  v1.0.1.json  v1.1.0.json  v1.2.0.json  v1.2.1.json
 *     v2/  v2.0.0.json  v2.1.0.json  ...  v2.7.3.json
 *     index.js  ← this file
 *
 * To add a new version:
 *   1. Create changelog/vX/vX.Y.Z.json
 *   2. Add the path to VERSION_FILES below
 *   3. Set isCurrent: true on the new entry, false on the previous latest
 */

const VERSION_FILES = [
  // v2 — newest first
  'v2/v2.7.4.json',
  'v2/v2.7.3.json',
  'v2/v2.7.2.json',
  'v2/v2.7.1.json',
  'v2/v2.7.0.json',
  'v2/v2.6.1.json',
  'v2/v2.6.0.json',
  'v2/v2.5.0.json',
  'v2/v2.4.2.json',
  'v2/v2.4.1.json',
  'v2/v2.4.0.json',
  'v2/v2.3.1.json',
  'v2/v2.3.0.json',
  'v2/v2.2.1.json',
  'v2/v2.2.0.json',
  'v2/v2.1.2.json',
  'v2/v2.1.1.json',
  'v2/v2.1.0.json',
  'v2/v2.0.0.json',
  // v1
  'v1/v1.2.1.json',
  'v1/v1.2.0.json',
  'v1/v1.1.0.json',
  'v1/v1.0.1.json',
  'v1/v1.0.0.json',
];

// ── Resolve base URL (works in both dev and packaged) ─────────────────────────
function _getBase() {
  return window.location.href.replace(/\/settings\.html.*$/, '/js/changelog/');
}

// ── Fetch all JSON files ───────────────────────────────────────────────────────
async function _loadVersions() {
  const base = _getBase();
  const results = await Promise.all(
    VERSION_FILES.map(f =>
      fetch(base + f)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )
  );
  return results.filter(Boolean);
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function _computeStats(versions) {
  let features = 0, fixes = 0, improvements = 0;
  versions.forEach(v => {
    (v.categories || []).forEach(cat => {
      (cat.features || []).forEach(f => {
        if (f.type === 'new')     features++;
        else if (f.type === 'fix')     fixes++;
        else if (f.type === 'improve') improvements++;
      });
    });
  });
  return { versions: versions.length, features, fixes, improvements };
}

// ── Render helpers ────────────────────────────────────────────────────────────
const TAG_LABELS = { new:'NEW', fix:'FIX', improve:'IMP', perf:'SYS' };

const TYPE_ICONS = {
  new:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  fix:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  improve: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  perf:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
};

const CAT_ICONS = {
  'New Features':    `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  'Bug Fixes':       `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  'Improvements':    `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  'Architecture':    `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
  'New Tools':       `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  'Browsing Core':   `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  'Productivity':    `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  'AI & Content':    `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  'Media & Tools':   `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>`,
  'System & Updates':`<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
};

function _catIcon(label) {
  return CAT_ICONS[label] || CAT_ICONS['New Features'];
}

function _renderFeature(f) {
  const icon = f.icon || TYPE_ICONS[f.type] || TYPE_ICONS.new;
  const howto = f.howto
    ? `<div class="cl-feat-howto">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${f.howto}
       </div>`
    : '';
  return `
    <div class="cl-feature-item">
      <div class="cl-feat-icon ${f.type}">${icon}</div>
      <div class="cl-feat-text">
        <div class="cl-feat-label">${f.label}</div>
        <div class="cl-feat-desc">${f.desc}</div>
        ${howto}
      </div>
      <span class="cl-feat-tag ${f.type}">${TAG_LABELS[f.type] || f.type.toUpperCase()}</span>
    </div>`;
}

function _renderCategory(cat, first) {
  const mt = first ? '' : 'style="margin-top:10px;"';
  const icon = _catIcon(cat.label);
  return `
    <div class="cl-category-label" ${mt}>${icon} ${cat.label}</div>
    ${(cat.features || []).map(_renderFeature).join('')}`;
}

function _renderCounts(counts) {
  return Object.entries(counts || {})
    .map(([type, n]) => `<span class="cl-count ${type}">${n} ${type}</span>`)
    .join('');
}

function _renderVersion(v) {
  const currentPill = v.isCurrent
    ? `<span class="cl-current-pill">● Current</span>` : '';
  const openClass = v.open ? ' open' : '';

  return `
    <div class="cl-version-block${openClass}" id="cl-${v.id}">
      <div class="cl-ver-header" onclick="clToggle('cl-${v.id}')">
        <div class="cl-ver-left">
          <span class="cl-ver-badge ${v.badge}">${v.version}</span>
          <div class="cl-ver-info">
            <div class="cl-ver-name">${v.name}</div>
            <div class="cl-ver-date">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${v.date}${currentPill}
            </div>
          </div>
        </div>
        <div class="cl-ver-right">
          <div class="cl-ver-counts">${_renderCounts(v.counts)}</div>
          <svg class="cl-ver-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="cl-features">
        <div class="cl-features-inner">
          ${(v.categories || []).map((cat, i) => _renderCategory(cat, i === 0)).join('')}
        </div>
      </div>
    </div>`;
}

function _renderHero(stats) {
  return `
    <div class="card" style="margin-bottom:16px;overflow:hidden;">
      <div class="cl-hero">
        <div class="cl-hero-glow"></div>
        <div class="cl-hero-badge">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Release History
        </div>
        <div class="cl-hero-title">Vortex Browser Changelog</div>
        <div class="cl-hero-sub">Every feature, fix and improvement — version by version</div>
        <div class="cl-stats-row">
          <div class="cl-stat"><div class="cl-stat-num">${stats.versions}</div><div class="cl-stat-label">Versions</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.features}</div><div class="cl-stat-label">Features</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.fixes}</div><div class="cl-stat-label">Bug Fixes</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.improvements}</div><div class="cl-stat-label">Improvements</div></div>
        </div>
        <div class="cl-legend">
          <span class="cl-leg-item new"><span class="cl-leg-dot"></span>New Feature</span>
          <span class="cl-leg-item fix"><span class="cl-leg-dot"></span>Bug Fix</span>
          <span class="cl-leg-item improve"><span class="cl-leg-dot"></span>Improvement</span>
          <span class="cl-leg-item perf"><span class="cl-leg-dot"></span>System</span>
        </div>
      </div>
    </div>`;
}

// ── Main render ───────────────────────────────────────────────────────────────
async function renderChangelog() {
  const container = document.getElementById('sec-changelog');
  if (!container) return;

  container.innerHTML = '<div class="section-title">What\'s New</div><div style="padding:20px;text-align:center;color:#4a8080;font-size:12px;">Loading changelog\u2026</div>';

  try {
    const versions = await _loadVersions();
    const stats    = _computeStats(versions);
    const hero     = _renderHero(stats);
    const vHtml    = versions.map(_renderVersion).join('');
    container.innerHTML = `<div class="section-title">What's New</div>${hero}${vHtml}`;
  } catch(e) {
    container.innerHTML = '<div class="section-title">What\'s New</div><div style="padding:20px;color:#ef4444;font-size:12px;">Failed to load changelog: ' + e.message + '</div>';
  }
}

// ── Auto-render ───────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderChangelog);
} else {
  renderChangelog();
}
