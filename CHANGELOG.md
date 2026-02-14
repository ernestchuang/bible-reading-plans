# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-14

### Added

- **Per-list day tracking for M'Cheyne** — each of the 4 reading columns tracks its own day independently; checking a card advances only that column's day
- **Per-card day number and ahead/behind badge** — each M'Cheyne card shows its current day number with a green (+N) or amber (-N) badge when ahead or behind schedule
- **Go-back button** on M'Cheyne cards — minus button to the left of the checkbox lets you revert a column by one day if you clicked too many times
- **Horner read-ahead** — when all 10 lists are checked, checkboxes auto-reset so you can do another round of reading in the same day

### Changed

- M'Cheyne plan state migrated from single `effectiveDayIndex` to per-list `effectiveDayIndices` array (automatic migration from previous format)
- Settings "Current Day" input shows the minimum day across all lists; changing it jumps all lists to the same day
- DailyView header "Day N" shows the minimum day across all lists (per-card badges show individual progress)

## [1.1.0] - 2026-02-14

### Added

- **Standalone journal browsing view** (`/journal`) — browse all journal entries independently from the reader
  - Master-detail layout: entry list on the left, full rendered entry on the right
  - **Date mode**: entries grouped by month with preview, book/chapter, and date
  - **Book mode**: expandable OT/NT tree organized by book and chapter
  - Click "Read" on any entry to navigate directly to that chapter in the Bible reader
- "Journal" tab in the header navigation between Read and Full Plan

### Fixed

- `<br/>` tags from Milkdown hard breaks no longer render as literal text in journal entry previews and body
- Journal entry preview line now skips blank lines containing only `<br/>` tags

### Changed

- Extracted shared markdown rendering helpers (`renderMarkdown`, `formatDate`, `getPreviewLine`) into `src/utils/journalRender.ts`
- `JournalEntryCard.onReply` is now optional (Reply button hidden when not provided)

## [1.0.0] - 2026-02-14

### Added

- **Full Bible download** — download all 1,189 chapters of any translation for complete offline use, with progress tracking per translation
- **Concurrent downloads** — download multiple translations simultaneously, each with its own progress bar and cancel button
- **"Download All Started" button** — one-click to resume downloading all partially-cached translations
- **Daily cache freshness check** — lightweight startup check compares cached Genesis 1 with the API (max once per 24 hours, silent when offline)
- **Translation selector in header** — quick-switch translation from any page via dropdown next to the theme toggle
- **Cache status dashboard** in Settings — see chapter counts for all four translations at a glance, with download dates

## [1.0.0-beta.2] - 2026-02-14

### Added

- **Collapsible reading plan bar** on the reader view — toggle via "Reading Plans" tab to see today's readings above the Bible text
- **Continuous scroll** — scroll to the bottom to auto-load the next chapter seamlessly
- **Visible chapter tracking** — toolbar, BibleBrowser, and journal pane update as you scroll through chapters
- **Floating chapter navigation** — small prev/next buttons at the top corners of the reading pane
- Plan selector dropdown in the plan bar and Settings
- Theme dropdown in Settings (Reading Appearance section)

### Changed

- Header simplified and left-justified; plan and translation selectors moved to plan bar and Settings
- Theme cycle button skips "System" option (still available in Settings dropdown)
- `/plans` route removed — "Reading Plans" is now a toggle on the reader view
- Navigation tabs: Read, Full Plan, Settings, Reading Plans (toggle)

## [1.0.0-beta.1] - 2026-02-13

### Added

- **Standalone Bible reader** (`/read`) as the default landing page — read any chapter without a plan
- **BibleBrowser navigation bar** on the reader view for quick book/chapter selection
- **Last-read persistence**: reopening the app restores your last-read chapter
- **Last-visited route persistence**: app reopens on whatever tab you were last using
- **React Router** with hash routing for client-side navigation (Tauri-compatible)
- Navigation tabs: Read, Today, Full Plan, Settings

### Changed

- Reading plan view moved from `/today` to `/plans` route
- App title bar updated with new tab navigation

## [0.9.1] - 2026-02-13

### Fixed

- Journal editor now respects the selected font — Milkdown's frame theme was overriding the font choice with its own defaults

## [0.9.0] - 2026-02-13

### Added

- **Faithful M'Cheyne Reading Plan**: replaced the cycling-list approximation with Robert Murray M'Cheyne's original 365-day hand-curated schedule
  - 4 daily readings labeled Family (1), Family (2), Secret (1), Secret (2)
  - Multi-chapter readings (e.g., Genesis 9–10) render both chapters with heading dividers
  - Sub-chapter verse ranges (e.g., Psalm 119:1–24) filter to the specified verses
- "Current Day" number input in Settings for M'Cheyne plan — jump directly to any day 1–365

### Changed

- M'Cheyne plan is now start-date-based: Day 1 = your start date, wraps at 365 (not tied to Jan 1)
- Toggling a M'Cheyne reading complete no longer advances a cycling offset — it simply marks the reading done
- `ReadingPlan` type refactored to a discriminated union (`kind: 'cycling' | 'calendar'`) for clean plan-type branching

### Removed

- Cycling-list M'Cheyne plan (`src/data/mcheyneLists.ts`) — replaced by the faithful calendar version

## [0.8.0] - 2026-02-13

### Added

- Offline chapter caching: previously-viewed Bible chapters are saved to disk and load instantly on revisit, even without an internet connection
- "Clear Offline Cache" button in Settings for reclaiming disk space

### Changed

- Adjusted app icon: moved Bible down relative to background for better vertical centering

## [0.7.0] - 2026-02-13

### Added

- Customizable reading font: 6 options (System Sans, Inter, Lexend, Linguistics Pro, Literata, EB Garamond) applied to Bible text and journal
- Adjustable font size (14–22px) with A-/A+ stepper in reader toolbar and dropdown in Settings
- Paper theme: warm cream backgrounds for comfortable daytime reading
- Warm Dark theme: warm brown-toned dark mode as an alternative to cool gray
- Reading Appearance section in Settings with font selectors and live preview
- Expandable journal entry cards: click to read full entry content inline

### Changed

- Theme cycle expanded to 5 modes: Light → Paper → Dark → Warm Dark → System
- Bundled Linguistics Pro font (OFL-licensed) as woff2 since it's not on fontsource
- Flash-of-wrong-theme prevention updated for Paper and Warm Dark themes

## [0.6.1] - 2026-02-13

### Changed

- Refreshed app icon: light gray semi-transparent background (was near-black), lightened burgundy Bible cover, darker cross and border details for better contrast

## [0.6.0] - 2026-02-13

### Added

- Dark mode with three-way toggle (Light / Dark / System) — cycling icon button in the header
- Bible text display modes: verse-by-verse, paragraph, and reader's layout with toolbar toggle
- Flash-of-wrong-theme prevention on page load

### Fixed

- Strip Strong's concordance numbers from KJV translation (scoped to KJV only)
- Regenerated macOS app icon — `.icns` was a 16×16 PNG, now a proper multi-resolution icon container

### Changed

- Theme and display mode preferences persist in localStorage
- System theme mode follows OS `prefers-color-scheme` and responds to live changes
- Milkdown editor styled for dark mode via CSS variable overrides

## [0.5.0] - 2026-02-12

### Changed

- Replaced iframe-based Bible reader with native text rendering powered by the [Bolls Life Bible API](https://bolls.life/api/)
- Bible text now renders inline with superscript verse numbers, loading state, and error/retry handling
- Full Plan view readings changed from external links to plain text pills (print-friendly)
- Removed dependency on literalword.com and biblegateway.com

### Removed

- `src/utils/bibleLinks.ts` (iframe URL generation) — replaced by `src/utils/bibleApi.ts`
- "Open in new tab" link from the Bible reader toolbar

## [0.4.0] - 2026-02-12

### Added

- Multi-plan support: modular architecture for multiple Bible reading plans
- M'Cheyne's Reading Plan (4 cycling lists covering the entire Bible)
- Plan selector dropdown in the header to switch between plans
- Per-plan state: each plan tracks its own start date, list offsets, and daily progress independently
- Automatic migration from legacy single-plan localStorage format

### Changed

- Compact journal entry cards: past entries show first heading/line preview instead of full content
- App icon redesigned with burgundy Bible, dark burgundy accents, gold pages, and purple ribbon

## [0.3.1] - 2026-02-12

### Added

- Markdown formatting guide (cheat sheet) in the journal editor

### Changed

- Replaced app icon with Bible-themed design (leather brown Bible with gold cross on black background)

## [0.3.0] - 2026-02-12

### Added

- Journal pane with split-view layout (Bible text left, journal right)
- WYSIWYG markdown editor (Milkdown Crepe) for writing reflections
- Journal entries saved as individual `.md` files with YAML frontmatter
- Entries tied to book and chapter, not the reading plan
- Write-once / append-only entries with entry-to-entry linking (reply to previous reflections)
- Chapter view and Date view for browsing journal entries
- Tauri filesystem plugin for reading/writing journal files to disk
- Journal toggle button in the Bible reader toolbar

## [0.2.1] - 2026-02-12

### Added

- Windows build target in GitHub Actions release workflow

## [0.2.0] - 2026-02-11

### Added

- Arch Linux PKGBUILD for building and installing via `makepkg`
- Comprehensive README with installation instructions for all platforms

## [0.1.0] - 2026-02-11

### Added

- Initial release
- 10 color-coded reading lists based on Dr. Grant Horner's Bible Reading System
- Embedded Bible reader with iframe (NASB95, LSB, ESV, KJV)
- Check-off system for daily readings with carry-over
- Progress tracking with daily reset and persistent list positions
- Fullscreen split-pane layout with compact reading card bar
- Markdown export and print-friendly CSS
- Settings panel for start date, translation, and list offsets
- Tauri desktop app for macOS and Linux
- GitHub Actions release workflow

[1.2.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v1.0.0-beta.2...v1.0.0
[1.0.0-beta.2]: https://github.com/ernestchuang/bible-reading-plans/compare/v1.0.0-beta.1...v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.9.1...v1.0.0-beta.1
[0.9.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ernestchuang/bible-reading-plans/releases/tag/v0.1.0
