/**
 * changelog.js — Vortex Browser Changelog Data
 *
 * Naya version add karna ho toh bas VERSIONS array mein ek object add karo.
 * Har version mein categories hain, har category mein features hain.
 *
 * Feature types: 'new' | 'fix' | 'improve' | 'perf'
 * Badge types:   'latest' | 'stable' | 'old'
 */

const CHANGELOG_VERSIONS = [
  {
    id: 'v120',
    version: 'v1.2.0',
    badge: 'latest',
    name: 'Help & FAQ Update',
    date: 'March 2026',
    isCurrent: true,
    open: true,
    counts: { new: 1 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            label: 'Help & FAQ Section',
            desc: 'New dedicated Help & FAQ section in Settings with 35+ questions covering navigation, tabs, features, issues, shortcuts, privacy and updates. Full-text search, category filters, and expandable answers. Data-driven via faq.js — easy to update.',
            howto: 'Settings → Help & FAQ · Search any keyword or browse by category',
          },
        ],
      },
    ],
  },

  {
    id: 'v110',
    version: 'v1.1.0',
    badge: 'stable',
    name: 'Changelog Refactor Update',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 1, improve: 1 },
    categories: [
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          {
            type: 'improve',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            label: 'Changelog Extracted to Separate File',
            desc: 'Changelog data moved from settings.html into a dedicated changelog.js file. Each version is a plain JS object — no HTML editing needed. Stats (versions, features, fixes) auto-computed from data.',
            howto: 'Edit vortex/src/renderer/js/changelog.js to add new versions',
          },
        ],
      },
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
            label: 'Dynamic Changelog Renderer',
            desc: 'Changelog section is now fully data-driven. HTML is generated at runtime from CHANGELOG_VERSIONS array. Adding a new version requires zero HTML changes — just add a JS object with version, categories and features.',
            howto: 'Add a new object to CHANGELOG_VERSIONS in changelog.js',
          },
        ],
      },
    ],
  },

  {
    id: 'v101',
    version: 'v1.0.1',
    badge: 'stable',
    name: 'Network & YouTube Update',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 3, fix: 2 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            label: 'Network Speed Indicator',
            desc: 'Live bar at bottom of screen showing page load time, DNS+TCP+TTFB latency, transfer size and average download speed. Click to dismiss. Color-coded: green <500ms, yellow <2s, red >2s.',
            howto: 'Appears automatically on every page load — no setup needed',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/></svg>`,
            label: 'YouTube Ad Blocker',
            desc: 'Two-layer blocking: main process cancels ad network requests before they load, plus CSS hides all ad DOM elements (banner, overlay, in-feed, companion ads). Works on page load, navigation and SPA route changes.',
            howto: 'Toggle in Settings → YouTube → Ad Blocker',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
            label: 'Ad Speed Control + Auto-Skip',
            desc: 'Unskippable ads are muted and sped up (4x–256x). Skip button is auto-clicked the moment it appears. After ad ends, video is restored to normal speed and unmuted. If video pauses post-ad, it auto-resumes.',
            howto: 'Settings → YouTube → Ad Speed · Recommended: 16x for low-end PCs',
          },
        ],
      },
      {
        label: 'Bug Fixes',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
        features: [
          {
            type: 'fix',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            label: 'Version Display Fix',
            desc: 'About section showed "Version —" in packaged builds. Root cause: require("../../package.json") fails in asar. Fixed by using app.getVersion() as primary source.',
          },
          {
            type: 'fix',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            label: 'Settings Toggle Not Rendering',
            desc: 'YouTube section toggle used &lt;span class="slider"&gt; but CSS only defines .toggle-track. Fixed class mismatch — toggle now renders correctly.',
          },
        ],
      },
    ],
  },

  {
    id: 'v100',
    version: 'v1.0.0',
    badge: 'stable',
    name: 'Initial Release',
    date: 'March 2026 · First Public Build',
    isCurrent: false,
    open: false,
    counts: { new: 14 },
    categories: [
      {
        label: 'Browsing Core',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
            label: 'Multi-Tab Browser',
            desc: 'Full tab management — drag-drop reorder, tab sleep (auto-suspend after N mins), thumbnail hover previews, per-tab mute, lazy loading. Each tab has isolated webview with custom scrollbars.',
            howto: 'Ctrl+T new · Ctrl+W close · Ctrl+Tab switch · Settings → Performance → Tab Sleep',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
            label: 'Smart Omnibox',
            desc: 'Address bar with real-time Google search suggestions, smart URL vs search detection, 5 search engines (Google, Bing, DuckDuckGo, Brave, Ecosia), keyboard navigation through suggestions.',
            howto: 'Ctrl+L to focus · Settings → Search Engine',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
            label: 'Find in Page',
            desc: 'Full-text search within any webpage. Shows match count (e.g. 3/12), highlights all matches, previous/next navigation, no-match red highlight, clears on close.',
            howto: 'Ctrl+F · Enter next · Shift+Enter prev · Esc close',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
            label: 'Incognito Mode',
            desc: 'Separate purple-themed private window with fully isolated session partition. No history saved, no cookies shared with normal windows, no tab history tracking.',
            howto: 'Ctrl+Shift+N or File menu',
          },
        ],
      },
      {
        label: 'Productivity',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
            label: 'Command Palette',
            desc: 'Fuzzy-search launcher for all browser actions — open settings, new tab, incognito, zoom in/out/reset, mute tab, screenshot, summarize, translate, PiP and more. Arrow key navigation.',
            howto: 'Ctrl+Shift+P',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
            label: 'Bookmarks & History',
            desc: 'Full bookmark manager with favicon, search and bookmarks bar. Browsing history with per-tab tracking, favicon updates, title updates. Export/import both via Settings → Sync.',
            howto: 'Ctrl+D bookmark · Ctrl+Shift+B bar · Ctrl+H history',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            label: 'Download Manager',
            desc: 'Real-time download tracking with speed (smoothed 5-sample average), progress bar, percentage, open file/folder buttons. Supports cancel, remove from list. Badge count on toolbar icon.',
            howto: 'Toolbar download icon · Settings → Downloads for path/behavior',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            label: 'Quick Launch Panel',
            desc: 'Spotlight-style launcher with bookmarks grid, 50+ popular sites organized by category (Social, Dev, News, Shopping, Entertainment, Productivity), integrated omnibox with suggestions.',
            howto: 'Ctrl+Space or toolbar button',
          },
        ],
      },
      {
        label: 'AI & Content',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
            label: 'AI Page Summarizer',
            desc: 'Slide-out drawer summarizes any webpage. 4 providers: HuggingFace (free, no key), OpenAI (GPT-3.5/4), Ollama (local LLM), Extractive (offline, no AI). Copy or re-summarize anytime.',
            howto: 'Toolbar AI button or right-click → Summarize Page',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            label: 'Page Translator',
            desc: 'Auto-detects page language via HTML lang attribute + Google Translate API fallback. Non-intrusive bar appears only when page language ≠ your preferred language. Dismissed URLs remembered per session.',
            howto: 'Auto · Settings → Languages to set preferred language',
          },
        ],
      },
      {
        label: 'Media & Tools',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
            label: 'Picture-in-Picture Manager',
            desc: 'Auto-triggers PiP when switching away from a tab with playing video. Per-site allowlist. Removes YouTube\'s disablePictureInPicture block. Falls back to YouTube\'s native PiP button if needed.',
            howto: 'Auto on tab switch · Settings → Performance → PiP',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
            label: 'Screenshot Tool',
            desc: 'Capture visible viewport or full page (auto-scrolls + stitches via device emulation). Saves PNG via system dialog. Full-page clamped at 16384px to prevent memory issues.',
            howto: 'Ctrl+Shift+S or toolbar camera',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>`,
            label: 'WhatsApp Panel',
            desc: 'Persistent WhatsApp Web sidebar using dedicated persist:whatsapp partition — stays logged in across sessions. Fullscreen mode, refresh button. Toggle visibility from toolbar.',
            howto: 'WhatsApp button in toolbar · Settings → Appearance to show/hide',
          },
        ],
      },
      {
        label: 'System & Updates',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
        features: [
          {
            type: 'perf',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            label: 'GitHub-based Updater',
            desc: 'Browse last 30 commits from GitHub API, apply any commit — downloads all source files from raw.githubusercontent.com and restarts. SHA tracked in userData/.applied-sha for version comparison.',
            howto: 'Settings → Updates → Fetch Commits',
          },
          {
            type: 'perf',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            label: 'DNS Prefetch & Link Prefetch',
            desc: 'Pre-warms DNS for 9 top sites on startup via HEAD requests. Also reads &lt;link rel="prefetch"&gt; hints from loaded pages and prefetches them in background for instant next-page loads.',
            howto: 'Settings → Performance → Prefetch to toggle',
          },
        ],
      },
    ],
  },
];

// ── Stats auto-computed from data ──────────────────────────────────────────────
function _computeStats() {
  let versions = 0, features = 0, fixes = 0, improvements = 0;
  CHANGELOG_VERSIONS.forEach(v => {
    versions++;
    v.categories.forEach(cat => {
      cat.features.forEach(f => {
        if (f.type === 'new')     features++;
        else if (f.type === 'fix')     fixes++;
        else if (f.type === 'improve') improvements++;
      });
    });
  });
  return { versions, features, fixes, improvements };
}

// ── Tag label map ──────────────────────────────────────────────────────────────
const TAG_LABELS = { new: 'NEW', fix: 'FIX', improve: 'IMP', perf: 'SYS' };

// ── Render helpers ─────────────────────────────────────────────────────────────
function _renderFeature(f) {
  const howto = f.howto
    ? `<div class="cl-feat-howto">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${f.howto}
       </div>`
    : '';
  return `
    <div class="cl-feature-item">
      <div class="cl-feat-icon ${f.type}">${f.icon}</div>
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
  return `
    <div class="cl-category-label" ${mt}>${cat.icon} ${cat.label}</div>
    ${cat.features.map(_renderFeature).join('')}`;
}

function _renderCounts(counts) {
  return Object.entries(counts)
    .map(([type, n]) => `<span class="cl-count ${type}">${n} ${type}</span>`)
    .join('');
}

function _renderVersion(v) {
  const currentPill = v.isCurrent
    ? `<span class="cl-current-pill">● Current</span>`
    : '';
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
          ${v.categories.map((cat, i) => _renderCategory(cat, i === 0)).join('')}
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

// ── Main render function ───────────────────────────────────────────────────────
function renderChangelog() {
  const container = document.getElementById('sec-changelog');
  if (!container) return;

  const stats = _computeStats();
  const title = `<div class="section-title">What's New</div>`;
  const hero  = _renderHero(stats);
  const versions = CHANGELOG_VERSIONS.map(_renderVersion).join('');

  container.innerHTML = title + hero + versions;
}

// Auto-render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderChangelog);
} else {
  renderChangelog();
}
