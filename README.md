# Bible Reading Plan

A daily Bible reading app based on **Dr. Grant Horner's Bible Reading System** — 10 independent reading lists that cycle at different lengths, so you never read the same combination twice.

## Features

- **10 color-coded reading lists** with check-off tracking
- **Embedded Bible reader** — click a chapter to read it inline (NASB95, LSB, ESV, KJV)
- **Carry-over system** — unchecked readings stay for the next day
- **Progress tracking** — completion state resets daily, list positions persist
- **Markdown export** and print-friendly layout
- **Settings** — adjust any list's starting position, start date, and translation
- **Native desktop app** for macOS and Linux

## Installation

Download the latest release for your platform from the [Releases page](https://github.com/ernestchuang/bible-reading-plans/releases).

### macOS (Apple Silicon — M1/M2/M3/M4)

1. Download `Bible.Reading.Plan_x.x.x_aarch64.dmg`
2. Open the `.dmg` and drag **Bible Reading Plan** to your **Applications** folder
3. **Important:** macOS will block the app because it is not signed with an Apple Developer certificate. To fix this:
   - Open **Terminal** (search for "Terminal" in Spotlight)
   - Paste this command and press Enter:
     ```bash
     xattr -cr /Applications/Bible\ Reading\ Plan.app
     ```
   - Close Terminal — the app will now open normally
4. Double-click **Bible Reading Plan** in Applications

### macOS (Intel)

1. Download `Bible.Reading.Plan_x.x.x_x64.dmg`
2. Follow the same steps as Apple Silicon above

### Linux (.deb — Ubuntu/Debian)

1. Download `Bible.Reading.Plan_x.x.x_amd64.deb`
2. Install with:
   ```bash
   sudo dpkg -i Bible\ Reading\ Plan_x.x.x_amd64.deb
   ```
3. Launch **Bible Reading Plan** from your application menu

### Linux (.rpm — Fedora/RHEL)

1. Download `Bible.Reading.Plan-x.x.x-1.x86_64.rpm`
2. Install with:
   ```bash
   sudo rpm -i Bible\ Reading\ Plan-x.x.x-1.x86_64.rpm
   ```
3. Launch **Bible Reading Plan** from your application menu

### Linux (AppImage)

1. Download `Bible.Reading.Plan_x.x.x_amd64.AppImage`
2. Make it executable and run:
   ```bash
   chmod +x Bible\ Reading\ Plan_x.x.x_amd64.AppImage
   ./Bible\ Reading\ Plan_x.x.x_amd64.AppImage
   ```

## Development

```bash
# Install dependencies
npm install

# Run in browser (development)
npm run dev

# Run as desktop app (development)
npm run tauri:dev

# Build for production (web only)
npm run build

# Build native desktop app
npm run tauri:build
```

## How the Horner System Works

You read **one chapter per day** from each of **10 lists**. When you finish a list, it loops back to the beginning. Since the lists range from 28 to 250 chapters, they naturally desynchronize — creating unique combinations for years.

| # | List | Books | Chapters |
|---|------|-------|----------|
| 1 | Gospels | Matthew — John | 89 |
| 2 | Pentateuch | Genesis — Deuteronomy | 187 |
| 3 | Epistles I | Romans — Hebrews | 78 |
| 4 | Epistles II | 1 Thessalonians — Revelation | 65 |
| 5 | Wisdom | Job, Ecclesiastes, Song of Solomon | 62 |
| 6 | Psalms | Psalms | 150 |
| 7 | Proverbs | Proverbs | 31 |
| 8 | History | Joshua — Esther | 249 |
| 9 | Prophets | Isaiah — Malachi | 250 |
| 10 | Acts | Acts | 28 |
