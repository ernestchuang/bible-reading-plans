import { useState, useEffect, useRef, useCallback } from 'react';
import type { Reading, Translation, Verse } from '../types';
import { fetchChapter } from '../utils/bibleApi';

interface BibleReaderProps {
  reading: Reading | null;
  translation: Translation;
  onToggleJournal: () => void;
  journalOpen: boolean;
}

export function BibleReader({ reading, translation, onToggleJournal, journalOpen }: BibleReaderProps) {
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
        <button
          onClick={onToggleJournal}
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {journalOpen ? 'Close Journal' : 'Journal'}
        </button>
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
            <div className="text-base leading-7 text-gray-800">
              {verses.map((v) => (
                <span key={v.pk}>
                  <sup className="text-xs font-semibold text-gray-400 mr-1 select-none">
                    {v.verse}
                  </sup>
                  <span dangerouslySetInnerHTML={{ __html: v.text }} />
                  {' '}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
