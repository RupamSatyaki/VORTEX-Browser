## Vortex Browser v4.6.0

### 📺 YouTube Ad Blocker — Undetectable

A completely reworked YouTube ad blocker that YouTube cannot detect.

**How it works:**

YouTube runs in a **dedicated Electron session** (`persist:youtube`) with its own `webRequest` interceptor. Ad requests are blocked at the network level — YouTube sees a network error, not an ad blocker.

**Layer 1 — Session Network Block:**
- Ad video URLs identified by parameters: `ctier=L`, `oad=1`, `adformat=`, `ad_type=`
- Ad tracking endpoints blocked: `/api/stats/ads`, `/pagead/`, `/ptracking`, `/get_midroll_info`
- Ad domains blocked when referrer is YouTube: `pagead2.googlesyndication.com`, `ad.doubleclick.net`, `googleads.g.doubleclick.net`, etc.
- **IMA SDK intentionally allowed** — blocking it triggers YouTube's detection

**Layer 2 — Auto Skip + Overlay Hide:**
- Skip button auto-clicked when available (`.ytp-ad-skip-button-modern`, `.ytp-ad-skip-button`)
- Ad module hidden: `.ytp-ad-module`, `.ytp-ad-overlay-slot`
- Companion/sponsored cards hidden: `#companion-ad-container`, `ytd-companion-slot-renderer`

> **Note:** Open YouTube in a **new tab** after enabling for the dedicated session to take effect.

Configure in **Settings → Privacy & Performance → YouTube**

---

### ✨ Other Improvements

- **FOUC Fix** — Assistant CSS now loaded in `<head>` instead of dynamically injected. No more flash of unstyled content on app startup for DevHub and Assistant.
- **Settings → YouTube** section updated to reflect new 2-layer approach with info note.
- **Blocklist → YouTube Ad Blocker** card updated with new layer badges.
- **analyze.py** root path fixed — no longer hardcoded to a specific machine path.

---

### 🐛 Bug Fixes

- **YoutubeUI not defined** — duplicate code in settings file after partial replacement. Fixed.
- **analyze.py hardcoded path** — now uses `Path(__file__).parent.parent` for portability.

---

### Installation

Download the `.exe` installer below and run it.

> **Note:** If Windows SmartScreen shows a warning, click **More info → Run anyway**.

**Full Changelog:** [v4.5.0...v4.6.0](https://github.com/RupamSatyaki/VORTEX-Browser/compare/v4.5.0...v4.6.0)
