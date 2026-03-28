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
    HashTool,
    ImageConverterTool,
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
      width: min(680px, 92vw);
      max-height: min(600px, 88vh);
      background: #0d1f1f;
      border: 1px solid #1e3838;
      border-radius: 18px;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      opacity: 0; pointer-events: none;
      /* Use margin instead of translate to avoid subpixel blur */
      margin-left: calc(min(680px, 92vw) / -2);
      margin-top: -300px;
      transform: scale(0.93);
      transform-origin: center center;
      transition: opacity 0.25s cubic-bezier(0.4,0,0.2,1),
                  transform 0.28s cubic-bezier(0.34,1.4,0.64,1);
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,180,0.06);
      overflow: hidden;
      /* Force integer pixel rendering */
      will-change: transform, opacity;
      -webkit-font-smoothing: antialiased;
    }
    #devhub-panel.open {
      opacity: 1; pointer-events: all;
      transform: scale(1);
    }
    #devhub-panel.closing {
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.16s ease, transform 0.16s ease;
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

    /* ── Color Picker v2 ── */
    .cp-wrap { display: flex; flex-direction: column; gap: 10px; }
    .cp-hero {
      height: 70px; border-radius: 12px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 3px;
      transition: background 0.2s; border: 1px solid rgba(255,255,255,0.08);
      position: relative; overflow: hidden;
    }
    .cp-hero-hex { font-size: 18px; font-weight: 800; font-family: 'Consolas',monospace; letter-spacing: 1px; }
    .cp-hero-name { font-size: 11px; font-weight: 500; }
    .cp-picker-row { display: flex; gap: 10px; align-items: flex-start; }
    .cp-native-input { width: 48px; height: 48px; border: 2px solid #1e3838; border-radius: 10px; cursor: pointer; background: none; padding: 2px; flex-shrink: 0; }
    .cp-fields-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 5px; flex: 1; }
    .cp-field-group { display: flex; flex-direction: column; gap: 2px; }
    .cp-field-group label { font-size: 9.5px; color: #4a8080; text-transform: uppercase; letter-spacing: 0.4px; }
    .cp-field { width: 100% !important; padding: 5px 7px !important; font-size: 11.5px !important; text-align: center; }
    .cp-num { font-family: 'Consolas',monospace; }

    /* Alpha */
    .cp-alpha-row { display: flex; align-items: center; gap: 8px; }
    .cp-alpha-label { font-size: 10.5px; color: #4a8080; width: 44px; flex-shrink: 0; }
    .cp-alpha-track { flex: 1; height: 18px; border-radius: 9px; position: relative; overflow: hidden; border: 1px solid #1e3838; }
    .cp-alpha-checker, .cp-alpha-gradient { position: absolute; inset: 0; border-radius: 9px; }
    .cp-alpha-checker { background: repeating-conic-gradient(#2a4a4a 0% 25%, #1a3030 0% 50%) 0 0/10px 10px; }
    .cp-alpha-gradient { transition: background 0.2s; }
    .cp-slider { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; height: 100%; }
    .cp-alpha-val { font-size: 11px; color: #4a8080; width: 32px; text-align: right; flex-shrink: 0; font-family: monospace; }

    /* Tabs */
    .cp-tabs { display: flex; gap: 2px; background: #060e0e; border: 1px solid #1a3030; border-radius: 10px; padding: 3px; flex-wrap: wrap; }
    .cp-tab { flex: 1; background: none; border: none; border-radius: 7px; color: #4a8080; font-size: 10.5px; padding: 5px 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-weight: 500; }
    .cp-tab:hover { color: #c8e8e5; background: rgba(255,255,255,0.04); }
    .cp-tab.active { background: #122222; color: #00c8b4; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    .cp-tab-content { animation: dh-tool-in 0.18s ease both; }

    /* Contrast */
    .cp-contrast-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .cp-contrast-box { flex: 1; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 16px; font-weight: 700; border: 1px solid #1e3838; transition: background 0.2s; }
    .cp-cr-badge { font-size: 11px; font-weight: 600; font-family: monospace; }
    .cp-wcag-row { display: flex; flex-direction: column; gap: 4px; }
    .cp-wcag-row-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
    .cp-wcag-label { color: #4a8080; flex: 1; }
    .cp-wcag-badge { padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 600; }
    .cp-wcag-badge.pass { background: rgba(34,197,94,0.12); color: #22c55e; }
    .cp-wcag-badge.fail { background: rgba(239,68,68,0.1); color: #ef4444; }

    /* Palette / Harmony swatches */
    .cp-palette-label { font-size: 10px; color: #4a8080; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 5px; }
    .cp-swatch-row { display: flex; gap: 5px; flex-wrap: wrap; }
    .cp-swatch-item { width: 30px; height: 30px; border-radius: 7px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.15s, box-shadow 0.15s; flex-shrink: 0; }
    .cp-swatch-item:hover { transform: scale(1.15) translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }

    /* Harmony */
    .cp-harmony-grid { display: flex; flex-direction: column; gap: 8px; }
    .cp-harmony-row { display: flex; align-items: center; gap: 10px; }
    .cp-harmony-label { font-size: 10.5px; color: #4a8080; width: 110px; flex-shrink: 0; }

    /* Gradient */
    .cp-grad-controls { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
    .cp-grad-preview { height: 50px; border-radius: 10px; margin-top: 8px; border: 1px solid #1e3838; transition: background 0.2s; }
    .cp-grad-code { font-family: 'Consolas',monospace; font-size: 11px; color: #7aadad; background: #060e0e; border-radius: 7px; padding: 7px 10px; margin-top: 6px; word-break: break-all; }

    /* Color Blindness */
    .cp-blind-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; }
    .cp-blind-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cp-blind-swatch { width: 100%; height: 36px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); transition: transform 0.15s; }
    .cp-blind-swatch:hover { transform: scale(1.08); }
    .cp-blind-label { font-size: 9px; color: #4a8080; text-align: center; line-height: 1.3; }
    .cp-blind-hex { font-size: 9px; color: #2e6060; font-family: monospace; }

    /* CSS / Tailwind */
    .cp-css-out { font-family: 'Consolas',monospace; font-size: 11px; color: #86efac; background: #060e0e; border-radius: 8px; padding: 10px 12px; white-space: pre; line-height: 1.7; }
    .cp-tw-match { margin-top: 8px; }
    .cp-tw-row { display: flex; align-items: center; gap: 10px; background: #0a1616; border-radius: 9px; padding: 8px 12px; }
    .cp-tw-swatch { width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.08); }
    .cp-tw-name { font-size: 12px; color: #c8e8e5; font-weight: 600; }
    .cp-tw-dist { font-size: 10.5px; color: #4a8080; margin-top: 2px; }
    .cp-tw-dist code { color: #00c8b4; font-family: monospace; }
    .cp-tw-copy { margin-left: auto; flex-shrink: 0; }

    /* Actions */
    .cp-actions { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
    .cp-history-wrap { }
    .cp-preview-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .cp-swatch { width: 48px; height: 48px; border-radius: 12px; border: 1px solid #1e3838; flex-shrink: 0; background: #00c8b4; transition: background 0.15s; }
    .cp-fields { display: flex; flex-direction: column; gap: 8px; }
    .cp-contrast { margin-top: 4px; }
    .cp-contrast-label { font-size: 10.5px; color: #4a8080; margin-bottom: 6px; }
    .cp-contrast-ratio { font-size: 11px; color: #4a8080; }

    /* ── Canvas picker ── */
    .cp-canvas-wrap { display: flex; flex-direction: column; gap: 6px; }
    .cp-canvas {
      width: 100%; height: 150px; border-radius: 10px; cursor: crosshair;
      border: 1px solid #1a3030; display: block;
    }
    .cp-hue-wrap { }
    .cp-hue-bar {
      width: 100%; height: 14px; border-radius: 7px; cursor: pointer;
      border: 1px solid #1a3030; display: block;
    }

    /* ── Mixer ── */
    .cp-mixer-row { display: flex; gap: 16px; align-items: flex-end; }
    .cp-mixer-col { display: flex; flex-direction: column; gap: 4px; align-items: center; }
    .cp-mix-slider { width: 100%; accent-color: #00c8b4; margin: 6px 0; cursor: pointer; }
    .cp-mix-preview-row { margin: 4px 0; }
    .cp-mix-result {
      height: 36px; border-radius: 9px; display: flex; align-items: center;
      justify-content: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
      transition: transform 0.15s;
    }
    .cp-mix-result:hover { transform: scale(1.02); }
    .cp-mix-steps-row { display: flex; gap: 4px; margin-top: 6px; }

    /* ── Named Colors ── */
    .cp-named-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 5px; max-height: 180px; overflow-y: auto;
    }
    .cp-named-grid::-webkit-scrollbar { width: 4px; }
    .cp-named-grid::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .cp-named-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      cursor: pointer; padding: 4px; border-radius: 7px;
      transition: background 0.12s;
    }
    .cp-named-item:hover { background: rgba(0,200,180,0.07); }
    .cp-named-swatch { width: 100%; height: 28px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.08); }
    .cp-named-label { font-size: 9px; color: #4a8080; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

    /* ── Image Colors ── */
    .cp-img-drop {
      border: 2px dashed #1e3838; border-radius: 10px; padding: 20px;
      text-align: center; color: #4a8080; font-size: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      transition: border-color 0.2s; cursor: pointer;
    }
    .cp-img-drop:hover { border-color: rgba(0,200,180,0.3); }

    /* ── Saved Palettes ── */
    .cp-saved-add-row { display: flex; gap: 6px; margin-bottom: 10px; }
    .cp-saved-list { display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto; }
    .cp-saved-list::-webkit-scrollbar { width: 4px; }
    .cp-saved-list::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .cp-saved-row {
      display: flex; align-items: center; gap: 8px;
      background: #0a1616; border-radius: 8px; padding: 7px 10px;
      border: 1px solid #1a3030;
    }
    .cp-saved-name { font-size: 11px; color: #c8e8e5; font-weight: 500; width: 80px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Regex Tester v2 ── */
    .rx-wrap { display: flex; flex-direction: column; gap: 8px; }
    .rx-pattern-row { display: flex; align-items: center; gap: 5px; }
    .rx-slash { color: #00c8b4; font-size: 20px; font-family: monospace; line-height: 1; flex-shrink: 0; }
    .rx-pattern-input { flex: 1; font-family: 'Consolas',monospace !important; }
    .rx-flags-row { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; }
    .rx-flag { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #4a8080; cursor: pointer; font-family: monospace; user-select: none; }
    .rx-flag input { accent-color: #00c8b4; }
    .rx-status-row { display: flex; align-items: center; gap: 10px; min-height: 18px; }
    .rx-match-count { font-size: 11px; color: #4a8080; }

    /* Char helpers */
    .rx-char-helpers { display: flex; flex-wrap: wrap; gap: 4px; }
    .rx-char-btn {
      background: #0a1616; border: 1px solid #1a3030; border-radius: 5px;
      color: #4a8080; font-size: 10.5px; font-family: 'Consolas',monospace;
      padding: 3px 7px; cursor: pointer; transition: all 0.12s;
    }
    .rx-char-btn:hover { background: rgba(0,200,180,0.1); color: #00c8b4; border-color: rgba(0,200,180,0.3); }

    /* Tabs */
    .rx-tabs { display: flex; gap: 2px; background: #060e0e; border: 1px solid #1a3030; border-radius: 10px; padding: 3px; flex-wrap: wrap; }
    .rx-tab { background: none; border: none; border-radius: 7px; color: #4a8080; font-size: 10.5px; padding: 5px 9px; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-weight: 500; }
    .rx-tab:hover { color: #c8e8e5; background: rgba(255,255,255,0.04); }
    .rx-tab.active { background: #122222; color: #00c8b4; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    .rx-tab-content { animation: dh-tool-in 0.18s ease both; }
    .rx-textarea { min-height: 70px !important; font-family: 'Consolas',monospace !important; font-size: 12px !important; }

    /* Highlight */
    .rx-highlighted { white-space: pre-wrap; word-break: break-all; font-family: 'Consolas',monospace; font-size: 12px; }
    mark.rx-mark { background: rgba(0,200,180,0.22); color: #00c8b4; border-radius: 2px; padding: 0 1px; cursor: default; }

    /* Groups */
    .rx-groups { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
    .rx-group-section { font-size: 10px; color: #2e6060; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; margin-bottom: 2px; }
    .rx-group-row { display: flex; gap: 8px; font-size: 11.5px; padding: 2px 4px; }
    .rx-group-idx { color: #4a8080; font-family: monospace; min-width: 30px; flex-shrink: 0; }
    .rx-group-val { color: #86efac; font-family: monospace; }

    /* Replace */
    .rx-rep-row { display: flex; gap: 6px; margin-top: 6px; align-items: center; }

    /* Split */
    .rx-split-item { display: flex; gap: 8px; font-size: 11.5px; padding: 4px 8px; background: #060e0e; border-radius: 5px; }
    .rx-split-idx { color: #4a8080; font-family: monospace; width: 20px; flex-shrink: 0; }
    .rx-split-val { color: #c8e8e5; font-family: monospace; word-break: break-all; }

    /* Multi-line */
    .rx-ml-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; padding: 4px 8px; border-radius: 6px; }
    .rx-ml-pass { background: rgba(34,197,94,0.07); }
    .rx-ml-fail { background: rgba(239,68,68,0.07); }
    .rx-ml-badge { font-size: 12px; font-weight: 700; width: 16px; flex-shrink: 0; }
    .rx-ml-pass .rx-ml-badge { color: #22c55e; }
    .rx-ml-fail .rx-ml-badge { color: #ef4444; }
    .rx-ml-line { flex: 1; font-family: monospace; color: #c8e8e5; word-break: break-all; }
    .rx-ml-cnt { font-size: 10px; color: #4a8080; flex-shrink: 0; }

    /* Match Table */
    .rx-table { width: 100%; border-collapse: collapse; font-size: 11.5px; font-family: 'Consolas',monospace; }
    .rx-table th { background: #0a1616; color: #4a8080; padding: 5px 8px; text-align: left; border-bottom: 1px solid #1a3030; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.4px; }
    .rx-table td { padding: 4px 8px; border-bottom: 1px solid #0d1a1a; color: #c8e8e5; }
    .rx-table tr:hover td { background: rgba(0,200,180,0.04); }
    .rx-table code { color: #00c8b4; }

    /* Test Cases */
    .rx-cases-add { display: flex; gap: 6px; align-items: center; }
    .rx-case-row { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #060e0e; border-radius: 7px; font-size: 11.5px; }
    .rx-case-expect { font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; }
    .rx-case-green { background: rgba(34,197,94,0.12); color: #22c55e; }
    .rx-case-red   { background: rgba(239,68,68,0.12);  color: #ef4444; }
    .rx-case-val { flex: 1; font-family: monospace; color: #c8e8e5; word-break: break-all; }
    .rx-case-result { font-size: 11px; font-weight: 600; flex-shrink: 0; }

    /* Code Gen */
    .rx-codegen-langs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
    .rx-lang-btn { background: #0a1616; border: 1px solid #1a3030; border-radius: 6px; color: #4a8080; font-size: 11px; padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
    .rx-lang-btn:hover { color: #c8e8e5; background: #122222; }
    .rx-lang-btn.active { background: rgba(0,200,180,0.12); color: #00c8b4; border-color: rgba(0,200,180,0.3); }
    .rx-code-out { font-family: 'Consolas',monospace; font-size: 11.5px; color: #86efac; background: #060e0e; border: 1px solid #1a3030; border-radius: 10px; padding: 12px 14px; white-space: pre; overflow-x: auto; line-height: 1.7; margin: 0; max-height: 200px; overflow-y: auto; }
    .rx-code-out::-webkit-scrollbar { width: 4px; height: 4px; }
    .rx-code-out::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }

    /* Explainer */
    .rx-explain-out { display: flex; flex-direction: column; gap: 10px; }
    .rx-explain-tokens { display: flex; flex-direction: column; gap: 4px; }
    .rx-explain-token { display: flex; align-items: baseline; gap: 10px; padding: 4px 8px; background: #060e0e; border-radius: 6px; }
    .rx-explain-tok { color: #00c8b4; font-family: 'Consolas',monospace; font-size: 13px; min-width: 60px; flex-shrink: 0; }
    .rx-explain-desc { font-size: 11.5px; color: #7aadad; }
    .rx-explain-summary { background: #0a1616; border: 1px solid #1a3030; border-radius: 9px; padding: 10px 12px; }
    .rx-explain-sum-title { font-size: 10px; color: #2e6060; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
    .rx-explain-sum-item { font-size: 11.5px; color: #7aadad; padding: 2px 0; }

    /* Library + Saved */
    .rx-lib-list { display: flex; flex-direction: column; gap: 5px; max-height: 200px; overflow-y: auto; }
    .rx-lib-list::-webkit-scrollbar { width: 4px; }
    .rx-lib-list::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .rx-lib-item { display: flex; align-items: center; gap: 8px; padding: 7px 10px; background: #060e0e; border-radius: 8px; border: 1px solid #1a3030; flex-wrap: wrap; }
    .rx-lib-name { font-size: 11.5px; color: #c8e8e5; font-weight: 500; min-width: 100px; flex-shrink: 0; }
    .rx-lib-pat { font-size: 10.5px; color: #4a8080; font-family: 'Consolas',monospace; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rx-saved-add-row { display: flex; gap: 6px; margin-bottom: 8px; }

    /* ── Regex v2 new features CSS ── */
    /* Visualizer */
    .rx-visual-out { overflow-x: auto; }
    .rx-visual-flow { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 10px 0; min-height: 60px; }
    .rx-visual-start, .rx-visual-end {
      background: rgba(0,200,180,0.15); border: 1px solid rgba(0,200,180,0.3);
      border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 700;
      color: #00c8b4; flex-shrink: 0;
    }
    .rx-visual-arrow { color: #2e6060; font-size: 14px; flex-shrink: 0; }
    .rx-visual-node {
      border: 1px solid; border-radius: 8px; padding: 5px 10px;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      flex-shrink: 0; transition: transform 0.15s, box-shadow 0.15s; cursor: default;
    }
    .rx-visual-node:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .rx-vn-val { font-family: 'Consolas',monospace; font-size: 13px; font-weight: 600; }
    .rx-vn-type { font-size: 9px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.4px; }
    .rx-visual-legend { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
    .rx-vl-item { font-size: 10px; padding: 2px 8px; border-radius: 10px; border: 1px solid; }

    /* Navigator */
    .rx-nav-controls { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
    .rx-nav-info { font-size: 12px; color: #c8e8e5; font-weight: 600; min-width: 60px; text-align: center; }
    .rx-nav-display { min-height: 50px; }
    mark.rx-nav-current { background: rgba(251,191,36,0.3); color: #fbbf24; border-radius: 3px; outline: 2px solid rgba(251,191,36,0.5); }
    .rx-nav-detail { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .rx-nav-detail-row { display: flex; align-items: center; gap: 6px; background: #060e0e; border-radius: 6px; padding: 4px 9px; font-size: 11.5px; }
    .rx-nav-dk { color: #4a8080; min-width: 40px; }
    .rx-nav-dv { color: #00c8b4; font-family: monospace; }

    /* Benchmark */
    .rx-bench-controls { display: flex; gap: 8px; align-items: flex-end; margin: 8px 0; flex-wrap: wrap; }
    .rx-bench-field { display: flex; flex-direction: column; gap: 3px; }
    .rx-bench-field label { font-size: 10px; color: #4a8080; text-transform: uppercase; letter-spacing: 0.4px; }
    .rx-bench-out { margin-top: 8px; }
    .rx-bench-result { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 10px; }
    .rx-bench-stat { background: #0a1616; border: 1px solid #1a3030; border-radius: 10px; padding: 12px; text-align: center; transition: border-color 0.15s; }
    .rx-bench-stat:hover { border-color: rgba(0,200,180,0.3); }
    .rx-bench-num { font-size: 20px; font-weight: 800; color: #00c8b4; line-height: 1; font-family: -apple-system,sans-serif; }
    .rx-bench-unit { font-size: 11px; color: #4a8080; margin-left: 2px; }
    .rx-bench-label { font-size: 9.5px; color: #4a8080; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .rx-bench-warn { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 8px; padding: 8px 12px; font-size: 11.5px; color: #fbbf24; }
    .rx-bench-ok { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 8px; padding: 8px 12px; font-size: 11.5px; color: #22c55e; }

    /* History */
    .rx-history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }

    /* Share */
    .rx-share-card { background: #060e0e; border: 1px solid #1a3030; border-radius: 10px; padding: 12px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; }
    .rx-share-row { display: flex; align-items: baseline; gap: 8px; font-size: 11.5px; }
    .rx-share-k { color: #4a8080; width: 50px; flex-shrink: 0; }
    .rx-share-v { color: #c8e8e5; font-family: monospace; word-break: break-all; }
    .rx-share-link { color: #00c8b4; }
    .rx-share-actions { display: flex; gap: 6px; margin-bottom: 8px; }
    .rx-share-import-row { display: flex; gap: 6px; margin-top: 8px; }

    /* Escape Helper */
    .rx-esc-actions { display: flex; gap: 6px; margin: 6px 0; }
    .rx-esc-chars { margin-top: 10px; }
    .rx-esc-char-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .rx-esc-char { background: #0a1616; border: 1px solid #1a3030; border-radius: 4px; padding: 2px 7px; font-size: 13px; color: #fdba74; font-family: monospace; }

    /* Quantifier Helper */
    .rx-quant-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; margin-bottom: 12px; }
    .rx-quant-card {
      background: #0a1616; border: 1px solid #1a3030; border-radius: 10px;
      padding: 10px 8px; text-align: center; cursor: pointer;
      transition: all 0.15s;
    }
    .rx-quant-card:hover { background: rgba(0,200,180,0.08); border-color: rgba(0,200,180,0.3); transform: translateY(-2px); }
    .rx-quant-sym { font-size: 20px; font-weight: 800; color: #fdba74; font-family: monospace; line-height: 1; }
    .rx-quant-name { font-size: 9.5px; color: #4a8080; margin-top: 4px; }
    .rx-quant-ex { font-size: 9px; color: #2e6060; margin-top: 2px; font-family: monospace; }
    .rx-quant-custom { background: #0a1616; border: 1px solid #1a3030; border-radius: 10px; padding: 12px; }
    .rx-quant-custom-label { font-size: 10.5px; color: #4a8080; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .rx-quant-custom-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rx-quant-num { width: 70px !important; text-align: center; }
    .rx-quant-preview { font-family: monospace; font-size: 18px; color: #fdba74; margin-top: 8px; min-height: 24px; font-weight: 700; }

    /* Unicode */
    .rx-unicode-grid { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; }
    .rx-unicode-grid::-webkit-scrollbar { width: 4px; }
    .rx-unicode-grid::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .rx-uni-section { background: #060e0e; border-radius: 9px; padding: 8px 10px; }
    .rx-uni-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
    .rx-uni-props { display: flex; flex-wrap: wrap; gap: 4px; }
    .rx-uni-btn { border: 1px solid; border-radius: 5px; background: none; font-family: 'Consolas',monospace; font-size: 10.5px; padding: 3px 8px; cursor: pointer; transition: all 0.12s; }
    .rx-uni-btn:hover { opacity: 0.8; transform: scale(1.05); }

    /* Base64 */
    .b64-drop {
      border: 2px dashed #1e3838; border-radius: 12px; padding: 28px;
      text-align: center; color: #4a8080; font-size: 12px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      transition: border-color 0.2s, background 0.2s; cursor: pointer;
    }
    .b64-drop:hover { border-color: rgba(0,200,180,0.3); background: rgba(0,200,180,0.03); }

    /* ── JSON Viewer v2.1 ── */
    .jv-wrap { display: flex; flex-direction: column; gap: 10px; }
    .jv-textarea { min-height: 80px !important; font-size: 11.5px !important; resize: vertical; }
    .jv-input-actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .jv-upload-label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }

    /* Tabs bar */
    .jv-tabs {
      display: flex; align-items: center; gap: 2px;
      background: #0a1616; border: 1px solid #1a3030; border-radius: 10px;
      padding: 4px;
    }
    .jv-tab {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: none; border-radius: 7px;
      color: #4a8080; font-size: 12px; padding: 6px 14px; cursor: pointer;
      transition: all 0.18s; flex: 1; justify-content: center;
      font-weight: 500;
    }
    .jv-tab:hover { color: #c8e8e5; background: rgba(255,255,255,0.04); }
    .jv-tab.active {
      background: #122222; color: #00c8b4;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    .jv-tab-actions { display: flex; gap: 4px; margin-left: auto; padding-left: 6px; }
    .jv-sm-btn { padding: 4px 9px !important; font-size: 10.5px !important; }

    /* ── Tree ── */
    .jv-tree-wrap {
      background: #060e0e;
      border: 1px solid #1a3030;
      border-radius: 12px;
      padding: 12px 14px;
      max-height: 260px;
      overflow-y: auto;
      overflow-x: auto;
      /* Critical: no transform, no filter on this element */
      transform: none;
      filter: none;
      -webkit-font-smoothing: subpixel-antialiased;
      text-rendering: optimizeLegibility;
    }
    .jv-tree-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
    .jv-tree-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .jv-tree {
      font-family: 'Consolas', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
      font-size: 12.5px;
      line-height: 1.75;
      color: #c8e8e5;
      /* Prevent subpixel issues */
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    .jv-node { position: relative; }
    .jv-row {
      display: flex; align-items: center; gap: 2px;
      padding: 1px 6px 1px 2px;
      border-radius: 5px;
      transition: background 0.1s;
      min-height: 22px;
      cursor: default;
      white-space: nowrap;
    }
    .jv-row:hover { background: rgba(0,200,180,0.07); }
    .jv-toggle {
      width: 16px; height: 16px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: #2e6060; border-radius: 3px;
      transition: color 0.15s, background 0.15s;
      cursor: pointer;
    }
    .jv-toggle:hover { color: #00c8b4; background: rgba(0,200,180,0.1); }
    .jv-toggle-empty { width: 16px; flex-shrink: 0; }
    .jv-key { color: #00c8b4; font-weight: 500; }
    .jv-colon { color: #2e6060; margin: 0 2px; }
    .jv-bracket { color: #5a9090; }
    .jv-count {
      font-size: 10px; color: #2a5050; margin-left: 6px;
      background: rgba(0,200,180,0.07);
      border: 1px solid rgba(0,200,180,0.1);
      border-radius: 4px; padding: 0 6px;
      font-family: -apple-system, sans-serif;
    }
    .jv-preview { cursor: pointer; opacity: 0.85; }
    .jv-preview:hover { opacity: 1; }
    .jv-children {
      border-left: 1px solid #1a3030;
      margin-left: 7px;
      padding-left: 2px;
      animation: jv-expand 0.18s ease both;
    }
    @keyframes jv-expand {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .jv-str  { color: #86efac; }
    .jv-num  { color: #fdba74; }
    .jv-bool { color: #a5b4fc; }
    .jv-null { color: #6b7280; font-style: italic; }

    /* Tooltip — no blur, sharp */
    .jv-tooltip {
      position: fixed; z-index: 99999;
      background: #0f2020;
      border: 1px solid #2a4a4a;
      border-radius: 9px;
      padding: 9px 13px;
      font-size: 11.5px; line-height: 1.8;
      font-family: 'Consolas', monospace;
      box-shadow: 0 8px 28px rgba(0,0,0,0.6);
      pointer-events: none; display: none;
      min-width: 130px;
      /* No backdrop-filter here — causes blur */
      transform: translateZ(0);
    }

    /* ── Stats ── */
    .jv-stats-wrap {
      display: flex; flex-direction: column; gap: 12px;
      max-height: 300px; overflow-y: auto;
      padding-right: 2px;
    }
    .jv-stats-wrap::-webkit-scrollbar { width: 4px; }
    .jv-stats-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }

    .jv-stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    }
    .jv-stat-card {
      background: linear-gradient(135deg, #0f2020, #0a1616);
      border: 1px solid #1e3838; border-radius: 11px;
      padding: 13px 10px; text-align: center;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .jv-stat-card:hover {
      border-color: rgba(0,200,180,0.35);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .jv-stat-num {
      font-size: 24px; font-weight: 800; color: #00c8b4;
      line-height: 1; font-family: -apple-system, sans-serif;
      animation: jv-count-in 0.5s cubic-bezier(0.34,1.4,0.64,1) both;
    }
    @keyframes jv-count-in {
      from { opacity: 0; transform: scale(0.7); }
      to   { opacity: 1; transform: scale(1); }
    }
    .jv-stat-label {
      font-size: 9.5px; color: #4a8080; margin-top: 5px;
      text-transform: uppercase; letter-spacing: 0.6px;
    }

    .jv-graph-section {
      background: #0a1616; border: 1px solid #1a3030;
      border-radius: 11px; padding: 13px 15px;
    }
    .jv-graph-title {
      font-size: 10.5px; font-weight: 700; color: #2e6060;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;
      display: flex; align-items: center; gap: 6px;
    }
    .jv-graph-title::after {
      content: ''; flex: 1; height: 1px; background: #1a3030;
    }

    /* Animated bar chart */
    .jv-bars { display: flex; flex-direction: column; gap: 8px; }
    .jv-bar-row { display: flex; align-items: center; gap: 10px; }
    .jv-bar-label {
      width: 56px; font-size: 11px; flex-shrink: 0;
      font-family: 'Consolas', monospace; font-weight: 500;
    }
    .jv-bar-track {
      flex: 1; height: 20px; background: #060e0e;
      border-radius: 6px; overflow: hidden;
      border: 1px solid #1a3030; position: relative;
    }
    .jv-bar-inner {
      height: 100%; border-radius: 5px;
      width: 0; /* starts at 0, animated via JS */
      transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
      position: relative; overflow: hidden;
    }
    .jv-bar-inner::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
      animation: jv-shimmer 2s infinite;
    }
    @keyframes jv-shimmer {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }
    .jv-bar-count { width: 30px; text-align: right; font-size: 11px; color: #c8e8e5; flex-shrink: 0; }
    .jv-bar-pct { width: 36px; text-align: right; font-size: 10px; color: #4a8080; flex-shrink: 0; }

    /* Depth histogram */
    .jv-depth-bars {
      display: flex; align-items: flex-end; gap: 5px;
      height: 90px; padding-top: 8px;
    }
    .jv-depth-col {
      display: flex; flex-direction: column; align-items: center;
      gap: 3px; flex: 1; cursor: default;
    }
    .jv-depth-fill {
      width: 100%;
      background: linear-gradient(to top, #00c8b4, rgba(0,200,180,0.25));
      border-radius: 4px 4px 0 0; min-height: 3px;
      height: 0; /* animated via JS */
      transition: height 0.6s cubic-bezier(0.34,1.2,0.64,1);
      box-shadow: 0 0 8px rgba(0,200,180,0.2);
    }
    .jv-depth-col:hover .jv-depth-fill { filter: brightness(1.3); }
    .jv-depth-num { font-size: 9px; color: #4a8080; }
    .jv-depth-label { font-size: 9px; color: #2e6060; }

    /* Top keys */
    .jv-key-list { display: flex; flex-direction: column; gap: 6px; }
    .jv-key-row { display: flex; align-items: center; gap: 8px; }
    .jv-key-name {
      font-family: 'Consolas', monospace; font-size: 11px; color: #00c8b4;
      width: 110px; flex-shrink: 0; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }
    .jv-key-bar-wrap {
      flex: 1; height: 10px; background: #060e0e;
      border-radius: 5px; overflow: hidden; border: 1px solid #1a3030;
    }
    .jv-key-bar {
      height: 100%;
      background: linear-gradient(to right, rgba(0,200,180,0.7), rgba(0,200,180,0.2));
      border-radius: 5px;
      width: 0; transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .jv-key-count { font-size: 10px; color: #4a8080; width: 26px; text-align: right; flex-shrink: 0; }

    /* ── New features CSS ── */
    /* Input row with line numbers */
    .jv-input-row { position: relative; }
    .jv-textarea-wrap { display: flex; position: relative; }
    .jv-line-nums {
      background: #060e0e; border: 1px solid #1a3030; border-right: none;
      border-radius: 10px 0 0 10px; padding: 10px 8px;
      font-family: 'Consolas', monospace; font-size: 11.5px; line-height: 1.6;
      color: #2e6060; text-align: right; min-width: 36px;
      overflow: hidden; user-select: none; flex-shrink: 0;
      white-space: pre;
    }
    .jv-textarea-wrap .dh-textarea {
      border-radius: 0 10px 10px 0 !important;
      min-height: 80px !important; font-size: 11.5px !important;
      resize: vertical;
    }
    .jv-size-badge {
      font-size: 10.5px; color: #4a8080; padding: 3px 0;
    }

    /* Action bar */
    .jv-action-bar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
    .jv-action-left, .jv-action-right { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }

    /* Tabs */
    .jv-tabs { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .jv-tab-pills { display: flex; gap: 2px; background: #060e0e; border: 1px solid #1a3030; border-radius: 10px; padding: 3px; }
    .jv-tab {
      display: inline-flex; align-items: center; gap: 5px;
      background: none; border: none; border-radius: 7px;
      color: #4a8080; font-size: 11.5px; padding: 5px 12px; cursor: pointer;
      transition: all 0.15s; font-weight: 500;
    }
    .jv-tab:hover { color: #c8e8e5; background: rgba(255,255,255,0.04); }
    .jv-tab.active { background: #122222; color: #00c8b4; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    .jv-tree-controls { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
    .jv-tab-actions { display: flex; gap: 4px; }
    .jv-sm-btn { padding: 4px 8px !important; font-size: 11px !important; }

    /* Search */
    .jv-search-wrap {
      display: flex; align-items: center; gap: 6px;
      background: #060e0e; border: 1px solid #1a3030; border-radius: 7px;
      padding: 4px 9px; transition: border-color 0.2s;
    }
    .jv-search-wrap:focus-within { border-color: rgba(0,200,180,0.4); }
    .jv-search-input { background: none; border: none; outline: none; color: #c8e8e5; font-size: 11.5px; width: 130px; }
    .jv-search-input::placeholder { color: #2e6060; }
    .jv-search-count { font-size: 10px; color: #4a8080; white-space: nowrap; }

    /* Tree */
    .jv-tree-wrap {
      background: #060e0e; border: 1px solid #1a3030; border-radius: 12px;
      padding: 10px 12px; max-height: 240px; overflow: auto;
      transform: none; filter: none;
      -webkit-font-smoothing: subpixel-antialiased;
    }
    .jv-tree-wrap::-webkit-scrollbar { width: 4px; height: 4px; }
    .jv-tree-wrap::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .jv-tree {
      font-family: 'Consolas','Cascadia Code','Fira Code',monospace;
      font-size: 12.5px; line-height: 1.75; color: #c8e8e5;
      transform: translateZ(0); backface-visibility: hidden;
    }
    /* Light theme */
    .jv-light { background: #f0fafa !important; }
    .jv-light .jv-tree { color: #1a3030; }
    .jv-light .jv-row:hover { background: rgba(0,200,180,0.08); }
    .jv-light .jv-children { border-color: #c0e0e0; }

    .jv-node { position: relative; }
    .jv-row {
      display: flex; align-items: center; gap: 2px;
      padding: 1px 4px; border-radius: 5px; min-height: 22px;
      transition: background 0.1s; white-space: nowrap; cursor: default;
    }
    .jv-row:hover { background: rgba(0,200,180,0.07); }
    .jv-match { background: rgba(0,200,180,0.12) !important; }
    .jv-bookmarked { border-left: 2px solid #f59e0b !important; }
    .jv-toggle {
      width: 16px; height: 16px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      color: #2e6060; border-radius: 3px; cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }
    .jv-toggle:hover { color: #00c8b4; background: rgba(0,200,180,0.1); }
    .jv-toggle-empty { width: 16px; flex-shrink: 0; }
    .jv-bm-btn {
      font-size: 10px; color: #1e3838; cursor: pointer; padding: 0 2px;
      transition: color 0.15s; line-height: 1; opacity: 0;
    }
    .jv-row:hover .jv-bm-btn { opacity: 1; }
    .jv-bm-btn.active { color: #f59e0b; opacity: 1; }
    .jv-key { font-weight: 500; cursor: pointer; }
    .jv-key:hover { text-decoration: underline; text-decoration-style: dotted; }
    .jv-colon { color: #2e6060; margin: 0 2px; }
    .jv-bracket { color: #5a9090; }
    .jv-count {
      font-size: 10px; color: #2a5050; margin-left: 6px;
      background: rgba(0,200,180,0.07); border: 1px solid rgba(0,200,180,0.1);
      border-radius: 4px; padding: 0 5px; font-family: -apple-system,sans-serif;
    }
    .jv-preview { cursor: pointer; opacity: 0.85; }
    .jv-preview:hover { opacity: 1; }
    .jv-children {
      border-left: 1px solid #1a3030; margin-left: 7px; padding-left: 2px;
      animation: jv-expand 0.18s ease both;
    }
    @keyframes jv-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
    .jv-edit-input {
      background: #0a1616; border: 1px solid rgba(0,200,180,0.4); border-radius: 5px;
      color: #c8e8e5; font-family: 'Consolas',monospace; font-size: 12px;
      padding: 1px 6px; outline: none; min-width: 80px;
    }

    /* Tooltip */
    .jv-tooltip {
      position: fixed; z-index: 99999; background: #0f2020;
      border: 1px solid #2a4a4a; border-radius: 9px; padding: 9px 13px;
      font-size: 11.5px; line-height: 1.8; font-family: 'Consolas',monospace;
      box-shadow: 0 8px 28px rgba(0,0,0,0.6); pointer-events: none;
      display: none; min-width: 140px; transform: translateZ(0);
    }

    /* Diff */
    .jv-diff-wrap { display: flex; flex-direction: column; gap: 8px; }
    .jv-diff-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .jv-diff-col { display: flex; flex-direction: column; gap: 4px; }
    .jv-diff-label { font-size: 10.5px; color: #4a8080; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .jv-diff-ta { min-height: 70px !important; font-size: 11.5px !important; }
    .jv-diff-result { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; max-height: 160px; overflow-y: auto; }
    .jv-diff-result::-webkit-scrollbar { width: 4px; }
    .jv-diff-result::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
    .jv-diff-ok { color: #22c55e; font-size: 12px; padding: 8px; }
    .jv-diff-count { font-size: 11px; color: #4a8080; padding: 4px 0; }
    .jv-diff-item {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 6px 10px; border-radius: 7px; font-size: 11.5px;
      font-family: 'Consolas',monospace; animation: jv-expand 0.15s ease both;
    }
    .jv-diff-added   { background: rgba(34,197,94,0.08);  border-left: 3px solid #22c55e; }
    .jv-diff-removed { background: rgba(239,68,68,0.08);  border-left: 3px solid #ef4444; }
    .jv-diff-changed { background: rgba(251,191,36,0.08); border-left: 3px solid #fbbf24; }
    .jv-diff-type { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 1px 5px; border-radius: 3px; flex-shrink: 0; }
    .jv-diff-added   .jv-diff-type { background: rgba(34,197,94,0.2);  color: #22c55e; }
    .jv-diff-removed .jv-diff-type { background: rgba(239,68,68,0.2);  color: #ef4444; }
    .jv-diff-changed .jv-diff-type { background: rgba(251,191,36,0.2); color: #fbbf24; }
    .jv-diff-path { color: #67e8f9; flex: 1; }
    .jv-diff-from { color: #ef4444; text-decoration: line-through; opacity: 0.8; }
    .jv-diff-arrow { color: #4a8080; }
    .jv-diff-to { color: #22c55e; }

    /* Schema */
    .jv-schema-wrap { display: flex; flex-direction: column; gap: 8px; }
    .jv-schema-actions { display: flex; align-items: center; gap: 10px; }
    .jv-schema-out {
      font-family: 'Consolas',monospace; font-size: 11.5px; color: #86efac;
      line-height: 1.65; white-space: pre; overflow: auto; max-height: 200px;
      margin: 0; padding: 10px 12px;
    }
    .jv-schema-out::-webkit-scrollbar { width: 4px; }
    .jv-schema-out::-webkit-scrollbar-thumb { background: #1a4a4a; border-radius: 2px; }
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
