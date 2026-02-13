# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.3.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ernestchuang/bible-reading-plans/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ernestchuang/bible-reading-plans/releases/tag/v0.1.0
