# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.6.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ernestchuang/bible-reading-plans/releases/tag/v0.1.0
