import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FontFamily } from '../../types';
import type { JournalEntry, JournalBrowseMode } from '../../types/journal';
import type { BookGroup } from '../../hooks/useJournalBrowser';
import { useJournalBrowser } from '../../hooks/useJournalBrowser';
import { useAvailableTags } from '../../hooks/useAvailableTags';
import { matchesTags } from '../../utils/tagUtils';
import { getFontCss } from '../../data/fonts';
import { formatDate, renderMarkdown, stripAutoInsertedLines } from '../../utils/journalRender';
import { JournalDateBrowse } from './JournalDateBrowse';
import { JournalBookBrowse } from './JournalBookBrowse';
import { TagFilter } from './TagFilter';
import { TagBadge } from './TagBadge';
import { BIBLE_TESTAMENTS } from '../../data/bibleBooks';

interface JournalViewProps {
  fontFamily: FontFamily;
}

const READER_KEY = 'bible-reader-v1';

/** Flat canonical order of all Bible book names. */
const BOOK_ORDER = BIBLE_TESTAMENTS.flatMap((t) =>
  t.sections.flatMap((s) => s.books.map((b) => b.name))
);

export function JournalView({ fontFamily }: JournalViewProps) {
  const [browseMode, setBrowseMode] = useState<JournalBrowseMode>('date');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { allEntries, isLoading, error } = useJournalBrowser();
  const navigate = useNavigate();
  const fontCss = getFontCss(fontFamily);

  const availableTags = useAvailableTags(allEntries);
  const filteredEntries = useMemo(
    () => allEntries.filter((e) => matchesTags(e, selectedTags)),
    [allEntries, selectedTags]
  );

  const filteredBookGroups = useMemo(() => {
    // Group filtered entries by book → chapter
    const map = new Map<string, Map<number, JournalEntry[]>>();
    for (const entry of filteredEntries) {
      const { book, chapter } = entry.meta;
      if (!map.has(book)) map.set(book, new Map());
      const chapterMap = map.get(book)!;
      if (!chapterMap.has(chapter)) chapterMap.set(chapter, []);
      chapterMap.get(chapter)!.push(entry);
    }

    // Build array in canonical Bible order
    const groups: BookGroup[] = [];
    for (const bookName of BOOK_ORDER) {
      const chapterMap = map.get(bookName);
      if (!chapterMap) continue;
      const chapters = Array.from(chapterMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([chapter, chapterEntries]) => ({ chapter, entries: chapterEntries }));
      groups.push({ book: bookName, chapters });
    }
    return groups;
  }, [filteredEntries]);

  const handleNavigateToReader = useCallback(
    (book: string, chapter: number) => {
      try {
        const existing = JSON.parse(localStorage.getItem(READER_KEY) || '{}');
        localStorage.setItem(
          READER_KEY,
          JSON.stringify({ ...existing, book, chapter })
        );
      } catch {
        localStorage.setItem(READER_KEY, JSON.stringify({ book, chapter }));
      }
      navigate('/read');
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
        Loading journal entries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400 text-sm">
        Error loading entries: {error}
      </div>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
        No journal entries yet. Start writing in the Read view.
      </div>
    );
  }

  function handleTagClick(tag: string) {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel — entry list */}
      <div className="w-72 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0 bg-white dark:bg-gray-900">
        {/* Mode toggle header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Browse by</span>
            <BrowseToggle mode={browseMode} onChange={setBrowseMode} />
          </div>
        </div>
        {/* Tag filter */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
          <TagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm px-3">
              {selectedTags.size > 0
                ? 'No entries match the selected tags.'
                : 'No entries available.'}
            </div>
          ) : browseMode === 'date' ? (
            <JournalDateBrowse
              entries={filteredEntries}
              selectedEntry={selectedEntry}
              onSelect={setSelectedEntry}
            />
          ) : (
            <JournalBookBrowse
              bookGroups={filteredBookGroups}
              selectedEntry={selectedEntry}
              onSelect={setSelectedEntry}
            />
          )}
        </div>
      </div>

      {/* Right panel — entry detail */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-gray-900">
        {selectedEntry ? (
          <div className="max-w-3xl mx-auto px-6 py-6">
            {/* Entry header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedEntry.meta.book} {selectedEntry.meta.chapter}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {formatDate(selectedEntry.meta.date)}
                  </p>
                  {selectedEntry.meta.tags && selectedEntry.meta.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedEntry.meta.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} onClick={() => handleTagClick(tag)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleNavigateToReader(selectedEntry.meta.book, selectedEntry.meta.chapter)}
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Read {selectedEntry.meta.book} {selectedEntry.meta.chapter}
              </button>
            </div>

            {/* Full rendered body */}
            <div
              className="text-base text-gray-800 dark:text-gray-200 space-y-1 leading-relaxed"
              style={{ fontFamily: fontCss }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(stripAutoInsertedLines(selectedEntry.body)) }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            Select an entry to view
          </div>
        )}
      </div>
    </div>
  );
}

function BrowseToggle({
  mode,
  onChange,
}: {
  mode: JournalBrowseMode;
  onChange: (mode: JournalBrowseMode) => void;
}) {
  return (
    <div className="flex rounded-md border border-gray-300 dark:border-gray-600 text-xs">
      <button
        onClick={() => onChange('date')}
        className={`px-2 py-0.5 rounded-l-md transition-colors ${
          mode === 'date'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Date
      </button>
      <button
        onClick={() => onChange('book')}
        className={`px-2 py-0.5 rounded-r-md transition-colors ${
          mode === 'book'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Book
      </button>
    </div>
  );
}
