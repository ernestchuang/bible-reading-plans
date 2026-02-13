import { useState, useEffect, useRef, useCallback } from 'react';
import type { Reading, Translation, Verse, DisplayMode } from '../types';
import { fetchChapter } from '../utils/bibleApi';

interface BibleReaderProps {
  reading: Reading | null;
  translation: Translation;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
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
    <div className="flex rounded-md border border-gray-300 overflow-hidden" role="radiogroup" aria-label="Display mode">
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
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          } ${i > 0 ? 'border-l border-gray-300' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function VerseByVerseView({ verses }: { verses: Verse[] }) {
  return (
    <div className="text-base leading-7 text-gray-800 space-y-1">
      {verses.map((v) => {
        const { heading, body } = parseVerseText(v.text);
        return (
          <div key={v.pk}>
            {heading && (
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">{heading}</h3>
            )}
            <p>
              <sup className="text-xs font-semibold text-gray-400 mr-1 select-none">
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

function ParagraphView({ verses }: { verses: Verse[] }) {
  return (
    <div className="text-base leading-7 text-gray-800">
      {verses.map((v) => {
        const { heading, body } = parseVerseText(v.text);
        return (
          <span key={v.pk}>
            {heading && (
              <span className="block text-lg font-bold text-gray-900 mt-6 mb-2">{heading}</span>
            )}
            <sup className="text-xs font-semibold text-gray-400 mr-0.5 select-none">
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
    <div className="text-base leading-8 text-gray-800">
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

export function BibleReader({ reading, translation, displayMode, onDisplayModeChange, onToggleJournal, journalOpen }: BibleReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
        <p className="text-lg">Select a reading above to begin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Reader toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {reading.book} {reading.chapter}
          <span className="text-gray-400 ml-2">({translation})</span>
        </span>
        <div className="flex items-center gap-2">
          <DisplayModeToggle mode={displayMode} onChange={onDisplayModeChange} />
          <span className="h-4 w-px bg-gray-300" />
          <button
            onClick={onToggleJournal}
            className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {journalOpen ? 'Close Journal' : 'Journal'}
          </button>
        </div>
      </div>

      {/* Chapter content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => loadChapter(reading.book, reading.chapter, translation)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {reading.book} {reading.chapter}
            </h2>
            {displayMode === 'verse' && <VerseByVerseView verses={verses} />}
            {displayMode === 'paragraph' && <ParagraphView verses={verses} />}
            {displayMode === 'reader' && <ReaderView verses={verses} />}
          </div>
        )}
      </div>
    </div>
  );
}
