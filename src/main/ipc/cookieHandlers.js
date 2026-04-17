/**
 * main/ipc/cookieHandlers.js
 * cookies:getAll/getForDomain/delete/deleteAll/deleteForDomain/deleteExpired/set/getStats
 */

const { ipcMain, session } = require('electron');

function register() {
  ipcMain.handle('cookies:getAll',       async ()           => { try { return await session.defaultSession.cookies.get({}); } catch { return []; } });
  ipcMain.handle('cookies:getForDomain', async (_e, domain) => { try { return await session.defaultSession.cookies.get({ domain }); } catch { return []; } });

  ipcMain.handle('cookies:delete', async (_e, url, name) => {
    try { await session.defaultSession.cookies.remove(url, name); return true; } catch { return false; }
  });

  ipcMain.handle('cookies:deleteAll', async () => {
    try {
      const all = await session.defaultSession.cookies.get({});
      for (const c of all) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return all.length;
    } catch { return 0; }
  });

  ipcMain.handle('cookies:deleteForDomain', async (_e, domain) => {
    try {
      const all = await session.defaultSession.cookies.get({ domain });
      for (const c of all) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return all.length;
    } catch { return 0; }
  });

  ipcMain.handle('cookies:deleteExpired', async () => {
    try {
      const now = Date.now() / 1000, all = await session.defaultSession.cookies.get({}), exp = all.filter(c => c.expirationDate && c.expirationDate < now);
      for (const c of exp) {
        const url = (c.secure ? 'https' : 'http') + '://' + c.domain.replace(/^\./, '') + (c.path || '/');
        await session.defaultSession.cookies.remove(url, c.name);
      }
      return exp.length;
    } catch { return 0; }
  });

  ipcMain.handle('cookies:set', async (_e, cookieDetails) => {
    try { await session.defaultSession.cookies.set(cookieDetails); return true; } catch { return false; }
  });

  ipcMain.handle('cookies:getStats', async () => {
    try {
      const all = await session.defaultSession.cookies.get({}), now = Date.now() / 1000;
      const domains = [...new Set(all.map(c => c.domain.replace(/^\./, '')))];
      return { total: all.length, domains: domains.length, expired: all.filter(c => c.expirationDate && c.expirationDate < now).length, session: all.filter(c => !c.expirationDate).length, secure: all.filter(c => c.secure).length, httpOnly: all.filter(c => c.httpOnly).length };
    } catch { return {}; }
  });
}

module.exports = { register };
