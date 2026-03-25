/**
 * devhub.js — DevHub Panel (centered modal, animated, searchable)
 * Naya tool add karna: tool file banao, TOOLS array mein push karo.
 */

const DevHub = (() => {
  const TOOLS = [
    JsonViewerTool,
    ColorPickerTool,
    RegexTesterTool,
    Base64Tool,
    UrlEncoderTool,
  ];

  let _open       = false;
  let _activeTool = null;
  let _query      = '';

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const CSS = `
    /* ── Backdrop ── */
    #devhub-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 8900;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
    }
    #devhub-backdrop.open { opacity: 1; pointer-events: all; }

    /* ── Panel ── */
    #devhub-panel {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) scale(0.92);
      width: min(680px, 92vw);
      max-height: min(580px, 88vh);
      background: #0d1f1f;
      border: 1px solid #1e3838;
      border-radius: 18px;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.4,0,0.2,1),
                  transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,180,0.06);
      overflow: hidden;
    }
    #devhub-panel.open {
      opacity: 1; pointer-events: all;
      transform: translate(-50%, -50%) scale(1);
    }
    #devhub-panel.closing {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.94);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    /* ── Header ── */
    #dh-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 12px;
      flex-shrink: 0;
      border-bottom: 1px solid #1a3030;
    }
    #dh-title {
      display: flex; align-items: center; gap: 10px;
    }
    #dh-title-icon {
      width: 32px; height: 32px; border-radius: 9px;
      background: linear-gradient(135deg, rgba(0,200,180,0.2), rgba(0,200,180,0.05));
      border: 1px solid rgba(0,200,180,0.2);
      display: flex; align-items: center; justify-content: center;
      color: #00c8b4;
    }
    #dh-title-text {
      font-size: 15px; font-weight: 700; color: #e0f4f4;
    }
    #dh-header-right { display: flex; align-items: center; gap: 6px; }
    #dh-home {
      display: flex; align-items: center; gap: 5px;
      background: rgba(0,200,180,0.08); border: 1px solid rgba(0,200,180,0.2);
      border-radius: 8px; color: #00c8b4; font-size: 12px;
      padding: 5px 10px; cursor: pointer;
      transition: all 0.15s;
    }
    #dh-home:hover { background: rgba(0,200,180,0.15); }
    #dh-close {
      width: 28px; height: 28px; border-radius: 8px;
      background: none; border: none; color: #4a8080;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    #dh-close:hover { background: #1a3030; color: #c8e8e5; }

    /* ── Search bar ── */
    #dh-search-wrap {
      display: flex; align-items: center; gap: 10px;
      margin: 12px 20px 0;
      background: #122222; border: 1px solid #1e3838; border-radius: 10px;
      padding: 9px 14px;
      transition: border-color 0.2s;
      flex-shrink: 0;
    }
    #dh-search-wrap:focus-within { border-color: rgba(0,200,180,0.4); }
    #dh-search {
      flex: 1; background: transparent; border: none; outline: none;
      color: #c8e8e5; font-size: 13px;
    }
    #dh-search::placeholder { color: #2e6060; }
    #dh-search-clear {
      background: none; border: none; color: #4a8080; cursor: pointer;
      font-size: 12px; padding: 0; line-height: 1; transition: color 0.15s;
    }
    #dh-search-clear:hover { color: #c8e8e5; }

    /* ── Body ── */
    #dh-body {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 16px 20px 20px;
    }
    #dh-body::-webkit-scrollbar { width: 4px; }
    #dh-body::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }

    /* ── Home: section label ── */
    .dh-section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.9px; color: #2a5050; margin-bottom: 10px;
    }

    /* ── Tool grid ── */
    .dh-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 10px;
    }

    .dh-tool-card {
      background: #122222; border: 1px solid #1e3838; border-radius: 14px;
      padding: 18px 16px; cursor: pointer;
      display: flex; flex-direction: column; gap: 10px;
      transition: background 0.15s, border-color 0.15s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s;
      animation: dh-card-in 0.3s cubic-bezier(0.34,1.2,0.64,1) both;
      position: relative; overflow: hidden;
    }
    .dh-tool-card::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 30%, rgba(0,200,180,0.06), transparent 60%);
      opacity: 0; transition: opacity 0.2s;
    }
    .dh-tool-card:hover::before { opacity: 1; }
    .dh-tool-card:hover {
      background: #162e2e; border-color: rgba(0,200,180,0.35);
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,200,180,0.1);
    }
    .dh-tool-card:active { transform: translateY(-1px) scale(0.99); }

    @keyframes dh-card-in {
      from { opacity: 0; transform: translateY(12px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dh-tool-card:nth-child(1) { animation-delay: 0.03s; }
    .dh-tool-card:nth-child(2) { animation-delay: 0.07s; }
    .dh-tool-card:nth-child(3) { animation-delay: 0.11s; }
    .dh-tool-card:nth-child(4) { animation-delay: 0.15s; }
    .dh-tool-card:nth-child(5) { animation-delay: 0.19s; }

    .dh-tool-card-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(0,200,180,0.15), rgba(0,200,180,0.05));
      border: 1px solid rgba(0,200,180,0.15);
      color: #00c8b4;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .dh-tool-card:hover .dh-tool-card-icon {
      transform: scale(1.1) rotate(-4deg);
      box-shadow: 0 4px 12px rgba(0,200,180,0.2);
    }
    .dh-tool-card-name {
      font-size: 13px; font-weight: 600; color: #c8e8e5;
    }
    .dh-tool-card-desc {
      font-size: 11px; color: #4a8080; line-height: 1.45;
    }
    .dh-tool-card-arrow {
      position: absolute; bottom: 14px; right: 14px;
      color: #1e3838; transition: color 0.15s, transform 0.15s;
    }
    .dh-tool-card:hover .dh-tool-card-arrow {
      color: #00c8b4; transform: translateX(3px);
    }

    /* No results */
    .dh-no-results {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 40px 20px; color: #4a8080; font-size: 13px;
      text-align: center;
    }

    /* ── Tool view ── */
    .dh-tool-view {
      animation: dh-tool-in 0.22s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes dh-tool-in {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ── Shared tool UI ── */
    .dh-tool-wrap { display: flex; flex-direction: column; gap: 10px; }
    .dh-textarea {
      width: 100%; background: #0a1616; border: 1px solid #1e3838;
      border-radius: 10px; color: #c8e8e5; font-size: 12px;
      font-family: 'Consolas', 'Fira Code', monospace;
      padding: 10px 13px; resize: vertical; min-height: 110px;
      outline: none; transition: border-color 0.2s; line-height: 1.6;
    }
    .dh-textarea:focus { border-color: rgba(0,200,180,0.4); }
    .dh-input {
      background: #0a1616; border: 1px solid #1e3838; border-radius: 8px;
      color: #c8e8e5; font-size: 12px; padding: 7px 11px;
      outline: none; transition: border-color 0.2s;
    }
    .dh-input:focus { border-color: rgba(0,200,180,0.4); }
    .dh-tool-actions {
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    }
    .dh-btn {
      background: rgba(0,200,180,0.07); border: 1px solid #2a4a4a;
      border-radius: 7px; color: #7aadad; font-size: 11.5px;
      padding: 6px 13px; cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .dh-btn:hover { background: rgba(0,200,180,0.15); color: #c8e8e5; border-color: rgba(0,200,180,0.4); transform: translateY(-1px); }
    .dh-btn:active { transform: translateY(0); }
    .dh-btn.primary { background: rgba(0,200,180,0.14); color: #00c8b4; border-color: rgba(0,200,180,0.35); }
    .dh-btn.primary:hover { background: rgba(0,200,180,0.24); }
    .dh-btn.danger { border-color: #3a2020; color: #c86060; background: rgba(200,60,60,0.06); }
    .dh-btn.danger:hover { background: rgba(200,60,60,0.15); border-color: #c86060; }
    .dh-status { font-size: 11.5px; transition: color 0.2s; }
    .dh-output {
      background: #080f0f; border: 1px solid #1e3838; border-radius: 10px;
      padding: 10px 13px; font-size: 11.5px;
      font-family: 'Consolas', 'Fira Code', monospace;
      color: #7aadad; min-height: 40px; max-height: 220px;
      overflow-y: auto; line-height: 1.65; word-break: break-all;
    }
    .dh-output::-webkit-scrollbar { width: 4px; }
    .dh-output::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .dh-tab-row { display: flex; gap: 4px; margin-bottom: 8px; }
    .dh-tab {
      background: #122222; border: 1px solid #1e3838; border-radius: 7px;
      color: #4a8080; font-size: 11.5px; padding: 5px 13px; cursor: pointer;
      transition: all 0.15s;
    }
    .dh-tab.active { background: rgba(0,200,180,0.12); color: #00c8b4; border-color: rgba(0,200,180,0.3); }
    .dh-tab:hover:not(.active) { background: #162e2e; color: #c8e8e5; }

    /* JSON Viewer */
    .jv-key    { color: #00c8b4; }
    .jv-str    { color: #a3e635; }
    .jv-num    { color: #fb923c; }
    .jv-bool   { color: #818cf8; }
    .jv-null   { color: #6b7280; }
    .jv-bracket{ color: #7aadad; }
    .jv-idx    { color: #4a8080; font-size: 10px; }
    .jv-line   { line-height: 1.65; }
    .dh-output-wrap { max-height: 200px; overflow-y: auto; border-radius: 10px; }
    .dh-output-wrap::-webkit-scrollbar { width: 4px; }
    .dh-output-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }

    /* Color Picker */
    .cp-preview-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .cp-swatch { width: 48px; height: 48px; border-radius: 12px; border: 1px solid #1e3838; flex-shrink: 0; background: #00c8b4; transition: background 0.15s; }
    .cp-fields { display: flex; flex-direction: column; gap: 8px; }
    .cp-field-group { display: flex; align-items: center; gap: 8px; }
    .cp-field-group label { font-size: 10.5px; color: #4a8080; width: 30px; flex-shrink: 0; }
    .cp-field-group .dh-input { flex: 1; }
    .cp-rgb { width: 58px !important; text-align: center; }
    .cp-contrast { margin-top: 4px; }
    .cp-contrast-label { font-size: 10.5px; color: #4a8080; margin-bottom: 6px; }
    .cp-contrast-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .cp-contrast-box { flex: 1; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border: 1px solid #1e3838; transition: background 0.15s; }
    .cp-contrast-ratio { font-size: 11px; color: #4a8080; }

    /* Regex Tester */
    .rx-pattern-row { display: flex; align-items: center; gap: 5px; }
    .rx-slash { color: #00c8b4; font-size: 20px; font-family: monospace; line-height: 1; }
    .rx-pattern { flex: 1; font-family: monospace; }
    .rx-flags { display: flex; gap: 8px; flex-shrink: 0; }
    .rx-flag { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #4a8080; cursor: pointer; font-family: monospace; user-select: none; }
    .rx-flag input { accent-color: #00c8b4; }
    .rx-result-label { font-size: 11px; color: #4a8080; margin: 4px 0 2px; }
    .rx-highlighted { white-space: pre-wrap; word-break: break-all; }
    mark.rx-mark { background: rgba(0,200,180,0.22); color: #00c8b4; border-radius: 2px; padding: 0 1px; }
    .rx-groups { margin-top: 4px; }
    .rx-group-row { display: flex; gap: 8px; font-size: 11.5px; padding: 2px 0; }
    .rx-group-idx { color: #4a8080; font-family: monospace; width: 22px; flex-shrink: 0; }
    .rx-group-val { color: #a3e635; font-family: monospace; }

    /* Base64 */
    .b64-drop {
      border: 2px dashed #1e3838; border-radius: 12px; padding: 28px;
      text-align: center; color: #4a8080; font-size: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      transition: border-color 0.2s, background 0.2s; cursor: pointer;
    }
    .b64-drop:hover { border-color: rgba(0,200,180,0.3); background: rgba(0,200,180,0.03); }

    /* URL Encoder */
    .ue-parse-table { display: flex; flex-direction: column; gap: 4px; }
    .ue-parse-row { display: flex; gap: 10px; font-size: 12px; padding: 5px 9px; background: #080f0f; border-radius: 6px; }
    .ue-parse-key { color: #4a8080; width: 82px; flex-shrink: 0; font-size: 11px; }
    .ue-parse-val { color: #c8e8e5; font-family: monospace; word-break: break-all; }

    /* ── JSON Viewer v2 ── */
    .jv-wrap { display: flex; flex-direction: column; gap: 10px; }
    .jv-textarea { min-height: 90px; font-size: 11.5px; }
    .jv-input-actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .jv-upload-label {
      display: inline-flex; align-items: center; gap: 5px; cursor: pointer;
    }
    .jv-tabs {
      display: flex; align-items: center; gap: 4px;
      border-bottom: 1px solid #1a3030; padding-bottom: 8px;
    }
    .jv-tab {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: none; border-radius: 7px;
      color: #4a8080; font-size: 12px; padding: 5px 12px; cursor: pointer;
      transition: all 0.15s;
    }
    .jv-tab:hover { background: #162e2e; color: #c8e8e5; }
    .jv-tab.active { background: rgba(0,200,180,0.12); color: #00c8b4; }
    .jv-tab-actions { display: flex; gap: 4px; margin-left: auto; }
    .jv-sm-btn { padding: 4px 9px !important; font-size: 11px !important; }

    /* Tree */
    .jv-tree-wrap {
      background: #080f0f; border: 1px solid #1e3838; border-radius: 10px;
      padding: 10px 12px; max-height: 280px; overflow-y: auto;
      font-family: 'Consolas','Fira Code',monospace; font-size: 12px;
      line-height: 1.7;
    }
    .jv-tree-wrap::-webkit-scrollbar { width: 4px; }
    .jv-tree-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .jv-node { position: relative; }
    .jv-row {
      display: flex; align-items: baseline; gap: 3px;
      padding: 1px 4px; border-radius: 5px; cursor: default;
      transition: background 0.1s;
    }
    .jv-row:hover { background: rgba(0,200,180,0.06); }
    .jv-toggle {
      width: 14px; flex-shrink: 0; display: flex; align-items: center;
      color: #2e6060; transition: color 0.15s;
    }
    .jv-toggle:hover { color: #00c8b4; }
    .jv-key { color: #00c8b4; }
    .jv-colon { color: #4a8080; }
    .jv-bracket { color: #7aadad; }
    .jv-count {
      font-size: 10px; color: #2e6060; margin-left: 5px;
      background: rgba(0,200,180,0.06); border-radius: 4px; padding: 0 5px;
    }
    .jv-preview { cursor: pointer; }
    .jv-preview:hover { opacity: 0.8; }
    .jv-children { border-left: 1px solid #1a3030; margin-left: 6px; }
    .jv-close-row { padding-left: 0 !important; }

    /* Tooltip */
    .jv-tooltip {
      position: fixed; z-index: 99999;
      background: #0d1f1f; border: 1px solid #1e3838; border-radius: 8px;
      padding: 8px 12px; font-size: 11.5px; line-height: 1.7;
      font-family: 'Consolas','Fira Code',monospace;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      pointer-events: none; display: none;
      min-width: 120px;
    }

    /* Stats */
    .jv-stats-wrap { display: flex; flex-direction: column; gap: 14px; max-height: 300px; overflow-y: auto; }
    .jv-stats-wrap::-webkit-scrollbar { width: 4px; }
    .jv-stats-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .jv-stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }
    .jv-stat-card {
      background: #0d1a1a; border: 1px solid #1e3838; border-radius: 10px;
      padding: 12px; text-align: center;
      transition: border-color 0.15s, transform 0.15s;
    }
    .jv-stat-card:hover { border-color: rgba(0,200,180,0.3); transform: translateY(-2px); }
    .jv-stat-num { font-size: 22px; font-weight: 800; color: #00c8b4; line-height: 1; }
    .jv-stat-label { font-size: 10px; color: #4a8080; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .jv-graph-section { background: #0d1a1a; border: 1px solid #1e3838; border-radius: 10px; padding: 12px 14px; }
    .jv-graph-title { font-size: 11px; font-weight: 700; color: #4a8080; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 10px; }
    .jv-bars { display: flex; flex-direction: column; gap: 7px; }
    .jv-bar-row { display: flex; align-items: center; gap: 8px; }
    .jv-bar-label { width: 60px; font-size: 11px; flex-shrink: 0; font-family: monospace; }
    .jv-bar-track { flex: 1; height: 18px; background: #0a1616; border-radius: 5px; overflow: hidden; position: relative; }
    .jv-bar-inner { height: 100%; border-radius: 5px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); opacity: 0.7; }
    .jv-bar-count { width: 32px; text-align: right; font-size: 11px; color: #c8e8e5; flex-shrink: 0; }
    .jv-bar-pct { width: 38px; text-align: right; font-size: 10px; color: #4a8080; flex-shrink: 0; }
    .jv-depth-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; padding-top: 10px; }
    .jv-depth-col { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
    .jv-depth-fill { width: 100%; background: linear-gradient(to top, #00c8b4, rgba(0,200,180,0.3)); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.5s cubic-bezier(0.4,0,0.2,1); }
    .jv-depth-num { font-size: 9px; color: #4a8080; }
    .jv-depth-label { font-size: 9px; color: #2e6060; }
    .jv-key-list { display: flex; flex-direction: column; gap: 5px; }
    .jv-key-row { display: flex; align-items: center; gap: 8px; }
    .jv-key-name { font-family: monospace; font-size: 11px; color: #00c8b4; width: 100px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .jv-key-bar-wrap { flex: 1; height: 8px; background: #0a1616; border-radius: 4px; overflow: hidden; }
    .jv-key-bar { height: 100%; background: linear-gradient(to right, rgba(0,200,180,0.6), rgba(0,200,180,0.2)); border-radius: 4px; transition: width 0.5s ease; }
    .jv-key-count { font-size: 10px; color: #4a8080; width: 24px; text-align: right; flex-shrink: 0; }
  `;

  function _injectCSS() {
    if (document.getElementById('devhub-css')) return;
    const s = document.createElement('style');
    s.id = 'devhub-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── Filtered tools ────────────────────────────────────────────────────────────
  function _filtered() {
    const q = _query.toLowerCase().trim();
    if (!q) return TOOLS;
    return TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }

  // ── Home screen ───────────────────────────────────────────────────────────────
  function _renderHome() {
    _activeTool = null;
    document.getElementById('dh-title-text').textContent = 'DevHub';
    document.getElementById('dh-home').style.display = 'none';
    document.getElementById('dh-search-wrap').style.display = 'flex';

    const list = _filtered();
    const body = document.getElementById('dh-body');

    if (!list.length) {
      body.innerHTML = `
        <div class="dh-no-results">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#1e3838" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div>No tools match "<strong style="color:#c8e8e5">${_query}</strong>"</div>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="dh-section-label">${_query ? `${list.length} result${list.length !== 1 ? 's' : ''}` : 'All Tools'}</div>
      <div class="dh-grid">
        ${list.map(t => `
          <div class="dh-tool-card" data-tool="${t.id}">
            <div class="dh-tool-card-icon">${t.icon}</div>
            <div>
              <div class="dh-tool-card-name">${t.name}</div>
              <div class="dh-tool-card-desc">${t.desc}</div>
            </div>
            <svg class="dh-tool-card-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`).join('')}
      </div>`;

    body.querySelectorAll('.dh-tool-card').forEach(card => {
      card.addEventListener('click', () => _openTool(card.dataset.tool));
    });
  }

  // ── Open a tool ───────────────────────────────────────────────────────────────
  function _openTool(id) {
    const tool = TOOLS.find(t => t.id === id);
    if (!tool) return;
    _activeTool = id;

    document.getElementById('dh-title-text').textContent = tool.name;
    document.getElementById('dh-home').style.display = 'flex';
    document.getElementById('dh-search-wrap').style.display = 'none';

    const body = document.getElementById('dh-body');
    body.innerHTML = '<div class="dh-tool-view" id="dh-tool-container"></div>';
    tool.render(document.getElementById('dh-tool-container'));
  }

  // ── Open / Close ──────────────────────────────────────────────────────────────
  function toggle() { _open ? close() : open(); }

  function open() {
    _open = true;
    _query = '';
    const panel    = document.getElementById('devhub-panel');
    const backdrop = document.getElementById('devhub-backdrop');
    panel.classList.remove('closing');
    backdrop.classList.add('open');
    panel.classList.add('open');
    _renderHome();
    // Focus search after animation
    setTimeout(() => {
      const inp = document.getElementById('dh-search');
      if (inp) inp.focus();
    }, 260);
  }

  function close() {
    if (!_open) return;
    _open = false;
    const panel    = document.getElementById('devhub-panel');
    const backdrop = document.getElementById('devhub-backdrop');
    panel.classList.add('closing');
    backdrop.classList.remove('open');
    setTimeout(() => {
      panel.classList.remove('open', 'closing');
    }, 200);
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    _injectCSS();

    document.getElementById('dh-close').addEventListener('click', close);
    document.getElementById('devhub-backdrop').addEventListener('click', close);

    document.getElementById('dh-home').addEventListener('click', () => {
      _activeTool = null;
      _renderHome();
    });

    // Search
    document.getElementById('dh-search').addEventListener('input', e => {
      _query = e.target.value;
      const clearBtn = document.getElementById('dh-search-clear');
      clearBtn.style.display = _query ? '' : 'none';
      _renderHome();
    });
    document.getElementById('dh-search-clear').addEventListener('click', () => {
      _query = '';
      document.getElementById('dh-search').value = '';
      document.getElementById('dh-search-clear').style.display = 'none';
      document.getElementById('dh-search').focus();
      _renderHome();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _open) close();
    });
  }

  return { init, toggle, open, close };
})();
