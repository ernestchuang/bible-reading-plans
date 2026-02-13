import { useState } from 'react';
import type { Reading } from '../../types';
import type { JournalViewMode } from '../../types/journal';
import { useJournal } from '../../hooks/useJournal';
import { JournalEditor } from './JournalEditor';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalDateView } from './JournalDateView';

interface JournalPaneProps {
  reading: Reading | null;
}

export function JournalPane({ reading }: JournalPaneProps) {
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
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
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
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            {book} {chapter} — New Entry
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <JournalEditor
            onSave={handleSave}
            onCancel={handleCancel}
            linkedTo={linkedTo}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
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
            <div className="flex items-center justify-center py-8 text-gray-400">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              No entries for {book} {chapter} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.filename}
                  entry={entry}
                  onReply={handleReply}
                />
              ))}
            </div>
          )
        ) : (
          <JournalDateView
            entries={allEntries}
            isLoading={isLoading}
            onReply={handleDateViewReply}
          />
        )}
      </div>

      {/* New entry button */}
      <div className="px-3 py-2 border-t border-gray-200 bg-white">
        <button
          onClick={() => setComposing(true)}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
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
    <div className="flex rounded-md border border-gray-300 text-xs">
      <button
        onClick={() => onChange('chapter')}
        className={`px-2 py-1 rounded-l-md transition-colors ${
          viewMode === 'chapter'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Chapter
      </button>
      <button
        onClick={() => onChange('date')}
        className={`px-2 py-1 rounded-r-md transition-colors ${
          viewMode === 'date'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        Date
      </button>
    </div>
  );
}
