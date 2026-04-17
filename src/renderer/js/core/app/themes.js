/**
 * core/app/themes.js
 * Accent color + background theme application.
 */

const AppThemes = (() => {

  const BG_THEMES = {
    teal:     { '--bg-base':'#1a2e2e','--bg-surface':'#22383a','--bg-tab':'#1c2f30','--bg-tab-active':'#36676c','--bg-hover':'#253f40','--bg-panel':'#0f2222','--bg-deep':'#0d1f1f','--bg-input':'#22383a','--bg-border':'#2e4a4c','--bg-border2':'#1e3838','--text-main':'#c8e8e5','--text-muted':'#7aadad','--text-dim':'#4a8080' },
    'teal-blur':{ '--bg-base':'#162828','--bg-surface':'#1e3434','--bg-tab':'#182c2c','--bg-tab-active':'#2e5a5e','--bg-hover':'#203838','--bg-panel':'#0e1e1e','--bg-deep':'#0b1a1a','--bg-input':'#1e3434','--bg-border':'#264444','--bg-border2':'#1a3030','--text-main':'#b8dede','--text-muted':'#6a9e9e','--text-dim':'#3e7070' },
    midnight: { '--bg-base':'#0f1117','--bg-surface':'#1a1d27','--bg-tab':'#13161f','--bg-tab-active':'#2a3050','--bg-hover':'#1e2235','--bg-panel':'#0a0c14','--bg-deep':'#080a10','--bg-input':'#1a1d27','--bg-border':'#252840','--bg-border2':'#181b2e','--text-main':'#d0d4f0','--text-muted':'#7880b0','--text-dim':'#454870' },
    slate:    { '--bg-base':'#141820','--bg-surface':'#1c2130','--bg-tab':'#161b28','--bg-tab-active':'#2c3a5a','--bg-hover':'#202840','--bg-panel':'#0e1118','--bg-deep':'#0b0e15','--bg-input':'#1c2130','--bg-border':'#28304a','--bg-border2':'#1a2038','--text-main':'#c8d0e8','--text-muted':'#7080a8','--text-dim':'#404870' },
    forest:   { '--bg-base':'#141e14','--bg-surface':'#1c2a1c','--bg-tab':'#162018','--bg-tab-active':'#2a4a2e','--bg-hover':'#1e3020','--bg-panel':'#0e160e','--bg-deep':'#0a1208','--bg-input':'#1c2a1c','--bg-border':'#264028','--bg-border2':'#1a2e1c','--text-main':'#c0dcc0','--text-muted':'#6a9a6a','--text-dim':'#3e6040' },
    crimson:  { '--bg-base':'#1e1214','--bg-surface':'#2a1a1e','--bg-tab':'#201416','--bg-tab-active':'#4a2030','--bg-hover':'#2e1820','--bg-panel':'#160e10','--bg-deep':'#120a0c','--bg-input':'#2a1a1e','--bg-border':'#3a2028','--bg-border2':'#281418','--text-main':'#e8c8cc','--text-muted':'#a07080','--text-dim':'#6a4050' },
    ocean:    { '--bg-base':'#0d1e2e','--bg-surface':'#142436','--bg-tab':'#101c2a','--bg-tab-active':'#1e4060','--bg-hover':'#182a40','--bg-panel':'#091420','--bg-deep':'#060e18','--bg-input':'#142436','--bg-border':'#1e3450','--bg-border2':'#122038','--text-main':'#c0d8f0','--text-muted':'#6090b8','--text-dim':'#385878' },
    aurora:   { '--bg-base':'#141020','--bg-surface':'#1e1830','--bg-tab':'#181428','--bg-tab-active':'#342858','--bg-hover':'#221e38','--bg-panel':'#0e0c18','--bg-deep':'#0a0810','--bg-input':'#1e1830','--bg-border':'#2e2448','--bg-border2':'#1e1a34','--text-main':'#d4c8f0','--text-muted':'#8878b8','--text-dim':'#504878' },
    amber:    { '--bg-base':'#1e1a0e','--bg-surface':'#2a2414','--bg-tab':'#201e10','--bg-tab-active':'#4a3c18','--bg-hover':'#2e2818','--bg-panel':'#141008','--bg-deep':'#100c06','--bg-input':'#2a2414','--bg-border':'#3a3020','--bg-border2':'#282010','--text-main':'#f0e0b0','--text-muted':'#b09060','--text-dim':'#706040' },
    obsidian: { '--bg-base':'#0e0e10','--bg-surface':'#161618','--bg-tab':'#121214','--bg-tab-active':'#242430','--bg-hover':'#1a1a20','--bg-panel':'#080810','--bg-deep':'#050508','--bg-input':'#161618','--bg-border':'#222228','--bg-border2':'#181820','--text-main':'#d8d8e8','--text-muted':'#7878a0','--text-dim':'#484860' },
  };

  function _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function applyAccent(hex) {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const root = document.documentElement;
    root.style.setProperty('--accent',      hex);
    root.style.setProperty('--accent-dim',  _hexToRgba(hex, 0.15));
    root.style.setProperty('--accent-glow', _hexToRgba(hex, 0.25));
    root.style.setProperty('--accent-10',   _hexToRgba(hex, 0.10));
    root.style.setProperty('--accent-20',   _hexToRgba(hex, 0.20));
  }

  function applyBgTheme(themeId) {
    const vars = BG_THEMES[themeId] || BG_THEMES.teal;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  return { applyAccent, applyBgTheme, BG_THEMES };

})();
