import { useState } from 'react';
import type { Reading, FontFamily, FontSize } from '../../types';
import type { JournalViewMode } from '../../types/journal';
import { useJournal } from '../../hooks/useJournal';
import { JournalEditor } from './JournalEditor';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalDateView } from './JournalDateView';

interface JournalPaneProps {
  reading: Reading | null;
  fontFamily: FontFamily;
  fontSize: FontSize;
}

export function JournalPane({ reading, fontFamily, fontSize }: JournalPaneProps) {
  const book = reading?.book ?? null;
  const chapter = reading?.chapter ?? null;
  const {
    entries,
    allEntries,
    isLoading,
    saveEntry,
    viewMode,
    setViewMode,
  } = useJournal(book, chapter);

  const [composing, setComposing] = useState(false);
  const [linkedTo, setLinkedTo] = useState<string | undefined>(undefined);

  if (!reading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
        <p className="text-sm">Select a reading to view journal entries</p>
      </div>
    );
  }

  function handleSave(markdown: string) {
    saveEntry(markdown, linkedTo).then(() => {
      setComposing(false);
      setLinkedTo(undefined);
    });
  }

  function handleCancel() {
    setComposing(false);
    setLinkedTo(undefined);
  }

  function handleReply(filename: string) {
    setLinkedTo(filename);
    setComposing(true);
  }

  function handleDateViewReply(
    filename: string,
    _book: string,
    _chapter: number
  ) {
    setLinkedTo(filename);
    setComposing(true);
  }

  if (composing) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {book} {chapter} — New Entry
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <JournalEditor
            onSave={handleSave}
            onCancel={handleCancel}
            linkedTo={linkedTo}
            fontFamily={fontFamily}
            fontSize={fontSize}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {book} {chapter} — Journal
        </span>
        <div className="flex items-center gap-1">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Entry list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {viewMode === 'chapter' ? (
          isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No entries for {book} {chapter} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.filename}
                  entry={entry}
                  onReply={handleReply}
                  fontFamily={fontFamily}
                />
              ))}
            </div>
          )
        ) : (
          <JournalDateView
            entries={allEntries}
            isLoading={isLoading}
            onReply={handleDateViewReply}
            fontFamily={fontFamily}
          />
        )}
      </div>

      {/* New entry button */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setComposing(true)}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        >
          New Entry
        </button>
      </div>
    </div>
  );
}

function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: JournalViewMode;
  onChange: (mode: JournalViewMode) => void;
}) {
  return (
    <div className="flex rounded-md border border-gray-300 dark:border-gray-600 text-xs">
      <button
        onClick={() => onChange('chapter')}
        className={`px-2 py-1 rounded-l-md transition-colors ${
          viewMode === 'chapter'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Chapter
      </button>
      <button
        onClick={() => onChange('date')}
        className={`px-2 py-1 rounded-r-md transition-colors ${
          viewMode === 'date'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Date
      </button>
    </div>
  );
}
