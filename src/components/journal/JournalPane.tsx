import { useState } from 'react';
import type { BibleSelection, FontFamily, FontSize } from '../../types';
import { formatBibleSelection } from '../../types';
import type { JournalViewMode } from '../../types/journal';
import { useJournal } from '../../hooks/useJournal';
import { useAvailableTags } from '../../hooks/useAvailableTags';
import { matchesTags } from '../../utils/tagUtils';
import { JournalEditor } from './JournalEditor';
import { JournalEntryCard } from './JournalEntryCard';
import { JournalDateView } from './JournalDateView';
import { TagFilter } from './TagFilter';

interface JournalPaneProps {
  selection: BibleSelection | null;
  fontFamily: FontFamily;
  fontSize: FontSize;
}

export function JournalPane({ selection, fontFamily, fontSize }: JournalPaneProps) {
  const book = selection?.book ?? null;
  const chapter = selection?.chapter ?? null;
  const {
    entries,
    allEntries,
    isLoading,
    saveEntry,
    viewMode,
    setViewMode,
  } = useJournal(book, chapter);

  const availableTags = useAvailableTags(entries);
  const [composing, setComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const filteredEntries = entries.filter((e) => matchesTags(e, selectedTags));
  const filteredAllEntries = allEntries.filter((e) => matchesTags(e, selectedTags));

  if (!selection) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
        <p className="text-sm">Select a chapter to view journal entries</p>
      </div>
    );
  }

  function handleSave(markdown: string, tags: string[]) {
    saveEntry(markdown, replyTo, tags).then(() => {
      setComposing(false);
      setReplyTo(undefined);
    });
  }

  function handleCancel() {
    setComposing(false);
    setReplyTo(undefined);
  }

  function handleReply(filename: string) {
    setReplyTo(filename);
    setComposing(true);
  }

  function handleDateViewReply(
    filename: string,
    _book: string,
    _chapter: number
  ) {
    setReplyTo(filename);
    setComposing(true);
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

  if (composing) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatBibleSelection(selection)} — New Entry
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <JournalEditor
            onSave={handleSave}
            onCancel={handleCancel}
            replyTo={replyTo}
            fontFamily={fontFamily}
            fontSize={fontSize}
            availableTags={availableTags}
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
          {formatBibleSelection(selection)} — Journal
        </span>
        <div className="flex items-center gap-2">
          <TagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />
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
          ) : filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              {selectedTags.size > 0
                ? 'No entries match the selected tags.'
                : `No entries for ${formatBibleSelection(selection)} yet.`}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <JournalEntryCard
                  key={entry.filename}
                  entry={entry}
                  onReply={handleReply}
                  onTagClick={handleTagClick}
                  fontFamily={fontFamily}
                />
              ))}
            </div>
          )
        ) : (
          <JournalDateView
            entries={filteredAllEntries}
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
