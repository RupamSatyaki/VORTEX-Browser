## Vortex Browser v4.5.0

### 🤖 Built-in AI Assistant (Ollama)

A fully local, private AI assistant powered by Ollama — no cloud, no data leaving your machine.

**How to use:**
- Click **Assistant** in the toolbar or press `Ctrl+Shift+A` to open the side panel
- Requires [Ollama](https://ollama.ai) running locally + at least one model (`ollama pull llama3`)

**Features:**
- **34 MCP Browser Control Tools** — AI can control your browser:
  - Tabs: create, close, switch, duplicate, mute
  - Navigation: navigate, go back/forward, reload, stop loading
  - Page: read content, get info, get selected text, scroll, zoom, find in page
  - Window: new window, incognito, minimize, maximize
  - Bookmarks, History, Downloads, Screenshot, PiP, Web Search
- **Thinking Model Support** — `<think>` tags detected in real-time. Spinner while thinking → "Thought for Xs" collapsible accordion when done (DeepSeek-R1, Qwen3, Phi4, etc.)
- **Page Reading** — Click 📎 to attach current page content, or type "summarize this page" — auto-detected
- **Streaming Chat** — Token-by-token response with stop button. Tool calls shown as collapsible cards (auto-collapse on success, stay open on error)
- **Model Selector** — Live Ollama status dot (green/red/yellow), auto-fetch available models, refresh button, default model saved

---

### 🏗️ Full Code Restructure

The entire codebase has been reorganized into modular files for better maintainability:

- **Settings panel:** 4,289 lines → 316 lines + 65 modular files (`js/settings/`)
- **Main process IPC:** 1,164 lines → 13 handler files (`main/ipc/`)
- **Renderer features:** 8 large files → 130+ modular files
  - `navigation.js` (1,374 lines) → `browser/navigation/` (10 files)
  - `webview.js` (949 lines) → `browser/webview/` (10 files)
  - `tabs.js` (750 lines) → `browser/tabs/` (6 files)
  - `ipc.js` (719 lines) → `core/ipc/` (5 files)
- **DevHub Lazy Loading** — 42 tool scripts now load only when DevHub is opened (~35% faster startup: 76 scripts instead of 118)

---

### ⚠️ YouTube Ad Blocker — Temporarily Removed

The YouTube ad blocker has been temporarily removed in this version.

YouTube's advanced detection system detects DOM manipulation, `playbackRate` changes, and `executeJavaScript` injection — all of which triggered the "Ad blockers violate YouTube's Terms of Service" popup.

**A better, undetectable solution is coming in v4.6.0.**

---

### 🐛 Bug Fixes

- **Storage path fix** — `passwordHandlers`, `permissionHandlers`, `addressHandlers` were using wrong path (`vortex/storage/` instead of `storage/`). Fixed to use `STORAGE_DIR` from `storage.js`
- **WhatsApp Panel crash** — `WhatsAppPanel` module was missing, causing toolbar button to crash on click. Module created.
- **Storage:read duplicate handler** — `main.js` and `ipcHandler.js` both registered storage handlers, causing Electron crash on startup. Fixed.
- **Find in page not working** — `DOMContentLoaded` wrapper prevented event listeners from binding after restructure. Wrapper removed, direct bind.

---

### Installation

Download the `.exe` installer below and run it.

> **Note:** If Windows SmartScreen shows a warning, click **More info → Run anyway**.

**Full Changelog:** [v4.4.0...v4.5.0](https://github.com/RupamSatyaki/VORTEX-Browser/compare/v4.4.0...v4.5.0)
