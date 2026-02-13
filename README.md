# Bible Reading Plan

A daily Bible reading app supporting multiple reading plans — including **Dr. Grant Horner's Bible Reading System** and **M'Cheyne's Reading Plan**. Each plan uses independent cycling lists, so you never read the same combination twice.

## Features

- **Multiple reading plans** — switch between Horner's (10 lists) and M'Cheyne's (4 lists) via a header dropdown
- **Color-coded reading lists** with check-off tracking
- **Native Bible reader** — click a chapter to read it inline with verse numbers, powered by the Bolls Life API (NASB95, LSB, ESV, KJV)
- **Display modes** — verse-by-verse, paragraph, and reader's layout (LSB includes poetry formatting)
- **Dark mode** — three-way toggle (Light / Dark / System) that follows your OS preference
- **Carry-over system** — unchecked readings stay for the next day
- **Progress tracking** — completion state resets daily, list positions persist
- **Markdown export** and print-friendly layout
- **Settings** — adjust any list's starting position, start date, and translation
- **Journal** — write reflections alongside your reading with a split-pane WYSIWYG markdown editor
  - Entries are tied to book and chapter, not the reading plan
  - Write-once / append-only with entry-to-entry linking (reply to a previous reflection)
  - Entries saved as individual `.md` files with YAML frontmatter
  - Chapter view (entries for the current book/chapter) and Date view (all entries by month)
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

Adapted from Robert Murray M'Cheyne's calendar into **4 cycling lists** covering the entire Bible:

| # | List | Books | Chapters |
|---|------|-------|----------|
| 1 | Family (AM) | Genesis — Deuteronomy | 187 |
| 2 | Family (PM) | Joshua — Esther | 249 |
| 3 | Poetry & Prophets | Job — Malachi | 493 |
| 4 | New Testament | Matthew — Revelation | 260 |
