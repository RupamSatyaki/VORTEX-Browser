/**
 * settings/sections/appearance/ui/themeSelector.js
 * HTML for background theme accordion — pure HTML, no logic.
 */

const ThemeSelectorUI = (() => {

  const BG_THEMES = [
    {
      id: 'teal', name: 'Teal', desc: 'Classic dark teal — default',
      vars: {
        '--bg-base':'#1a2e2e','--bg-surface':'#22383a','--bg-tab':'#1c2f30',
        '--bg-tab-active':'#36676c','--bg-hover':'#253f40','--bg-panel':'#0f2222',
        '--bg-deep':'#0d1f1f','--bg-input':'#22383a','--bg-border':'#2e4a4c',
        '--bg-border2':'#1e3838','--text-main':'#c8e8e5','--text-muted':'#7aadad','--text-dim':'#4a8080',
      },
      preview: { base:'#1a2e2e', surface:'#22383a', bar:'#36676c', text:'#7aadad' },
    },
    {
      id: 'teal-mist', name: 'Teal Mist', desc: 'Softer, lighter teal tones',
      vars: {
        '--bg-base':'#162828','--bg-surface':'#1e3434','--bg-tab':'#182c2c',
        '--bg-tab-active':'#2e5a5e','--bg-hover':'#203838','--bg-panel':'#0e1e1e',
        '--bg-deep':'#0b1a1a','--bg-input':'#1e3434','--bg-border':'#264444',
        '--bg-border2':'#1a3030','--text-main':'#b8dede','--text-muted':'#6a9e9e','--text-dim':'#3e7070',
      },
      preview: { base:'#162828', surface:'#1e3434', bar:'#2e5a5e', text:'#6a9e9e' },
    },
    {
      id: 'midnight', name: 'Midnight', desc: 'Deep blue-black night theme',
      vars: {
        '--bg-base':'#0f1117','--bg-surface':'#1a1d27','--bg-tab':'#13161f',
        '--bg-tab-active':'#2a3050','--bg-hover':'#1e2235','--bg-panel':'#0a0c14',
        '--bg-deep':'#080a10','--bg-input':'#1a1d27','--bg-border':'#252840',
        '--bg-border2':'#181b2e','--text-main':'#d0d4f0','--text-muted':'#7880b0','--text-dim':'#454870',
      },
      preview: { base:'#0f1117', surface:'#1a1d27', bar:'#2a3050', text:'#7880b0' },
    },
    {
      id: 'slate', name: 'Slate', desc: 'Cool blue-grey professional',
      vars: {
        '--bg-base':'#141820','--bg-surface':'#1c2130','--bg-tab':'#161b28',
        '--bg-tab-active':'#2c3a5a','--bg-hover':'#202840','--bg-panel':'#0e1118',
        '--bg-deep':'#0b0e15','--bg-input':'#1c2130','--bg-border':'#28304a',
        '--bg-border2':'#1a2038','--text-main':'#c8d0e8','--text-muted':'#7080a8','--text-dim':'#404870',
      },
      preview: { base:'#141820', surface:'#1c2130', bar:'#2c3a5a', text:'#7080a8' },
    },
    {
      id: 'forest', name: 'Forest', desc: 'Natural deep green tones',
      vars: {
        '--bg-base':'#141e14','--bg-surface':'#1c2a1c','--bg-tab':'#162018',
        '--bg-tab-active':'#2a4a2e','--bg-hover':'#1e3020','--bg-panel':'#0e160e',
        '--bg-deep':'#0a1208','--bg-input':'#1c2a1c','--bg-border':'#264028',
        '--bg-border2':'#1a2e1c','--text-main':'#c0dcc0','--text-muted':'#6a9a6a','--text-dim':'#3e6040',
      },
      preview: { base:'#141e14', surface:'#1c2a1c', bar:'#2a4a2e', text:'#6a9a6a' },
    },
    {
      id: 'crimson', name: 'Crimson', desc: 'Dark red dramatic palette',
      vars: {
        '--bg-base':'#1e1214','--bg-surface':'#2a1a1e','--bg-tab':'#201416',
        '--bg-tab-active':'#4a2030','--bg-hover':'#2e1820','--bg-panel':'#160e10',
        '--bg-deep':'#120a0c','--bg-input':'#2a1a1e','--bg-border':'#3a2028',
        '--bg-border2':'#281418','--text-main':'#e8c8cc','--text-muted':'#a07080','--text-dim':'#6a4050',
      },
      preview: { base:'#1e1214', surface:'#2a1a1e', bar:'#4a2030', text:'#a07080' },
    },
    {
      id: 'ocean', name: 'Ocean', desc: 'Deep sea blue atmosphere',
      vars: {
        '--bg-base':'#0d1e2e','--bg-surface':'#142436','--bg-tab':'#101c2a',
        '--bg-tab-active':'#1e4060','--bg-hover':'#182a40','--bg-panel':'#091420',
        '--bg-deep':'#060e18','--bg-input':'#142436','--bg-border':'#1e3450',
        '--bg-border2':'#122038','--text-main':'#c0d8f0','--text-muted':'#6090b8','--text-dim':'#385878',
      },
      preview: { base:'#0d1e2e', surface:'#142436', bar:'#1e4060', text:'#6090b8' },
    },
    {
      id: 'aurora', name: 'Aurora', desc: 'Purple-teal northern lights',
      vars: {
        '--bg-base':'#141020','--bg-surface':'#1e1830','--bg-tab':'#181428',
        '--bg-tab-active':'#342858','--bg-hover':'#221e38','--bg-panel':'#0e0c18',
        '--bg-deep':'#0a0810','--bg-input':'#1e1830','--bg-border':'#2e2448',
        '--bg-border2':'#1e1a34','--text-main':'#d4c8f0','--text-muted':'#8878b8','--text-dim':'#504878',
      },
      preview: { base:'#141020', surface:'#1e1830', bar:'#342858', text:'#8878b8' },
    },
    {
      id: 'amber', name: 'Amber', desc: 'Warm golden dark theme',
      vars: {
        '--bg-base':'#1e1a0e','--bg-surface':'#2a2414','--bg-tab':'#201e10',
        '--bg-tab-active':'#4a3c18','--bg-hover':'#2e2818','--bg-panel':'#141008',
        '--bg-deep':'#100c06','--bg-input':'#2a2414','--bg-border':'#3a3020',
        '--bg-border2':'#282010','--text-main':'#f0e0b0','--text-muted':'#b09060','--text-dim':'#706040',
      },
      preview: { base:'#1e1a0e', surface:'#2a2414', bar:'#4a3c18', text:'#b09060' },
    },
    {
      id: 'obsidian', name: 'Obsidian', desc: 'Pure near-black minimal',
      vars: {
        '--bg-base':'#0e0e10','--bg-surface':'#161618','--bg-tab':'#121214',
        '--bg-tab-active':'#242430','--bg-hover':'#1a1a20','--bg-panel':'#080810',
        '--bg-deep':'#050508','--bg-input':'#161618','--bg-border':'#222228',
        '--bg-border2':'#181820','--text-main':'#d8d8e8','--text-muted':'#7878a0','--text-dim':'#484860',
      },
      preview: { base:'#0e0e10', surface:'#161618', bar:'#242430', text:'#7878a0' },
    },
  ];

  function render(currentId) {
    const current = BG_THEMES.find(t => t.id === currentId) || BG_THEMES[0];

    const cards = BG_THEMES.map(t => `
      <div class="bg-theme-card ${t.id === currentId ? 'active' : ''}"
        data-theme="${t.id}" title="${t.desc}">
        <div class="bg-theme-card-preview" style="background:${t.preview.base};">
          <div class="bg-theme-card-bar"  style="background:${t.preview.surface};"></div>
          <div class="bg-theme-card-bar"  style="background:${t.preview.bar};width:80%;"></div>
          <div class="bg-theme-card-bar2" style="background:${t.preview.text};"></div>
          <div class="bg-theme-card-dot"  style="background:var(--accent,#00c8b4);"></div>
        </div>
        <div class="bg-theme-card-label"
          style="background:${t.preview.surface};color:${t.preview.text};">
          ${t.name}
        </div>
      </div>`).join('');

    return `
      <div class="bg-theme-accordion" id="bg-theme-accordion">
        <div class="bg-theme-header" id="bg-theme-header">
          <div class="bg-theme-header-left">
            <div class="row-icon" style="flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div class="row-text" style="flex:1;">
              <div class="row-label">Background Theme</div>
              <div class="row-desc" id="bg-theme-header-desc">${current.desc}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="bg-theme-header-preview" id="bg-theme-header-preview"
              style="background:${current.preview.base};">
              <div class="bg-theme-header-bar"  style="background:${current.preview.surface};"></div>
              <div class="bg-theme-header-bar"  style="background:${current.preview.bar};width:75%;"></div>
              <div class="bg-theme-header-bar2" style="background:${current.preview.text};"></div>
            </div>
            <span class="bg-theme-header-name" id="bg-theme-header-name"
              style="font-size:12px;color:#7aadad;font-weight:600;">
              ${current.name}
            </span>
            <svg class="bg-theme-chevron" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
        <div class="bg-theme-panel" id="bg-theme-panel">
          <div class="bg-theme-panel-inner" id="bg-theme-panel-inner">
            ${cards}
          </div>
        </div>
      </div>`;
  }

  function applyThemeVars(themeId) {
    const theme = BG_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  function updateHeader(container, themeId) {
    const theme   = BG_THEMES.find(t => t.id === themeId) || BG_THEMES[0];
    const preview = container.querySelector('#bg-theme-header-preview');
    const name    = container.querySelector('#bg-theme-header-name');
    const desc    = container.querySelector('#bg-theme-header-desc');
    if (preview) {
      preview.style.background = theme.preview.base;
      preview.innerHTML = `
        <div class="bg-theme-header-bar"  style="background:${theme.preview.surface};"></div>
        <div class="bg-theme-header-bar"  style="background:${theme.preview.bar};width:75%;"></div>
        <div class="bg-theme-header-bar2" style="background:${theme.preview.text};"></div>`;
    }
    if (name) name.textContent = theme.name;
    if (desc) desc.textContent = theme.desc;
  }

  return { render, applyThemeVars, updateHeader, BG_THEMES };

})();
