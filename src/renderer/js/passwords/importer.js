/**
 * passwords/importer.js
 * Import from Chrome/Firefox CSV export
 */

const PasswordImporter = (() => {

  // Chrome CSV: name,url,username,password
  // Firefox CSV: url,username,password,httpRealm,formActionOrigin,guid,timeCreated,timeLastUsed,timePasswordChanged
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const header = lines[0].toLowerCase().replace(/"/g, '');
    const cols   = header.split(',');
    const entries = [];

    for (let i = 1; i < lines.length; i++) {
      const row = _parseCSVRow(lines[i]);
      if (!row.length) continue;

      let entry = { id: _uuid(), createdAt: Date.now(), updatedAt: Date.now(), notes: '' };

      // Chrome format
      if (cols.includes('name') && cols.includes('url') && cols.includes('username') && cols.includes('password')) {
        entry.site     = _domain(row[cols.indexOf('url')] || '');
        entry.url      = row[cols.indexOf('url')]      || '';
        entry.username = row[cols.indexOf('username')] || '';
        entry.password = row[cols.indexOf('password')] || '';
        entry.title    = row[cols.indexOf('name')]     || entry.site;
      }
      // Firefox format
      else if (cols.includes('url') && cols.includes('username') && cols.includes('password')) {
        entry.site     = _domain(row[cols.indexOf('url')] || '');
        entry.url      = row[cols.indexOf('url')]      || '';
        entry.username = row[cols.indexOf('username')] || '';
        entry.password = row[cols.indexOf('password')] || '';
        entry.title    = entry.site;
      } else {
        continue;
      }

      if (entry.username || entry.password) entries.push(entry);
    }
    return entries;
  }

  function _parseCSVRow(line) {
    const result = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    result.push(cur.trim());
    return result;
  }

  function _domain(url) {
    if (!url) return '';
    try {
      const u = url.startsWith('http') ? url : 'https://' + url;
      return new URL(u).hostname.replace(/^www\./, '');
    } catch { return url.split('/')[0].replace(/^www\./, ''); }
  }

  function _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  return { parseCSV };
})();
