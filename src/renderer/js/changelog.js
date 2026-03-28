/**
 * changelog.js — Vortex Browser Changelog Data
 *
 * Naya version add karna ho toh bas VERSIONS array mein ek object add karo.
 * Har version mein categories hain, har category mein features hain.
 *
 * Feature types: 'new' | 'fix' | 'improve' | 'perf'
 * Badge types:   'latest' | 'stable' | 'old'
 */

const CHANGELOG_VERSIONS = [
  {
    id: 'v261',
    version: 'v2.6.1',
    badge: 'latest',
    name: 'Hash Generator — Advanced Features',
    date: 'March 2026',
    isCurrent: true,
    open: true,
    counts: { new: 8 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label:'Password Strength Checker', desc:'Entropy bits, charset size, crack time estimate (GPU-speed), 7 requirement checks, common password detection. Live as you type.', howto:'Hash \u2192 Advanced \u2192 Password tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`, label:'Hash Format Detector', desc:'Paste any hash \u2192 auto-detects MD5, SHA-1, SHA-256, SHA-384, SHA-512, bcrypt, CRC32, NTLM by length and pattern.', howto:'Hash \u2192 Advanced \u2192 Detector tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label:'Salted Hash Generator', desc:'Text + salt (random or manual) \u2192 salted hash. 3 output formats: $salt$hash, salt:hash, JSON. Supports SHA-256, SHA-512, MD5.', howto:'Hash \u2192 Advanced \u2192 Salted Hash tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`, label:'PBKDF2 Key Derivation', desc:'Password + salt + iterations + key length \u2192 derived key via Web Crypto PBKDF2. Output in hex and Base64. Configurable hash algorithm.', howto:'Hash \u2192 Advanced \u2192 PBKDF2 tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, label:'Checksum Verifier', desc:'Drop any file \u2192 computes MD5/SHA-1/SHA-256/SHA-512. Paste expected checksum \u2192 instantly shows which algorithm matches. Green highlight on match.', howto:'Hash \u2192 Advanced \u2192 Checksum tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label:'Multiple Output Formats', desc:'Hash in 7 formats: hex lowercase, hex uppercase, 0x prefix, colon-separated, Base64, Base64URL, binary. Copy any format individually.', howto:'Hash \u2192 Formats & Export \u2192 Formats tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Hash Visualization', desc:'Identicon-style symmetric color grid generated from any hash. Configurable grid size (8x8, 10x10, 12x12). Download as PNG.', howto:'Hash \u2192 Formats & Export \u2192 Visualize tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>`, label:'Batch Export (JSON/CSV)', desc:'Hash multiple strings with multiple algorithms at once. Export as JSON or CSV file, or copy JSON. Preview first 3 results inline.', howto:'Hash \u2192 Formats & Export \u2192 Export tab' },
        ],
      },
    ],
  },

  {
    id: 'v260',
    version: 'v2.6.0',
    badge: 'stable',
    name: 'Hash Generator Tool',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 1 },
    categories: [
      {
        label: 'New Tools',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h7"/><path d="M15 15l2 2 4-4"/></svg>`, label:'Hash Generator', desc:'MD5, SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto API. HMAC-SHA256 with secret key. File hashing with progress bar. Hash comparison with diff position. Batch hashing. History. All in tools/hash/ modular directory.', howto:'DevHub \u2192 Hash Generator' },
        ],
      },
    ],
  },

  {
    id: 'v250',
    version: 'v2.5.0',
    badge: 'stable',
    name: 'URL Encoder \u2014 Full Rewrite',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 9, improve: 1 },
    categories: [
      {
        label: 'Architecture',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
        features: [
          { type:'improve', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`, label:'Modular Directory Structure', desc:'URL Encoder split into tools/url-encoder/ with 6 files: utils.js, encode.js, parser.js, builder.js, tools.js, index.js. CSS self-contained in styles.css injected by index.js.', howto:'DevHub → URL Encoder' },
        ],
      },
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label:'Auto-detect', desc:'Paste anything → auto-detects plain text, encoded string, URL, or query string. Badge shows detection. Auto button encodes or decodes based on detection.', howto:'Encode/Decode tab → Auto button' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`, label:'Parse & Edit + URL Diff', desc:'Parse any URL into all components. Edit query params inline — URL rebuilds live. Copy individual parts. Diff two URLs side-by-side showing added/removed/changed params and fields.', howto:'Parse & Edit tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`, label:'Query String Builder', desc:'Visually add/remove/toggle key-value pairs. URL builds live. Import params from any URL. Copy as URL, query string, or JSON object.', howto:'Builder tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/></svg>`, label:'Batch Encode/Decode/Canonicalize', desc:'Process multiple URLs at once — one per line. Encode all, decode all, or canonicalize all. Shows processed count.', howto:'Tools → Batch tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, label:'URL Validator', desc:'Validates protocol, hostname, TLD, path encoding. Shows detailed pass/fail with specific issue messages.', howto:'Tools → Validate tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:'URL Canonicalize', desc:'Normalizes URL: lowercase hostname, remove default ports (80/443), sort query params alphabetically, remove trailing slash. Shows what changed.', howto:'Tools → Canonicalize tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label:'URL to Code', desc:'Generate ready-to-use code in 8 formats: JS fetch, JS axios, Python requests, curl, curl -v, wget, PHP, Go.', howto:'Tools → URL to Code tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'QR Code Generator', desc:'Generate a visual QR-style pattern from any URL. Download as PNG.', howto:'Tools → QR Code tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label:'URL History', desc:'Last 15 processed URLs saved per session. Copy any URL from history.', howto:'Tools → History tab' },
        ],
      },
    ],
  },

  {
    id: 'v242',
    version: 'v2.4.2',
    badge: 'stable',
    name: 'Base64 UI Polish',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { improve: 1 },
    categories: [
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          { type:'improve', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Base64 UI Redesign', desc:'Full CSS rewrite: better spacing, grouped action buttons, animated slide-in for all sections, glowing detect dot, swap button spring animation, drop zone hover glow, image preview shadow, JWT section hover states, gradient file divider, hex byte hover effects.', howto:'DevHub \u2192 Base64' },
        ],
      },
    ],
  },

  {
    id: 'v241',
    version: 'v2.4.1',
    badge: 'stable',
    name: 'Base64 \u2014 History, Batch, JWT, Image Transform',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 6, fix: 1 },
    categories: [
      {
        label: 'Bug Fixes',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
        features: [
          { type:'fix', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Deprecated escape/unescape Removed', desc:'utils.js now uses TextEncoder/TextDecoder for encode/decode — no more deprecated escape() and unescape() calls. Proper Unicode support.', },
        ],
      },
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label:'Operation History', desc:'Last 10 encode/decode operations saved per session. Shows op type, input/output preview, timestamp. Click Load to restore any operation.', howto:'Text tab → History mode' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/></svg>`, label:'Batch Mode', desc:'Encode or decode multiple strings at once — one per line. Output is newline-separated. Shows count of processed lines.', howto:'Text tab → Batch mode' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label:'Copy as Code', desc:'Copy encoded Base64 directly as a variable in JS, TypeScript, Python, Java, Go, or C#.', howto:'Text tab → Copy as: buttons' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`, label:'Image Resize + Quality + Format', desc:'Before encoding: resize to custom dimensions, set JPEG quality (1-100 slider), convert format (PNG/JPEG/WebP). Re-encode with one click.', howto:'Image tab → Transform before encode section' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Multiple Images → JSON Array', desc:'Upload multiple images at once → all encoded to Base64 and output as a JSON array with name, type, base64 fields.', howto:'Image tab → Multiple button' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`, label:'JWT Decoder Tab', desc:'Paste any JWT → colored token display, header/payload/signature sections, claims table with human-readable names, expiry check (valid/expired with time remaining), copy header/payload/full JSON.', howto:'Base64 → JWT tab' },
        ],
      },
    ],
  },

  {
    id: 'v240',
    version: 'v2.4.0',
    badge: 'stable',
    name: 'Base64 — Full Rewrite (Multi-component)',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 8, improve: 1 },
    categories: [
      {
        label: 'Architecture',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
        features: [
          { type:'improve', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>`, label:'Modular Directory Structure', desc:'Base64 tool split into tools/base64/ directory with 4 components: utils.js (shared helpers), text.js, image.js, file.js, index.js (entry). Each component is independently maintainable.', howto:'DevHub → Base64' },
        ],
      },
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label:'Auto-detect Mode', desc:'Paste anything → auto-detects plain text, Base64, or URL-safe Base64. Badge shows detection result. Auto button encodes or decodes based on detection.', howto:'Text tab → Auto button or live typing' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label:'URL-safe Base64', desc:'Encode/decode URL-safe Base64 (+ → -, / → _, no padding). Essential for JWT tokens and URL parameters.', howto:'Text tab → URL-safe ↑/↓ buttons or URL-safe mode checkbox' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/></svg>`, label:'Chunked Output (MIME)', desc:'Wrap Base64 output at 76 characters per line — MIME standard for email attachments and PEM certificates.', howto:'Text tab → Chunk button or Chunk output checkbox' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:'Size Info + Validation', desc:'Shows original vs encoded size with overhead %. Live validation badge shows if input is valid Base64. Swap button to flip input/output.', howto:'Text tab — appears automatically' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`, label:'Image Embed Code Generator', desc:'Load any image → generates HTML img tag, CSS background, JSON embed, Markdown, or raw Base64. Shows dimensions, file size, encoded size. Decode Base64 back to image preview.', howto:'Image tab → embed code tabs' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/></svg>`, label:'Any File Encode/Decode', desc:'Encode any file (PDF, ZIP, binary) to Base64. Copy as raw Base64 or full data URI. Decode Base64 back to file and download. Preview text/image files inline.', howto:'File tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>`, label:'Download Outputs', desc:'Download encoded Base64 as .txt file, download decoded file directly, download embed code snippets.', howto:'Download buttons in each tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, label:'Live Encode on Type', desc:'Toggle live encoding as you type. Swap button flips input/output. Individual clear buttons per field.', howto:'Text tab → Live encode checkbox' },
        ],
      },
    ],
  },

  {
    id: 'v231',
    version: 'v2.3.1',
    badge: 'stable',
    name: 'Regex Tester — 8 More Features',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 8 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Regex Visualizer', desc:'Token-by-token visual flow diagram. Each part of the pattern shown as a colored node with type label. Hover for details.', howto:'Regex Tester → Visual tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`, label:'Match Navigator', desc:'Prev/Next buttons to jump between matches one by one. Current match highlighted in gold. Shows index, length, groups for each match.', howto:'Regex Tester → Navigator tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:'Performance Benchmark', desc:'Run regex N times (1K–1M iterations), measure total time, per-op µs, ops/sec. Detects catastrophic backtracking automatically.', howto:'Regex Tester → Bench tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`, label:'Pattern History', desc:'Last 20 typed patterns auto-saved per session. Click any to reload. Clear all with one button.', howto:'Regex Tester → History tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg>`, label:'Share Pattern', desc:'Encode pattern + flags + test string into a shareable link. Import from link. Also copy as JSON.', howto:'Regex Tester → Share tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>`, label:'Import/Export Saved Patterns', desc:'Export all saved patterns as JSON file. Import from JSON to merge with existing. Share patterns with teammates.', howto:'Regex Tester → Saved tab → ↓ Export / ↑ Import' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, label:'Escape Helper', desc:'Paste any raw string → auto-escapes all regex special chars (., *, +, ?, ^, $, {, }, (, ), [, ], \\, |). Load directly into pattern.', howto:'Regex Tester → Escape tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`, label:'Quantifier Helper + Unicode Properties', desc:'Visual quantifier cards (*, +, ?, lazy) + custom {n,m} builder. Unicode tab with \\p{Letter}, \\p{Number}, Scripts etc. — click to insert.', howto:'Regex Tester → Quant tab · Unicode tab' },
        ],
      },
    ],
  },

  {
    id: 'v230',
    version: 'v2.3.0',
    badge: 'stable',
    name: 'Regex Tester — 12 Features',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 12 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/></svg>`, label:'Replace Mode', desc:'Pattern + replacement string → replaced output. Supports $1, $2 backreferences, $&, $`, $\'. Live preview.', howto:'Regex Tester → Replace tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Named Capture Groups', desc:'(?<name>...) syntax fully supported. Named groups shown in a separate table alongside numbered groups.', howto:'Use (?<name>...) in pattern → see groups in Test tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/></svg>`, label:'Match Details Table', desc:'Every match with index, length, value, line number, and all capture groups in a sortable table.', howto:'Regex Tester → Match Table tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Pattern Library', desc:'22 pre-built patterns: Email, URL, Phone, IP, Date, UUID, Hex Color, Credit Card, HTML Tag, Password, and more. Click to load.', howto:'Regex Tester → Library tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>`, label:'Regex Explainer', desc:'Token-by-token breakdown of any pattern in plain English. Also shows a pattern summary with all detected constructs.', howto:'Regex Tester → Explainer tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>`, label:'Multi-line Tester', desc:'Test each line independently. Green ✓ / red ✗ per line with match count. Useful for batch validation.', howto:'Regex Tester → Multi-line tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27"/></svg>`, label:'Split Mode', desc:'Split a string by the regex pattern. Shows all parts with index numbers.', howto:'Regex Tester → Split tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`, label:'Code Generator', desc:'Generates ready-to-use regex code in 6 languages: JavaScript, Python, Java, Go, PHP, Rust.', howto:'Regex Tester → Code Gen tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, label:'Test Cases', desc:'Add multiple test strings with expected outcome (should match / should NOT match). Run all → PASS/FAIL per case.', howto:'Regex Tester → Test Cases tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`, label:'Saved Patterns', desc:'Save frequently used patterns with names. Persists in localStorage. Load or delete anytime.', howto:'Regex Tester → Saved tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/></svg>`, label:'u and y Flags', desc:'Added Unicode (u) and Sticky (y) flags alongside g/i/m/s. All 6 flags with tooltip explanations.', howto:'Flag checkboxes in pattern row' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/></svg>`, label:'Character Class Helper', desc:'20 clickable buttons for \\d, \\w, \\s, \\b, lookaheads, lookbehinds, named groups etc. Click to insert at cursor.', howto:'Button row below pattern input' },
        ],
      },
    ],
  },

  {
    id: 'v221',
    version: 'v2.2.1',
    badge: 'stable',
    name: 'Color Picker — Canvas, Mixer, Named, Image, Saved',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 5 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Visual Color Canvas', desc:'2D saturation/lightness picker canvas + hue bar slider. Drag to pick color visually — like Figma/Photoshop. Now the default tab.', howto:'Color Picker → Canvas tab (default)' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Color Mixer', desc:'Pick two colors + ratio slider → mixed color preview. Also shows 7-step gradient between the two colors. Click any step to load it.', howto:'Color Picker → Mixer tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/></svg>`, label:'CSS Named Colors', desc:'140+ CSS named colors (tomato, steelblue, coral…) in a searchable grid. Click any to load.', howto:'Color Picker → Named tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>`, label:'Color from Image', desc:'Upload or drag-drop any image → extracts top 8 dominant colors using pixel quantization. Click any color to load it.', howto:'Color Picker → Image tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`, label:'Saved Palettes', desc:'Save named palettes from your color history. Persists in localStorage. Click any swatch to reload, delete palettes individually.', howto:'Color Picker → Saved tab → name + Save Current' },
        ],
      },
    ],
  },

  {
    id: 'v220',
    version: 'v2.2.0',
    badge: 'stable',
    name: 'Color Picker — Full Upgrade',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 13 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Palette Generator', desc:'Auto-generates Shades, Tints and Tones from any color — 7 swatches each. Click any swatch to load it.', howto:'Color Picker → Palette tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`, label:'Color Harmony', desc:'Complementary, Split-Complementary, Triadic, Analogous, Tetradic — all with swatches. Click to load any.', howto:'Color Picker → Harmony tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`, label:'Gradient Generator', desc:'Pick two colors, angle and type (linear/radial/conic). Live preview + copy CSS.', howto:'Color Picker → Gradient tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>`, label:'Color History', desc:'Last 12 picked colors shown as swatches. Click any to reload.', howto:'Appears below actions automatically' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'CMYK + HWB Support', desc:'Full CMYK and HWB format support with copy buttons. All 6 formats: HEX, RGB, HSL, RGBA, CMYK, HWB.', howto:'Copy buttons in action bar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/></svg>`, label:'CSS Variables Output', desc:'One-click CSS custom properties: --color, --color-rgb, --color-hsl, --color-rgba, --color-cmyk, --color-hwb.', howto:'Color Picker → CSS/TW tab → Copy CSS Vars' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/></svg>`, label:'Tailwind CSS Match', desc:'Finds the closest Tailwind color class with color distance (Δ). Copy class name directly.', howto:'Color Picker → CSS/TW tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`, label:'Color Blindness Simulator', desc:'Simulates Protanopia, Deuteranopia, Tritanopia and Achromatopsia. Click simulated swatch to load it.', howto:'Color Picker → Blindness tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87"/></svg>`, label:'Eyedropper API', desc:'Pick any color from the screen using the native browser Eyedropper API.', howto:'💉 Pick button in action bar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5"/></svg>`, label:'Export Palette JSON', desc:'Export current color + history as a JSON file for use in design tools.', howto:'Color Picker → CSS/TW tab → Export Palette JSON' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/></svg>`, label:'Alpha / Opacity Slider', desc:'Visual alpha slider with checkerboard background. RGBA output with full opacity control.', howto:'Opacity slider below color fields' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, label:'Large Preview Hero', desc:'Big color swatch at top shows current color with HEX overlay and nearest Tailwind name. Auto-contrast text.', howto:'Top of Color Picker' },
          { type:'improve', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:'WCAG Contrast Checker Upgraded', desc:'Now shows AA Normal, AA Large, AAA Normal, AAA Large — all four levels vs both white and black.', howto:'Color Picker → Contrast tab' },
        ],
      },
    ],
  },

  {
    id: 'v212',
    version: 'v2.1.2',
    badge: 'stable',
    name: 'JSON Viewer — 13 Features',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 13 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`, label:'Search / Filter', desc:'Search any key or value in the tree. Matching nodes highlight, non-matching fade. Live match count shown.', howto:'Type in search box in Tree tab toolbar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg>`, label:'JSONPath Copy', desc:'Click any key in the tree to copy its full JSONPath (e.g. $.user.address.city) to clipboard.', howto:'Click any key name in tree' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`, label:'JSON Schema Generator', desc:'Auto-generates a JSON Schema (draft-07) from parsed JSON. Infers types, required fields, nested structure. Copy with one click.', howto:'DevHub → JSON Viewer → Schema tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/></svg>`, label:'Diff Mode', desc:'Paste two JSONs side by side. Differences shown as ADDED/REMOVED/CHANGED with path and values. Color-coded.', howto:'DevHub → JSON Viewer → Diff tab' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`, label:'Edit Mode', desc:'Toggle edit mode to modify values directly in the tree. Changes update the JSON textarea in real time.', howto:'✎ button in tree toolbar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>`, label:'JSON → CSV', desc:'Converts array of objects to CSV and downloads it. Handles commas, quotes and newlines in values.', howto:'→ CSV button in action bar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>`, label:'Sort Keys', desc:'Recursively sorts all object keys alphabetically. Useful for comparing JSONs or normalizing output.', howto:'Sort Keys button' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, label:'Flatten / Unflatten', desc:'Flatten nested JSON to dot-notation keys (user.address.city). Unflatten converts back to nested structure.', howto:'Flatten / Unflatten buttons' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>`, label:'Size Info', desc:'Shows file size (KB), node count, and validation status in real time as you type.', howto:'Appears below textarea automatically' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/></svg>`, label:'Line Numbers', desc:'Textarea now shows line numbers that sync with scroll position.', howto:'Visible in textarea automatically' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`, label:'Real-time Validation', desc:'Green border = valid JSON, red border = invalid. Updates as you type without needing to click Parse.', howto:'Just type in the textarea' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42"/></svg>`, label:'Syntax Theme Toggle', desc:'Switch between dark and light syntax color themes for the tree view.', howto:'◑ button in tree toolbar' },
          { type:'new', icon:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, label:'Bookmark Nodes', desc:'Star any node in the tree to bookmark it. Bookmarked nodes show a gold left border for quick identification.', howto:'Hover any row → click ★ icon' },
        ],
      },
    ],
  },

  {
    id: 'v211',
    version: 'v2.1.1',
    badge: 'stable',
    name: 'JSON Viewer UI Polish',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { fix: 1, improve: 1 },
    categories: [
      {
        label: 'Bug Fixes',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
        features: [
          {
            type: 'fix',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            label: 'JSON Tree Text Blur Fixed',
            desc: 'Tree text was blurry due to translate(-50%,-50%) causing subpixel rendering. Fixed by using margin-based centering + transform:translateZ(0) on tree container. Text is now crisp at all zoom levels.',
          },
        ],
      },
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          {
            type: 'improve',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            label: 'JSON Viewer UI Redesign',
            desc: 'Pill-style tab switcher, animated expand/collapse with slide-in, shimmer effect on stat bars, animated depth histogram (bars grow from 0), staggered stat card entrance. Tooltip has no backdrop-filter to prevent blur.',
          },
        ],
      },
    ],
  },

  {
    id: 'v210',
    version: 'v2.1.0',
    badge: 'stable',
    name: 'JSON Viewer Upgrade',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { improve: 1 },
    categories: [
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          {
            type: 'improve',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            label: 'JSON Viewer — Full Rewrite',
            desc: 'File upload (.json), collapsible tree with expand/collapse all, hover tooltips (type, length, key count), auto-parse on paste. New Stats & Graph tab: type distribution bars, depth histogram, top keys chart.',
            howto: 'DevHub → JSON Viewer · Upload button or paste · Tree/Stats tabs',
          },
        ],
      },
    ],
  },

  {
    id: 'v200',
    version: 'v2.0.0',
    badge: 'stable',
    name: 'DevHub — Developer Tools Panel',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 6 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
            label: 'DevHub Panel',
            desc: 'New toolbar button opens a slide-out DevHub panel. Home screen shows all tools in a grid. Click any tool to open it, back button returns to home. Toggle button visibility in Settings → Appearance.',
            howto: 'Click the wrench icon in toolbar · Settings → Appearance → Show DevHub Button to hide',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            label: 'JSON Viewer',
            desc: 'Paste JSON to pretty-print with syntax-highlighted collapsible tree. Validate, minify, and copy. Color-coded: keys teal, strings green, numbers orange, booleans purple.',
            howto: 'DevHub → JSON Viewer',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
            label: 'Color Picker',
            desc: 'HEX ↔ RGB ↔ HSL converter with live preview swatch. WCAG contrast checker vs white and black. Copy in any format.',
            howto: 'DevHub → Color Picker',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
            label: 'Regex Tester',
            desc: 'Live regex match highlighter. Supports g/i/m/s flags. Shows match count, highlights all matches inline, and lists capture groups from the first match.',
            howto: 'DevHub → Regex Tester',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
            label: 'Base64 Encoder/Decoder',
            desc: 'Encode/decode text to Base64. Image tab: drag-drop or upload any image to get its Base64 data URI instantly.',
            howto: 'DevHub → Base64',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
            label: 'URL Encoder / Parser',
            desc: 'Encode/decode URL components (encodeURIComponent or encodeURI). Parse tab breaks any URL into protocol, host, pathname, query params and hash.',
            howto: 'DevHub → URL Encoder',
          },
        ],
      },
    ],
  },

  {
    id: 'v121',
    version: 'v1.2.1',
    badge: 'stable',
    name: 'Settings Sidebar Redesign',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { improve: 1 },
    categories: [
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          {
            type: 'improve',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
            label: 'Settings Sidebar Grouped Sections',
            desc: 'Sidebar nav items reorganized into 5 labeled groups: General, Privacy & Performance, Account, System, and Info. Replaces plain separators with uppercase section headers for better scannability.',
            howto: 'Open Settings — sidebar now shows group labels on the left',
          },
        ],
      },
    ],
  },

  {
    id: 'v120',
    version: 'v1.2.0',
    badge: 'stable',
    name: 'Help & FAQ Update',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 1 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            label: 'Help & FAQ Section',
            desc: 'New dedicated Help & FAQ section in Settings with 35+ questions covering navigation, tabs, features, issues, shortcuts, privacy and updates. Full-text search, category filters, and expandable answers. Data-driven via faq.js — easy to update.',
            howto: 'Settings → Help & FAQ · Search any keyword or browse by category',
          },
        ],
      },
    ],
  },

  {
    id: 'v110',
    version: 'v1.1.0',
    badge: 'stable',
    name: 'Changelog Refactor Update',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 1, improve: 1 },
    categories: [
      {
        label: 'Improvements',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
        features: [
          {
            type: 'improve',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            label: 'Changelog Extracted to Separate File',
            desc: 'Changelog data moved from settings.html into a dedicated changelog.js file. Each version is a plain JS object — no HTML editing needed. Stats (versions, features, fixes) auto-computed from data.',
            howto: 'Edit vortex/src/renderer/js/changelog.js to add new versions',
          },
        ],
      },
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
            label: 'Dynamic Changelog Renderer',
            desc: 'Changelog section is now fully data-driven. HTML is generated at runtime from CHANGELOG_VERSIONS array. Adding a new version requires zero HTML changes — just add a JS object with version, categories and features.',
            howto: 'Add a new object to CHANGELOG_VERSIONS in changelog.js',
          },
        ],
      },
    ],
  },

  {
    id: 'v101',
    version: 'v1.0.1',
    badge: 'stable',
    name: 'Network & YouTube Update',
    date: 'March 2026',
    isCurrent: false,
    open: false,
    counts: { new: 3, fix: 2 },
    categories: [
      {
        label: 'New Features',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            label: 'Network Speed Indicator',
            desc: 'Live bar at bottom of screen showing page load time, DNS+TCP+TTFB latency, transfer size and average download speed. Click to dismiss. Color-coded: green <500ms, yellow <2s, red >2s.',
            howto: 'Appears automatically on every page load — no setup needed',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/></svg>`,
            label: 'YouTube Ad Blocker',
            desc: 'Two-layer blocking: main process cancels ad network requests before they load, plus CSS hides all ad DOM elements (banner, overlay, in-feed, companion ads). Works on page load, navigation and SPA route changes.',
            howto: 'Toggle in Settings → YouTube → Ad Blocker',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
            label: 'Ad Speed Control + Auto-Skip',
            desc: 'Unskippable ads are muted and sped up (4x–256x). Skip button is auto-clicked the moment it appears. After ad ends, video is restored to normal speed and unmuted. If video pauses post-ad, it auto-resumes.',
            howto: 'Settings → YouTube → Ad Speed · Recommended: 16x for low-end PCs',
          },
        ],
      },
      {
        label: 'Bug Fixes',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
        features: [
          {
            type: 'fix',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            label: 'Version Display Fix',
            desc: 'About section showed "Version —" in packaged builds. Root cause: require("../../package.json") fails in asar. Fixed by using app.getVersion() as primary source.',
          },
          {
            type: 'fix',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            label: 'Settings Toggle Not Rendering',
            desc: 'YouTube section toggle used &lt;span class="slider"&gt; but CSS only defines .toggle-track. Fixed class mismatch — toggle now renders correctly.',
          },
        ],
      },
    ],
  },

  {
    id: 'v100',
    version: 'v1.0.0',
    badge: 'stable',
    name: 'Initial Release',
    date: 'March 2026 · First Public Build',
    isCurrent: false,
    open: false,
    counts: { new: 14 },
    categories: [
      {
        label: 'Browsing Core',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
            label: 'Multi-Tab Browser',
            desc: 'Full tab management — drag-drop reorder, tab sleep (auto-suspend after N mins), thumbnail hover previews, per-tab mute, lazy loading. Each tab has isolated webview with custom scrollbars.',
            howto: 'Ctrl+T new · Ctrl+W close · Ctrl+Tab switch · Settings → Performance → Tab Sleep',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
            label: 'Smart Omnibox',
            desc: 'Address bar with real-time Google search suggestions, smart URL vs search detection, 5 search engines (Google, Bing, DuckDuckGo, Brave, Ecosia), keyboard navigation through suggestions.',
            howto: 'Ctrl+L to focus · Settings → Search Engine',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
            label: 'Find in Page',
            desc: 'Full-text search within any webpage. Shows match count (e.g. 3/12), highlights all matches, previous/next navigation, no-match red highlight, clears on close.',
            howto: 'Ctrl+F · Enter next · Shift+Enter prev · Esc close',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
            label: 'Incognito Mode',
            desc: 'Separate purple-themed private window with fully isolated session partition. No history saved, no cookies shared with normal windows, no tab history tracking.',
            howto: 'Ctrl+Shift+N or File menu',
          },
        ],
      },
      {
        label: 'Productivity',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
            label: 'Command Palette',
            desc: 'Fuzzy-search launcher for all browser actions — open settings, new tab, incognito, zoom in/out/reset, mute tab, screenshot, summarize, translate, PiP and more. Arrow key navigation.',
            howto: 'Ctrl+Shift+P',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
            label: 'Bookmarks & History',
            desc: 'Full bookmark manager with favicon, search and bookmarks bar. Browsing history with per-tab tracking, favicon updates, title updates. Export/import both via Settings → Sync.',
            howto: 'Ctrl+D bookmark · Ctrl+Shift+B bar · Ctrl+H history',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            label: 'Download Manager',
            desc: 'Real-time download tracking with speed (smoothed 5-sample average), progress bar, percentage, open file/folder buttons. Supports cancel, remove from list. Badge count on toolbar icon.',
            howto: 'Toolbar download icon · Settings → Downloads for path/behavior',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            label: 'Quick Launch Panel',
            desc: 'Spotlight-style launcher with bookmarks grid, 50+ popular sites organized by category (Social, Dev, News, Shopping, Entertainment, Productivity), integrated omnibox with suggestions.',
            howto: 'Ctrl+Space or toolbar button',
          },
        ],
      },
      {
        label: 'AI & Content',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
            label: 'AI Page Summarizer',
            desc: 'Slide-out drawer summarizes any webpage. 4 providers: HuggingFace (free, no key), OpenAI (GPT-3.5/4), Ollama (local LLM), Extractive (offline, no AI). Copy or re-summarize anytime.',
            howto: 'Toolbar AI button or right-click → Summarize Page',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
            label: 'Page Translator',
            desc: 'Auto-detects page language via HTML lang attribute + Google Translate API fallback. Non-intrusive bar appears only when page language ≠ your preferred language. Dismissed URLs remembered per session.',
            howto: 'Auto · Settings → Languages to set preferred language',
          },
        ],
      },
      {
        label: 'Media & Tools',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>`,
        features: [
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
            label: 'Picture-in-Picture Manager',
            desc: 'Auto-triggers PiP when switching away from a tab with playing video. Per-site allowlist. Removes YouTube\'s disablePictureInPicture block. Falls back to YouTube\'s native PiP button if needed.',
            howto: 'Auto on tab switch · Settings → Performance → PiP',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
            label: 'Screenshot Tool',
            desc: 'Capture visible viewport or full page (auto-scrolls + stitches via device emulation). Saves PNG via system dialog. Full-page clamped at 16384px to prevent memory issues.',
            howto: 'Ctrl+Shift+S or toolbar camera',
          },
          {
            type: 'new',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>`,
            label: 'WhatsApp Panel',
            desc: 'Persistent WhatsApp Web sidebar using dedicated persist:whatsapp partition — stays logged in across sessions. Fullscreen mode, refresh button. Toggle visibility from toolbar.',
            howto: 'WhatsApp button in toolbar · Settings → Appearance to show/hide',
          },
        ],
      },
      {
        label: 'System & Updates',
        icon: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>`,
        features: [
          {
            type: 'perf',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
            label: 'GitHub-based Updater',
            desc: 'Browse last 30 commits from GitHub API, apply any commit — downloads all source files from raw.githubusercontent.com and restarts. SHA tracked in userData/.applied-sha for version comparison.',
            howto: 'Settings → Updates → Fetch Commits',
          },
          {
            type: 'perf',
            icon: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            label: 'DNS Prefetch & Link Prefetch',
            desc: 'Pre-warms DNS for 9 top sites on startup via HEAD requests. Also reads &lt;link rel="prefetch"&gt; hints from loaded pages and prefetches them in background for instant next-page loads.',
            howto: 'Settings → Performance → Prefetch to toggle',
          },
        ],
      },
    ],
  },
];

// ── Stats auto-computed from data ──────────────────────────────────────────────
function _computeStats() {
  let versions = 0, features = 0, fixes = 0, improvements = 0;
  CHANGELOG_VERSIONS.forEach(v => {
    versions++;
    (v.categories || []).forEach(cat => {
      (cat.features || []).forEach(f => {
        if (f.type === 'new')     features++;
        else if (f.type === 'fix')     fixes++;
        else if (f.type === 'improve') improvements++;
      });
    });
  });
  return { versions, features, fixes, improvements };
}

// ── Tag label map ──────────────────────────────────────────────────────────────
const TAG_LABELS = { new: 'NEW', fix: 'FIX', improve: 'IMP', perf: 'SYS' };

// ── Render helpers ─────────────────────────────────────────────────────────────
function _renderFeature(f) {
  const howto = f.howto
    ? `<div class="cl-feat-howto">
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        ${f.howto}
       </div>`
    : '';
  return `
    <div class="cl-feature-item">
      <div class="cl-feat-icon ${f.type}">${f.icon}</div>
      <div class="cl-feat-text">
        <div class="cl-feat-label">${f.label}</div>
        <div class="cl-feat-desc">${f.desc}</div>
        ${howto}
      </div>
      <span class="cl-feat-tag ${f.type}">${TAG_LABELS[f.type] || f.type.toUpperCase()}</span>
    </div>`;
}

function _renderCategory(cat, first) {
  const mt = first ? '' : 'style="margin-top:10px;"';
  return `
    <div class="cl-category-label" ${mt}>${cat.icon} ${cat.label}</div>
    ${cat.features.map(_renderFeature).join('')}`;
}

function _renderCounts(counts) {
  return Object.entries(counts || {})
    .map(([type, n]) => `<span class="cl-count ${type}">${n} ${type}</span>`)
    .join('');
}

function _renderVersion(v) {
  const currentPill = v.isCurrent
    ? `<span class="cl-current-pill">● Current</span>`
    : '';
  const openClass = v.open ? ' open' : '';

  return `
    <div class="cl-version-block${openClass}" id="cl-${v.id}">
      <div class="cl-ver-header" onclick="clToggle('cl-${v.id}')">
        <div class="cl-ver-left">
          <span class="cl-ver-badge ${v.badge}">${v.version}</span>
          <div class="cl-ver-info">
            <div class="cl-ver-name">${v.name}</div>
            <div class="cl-ver-date">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${v.date}${currentPill}
            </div>
          </div>
        </div>
        <div class="cl-ver-right">
          <div class="cl-ver-counts">${_renderCounts(v.counts)}</div>
          <svg class="cl-ver-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="cl-features">
        <div class="cl-features-inner">
          ${(v.categories || []).map((cat, i) => _renderCategory(cat, i === 0)).join('')}
        </div>
      </div>
    </div>`;
}

function _renderHero(stats) {
  return `
    <div class="card" style="margin-bottom:16px;overflow:hidden;">
      <div class="cl-hero">
        <div class="cl-hero-glow"></div>
        <div class="cl-hero-badge">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Release History
        </div>
        <div class="cl-hero-title">Vortex Browser Changelog</div>
        <div class="cl-hero-sub">Every feature, fix and improvement — version by version</div>
        <div class="cl-stats-row">
          <div class="cl-stat"><div class="cl-stat-num">${stats.versions}</div><div class="cl-stat-label">Versions</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.features}</div><div class="cl-stat-label">Features</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.fixes}</div><div class="cl-stat-label">Bug Fixes</div></div>
          <div class="cl-stat-sep"></div>
          <div class="cl-stat"><div class="cl-stat-num">${stats.improvements}</div><div class="cl-stat-label">Improvements</div></div>
        </div>
        <div class="cl-legend">
          <span class="cl-leg-item new"><span class="cl-leg-dot"></span>New Feature</span>
          <span class="cl-leg-item fix"><span class="cl-leg-dot"></span>Bug Fix</span>
          <span class="cl-leg-item improve"><span class="cl-leg-dot"></span>Improvement</span>
          <span class="cl-leg-item perf"><span class="cl-leg-dot"></span>System</span>
        </div>
      </div>
    </div>`;
}

// ── Main render function ───────────────────────────────────────────────────────
function renderChangelog() {
  const container = document.getElementById('sec-changelog');
  if (!container) return;

  const stats = _computeStats();
  const title = `<div class="section-title">What's New</div>`;
  const hero  = _renderHero(stats);
  const versions = CHANGELOG_VERSIONS.map(_renderVersion).join('');

  container.innerHTML = title + hero + versions;
}

// Auto-render when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderChangelog);
} else {
  renderChangelog();
}
