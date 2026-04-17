/**
 * settings/sections/faq/ui/faqData.js
 * FAQ categories and Q&A data — extracted from faq.js
 */

const FaqData = (() => {

  const CATEGORIES = [
    { id: 'all',        label: 'All',            icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
    { id: 'navigation', label: 'Navigation',     icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
    { id: 'tabs',       label: 'Tabs',           icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>` },
    { id: 'features',  label: 'Features',       icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    { id: 'issues',    label: 'Issues & Fixes',  icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
    { id: 'shortcuts', label: 'Shortcuts',       icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
    { id: 'privacy',   label: 'Privacy',         icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
    { id: 'updates',   label: 'Updates',         icon: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>` },
  ];

  const ITEMS = [
    // NAVIGATION
    { id:'nav-1', category:'navigation', q:'How do I go to a website?', a:'Click the address bar at the top (or press <code>Ctrl+L</code>), type a URL like <code>google.com</code> or a search term, then press <code>Enter</code>. Vortex auto-detects if it\'s a URL or a search query.', tags:['address bar','url','navigate','open site'] },
    { id:'nav-2', category:'navigation', q:'How do I go back or forward?', a:'Click the <strong>← Back</strong> or <strong>→ Forward</strong> arrows in the toolbar. Keyboard: <code>Alt+Left</code> (back) and <code>Alt+Right</code> (forward).', tags:['back','forward','history','navigate'] },
    { id:'nav-3', category:'navigation', q:'How do I reload a page?', a:'Press <code>Ctrl+R</code> for a normal reload, or <code>Ctrl+Shift+R</code> for a hard reload (clears cache for that page).', tags:['reload','refresh','hard reload','cache'] },
    { id:'nav-4', category:'navigation', q:'How do I zoom in or out on a page?', a:'Use <code>Ctrl++</code> to zoom in, <code>Ctrl+-</code> to zoom out, and <code>Ctrl+0</code> to reset to 100%.', tags:['zoom','font size','scale','bigger','smaller'] },
    { id:'nav-5', category:'navigation', q:'How do I open a link in a new tab?', a:'Middle-click any link, or right-click → <strong>Open in New Tab</strong>. You can also hold <code>Ctrl</code> while clicking a link.', tags:['new tab','link','open','middle click'] },
    { id:'nav-6', category:'navigation', q:'How do I search within a page?', a:'Press <code>Ctrl+F</code> to open Find in Page. Type your search term — all matches are highlighted.', tags:['find','search','ctrl+f','highlight','text search'] },
    { id:'nav-7', category:'navigation', q:'How do I set a homepage?', a:'Go to <strong>Settings → On Startup</strong>, set Startup Behavior to <em>Open homepage</em>, then enter your URL in the Homepage URL field.', tags:['homepage','startup','default page'] },
    // TABS
    { id:'tab-1', category:'tabs', q:'How do I open a new tab?', a:'Press <code>Ctrl+T</code> or click the <strong>+</strong> button at the end of the tab bar.', tags:['new tab','open tab','ctrl+t'] },
    { id:'tab-2', category:'tabs', q:'How do I close a tab?', a:'Press <code>Ctrl+W</code>, or click the <strong>✕</strong> on the tab. Middle-clicking a tab also closes it.', tags:['close tab','ctrl+w'] },
    { id:'tab-3', category:'tabs', q:'How do I switch between tabs?', a:'Press <code>Ctrl+Tab</code> to go to the next tab, <code>Ctrl+Shift+Tab</code> for the previous tab.', tags:['switch tab','next tab','previous tab'] },
    { id:'tab-4', category:'tabs', q:'How do I reorder tabs?', a:'Click and drag a tab left or right to reorder it. Drop it at the desired position.', tags:['reorder','drag','move tab'] },
    { id:'tab-5', category:'tabs', q:'What is Tab Sleep and how does it work?', a:'Tab Sleep automatically suspends background tabs after a period of inactivity to save memory.<br><br>Enable/disable in <strong>Settings → Performance → Tab Sleep</strong>.', tags:['tab sleep','suspend','memory','inactive','background'] },
    { id:'tab-6', category:'tabs', q:'How do I mute a tab?', a:'Right-click the tab and select <strong>Mute Tab</strong>, or use the Command Palette (<code>Ctrl+Shift+P</code>) and search "mute".', tags:['mute','sound','audio','tab mute'] },
    { id:'tab-7', category:'tabs', q:'How do I see a preview of a tab before switching?', a:'Hover over any tab for ~600ms — a thumbnail preview will appear. You can disable this in <strong>Settings → Appearance → Show Tab Previews</strong>.', tags:['tab preview','thumbnail','hover'] },
    // FEATURES
    { id:'feat-1', category:'features', q:'How do I use the AI Page Summarizer?', a:'Click the AI button in the toolbar. A drawer slides out with a summary of the current page. Choose provider: HuggingFace (free), OpenAI, Ollama, or Extractive (offline).', tags:['summarize','ai','summary','huggingface','openai','ollama'] },
    { id:'feat-2', category:'features', q:'How do I take a screenshot?', a:'Press <code>Ctrl+Shift+S</code> or click the camera icon. Choose <strong>Visible Area</strong> or <strong>Full Page</strong>.', tags:['screenshot','capture','full page','camera'] },
    { id:'feat-3', category:'features', q:'How does Picture-in-Picture (PiP) work?', a:'When you switch away from a tab with a playing video, Vortex auto-triggers PiP. Control in <strong>Settings → Performance → Picture in Picture</strong>.', tags:['pip','picture in picture','floating video','video'] },
    { id:'feat-4', category:'features', q:'How do I use the WhatsApp panel?', a:'Click the WhatsApp button in the toolbar. A sidebar opens with WhatsApp Web using a dedicated persistent session.', tags:['whatsapp','panel','sidebar','chat'] },
    { id:'feat-5', category:'features', q:'How do I use the Command Palette?', a:'Press <code>Ctrl+Shift+P</code> to open the Command Palette. Start typing to fuzzy-search all browser actions.', tags:['command palette','ctrl+shift+p','actions','launcher'] },
    { id:'feat-6', category:'features', q:'How do I translate a page?', a:'Vortex auto-detects the page language. If it differs from your preferred language, a translation bar appears. Set your language in <strong>Settings → Languages</strong>.', tags:['translate','language','translation bar'] },
    { id:'feat-7', category:'features', q:'How do I use the Quick Launch panel?', a:'Press <code>Ctrl+Space</code>. A spotlight-style panel opens with your bookmarks and 50+ popular sites.', tags:['quick launch','ctrl+space','launcher','sites','bookmarks'] },
    { id:'feat-8', category:'features', q:'How do I manage bookmarks?', a:'Press <code>Ctrl+D</code> to bookmark. Open bookmarks with <code>Ctrl+B</code>. Export/import via <strong>Settings → Sync & Backup</strong>.', tags:['bookmarks','ctrl+d','bookmark bar','save page'] },
    { id:'feat-9', category:'features', q:'How do I view my browsing history?', a:'Press <code>Ctrl+H</code> or click the history icon. The history panel shows all visited pages with search and clear options.', tags:['history','ctrl+h','visited','browsing history'] },
    { id:'feat-10', category:'features', q:'How does the YouTube Ad Blocker work?', a:'Two layers: network-level ad blocking + CSS hiding. Unskippable ads are muted, sped up (4x–256x), and auto-skipped.<br><br>Toggle in <strong>Settings → YouTube</strong>.', tags:['youtube','ad blocker','ads','skip ad','ad speed'] },
    { id:'feat-11', category:'features', q:'How do I open an Incognito window?', a:'Press <code>Ctrl+Shift+N</code>. Incognito opens a separate purple-themed window with a fully isolated session.', tags:['incognito','private','ctrl+shift+n','private window'] },
    // ISSUES
    { id:'issue-1', category:'issues', q:'Page is not loading / showing blank', a:'Try: 1. <code>Ctrl+R</code> reload 2. <code>Ctrl+Shift+R</code> hard reload 3. Check internet connection 4. Try a new tab 5. Site may be down.', tags:['blank page','not loading','white screen','page error'] },
    { id:'issue-2', category:'issues', q:'Video is freezing after a YouTube ad', a:'Go to <strong>Settings → YouTube → Ad Speed</strong> and set it to <strong>16x or lower</strong>.', tags:['youtube','video freeze','ad speed','video not playing'] },
    { id:'issue-3', category:'issues', q:'Settings are not saving / resetting on restart', a:'Settings are stored in <code>%APPDATA%\\vortex\\storage\\settings.json</code>. If missing or corrupted, settings reset to defaults.', tags:['settings not saving','reset','storage','appdata'] },
    { id:'issue-4', category:'issues', q:'Downloads are not starting or failing', a:'Check your download folder path in <strong>Settings → Downloads → Change Folder</strong>. If the path no longer exists, downloads will fail.', tags:['download','not downloading','download failed','download path'] },
    { id:'issue-5', category:'issues', q:'Browser is slow or using too much memory', a:'Enable <strong>Tab Sleep</strong>, reduce Cache Size, close unused tabs, or disable Hardware Acceleration.', tags:['slow','memory','performance','lag','ram'] },
    // SHORTCUTS
    { id:'short-1', category:'shortcuts', q:'What are all the keyboard shortcuts?', a:'Full list in <strong>Settings → Keyboard Shortcuts</strong>. Key ones: <code>Ctrl+T</code> New tab · <code>Ctrl+W</code> Close · <code>Ctrl+L</code> Address bar · <code>Ctrl+F</code> Find · <code>Ctrl+Shift+P</code> Command Palette · <code>F12</code> DevTools', tags:['shortcuts','keyboard','hotkeys','keybindings'] },
    { id:'short-2', category:'shortcuts', q:'How do I open Developer Tools?', a:'Press <code>F12</code> on any page to open Chromium DevTools for that webview.', tags:['devtools','developer tools','f12','inspect','console'] },
    { id:'short-3', category:'shortcuts', q:'How do I enter fullscreen?', a:'Press <code>F11</code> to toggle fullscreen mode. Press <code>F11</code> again or <code>Esc</code> to exit.', tags:['fullscreen','f11','full screen'] },
    // PRIVACY
    { id:'priv-1', category:'privacy', q:'How do I clear my browsing data?', a:'Go to <strong>Settings → Privacy & Security → Clear Browsing Data → Clear Now</strong>.', tags:['clear data','clear history','clear cache','cookies','privacy'] },
    { id:'priv-2', category:'privacy', q:'Does Incognito mode make me anonymous?', a:'Incognito prevents Vortex from saving history locally. However, your ISP and websites can still see your activity.', tags:['incognito','anonymous','private','tracking'] },
    { id:'priv-3', category:'privacy', q:'What does "Block Trackers" do?', a:'Blocks known tracking scripts from loading. Reduces cross-site tracking and can speed up page loads.', tags:['trackers','block trackers','privacy','tracking scripts'] },
    { id:'priv-4', category:'privacy', q:'Where is my data stored?', a:'All data is stored locally: Settings in <code>%APPDATA%\\vortex\\storage\\settings.json</code>, Profile in <code>profile.json</code>, History in <code>tab_history.json</code>. No data is sent to any server.', tags:['data','storage','appdata','local','where is data'] },
    // UPDATES
    { id:'upd-1', category:'updates', q:'How do I update Vortex?', a:'Go to <strong>Settings → Updates</strong>. Check for a new release and click <strong>Download Installer</strong> to get the latest version.', tags:['update','upgrade','new version','installer'] },
    { id:'upd-2', category:'updates', q:'How do I check the current version?', a:'Go to <strong>Settings → About Vortex</strong>. The version number is shown there.', tags:['version','current version','about','check version'] },
  ];

  return { CATEGORIES, ITEMS };

})();
