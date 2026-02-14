import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FontFamily } from '../../types';
import type { JournalEntry, JournalBrowseMode } from '../../types/journal';
import { useJournalBrowser } from '../../hooks/useJournalBrowser';
import { getFontCss } from '../../data/fonts';
import { formatDate, renderMarkdown } from '../../utils/journalRender';
import { JournalDateBrowse } from './JournalDateBrowse';
import { JournalBookBrowse } from './JournalBookBrowse';

interface JournalViewProps {
  fontFamily: FontFamily;
}

const READER_KEY = 'bible-reader-v1';

export function JournalView({ fontFamily }: JournalViewProps) {
  const [browseMode, setBrowseMode] = useState<JournalBrowseMode>('date');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const { allEntries, bookGroups, isLoading, error } = useJournalBrowser();
  const navigate = useNavigate();
  const fontCss = getFontCss(fontFamily);

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

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel — entry list */}
      <div className="w-72 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0 bg-white dark:bg-gray-900">
        {/* Mode toggle header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Browse by</span>
          <BrowseToggle mode={browseMode} onChange={setBrowseMode} />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {browseMode === 'date' ? (
            <JournalDateBrowse
              entries={allEntries}
              selectedEntry={selectedEntry}
              onSelect={setSelectedEntry}
            />
          ) : (
            <JournalBookBrowse
              bookGroups={bookGroups}
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
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {formatDate(selectedEntry.meta.date)}
                </p>
              </div>
              <button
                onClick={() => handleNavigateToReader(selectedEntry.meta.book, selectedEntry.meta.chapter)}
                className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Read {selectedEntry.meta.book} {selectedEntry.meta.chapter}
              </button>
            </div>

            {selectedEntry.meta.linkedTo && (
              <div className="mb-4 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-800 rounded-md">
                In reply to{' '}
                {formatDate(
                  selectedEntry.meta.linkedTo
                    .replace(/\.md$/, '')
                    .replace(/-/g, (m, _p1, offset) => (offset > 9 ? ':' : m))
                    .replace('T', ' ')
                )}
              </div>
            )}

            {/* Full rendered body */}
            <div
              className="text-base text-gray-800 dark:text-gray-200 space-y-1 leading-relaxed"
              style={{ fontFamily: fontCss }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedEntry.body) }}
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
