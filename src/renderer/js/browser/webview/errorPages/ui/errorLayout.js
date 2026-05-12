/**
 * errorPages/ui/errorLayout.js
 * Clean, minimal, professional error page layout.
 */

const ErrorLayout = {

  render({ scene, sceneScript, message, errorCode, url, threeJsCode }) {
    const { title, subtitle, tips, color } = message;

    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);

    const tipsHTML = tips.map(t => `<li>${t}</li>`).join('');
    const shortUrl = url ? (url.length > 60 ? url.slice(0, 60) + '…' : url) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  html, body {
    width:100%; height:100%;
    background:#0e1117;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color:#e2e8f0;
    overflow:hidden;
  }

  body {
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:100vh;
  }

  /* Canvas — subtle background only */
  #three-canvas {
    position:fixed;
    inset:0;
    width:100%;
    height:100%;
    z-index:0;
    opacity:0.55;
  }

  .wrap {
    position:relative;
    z-index:1;
    display:flex;
    align-items:center;
    gap:64px;
    max-width:860px;
    width:100%;
    padding:40px;
    animation: fadeIn 0.4s ease both;
  }

  /* Left — icon/visual */
  .visual {
    flex-shrink:0;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:16px;
  }

  .icon-wrap {
    width:80px; height:80px;
    border-radius:20px;
    background:rgba(${r},${g},${b},0.1);
    border:1px solid rgba(${r},${g},${b},0.2);
    display:flex;
    align-items:center;
    justify-content:center;
    animation: iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
  }

  .icon-wrap svg {
    width:36px; height:36px;
    stroke:${color};
  }

  .err-badge {
    font-size:11px;
    font-family:'SF Mono','Fira Code',monospace;
    color:rgba(${r},${g},${b},0.7);
    background:rgba(${r},${g},${b},0.08);
    border:1px solid rgba(${r},${g},${b},0.15);
    border-radius:6px;
    padding:3px 10px;
    letter-spacing:0.5px;
    white-space:nowrap;
  }

  /* Right — text */
  .content {
    flex:1;
    min-width:0;
  }

  .title {
    font-size:26px;
    font-weight:700;
    color:#f1f5f9;
    letter-spacing:-0.5px;
    line-height:1.2;
    margin-bottom:8px;
    animation: slideUp 0.35s ease 0.05s both;
  }

  .subtitle {
    font-size:14px;
    color:#64748b;
    margin-bottom:24px;
    animation: slideUp 0.35s ease 0.1s both;
  }

  .divider {
    height:1px;
    background:linear-gradient(90deg, #1e293b, transparent);
    margin-bottom:20px;
    animation: slideUp 0.35s ease 0.12s both;
  }

  .tips-label {
    font-size:11px;
    font-weight:600;
    letter-spacing:0.8px;
    text-transform:uppercase;
    color:#334155;
    margin-bottom:10px;
    animation: slideUp 0.35s ease 0.14s both;
  }

  .tips {
    list-style:none;
    margin-bottom:28px;
    animation: slideUp 0.35s ease 0.16s both;
  }

  .tips li {
    font-size:13px;
    color:#475569;
    padding:5px 0;
    padding-left:14px;
    position:relative;
    line-height:1.5;
    border-bottom:1px solid #0f172a;
  }
  .tips li:last-child { border-bottom:none; }
  .tips li::before {
    content:'';
    position:absolute;
    left:0; top:12px;
    width:5px; height:5px;
    border-radius:50%;
    background:rgba(${r},${g},${b},0.5);
  }

  .actions {
    display:flex;
    gap:10px;
    animation: slideUp 0.35s ease 0.2s both;
  }

  .btn {
    padding:9px 20px;
    border-radius:8px;
    border:none;
    font-size:13px;
    font-weight:500;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    gap:6px;
    transition:all 0.15s ease;
    letter-spacing:0.1px;
  }

  .btn-primary {
    background:${color};
    color:#0a0f1a;
    font-weight:600;
  }
  .btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); filter:brightness(0.95); }

  .btn-ghost {
    background:transparent;
    color:#475569;
    border:1px solid #1e293b;
  }
  .btn-ghost:hover { background:#1e293b; color:#94a3b8; }

  .url-bar {
    margin-top:20px;
    font-size:11px;
    color:#1e293b;
    font-family:'SF Mono','Fira Code',monospace;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    animation: slideUp 0.35s ease 0.22s both;
  }

  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes iconPop {
    from { opacity:0; transform:scale(0.7); }
    to   { opacity:1; transform:scale(1); }
  }

  /* Responsive — stack on narrow */
  @media (max-width: 600px) {
    .wrap { flex-direction:column; gap:28px; padding:28px 20px; }
    .visual { flex-direction:row; }
    .title { font-size:20px; }
  }
</style>
</head>
<body>

<canvas id="three-canvas"></canvas>

<div class="wrap">
  <div class="visual">
    <div class="icon-wrap">
      ${_getIcon(scene, color)}
    </div>
    ${errorCode ? `<div class="err-badge">ERR ${errorCode}</div>` : ''}
  </div>

  <div class="content">
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
    <div class="divider"></div>
    <div class="tips-label">Try this</div>
    <ul class="tips">${tipsHTML}</ul>
    <div class="actions">
      <button class="btn btn-primary" onclick="window.location.reload()">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2-8.83L23 10"/>
        </svg>
        Try Again
      </button>
      <button class="btn btn-ghost" onclick="history.back()">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Go Back
      </button>
    </div>
    ${shortUrl ? `<div class="url-bar">${shortUrl}</div>` : ''}
  </div>
</div>

<script>${threeJsCode}</script>
<script>${sceneScript}</script>

</body>
</html>`;
  },
};

// Inline SVG icons per scene — clean line icons
function _getIcon(scene, color) {
  const icons = {
    noInternet: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>`,
    dnsError: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="11"/>
      <line x1="11" y1="14" x2="11.01" y2="14"/>
    </svg>`,
    sslError: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>`,
    timeout: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
    notFound: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
      <line x1="9" y1="14" x2="15" y2="14"/>
    </svg>`,
    redirectLoop: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>`,
  };
  return icons[scene] || icons.noInternet;
}
