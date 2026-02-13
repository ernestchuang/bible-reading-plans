import { useState, useEffect, useRef, useCallback } from 'react';
import type { Reading, Translation, Verse, DisplayMode, FontFamily, FontSize } from '../types';
import { fetchChapter } from '../utils/bibleApi';
import { getFontCss, FONT_SIZES } from '../data/fonts';

interface BibleReaderProps {
  reading: Reading | null;
  translation: Translation;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  fontFamily: FontFamily;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  onToggleJournal: () => void;
  journalOpen: boolean;
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

export function BibleReader({ reading, translation, displayMode, onDisplayModeChange, fontFamily, fontSize, onFontSizeChange, onToggleJournal, journalOpen }: BibleReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fontCss = getFontCss(fontFamily);
  const contentStyle: React.CSSProperties = {
    fontFamily: fontCss,
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize + 8}px`,
  };

  const loadChapter = useCallback(async (book: string, chapter: number, trans: Translation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(book, chapter, trans);
      setVerses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!reading) {
      setVerses([]);
      setError(null);
      return;
    }
    loadChapter(reading.book, reading.chapter, translation);
  }, [reading?.book, reading?.chapter, translation, loadChapter]);

  // Reset scroll when reading changes
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [reading?.book, reading?.chapter, translation]);

  if (!reading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
        <p className="text-lg">Select a reading above to begin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Reader toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {reading.book} {reading.chapter}
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

      {/* Chapter content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => loadChapter(reading.book, reading.chapter, translation)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 py-8" style={contentStyle}>
            <h2
              className="font-semibold text-gray-900 dark:text-gray-100 mb-6"
              style={{ fontSize: `${fontSize + 4}px` }}
            >
              {reading.book} {reading.chapter}
            </h2>
            {displayMode === 'verse' && <VerseByVerseView verses={verses} fontSize={fontSize} />}
            {displayMode === 'paragraph' && <ParagraphView verses={verses} fontSize={fontSize} />}
            {displayMode === 'reader' && <ReaderView verses={verses} />}
          </div>
        )}
      </div>
    </div>
  );
}
