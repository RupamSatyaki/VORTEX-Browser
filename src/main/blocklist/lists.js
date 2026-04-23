/**
 * blocklist/lists.js — Blocklist source definitions
 */

const BLOCKLISTS = [
  {
    id: 'easylist',
    name: 'EasyList',
    desc: 'Removes ads from websites',
    category: 'ads',
    url: 'https://easylist.to/easylist/easylist.txt',
    defaultEnabled: true,
  },
  {
    id: 'easyprivacy',
    name: 'EasyPrivacy',
    desc: 'Blocks tracking and analytics scripts',
    category: 'privacy',
    url: 'https://easylist.to/easylist/easyprivacy.txt',
    defaultEnabled: true,
  },
  {
    id: 'peterlow',
    name: "Peter Lowe's List",
    desc: 'Ad servers and malware domains',
    category: 'ads',
    url: 'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext',
    defaultEnabled: true,
  },
  {
    id: 'stevenblack',
    name: 'Steven Black Hosts',
    desc: 'Ads, malware, and fake news domains',
    category: 'mixed',
    url: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
    defaultEnabled: false,
  },
  {
    id: 'malware',
    name: 'Malware Domains',
    desc: 'Known malware and phishing domains',
    category: 'security',
    url: 'https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-hosts.txt',
    defaultEnabled: false,
  },
  // ── Built-in YouTube Ad Blocker ──────────────────────────────────────────
  {
    id: 'youtube-ads',
    name: 'YouTube Ad Blocker',
    desc: 'Blocks YouTube ads at network level (ad domains only, NOT IMA SDK)',
    category: 'youtube',
    url: null,
    builtin: true,
    defaultEnabled: false, // DISABLED — DOM removal approach is better (no detection)
    builtinDomains: [
      // DO NOT block imasdk.googleapis.com — it breaks video playback
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      'ad.doubleclick.net',
      'static.doubleclick.net',
    ],
    builtinPatterns: [],
  },
];

module.exports = { BLOCKLISTS };
