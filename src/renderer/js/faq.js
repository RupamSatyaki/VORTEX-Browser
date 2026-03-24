/**
 * faq.js — Vortex Browser Help & FAQ
 *
 * Naya question add karna ho toh bas FAQ_DATA array mein entry add karo.
 * Categories: 'navigation' | 'tabs' | 'features' | 'issues' | 'shortcuts' | 'privacy' | 'updates'
 *
 * Each entry: { id, category, q, a, tags[] }
 * 'a' can contain basic HTML (code, strong, br)
 */

const FAQ_CATEGORIES = [
  { id: 'all',       label: 'All',           icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'navigation',label: 'Navigation',    icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
  { id: 'tabs',      label: 'Tabs',          icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>` },
  { id: 'features',  label: 'Features',      icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
  { id: 'issues',    label: 'Issues & Fixes', icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
  { id: 'shortcuts', label: 'Shortcuts',     icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { id: 'privacy',   label: 'Privacy',       icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { id: 'updates',   label: 'Updates',       icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>` },
];

const FAQ_DATA = [

  // ── NAVIGATION ──────────────────────────────────────────────────────────────
  {
    id: 'nav-1', category: 'navigation',
    q: 'How do I go to a website?',
    a: 'Click the address bar at the top (or press <code>Ctrl+L</code>), type a URL like <code>google.com</code> or a search term, then press <code>Enter</code>. Vortex auto-detects if it\'s a URL or a search query.',
    tags: ['address bar', 'url', 'navigate', 'open site'],
  },
  {
    id: 'nav-2', category: 'navigation',
    q: 'How do I go back or forward?',
    a: 'Click the <strong>← Back</strong> or <strong>→ Forward</strong> arrows in the toolbar. Keyboard: <code>Alt+Left</code> (back) and <code>Alt+Right</code> (forward). You can also right-click on the page for back/forward options.',
    tags: ['back', 'forward', 'history', 'navigate'],
  },
  {
    id: 'nav-3', category: 'navigation',
    q: 'How do I reload a page?',
    a: 'Press <code>Ctrl+R</code> for a normal reload, or <code>Ctrl+Shift+R</code> for a hard reload (clears cache for that page). You can also click the reload button (↺) in the toolbar.',
    tags: ['reload', 'refresh', 'hard reload', 'cache'],
  },
  {
    id: 'nav-4', category: 'navigation',
    q: 'How do I zoom in or out on a page?',
    a: 'Use <code>Ctrl++</code> to zoom in, <code>Ctrl+-</code> to zoom out, and <code>Ctrl+0</code> to reset to 100%. You can also use the Command Palette (<code>Ctrl+Shift+P</code>) and search "zoom".',
    tags: ['zoom', 'font size', 'scale', 'bigger', 'smaller'],
  },
  {
    id: 'nav-5', category: 'navigation',
    q: 'How do I open a link in a new tab?',
    a: 'Middle-click any link, or right-click → <strong>Open in New Tab</strong>. You can also hold <code>Ctrl</code> while clicking a link.',
    tags: ['new tab', 'link', 'open', 'middle click'],
  },
  {
    id: 'nav-6', category: 'navigation',
    q: 'How do I search within a page?',
    a: 'Press <code>Ctrl+F</code> to open Find in Page. Type your search term — all matches are highlighted. Use <code>Enter</code> / <code>Shift+Enter</code> to jump between matches. Press <code>Esc</code> to close.',
    tags: ['find', 'search', 'ctrl+f', 'highlight', 'text search'],
  },
  {
    id: 'nav-7', category: 'navigation',
    q: 'How do I set a homepage?',
    a: 'Go to <strong>Settings → On Startup</strong>, set Startup Behavior to <em>Open homepage</em>, then enter your URL in the Homepage URL field.',
    tags: ['homepage', 'startup', 'default page'],
  },

  // ── TABS ────────────────────────────────────────────────────────────────────
  {
    id: 'tab-1', category: 'tabs',
    q: 'How do I open a new tab?',
    a: 'Press <code>Ctrl+T</code> or click the <strong>+</strong> button at the end of the tab bar.',
    tags: ['new tab', 'open tab', 'ctrl+t'],
  },
  {
    id: 'tab-2', category: 'tabs',
    q: 'How do I close a tab?',
    a: 'Press <code>Ctrl+W</code>, or click the <strong>✕</strong> on the tab. Middle-clicking a tab also closes it.',
    tags: ['close tab', 'ctrl+w'],
  },
  {
    id: 'tab-3', category: 'tabs',
    q: 'How do I switch between tabs?',
    a: 'Press <code>Ctrl+Tab</code> to go to the next tab, <code>Ctrl+Shift+Tab</code> for the previous tab. You can also click any tab directly.',
    tags: ['switch tab', 'next tab', 'previous tab'],
  },
  {
    id: 'tab-4', category: 'tabs',
    q: 'How do I reorder tabs?',
    a: 'Click and drag a tab left or right to reorder it. Drop it at the desired position.',
    tags: ['reorder', 'drag', 'move tab'],
  },
  {
    id: 'tab-5', category: 'tabs',
    q: 'What is Tab Sleep and how does it work?',
    a: 'Tab Sleep automatically suspends background tabs after a period of inactivity to save memory. The tab\'s webview is unloaded but the tab stays in the bar. Clicking it reloads the page.<br><br>Enable/disable in <strong>Settings → Performance → Tab Sleep</strong>. You can also set the sleep timer (5–60 mins).',
    tags: ['tab sleep', 'suspend', 'memory', 'inactive', 'background'],
  },
  {
    id: 'tab-6', category: 'tabs',
    q: 'How do I mute a tab?',
    a: 'Right-click the tab and select <strong>Mute Tab</strong>, or use the Command Palette (<code>Ctrl+Shift+P</code>) and search "mute". A muted tab shows a 🔇 icon.',
    tags: ['mute', 'sound', 'audio', 'tab mute'],
  },
  {
    id: 'tab-7', category: 'tabs',
    q: 'How do I see a preview of a tab before switching?',
    a: 'Hover over any tab for ~600ms — a thumbnail preview will appear showing the current page content. You can disable this in <strong>Settings → Appearance → Show Tab Previews</strong>.',
    tags: ['tab preview', 'thumbnail', 'hover'],
  },

  // ── FEATURES ────────────────────────────────────────────────────────────────
  {
    id: 'feat-1', category: 'features',
    q: 'How do I use the AI Page Summarizer?',
    a: 'Click the AI button in the toolbar (or right-click → Summarize Page). A drawer slides out with a summary of the current page.<br><br>You can choose the AI provider in the summarizer panel: <strong>HuggingFace</strong> (free, no API key), <strong>OpenAI</strong> (needs key), <strong>Ollama</strong> (local), or <strong>Extractive</strong> (offline, no AI).',
    tags: ['summarize', 'ai', 'summary', 'huggingface', 'openai', 'ollama'],
  },
  {
    id: 'feat-2', category: 'features',
    q: 'How do I take a screenshot?',
    a: 'Press <code>Ctrl+Shift+S</code> or click the camera icon in the toolbar. Choose <strong>Visible Area</strong> (current viewport) or <strong>Full Page</strong> (entire scrollable page). The PNG is saved via a system save dialog.',
    tags: ['screenshot', 'capture', 'full page', 'camera'],
  },
  {
    id: 'feat-3', category: 'features',
    q: 'How does Picture-in-Picture (PiP) work?',
    a: 'When you switch away from a tab that has a playing video, Vortex auto-triggers PiP so the video floats over other windows.<br><br>You can control this in <strong>Settings → Performance → Picture in Picture</strong>. You can also set an allowlist of sites that can trigger PiP.',
    tags: ['pip', 'picture in picture', 'floating video', 'video'],
  },
  {
    id: 'feat-4', category: 'features',
    q: 'How do I use the WhatsApp panel?',
    a: 'Click the WhatsApp button in the toolbar. A sidebar opens with WhatsApp Web. It uses a dedicated session so you stay logged in across restarts.<br><br>You can show/hide the toolbar button in <strong>Settings → Appearance → Show WhatsApp Button</strong>.',
    tags: ['whatsapp', 'panel', 'sidebar', 'chat'],
  },
  {
    id: 'feat-5', category: 'features',
    q: 'How do I use the Command Palette?',
    a: 'Press <code>Ctrl+Shift+P</code> to open the Command Palette. Start typing to fuzzy-search all browser actions — new tab, zoom, mute, screenshot, summarize, settings, and more. Use arrow keys to navigate, Enter to run.',
    tags: ['command palette', 'ctrl+shift+p', 'actions', 'launcher'],
  },
  {
    id: 'feat-6', category: 'features',
    q: 'How do I translate a page?',
    a: 'Vortex auto-detects the page language. If it differs from your preferred language, a translation bar appears at the top. Click <strong>Translate</strong> to open the page in Google Translate.<br><br>Set your preferred language in <strong>Settings → Languages</strong>.',
    tags: ['translate', 'language', 'translation bar'],
  },
  {
    id: 'feat-7', category: 'features',
    q: 'How do I use the Quick Launch panel?',
    a: 'Press <code>Ctrl+Space</code> or click the grid icon in the toolbar. A spotlight-style panel opens with your bookmarks and 50+ popular sites organized by category. You can also search from it directly.',
    tags: ['quick launch', 'ctrl+space', 'launcher', 'sites', 'bookmarks'],
  },
  {
    id: 'feat-8', category: 'features',
    q: 'How do I manage bookmarks?',
    a: 'Press <code>Ctrl+D</code> to bookmark the current page. Open the bookmarks panel with <code>Ctrl+B</code> or the toolbar icon. Toggle the bookmarks bar with <code>Ctrl+Shift+B</code>.<br><br>Export/import bookmarks via <strong>Settings → Sync & Backup</strong>.',
    tags: ['bookmarks', 'ctrl+d', 'bookmark bar', 'save page'],
  },
  {
    id: 'feat-9', category: 'features',
    q: 'How do I view my browsing history?',
    a: 'Press <code>Ctrl+H</code> or click the history icon in the toolbar. The history panel shows all visited pages with favicons, titles and timestamps. You can search and clear history from there.',
    tags: ['history', 'ctrl+h', 'visited', 'browsing history'],
  },
  {
    id: 'feat-10', category: 'features',
    q: 'How does the YouTube Ad Blocker work?',
    a: 'Vortex uses two layers: the main process blocks ad network requests before they load, and CSS hides all ad DOM elements. Unskippable ads are muted, sped up (configurable 4x–256x), and the skip button is auto-clicked.<br><br>Toggle in <strong>Settings → YouTube → Ad Blocker</strong>. Set speed in <strong>Ad Speed</strong> (16x recommended for low-end PCs).',
    tags: ['youtube', 'ad blocker', 'ads', 'skip ad', 'ad speed'],
  },
  {
    id: 'feat-11', category: 'features',
    q: 'How do I open an Incognito window?',
    a: 'Press <code>Ctrl+Shift+N</code> or go to <strong>File menu → New Incognito Window</strong>. Incognito opens a separate purple-themed window with a fully isolated session — no history, no shared cookies.',
    tags: ['incognito', 'private', 'ctrl+shift+n', 'private window'],
  },
  {
    id: 'feat-12', category: 'features',
    q: 'What is the Network Speed Indicator?',
    a: 'After every page load, a bar appears at the bottom showing: load time, DNS+TCP+TTFB latency, transfer size, and average download speed. Color-coded: <strong style="color:#22c55e">green</strong> &lt;500ms, <strong style="color:#eab308">yellow</strong> &lt;2s, <strong style="color:#ef4444">red</strong> &gt;2s. Click it to dismiss.',
    tags: ['network', 'speed', 'latency', 'load time', 'net status'],
  },

  // ── ISSUES & FIXES ──────────────────────────────────────────────────────────
  {
    id: 'issue-1', category: 'issues',
    q: 'Page is not loading / showing blank',
    a: 'Try these steps in order:<br>1. Press <code>Ctrl+R</code> to reload<br>2. Press <code>Ctrl+Shift+R</code> for a hard reload (clears cache)<br>3. Check your internet connection<br>4. Try opening the URL in a new tab<br>5. If it\'s a specific site, it may be down — check <a href="https://downdetector.com" style="color:#00c8b4">downdetector.com</a>',
    tags: ['blank page', 'not loading', 'white screen', 'page error'],
  },
  {
    id: 'issue-2', category: 'issues',
    q: 'Video is freezing or not playing after a YouTube ad',
    a: 'This is a known issue with high ad speeds on low-end PCs. Fix: go to <strong>Settings → YouTube → Ad Speed</strong> and set it to <strong>16x or lower</strong>. The video should resume normally after the ad.',
    tags: ['youtube', 'video freeze', 'ad speed', 'video not playing'],
  },
  {
    id: 'issue-3', category: 'issues',
    q: 'Settings are not saving / resetting on restart',
    a: 'Settings are stored in <code>%APPDATA%\\vortex\\storage\\settings.json</code>. If this file is missing or corrupted, settings reset to defaults.<br><br>Check if the file exists. If Vortex can\'t write to AppData, try running it as administrator once to create the file.',
    tags: ['settings not saving', 'reset', 'storage', 'appdata'],
  },
  {
    id: 'issue-4', category: 'issues',
    q: 'Version shows "—" or wrong version in About section',
    a: 'This was a bug in v1.0.0 where <code>require(package.json)</code> failed inside asar packages. Fixed in v1.0.1 — the app now uses <code>app.getVersion()</code> which always works. Update to v1.0.1 or later.',
    tags: ['version', 'about', 'wrong version', 'asar'],
  },
  {
    id: 'issue-5', category: 'issues',
    q: 'WhatsApp panel keeps logging me out',
    a: 'WhatsApp Web uses a dedicated <code>persist:whatsapp</code> session partition that survives restarts. If you\'re being logged out, it may be because:<br>1. You cleared browsing data (Settings → Privacy → Clear Now clears all sessions)<br>2. WhatsApp Web logged you out from your phone<br><br>Re-scan the QR code to log back in.',
    tags: ['whatsapp', 'logout', 'session', 'qr code'],
  },
  {
    id: 'issue-6', category: 'issues',
    q: 'Tab preview thumbnails are not showing',
    a: 'Tab previews require the tab to have loaded at least once. If a tab was just opened or is sleeping, no preview is available yet.<br><br>Also check <strong>Settings → Appearance → Show Tab Previews</strong> is enabled.',
    tags: ['tab preview', 'thumbnail', 'not showing'],
  },
  {
    id: 'issue-7', category: 'issues',
    q: 'Downloads are not starting or failing',
    a: 'Check your download folder path in <strong>Settings → Downloads → Change Folder</strong>. If the path no longer exists (e.g. external drive disconnected), downloads will fail silently.<br><br>Also check if "Ask Where to Save" is enabled — if so, a dialog should appear for each download.',
    tags: ['download', 'not downloading', 'download failed', 'download path'],
  },
  {
    id: 'issue-8', category: 'issues',
    q: 'Browser is slow or using too much memory',
    a: 'Try these:<br>1. Enable <strong>Tab Sleep</strong> (Settings → Performance) — suspends inactive tabs<br>2. Reduce <strong>Cache Size</strong> if disk space is low<br>3. Close unused tabs<br>4. Disable <strong>Hardware Acceleration</strong> if GPU is causing issues<br>5. Disable <strong>Preload Pages</strong> if on a slow connection',
    tags: ['slow', 'memory', 'performance', 'lag', 'ram'],
  },
  {
    id: 'issue-9', category: 'issues',
    q: 'PiP (Picture-in-Picture) is not triggering automatically',
    a: 'Auto-PiP triggers when you switch away from a tab with a playing video. Make sure:<br>1. <strong>Settings → Performance → Picture in Picture</strong> is enabled<br>2. The video is actually playing (not paused) when you switch tabs<br>3. If you have a PiP allowlist set, the site must be in it',
    tags: ['pip', 'picture in picture', 'not working', 'auto pip'],
  },

  // ── SHORTCUTS ───────────────────────────────────────────────────────────────
  {
    id: 'short-1', category: 'shortcuts',
    q: 'What are all the keyboard shortcuts?',
    a: 'Full list in <strong>Settings → Keyboard Shortcuts</strong>. Key ones:<br><code>Ctrl+T</code> New tab · <code>Ctrl+W</code> Close tab · <code>Ctrl+L</code> Address bar · <code>Ctrl+F</code> Find · <code>Ctrl+H</code> History · <code>Ctrl+D</code> Bookmark · <code>Ctrl+Shift+P</code> Command Palette · <code>Ctrl+Shift+N</code> Incognito · <code>Ctrl+Shift+S</code> Screenshot · <code>F11</code> Fullscreen · <code>F12</code> DevTools',
    tags: ['shortcuts', 'keyboard', 'hotkeys', 'keybindings'],
  },
  {
    id: 'short-2', category: 'shortcuts',
    q: 'How do I open Developer Tools?',
    a: 'Press <code>F12</code> on any page to open Chromium DevTools for that webview. This gives you the full Elements, Console, Network, Sources panels.',
    tags: ['devtools', 'developer tools', 'f12', 'inspect', 'console'],
  },
  {
    id: 'short-3', category: 'shortcuts',
    q: 'How do I enter fullscreen?',
    a: 'Press <code>F11</code> to toggle fullscreen mode. Press <code>F11</code> again or <code>Esc</code> to exit.',
    tags: ['fullscreen', 'f11', 'full screen'],
  },

  // ── PRIVACY ─────────────────────────────────────────────────────────────────
  {
    id: 'priv-1', category: 'privacy',
    q: 'How do I clear my browsing data?',
    a: 'Go to <strong>Settings → Privacy & Security → Clear Browsing Data → Clear Now</strong>. This clears history, cache, and cookies for all sessions.',
    tags: ['clear data', 'clear history', 'clear cache', 'cookies', 'privacy'],
  },
  {
    id: 'priv-2', category: 'privacy',
    q: 'Does Incognito mode make me anonymous?',
    a: 'Incognito prevents Vortex from saving your history, cookies, and session data locally. However, your ISP, network admin, and the websites you visit can still see your activity. It\'s private from other users of the same device, not from the internet.',
    tags: ['incognito', 'anonymous', 'private', 'tracking'],
  },
  {
    id: 'priv-3', category: 'privacy',
    q: 'What does "Block Trackers" do?',
    a: 'When enabled (Settings → Privacy), Vortex blocks known tracking scripts from loading. This reduces cross-site tracking and can speed up page loads. It uses a blocklist of known tracker domains.',
    tags: ['trackers', 'block trackers', 'privacy', 'tracking scripts'],
  },
  {
    id: 'priv-4', category: 'privacy',
    q: 'Where is my data stored?',
    a: 'All Vortex data is stored locally on your device:<br>• Settings: <code>%APPDATA%\\vortex\\storage\\settings.json</code><br>• Profile: <code>%APPDATA%\\vortex\\storage\\profile.json</code><br>• History: <code>%APPDATA%\\vortex\\storage\\tab_history.json</code><br>• Sessions: Electron\'s default userData directory<br><br>No data is sent to any server.',
    tags: ['data', 'storage', 'appdata', 'local', 'where is data'],
  },

  // ── UPDATES ─────────────────────────────────────────────────────────────────
  {
    id: 'upd-1', category: 'updates',
    q: 'How do I update Vortex?',
    a: 'Go to <strong>Settings → Updates → Fetch Commits</strong>. Vortex fetches the last 30 commits from GitHub. Click <strong>Apply</strong> on any commit to update. The app downloads the source files and restarts automatically.',
    tags: ['update', 'upgrade', 'new version', 'fetch commits'],
  },
  {
    id: 'upd-2', category: 'updates',
    q: 'Update says "Unable to fetch commits" — what do I do?',
    a: 'This is usually a network issue. Try:<br>1. Check your internet connection<br>2. Try again 2–3 times — it may be a temporary GitHub API hiccup<br>3. If it keeps failing, GitHub API may be rate-limiting you (60 req/hr for unauthenticated). Wait an hour and try again.',
    tags: ['update error', 'fetch failed', 'github', 'rate limit'],
  },
  {
    id: 'upd-3', category: 'updates',
    q: 'How do I check the current version?',
    a: 'Go to <strong>Settings → About Vortex</strong>. The version number and latest applied commit SHA are shown there.',
    tags: ['version', 'current version', 'about', 'check version'],
  },
];

// ── Render ─────────────────────────────────────────────────────────────────────

let _faqActive = 'all';
let _faqSearch = '';
let _faqOpen   = null;

function _faqMatches(item) {
  const q = _faqSearch.toLowerCase().trim();
  if (!q) return _faqActive === 'all' || item.category === _faqActive;
  const inCat = _faqActive === 'all' || item.category === _faqActive;
  const inText = item.q.toLowerCase().includes(q) ||
                 item.a.toLowerCase().includes(q) ||
                 item.tags.some(t => t.includes(q));
  return inCat && inText;
}

function _highlight(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:rgba(0,200,180,0.25);color:#00c8b4;border-radius:2px;">$1</mark>');
}

function _renderItem(item) {
  const isOpen = _faqOpen === item.id;
  const q = _faqSearch.trim();
  const qText = _highlight(item.q, q);
  const catObj = FAQ_CATEGORIES.find(c => c.id === item.category);
  const catLabel = catObj ? catObj.label : item.category;

  return `
    <div class="faq-item ${isOpen ? 'open' : ''}" id="faq-${item.id}" onclick="faqToggle('${item.id}')">
      <div class="faq-q">
        <div class="faq-q-text">${qText}</div>
        <div class="faq-q-right">
          <span class="faq-cat-pill">${catLabel}</span>
          <svg class="faq-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="faq-a">
        <div class="faq-a-inner">${item.a}</div>
      </div>
    </div>`;
}

function _renderFaq() {
  const container = document.getElementById('sec-faq');
  if (!container) return;

  const filtered = FAQ_DATA.filter(_faqMatches);
  const q = _faqSearch.trim();

  const catTabs = FAQ_CATEGORIES.map(c => {
    const count = c.id === 'all' ? FAQ_DATA.length : FAQ_DATA.filter(i => i.category === c.id).length;
    return `<button class="faq-cat-tab ${_faqActive === c.id ? 'active' : ''}" onclick="faqSetCat('${c.id}')">
      ${c.icon} ${c.label} <span class="faq-cat-count">${count}</span>
    </button>`;
  }).join('');

  const items = filtered.length
    ? filtered.map(_renderItem).join('')
    : `<div class="faq-empty">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2e6060" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <div>No results for "<strong style="color:#c8e8e5">${q}</strong>"</div>
        <div style="font-size:11px;color:#2e6060;margin-top:4px;">Try different keywords or browse a category</div>
       </div>`;

  container.innerHTML = `
    <div class="section-title">Help &amp; FAQ</div>

    <!-- Search bar -->
    <div class="faq-search-wrap">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4a8080" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="faq-search" id="faq-search-input" type="text" placeholder="Search questions, features, issues…" value="${_faqSearch}" oninput="faqOnSearch(this.value)" />
      ${q ? `<button class="faq-search-clear" onclick="faqOnSearch('')">✕</button>` : ''}
    </div>

    <!-- Category tabs -->
    <div class="faq-cats">${catTabs}</div>

    <!-- Stats bar -->
    <div class="faq-stats">
      ${filtered.length} of ${FAQ_DATA.length} questions
      ${q ? `· matching "<strong style="color:#00c8b4">${q}</strong>"` : ''}
    </div>

    <!-- Items -->
    <div class="faq-list">${items}</div>
  `;

  // Re-focus search input if it was active
  if (q || document.activeElement && document.activeElement.id === 'faq-search-input') {
    const inp = document.getElementById('faq-search-input');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────
function faqToggle(id) {
  _faqOpen = _faqOpen === id ? null : id;
  _renderFaq();
}

function faqSetCat(cat) {
  _faqActive = cat;
  _faqOpen = null;
  _renderFaq();
}

function faqOnSearch(val) {
  _faqSearch = val;
  _faqOpen = null;
  _renderFaq();
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const FAQ_CSS = `
  .faq-search-wrap {
    display: flex; align-items: center; gap: 10px;
    background: #122222; border: 1px solid #1e3838; border-radius: 10px;
    padding: 10px 14px; margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .faq-search-wrap:focus-within { border-color: #00c8b4; }
  .faq-search {
    flex: 1; background: transparent; border: none; outline: none;
    color: #c8e8e5; font-size: 13px;
  }
  .faq-search::placeholder { color: #2e6060; }
  .faq-search-clear {
    background: none; border: none; color: #4a8080; cursor: pointer;
    font-size: 13px; padding: 0 2px; line-height: 1;
  }
  .faq-search-clear:hover { color: #c8e8e5; }

  .faq-cats {
    display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
  }
  .faq-cat-tab {
    display: inline-flex; align-items: center; gap: 5px;
    background: #122222; border: 1px solid #1e3838; border-radius: 20px;
    color: #4a8080; font-size: 11.5px; padding: 5px 12px; cursor: pointer;
    transition: all 0.15s; white-space: nowrap;
  }
  .faq-cat-tab:hover { background: #162e2e; color: #c8e8e5; }
  .faq-cat-tab.active { background: rgba(0,200,180,0.12); border-color: rgba(0,200,180,0.35); color: #00c8b4; }
  .faq-cat-count {
    background: rgba(0,0,0,0.3); border-radius: 10px;
    padding: 0 5px; font-size: 10px; color: inherit;
  }

  .faq-stats {
    font-size: 11px; color: #2e6060; margin-bottom: 10px; padding: 0 2px;
  }

  .faq-list { display: flex; flex-direction: column; gap: 6px; }

  .faq-item {
    background: #122222; border: 1px solid #1e3838; border-radius: 10px;
    overflow: hidden; cursor: pointer;
    animation: faq-in 0.25s ease both;
    transition: border-color 0.15s;
  }
  @keyframes faq-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .faq-item:hover { border-color: #2e5050; }
  .faq-item.open  { border-color: rgba(0,200,180,0.3); }

  .faq-q {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 13px 16px;
    transition: background 0.12s;
  }
  .faq-item:hover .faq-q { background: #162e2e; }
  .faq-item.open .faq-q  { background: rgba(0,200,180,0.05); }

  .faq-q-text { font-size: 13px; color: #c8e8e5; font-weight: 500; flex: 1; }
  .faq-q-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  .faq-cat-pill {
    font-size: 10px; padding: 2px 8px; border-radius: 10px;
    background: rgba(0,200,180,0.08); color: #4a8080; border: 1px solid #1e3838;
  }
  .faq-item.open .faq-cat-pill { color: #00c8b4; border-color: rgba(0,200,180,0.2); }

  .faq-arrow { color: #2e6060; transition: transform 0.25s ease; flex-shrink: 0; }
  .faq-item.open .faq-arrow { transform: rotate(180deg); color: #00c8b4; }

  .faq-a {
    max-height: 0; overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
    border-top: 0px solid #1a3030;
  }
  .faq-item.open .faq-a {
    max-height: 600px; border-top-width: 1px;
  }
  .faq-a-inner {
    padding: 14px 16px; font-size: 12.5px; color: #7aadad;
    line-height: 1.7;
  }
  .faq-a-inner code {
    background: #0d2a2a; padding: 1px 6px; border-radius: 4px;
    font-size: 11.5px; color: #00c8b4; font-family: monospace;
  }
  .faq-a-inner strong { color: #c8e8e5; }
  .faq-a-inner a { color: #00c8b4; }

  .faq-empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 40px 20px; color: #4a8080; font-size: 13px;
    text-align: center;
  }
`;

(function injectFaqCss() {
  const style = document.createElement('style');
  style.textContent = FAQ_CSS;
  document.head.appendChild(style);
})();

// ── Init ───────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _renderFaq);
} else {
  _renderFaq();
}
