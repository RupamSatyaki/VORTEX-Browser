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
    desc: 'Blocks YouTube ads at network level (IMA SDK + ad domains)',
    category: 'youtube',
    url: null,       // built-in — no download needed
    builtin: true,
    defaultEnabled: true,
    // Domains to block — imasdk.googleapis.com is the key one (IMA SDK)
    builtinDomains: [
      'imasdk.googleapis.com',       // Google IMA SDK — blocks ALL YouTube ads
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      'ad.doubleclick.net',
      'static.doubleclick.net',
      'stats.g.doubleclick.net',
      'googletagmanager.com',
      'googletagservices.com',
      'pagead2.googlesyndication.com',
      'tpc.googlesyndication.com',
    ],
    // URL patterns to block (partial match on full URL)
    builtinPatterns: [
      '/api/stats/ads',
      '/pagead/',
      '/ptracking',
      '/get_video_info?',
      'ctier=L',                     // ad-quality tier param
    ],
  },
];

module.exports = { BLOCKLISTS };
