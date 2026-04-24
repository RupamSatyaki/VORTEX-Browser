## Vortex Browser v4.7.0

### 📥 Built-in Video Downloader

Download videos from **1000+ sites** directly in the browser — no extensions, no external tools.

**Powered by yt-dlp** — the most comprehensive video downloader available.

**Supported Sites:**
- YouTube (videos, playlists, shorts)
- Instagram (reels, posts, stories)
- Twitter/X (videos, GIFs)
- TikTok
- Facebook
- Reddit
- Vimeo
- Twitch
- Dailymotion
- SoundCloud
- Bilibili
- **1000+ more** — [view full list](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

---

### How to Use

1. **Open the panel** — Click the video icon in the toolbar or press `Ctrl+Shift+D`
2. **Auto-detect** — If you're on a video page, the URL is auto-filled
3. **Fetch info** — Click "Fetch" to load video details, thumbnail, and available qualities
4. **Select quality** — Choose from 4K, 1080p, 720p, 480p, 360p, or Audio only
5. **Download** — Click "Download" — progress shows in the panel and Downloads manager

> **Note:** High quality (1080p+) requires **ffmpeg** to merge video+audio. Install from Settings → Video Downloader.

---

### Features

**Sidebar Panel:**
- Opens on the right side (same as Assistant)
- Webview shrinks to make room
- Auto-detects video URLs from the current page
- Manual URL paste also supported

**Quality Selector:**
- All available qualities shown in dropdown
- Pre-merged formats shown first (no ffmpeg needed)
- High quality formats (1080p+) auto-merge with ffmpeg
- Audio-only option (MP3 extraction)

**ffmpeg Integration:**
- Required for 1080p+ (video+audio merge)
- One-click install from Settings → Video Downloader
- Warning shown in panel when high quality selected but ffmpeg missing
- Click "Install from Settings →" to open settings and install

**Downloads Manager Integration:**
- Video downloads appear in the main Downloads panel
- Progress bar with speed (MB/s) and file size
- Open downloaded file directly from downloads panel

**Settings Section:**
- Settings → Privacy & Performance → Video Downloader
- yt-dlp status (version, path)
- ffmpeg status (installed/not installed, path)
- Install/Update buttons for both
- Default quality selector
- Supported sites browser with search

**Supported Sites Browser:**
- Click "View all 1000+ →" in settings
- Modal with searchable list of all supported sites
- Live search with highlight
- Favicons for each site (Google favicon service)
- Themed scrollbar

---

### Installation

Download the `.exe` installer below and run it.

> **Note:** If Windows SmartScreen shows a warning, click **More info → Run anyway**.

**Full Changelog:** [v4.6.0...v4.7.0](https://github.com/RupamSatyaki/VORTEX-Browser/compare/v4.6.0...v4.7.0)
