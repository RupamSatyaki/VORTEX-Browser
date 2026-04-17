/**
 * settings/sections/shortcuts/ui/shortcutsUI.js
 * HTML for Keyboard Shortcuts section — pure static HTML, no logic.
 */

const ShortcutsUI = (() => {

  const SHORTCUTS = [
    { action: 'New Tab',           keys: ['Ctrl', 'T'] },
    { action: 'Close Tab',         keys: ['Ctrl', 'W'] },
    { action: 'Reopen Closed Tab', keys: ['Ctrl', 'Shift', 'T'] },
    { action: 'New Window',        keys: ['Ctrl', 'N'] },
    { action: 'New Incognito',     keys: ['Ctrl', 'Shift', 'N'] },
    { action: 'Reload',            keys: ['Ctrl', 'R'] },
    { action: 'Hard Reload',       keys: ['Ctrl', 'Shift', 'R'] },
    { action: 'Address Bar Focus', keys: ['Ctrl', 'L'] },
    { action: 'Find in Page',      keys: ['Ctrl', 'F'] },
    { action: 'Downloads',         keys: ['Ctrl', 'J'] },
    { action: 'History',           keys: ['Ctrl', 'H'] },
    { action: 'Bookmarks',         keys: ['Ctrl', 'B'] },
    { action: 'Settings',          keys: ['Ctrl', ','] },
    { action: 'Zoom In',           keys: ['Ctrl', '='] },
    { action: 'Zoom Out',          keys: ['Ctrl', '-'] },
    { action: 'Reset Zoom',        keys: ['Ctrl', '0'] },
    { action: 'Next Tab',          keys: ['Ctrl', 'Tab'] },
    { action: 'Previous Tab',      keys: ['Ctrl', 'Shift', 'Tab'] },
    { action: 'Quick Launch',      keys: ['Ctrl', 'Space'] },
    { action: 'Command Palette',   keys: ['Ctrl', 'Shift', 'P'] },
    { action: 'Screenshot',        keys: ['Ctrl', 'Shift', 'S'] },
    { action: 'Site Permissions',  keys: ['Ctrl', 'Shift', 'I'] },
    { action: 'Developer Tools',   keys: ['F12'] },
    { action: 'Fullscreen',        keys: ['F11'] },
    { action: 'Print',             keys: ['Ctrl', 'P'] },
    { action: 'Save Page',         keys: ['Ctrl', 'S'] },
  ];

  function _kbd(keys) {
    return keys.map(k => `<span class="kbd">${k}</span>`).join(' + ');
  }

  function render() {
    const rows = SHORTCUTS.map(s => `
      <tr>
        <td>${s.action}</td>
        <td>${_kbd(s.keys)}</td>
      </tr>`).join('');

    return `
      ${SettingsSectionHeader.render({
        title: 'Keyboard Shortcuts',
        subtitle: 'All available keyboard shortcuts in Vortex',
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                 <rect x="2" y="7" width="20" height="14" rx="2"/>
                 <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
               </svg>`,
      })}

      ${SettingsCard.render({
        children: `
          <table class="shortcut-table">
            ${rows}
          </table>
        `,
      })}`;
  }

  return { render };

})();
