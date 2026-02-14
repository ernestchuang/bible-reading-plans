import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import type { BibleSelection, Translation, Verse, DisplayMode, FontFamily, FontSize } from '../types';
import { formatBibleSelection } from '../types';
import { fetchChapterCached } from '../utils/bibleCache';
import { getFontCss, FONT_SIZES } from '../data/fonts';
import { getNextChapter, getPrevChapter } from '../data/bibleBooks';

interface ChapterBlock {
  book: string;
  chapter: number;
  verses: Verse[];
}

interface BibleReaderProps {
  selection: BibleSelection | null;
  translation: Translation;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  fontFamily: FontFamily;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  onToggleJournal: () => void;
  journalOpen: boolean;
  onNavigate?: (book: string, chapter: number) => void;
  onVisibleChapterChange?: (book: string, chapter: number) => void;
}

/** Separate any leading section heading from the verse body text. */
function parseVerseText(html: string): { heading: string | null; body: string } {
  const match = html.match(/^<b>(.+?)<\/b>(?:<br\/?>)?\s*(.*)$/s);
  if (match) {
    return { heading: match[1], body: match[2] };
  }
  return { heading: null, body: html };
}

const DISPLAY_MODES: { value: DisplayMode; label: string; title: string }[] = [
  { value: 'verse', label: 'Aa', title: 'Verse-by-verse' },
  { value: 'paragraph', label: '\u00b6', title: 'Paragraph' },
  { value: 'reader', label: '\u2261', title: "Reader's layout" },
];

function DisplayModeToggle({ mode, onChange }: { mode: DisplayMode; onChange: (m: DisplayMode) => void }) {
  return (
    <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden" role="radiogroup" aria-label="Display mode">
      {DISPLAY_MODES.map(({ value, label, title }, i) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          title={title}
          onClick={() => onChange(value)}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            mode === value
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
          } ${i > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function FontSizeStepper({ fontSize, onChange }: { fontSize: FontSize; onChange: (s: FontSize) => void }) {
  const sizes = FONT_SIZES.map((f) => f.value);
  const idx = sizes.indexOf(fontSize);

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        disabled={idx <= 0}
        onClick={() => onChange(sizes[idx - 1])}
        className="px-1.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Decrease font size"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button
        type="button"
        disabled={idx >= sizes.length - 1}
        onClick={() => onChange(sizes[idx + 1])}
        className="px-1.5 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Increase font size"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
}

function VerseByVerseView({ verses, fontSize }: { verses: Verse[]; fontSize: FontSize }) {
  return (
    <div className="text-gray-800 dark:text-gray-200 space-y-1">
      {verses.map((v) => {
        const { heading, body } = parseVerseText(v.text);
        return (
          <div key={v.pk}>
            {heading && (
              <h3
                className="font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2"
                style={{ fontSize: `${fontSize + 2}px` }}
              >
                {heading}
              </h3>
            )}
            <p>
              <sup className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-1 select-none">
                {v.verse}
              </sup>
              <span dangerouslySetInnerHTML={{ __html: body }} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ParagraphView({ verses, fontSize }: { verses: Verse[]; fontSize: FontSize }) {
  return (
    <div className="text-gray-800 dark:text-gray-200">
      {verses.map((v) => {
        const { heading, body } = parseVerseText(v.text);
        return (
          <span key={v.pk}>
            {heading && (
              <span
                className="block font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2"
                style={{ fontSize: `${fontSize + 2}px` }}
              >
                {heading}
              </span>
            )}
            <sup className="text-xs font-semibold text-gray-400 dark:text-gray-500 mr-0.5 select-none">
              {v.verse}
            </sup>
            <span dangerouslySetInnerHTML={{ __html: body }} />
            {' '}
          </span>
        );
      })}
    </div>
  );
}

function ReaderView({ verses }: { verses: Verse[] }) {
  return (
    <div className="text-gray-800 dark:text-gray-200">
      {verses.map((v) => {
        const { body } = parseVerseText(v.text);
        const cleanBody = body.replace(/<\/?b>/g, '');
        return (
          <span key={v.pk}>
            <span dangerouslySetInnerHTML={{ __html: cleanBody }} />
            {' '}
          </span>
        );
      })}
    </div>
  );
}

/** Small floating chevron button for prev/next navigation */
function NavButton({ direction, onClick, className = '' }: { direction: 'prev' | 'next'; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={direction === 'prev' ? 'Previous chapter' : 'Next chapter'}
      title={direction === 'prev' ? 'Previous chapter' : 'Next chapter'}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {direction === 'prev' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

export function BibleReader({ selection, translation, displayMode, onDisplayModeChange, fontFamily, fontSize, onFontSizeChange, onToggleJournal, journalOpen, onNavigate, onVisibleChapterChange }: BibleReaderProps) {
  const [blocks, setBlocks] = useState<ChapterBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const loadingPrevRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const [visibleChapter, setVisibleChapter] = useState<{ book: string; chapter: number } | null>(null);

  const fontCss = getFontCss(fontFamily);
  const contentStyle: React.CSSProperties = {
    fontFamily: fontCss,
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize + 8}px`,
  };

  const loadSelection = useCallback(async (s: BibleSelection, trans: Translation) => {
    setLoading(true);
    setError(null);
    try {
      const startCh = s.chapter;
      const endCh = s.endChapter ?? s.chapter;
      const newBlocks: ChapterBlock[] = [];

      for (let ch = startCh; ch <= endCh; ch++) {
        let verses = await fetchChapterCached(s.book, ch, trans);

        // Filter verses for sub-chapter ranges (single-chapter readings only)
        if (s.startVerse != null && s.endVerse != null && startCh === endCh) {
          verses = verses.filter(
            (v) => v.verse >= s.startVerse! && v.verse <= s.endVerse!
          );
        }

        newBlocks.push({ book: s.book, chapter: ch, verses });
      }

      setBlocks(newBlocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reading');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load next chapter and append it
  const loadNextChapter = useCallback(async () => {
    if (loadingMoreRef.current || blocks.length === 0) return;
    const lastBlock = blocks[blocks.length - 1];
    const next = getNextChapter(lastBlock.book, lastBlock.chapter);
    if (!next) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const verses = await fetchChapterCached(next.book, next.chapter, translation);
      setBlocks((prev) => [...prev, { book: next.book, chapter: next.chapter, verses }]);
    } catch {
      // Silently fail — user can scroll again or use next button
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [blocks, translation]);

  // Load previous chapter and prepend it
  const loadPrevChapter = useCallback(async () => {
    if (loadingPrevRef.current || loadingMoreRef.current || blocks.length === 0) return;
    const firstBlock = blocks[0];
    const prev = getPrevChapter(firstBlock.book, firstBlock.chapter);
    if (!prev) return;

    loadingPrevRef.current = true;
    try {
      const verses = await fetchChapterCached(prev.book, prev.chapter, translation);
      if (scrollRef.current) {
        prevScrollHeightRef.current = scrollRef.current.scrollHeight;
      }
      setBlocks((b) => [{ book: prev.book, chapter: prev.chapter, verses }, ...b]);
    } catch {
      // Silently fail
    } finally {
      loadingPrevRef.current = false;
    }
  }, [blocks, translation]);

  // Preserve scroll position after prepending a chapter
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || prevScrollHeightRef.current === 0) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      el.scrollTop += diff;
    }
    prevScrollHeightRef.current = 0;
  }, [blocks]);

  // Stable key for selection identity
  const selectionKey = selection
    ? `${selection.book}|${selection.chapter}|${selection.endChapter ?? ''}|${selection.startVerse ?? ''}|${selection.endVerse ?? ''}`
    : null;

  useEffect(() => {
    if (!selection) {
      setBlocks([]);
      setError(null);
      return;
    }
    loadSelection(selection, translation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, translation, loadSelection]);

  // Reset scroll when selection changes
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, translation]);

  // Initialize visibleChapter when selection changes
  useEffect(() => {
    if (selection) {
      setVisibleChapter({ book: selection.book, chapter: selection.chapter });
    } else {
      setVisibleChapter(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  // IntersectionObserver to track which chapter heading is in the top portion of the scroll area
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || blocks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).dataset.chapterKey;
            if (key) {
              const sep = key.indexOf('|');
              const book = key.slice(0, sep);
              const chapter = parseInt(key.slice(sep + 1), 10);
              setVisibleChapter({ book, chapter });
            }
          }
        }
      },
      { root, rootMargin: '0px 0px -80% 0px', threshold: 0 },
    );

    root.querySelectorAll<HTMLElement>('[data-chapter-key]').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [blocks]);

  // Notify parent of visible chapter changes
  useEffect(() => {
    if (visibleChapter && onVisibleChapterChange) {
      onVisibleChapterChange(visibleChapter.book, visibleChapter.chapter);
    }
  }, [visibleChapter, onVisibleChapterChange]);

  // Continuous scroll: load next/prev chapter when near edges
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      // Near bottom — load next
      if (scrollHeight - scrollTop - clientHeight < 300) {
        loadNextChapter();
      }
      // Near top — load prev
      if (scrollTop < 200) {
        loadPrevChapter();
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loadNextChapter, loadPrevChapter]);

  // Navigation handlers — navigate relative to visible chapter, not original selection
  const handlePrev = useCallback(() => {
    const ref = visibleChapter ?? (selection ? { book: selection.book, chapter: selection.chapter } : null);
    if (!ref) return;
    const prev = getPrevChapter(ref.book, ref.chapter);
    if (prev && onNavigate) {
      onNavigate(prev.book, prev.chapter);
    }
  }, [visibleChapter, selection, onNavigate]);

  const handleNext = useCallback(() => {
    const ref = visibleChapter ?? (selection ? { book: selection.book, chapter: selection.chapter } : null);
    if (!ref) return;
    const next = getNextChapter(ref.book, ref.chapter);
    if (next && onNavigate) {
      onNavigate(next.book, next.chapter);
    }
  }, [visibleChapter, selection, onNavigate]);

  const navRef = visibleChapter ?? (selection ? { book: selection.book, chapter: selection.chapter } : null);
  const hasPrev = navRef ? getPrevChapter(navRef.book, navRef.chapter) !== null : false;
  const hasNext = navRef ? getNextChapter(navRef.book, navRef.chapter) !== null : false;

  if (!selection) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
        <p className="text-lg">Select a chapter to begin reading</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Reader toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {visibleChapter ? `${visibleChapter.book} ${visibleChapter.chapter}` : formatBibleSelection(selection)}
          <span className="text-gray-400 dark:text-gray-500 ml-2">({translation})</span>
        </span>
        <div className="flex items-center gap-2">
          <DisplayModeToggle mode={displayMode} onChange={onDisplayModeChange} />
          <span className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <FontSizeStepper fontSize={fontSize} onChange={onFontSizeChange} />
          <span className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={onToggleJournal}
            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            {journalOpen ? 'Close Journal' : 'Journal'}
          </button>
        </div>
      </div>

      {/* Chapter content with floating nav buttons */}
      <div className="flex-1 min-h-0 relative">
        {/* Scrollable content */}
        <div ref={scrollRef} className="h-full overflow-y-auto bg-white dark:bg-gray-900">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={() => loadSelection(selection, translation)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && blocks.length > 0 && (
            <div className="max-w-3xl mx-auto px-6 py-8" style={contentStyle}>
              {blocks.map((block, blockIdx) => (
                <div key={`${block.book}-${block.chapter}`} data-chapter-key={`${block.book}|${block.chapter}`}>
                  <h2
                    className={`font-semibold text-gray-900 dark:text-gray-100 mb-6 ${blockIdx > 0 ? 'mt-10 pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}
                    style={{ fontSize: `${fontSize + 4}px` }}
                  >
                    {block.book} {block.chapter}
                  </h2>
                  {displayMode === 'verse' && <VerseByVerseView verses={block.verses} fontSize={fontSize} />}
                  {displayMode === 'paragraph' && <ParagraphView verses={block.verses} fontSize={fontSize} />}
                  {displayMode === 'reader' && <ReaderView verses={block.verses} />}
                </div>
              ))}
              {loadingMore && (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                  Loading next chapter...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating nav buttons at top corners */}
        {hasPrev && <NavButton direction="prev" onClick={handlePrev} className="absolute top-2 left-2" />}
        {hasNext && <NavButton direction="next" onClick={handleNext} className="absolute top-2 right-2" />}
      </div>
    </div>
  );
}
