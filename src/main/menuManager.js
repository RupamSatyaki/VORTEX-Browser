const { Menu, BrowserWindow } = require('electron');

function send(channel, data) {
  BrowserWindow.getAllWindows().forEach(win => {
    try { win.webContents.send(channel, data); } catch (_) {}
  });
}

function setupMenu() {
  const template = [
    {
      label: 'Vortex',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Tab',    accelerator: 'CmdOrCtrl+T', click: () => send('menu:newTab') },
        { label: 'New Window', accelerator: 'CmdOrCtrl+N', click: () => send('menu:newWindow') },
        { label: 'Close Tab',  accelerator: 'CmdOrCtrl+W', click: () => send('menu:closeTab') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload',      accelerator: 'CmdOrCtrl+R',       click: () => send('menu:reload') },
        { label: 'Hard Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => send('menu:hardReload') },
        { label: 'Find',        accelerator: 'CmdOrCtrl+F',       click: () => send('menu:find') },
        { label: 'Screenshot',       accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu:screenshot') },
        { label: 'Full Page Screenshot', accelerator: 'CmdOrCtrl+Shift+F', click: () => send('menu:screenshotFull') },
        { label: 'Zoom In',     accelerator: 'CmdOrCtrl+=',       click: () => send('menu:zoomIn') },
        { label: 'Zoom Out',    accelerator: 'CmdOrCtrl+-',       click: () => send('menu:zoomOut') },
        { label: 'Reset Zoom',  accelerator: 'CmdOrCtrl+0',       click: () => send('menu:zoomReset') },
        { type: 'separator' },
        { label: 'Downloads',   accelerator: 'CmdOrCtrl+J',       click: () => send('menu:downloads') },
        { label: 'History',     accelerator: 'CmdOrCtrl+H',       click: () => send('menu:history') },
        { label: 'Bookmarks',   accelerator: 'CmdOrCtrl+B',       click: () => send('menu:bookmarks') },
        { label: 'Settings',    accelerator: 'CmdOrCtrl+,',       click: () => send('menu:settings') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Next Tab',     accelerator: 'CmdOrCtrl+Tab',       click: () => send('menu:nextTab') },
        { label: 'Prev Tab',     accelerator: 'CmdOrCtrl+Shift+Tab', click: () => send('menu:prevTab') },
        { label: 'Address Bar',  accelerator: 'CmdOrCtrl+L',         click: () => send('menu:focusUrl') },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { setupMenu };
