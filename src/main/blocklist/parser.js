/**
 * blocklist/parser.js — Parse EasyList and hosts format into domain Set
 */

function parseList(text) {
  const domains = new Set();
  const lines = text.split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Skip comments
    if (line.startsWith('!') || line.startsWith('#') || line.startsWith('[')) continue;

    // Hosts format: "0.0.0.0 domain.com" or "127.0.0.1 domain.com"
    if (line.startsWith('0.0.0.0 ') || line.startsWith('127.0.0.1 ')) {
      const parts = line.split(/\s+/);
      const domain = parts[1];
      if (domain && _isValidDomain(domain) && domain !== 'localhost') {
        domains.add(domain.toLowerCase());
      }
      continue;
    }

    // EasyList format: "||domain.com^" or "||domain.com^$..."
    if (line.startsWith('||')) {
      const match = line.match(/^\|\|([a-z0-9._-]+)\^/i);
      if (match && _isValidDomain(match[1])) {
        domains.add(match[1].toLowerCase());
      }
      continue;
    }

    // Plain domain (some lists just list domains)
    if (_isValidDomain(line) && !line.includes('/') && !line.includes('=')) {
      domains.add(line.toLowerCase());
    }
  }

  return domains;
}

function _isValidDomain(d) {
  if (!d || d.length > 253) return false;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(d);
}

module.exports = { parseList };
