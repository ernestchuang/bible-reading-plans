# Bible Reading Plan

A daily Bible reading app supporting multiple reading plans — including **Dr. Grant Horner's Bible Reading System** and **M'Cheyne's Reading Plan**.

## Features

- **Bible reader as default view** — open the app and start reading any chapter immediately via the BibleBrowser bar
- **Continuous scroll** — scroll to the bottom to seamlessly load the next chapter; visible chapter tracked in the toolbar, browser, and journal
- **Multiple reading plans** — switch between Horner's (10 cycling lists) and M'Cheyne's (365-day calendar) via the collapsible plan bar or Settings
- **Color-coded reading lists** with check-off tracking
- **Native Bible reader** — verse numbers, powered by the Bolls Life API (NASB95, LSB, ESV, KJV)
- **Display modes** — verse-by-verse, paragraph, and reader's layout (LSB includes poetry formatting)
- **Offline Bible download** — download all 1,189 chapters per translation for full offline use; concurrent downloads with progress tracking
- **Translation quick-switch** — change translation from any page via the header dropdown
- **Themes** — Light, Paper, Dark, Warm Dark, and System — cycle in the header or pick from Settings
- **Carry-over system** — unchecked readings stay for the next day
- **Progress tracking** — completion state resets daily, list positions persist
- **Markdown export** and print-friendly layout
- **Settings** — adjust any list's starting position, start date, translation, font, and theme
- **Journal** — write reflections alongside your reading with a split-pane WYSIWYG markdown editor
  - Entries are tied to book and chapter, not the reading plan
  - Write-once / append-only with entry-to-entry linking (reply to a previous reflection)
  - Entries saved as individual `.md` files with YAML frontmatter
  - **Standalone journal browser** (`/journal`) — master-detail view to browse all entries by date or by book/chapter, with links back to the reader
  - Chapter view (entries for the current book/chapter) and Date view (all entries by month) in the split pane
  - Built-in markdown formatting guide for new users
- **Native desktop app** for macOS, Linux, and Windows

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
   sudo dpkg -i "Bible Reading Plan_x.x.x_amd64.deb"
   ```
3. Launch **Bible Reading Plan** from your application menu

### Linux (.rpm — Fedora/RHEL)

1. Download `Bible.Reading.Plan-x.x.x-1.x86_64.rpm`
2. Install with:
   ```bash
   sudo rpm -i "Bible Reading Plan-x.x.x-1.x86_64.rpm"
   ```
3. Launch **Bible Reading Plan** from your application menu

### Linux (AppImage — any distro)

1. Download `Bible.Reading.Plan_x.x.x_amd64.AppImage`
2. Make it executable and run:
   ```bash
   chmod +x "Bible Reading Plan_x.x.x_amd64.AppImage"
   ./"Bible Reading Plan_x.x.x_amd64.AppImage"
   ```

### Arch Linux

Clone the repo and build with `makepkg`:

```bash
git clone https://github.com/ernestchuang/bible-reading-plans.git
cd bible-reading-plans
makepkg -si
```

This installs the binary, a `.desktop` entry, and an app icon. Launch from your application menu or run `bible-reading-plan` from the terminal.

**Dependencies:** `webkit2gtk-4.1`, `gtk3` (installed automatically by `makepkg -si`)

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

## Releasing a New Version

1. Update the version in `package.json` and `src-tauri/tauri.conf.json`
2. Commit and push
3. Tag and push:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
4. GitHub Actions automatically builds macOS and Linux binaries and creates a release

## Reading Plans

### Horner's Bible Reading System

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

### M'Cheyne's Reading Plan

Robert Murray M'Cheyne's original **365-day** schedule with **4 daily readings** — two for family worship and two for private devotion. The plan covers the Old Testament once and the New Testament and Psalms twice per year.

| # | Column | Purpose |
|---|--------|---------|
| 1 | Family (1) | Family worship — first reading |
| 2 | Family (2) | Family worship — second reading |
| 3 | Secret (1) | Private devotion — first reading |
| 4 | Secret (2) | Private devotion — second reading |

Your **start date** determines Day 1 — jump in any time of year. Includes multi-chapter readings and sub-chapter verse ranges exactly as M'Cheyne designed them.
