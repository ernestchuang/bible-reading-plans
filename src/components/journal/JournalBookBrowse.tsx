import { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import type { BookGroup } from '../../hooks/useJournalBrowser';
import { BIBLE_TESTAMENTS } from '../../data/bibleBooks';
import { formatDate, getPreviewLine } from '../../utils/journalRender';

interface JournalBookBrowseProps {
  bookGroups: BookGroup[];
  selectedEntry: JournalEntry | null;
  onSelect: (entry: JournalEntry) => void;
}

const OT_BOOKS = new Set(
  BIBLE_TESTAMENTS[0].sections.flatMap((s) => s.books.map((b) => b.name))
);

export function JournalBookBrowse({ bookGroups, selectedEntry, onSelect }: JournalBookBrowseProps) {
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(() => new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => new Set());

  if (bookGroups.length === 0) return null;

  const otGroups = bookGroups.filter((g) => OT_BOOKS.has(g.book));
  const ntGroups = bookGroups.filter((g) => !OT_BOOKS.has(g.book));

  function toggleBook(book: string) {
    setExpandedBooks((prev) => {
      const next = new Set(prev);
      if (next.has(book)) next.delete(book);
      else next.add(book);
      return next;
    });
  }

  function toggleChapter(key: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function entryCount(group: BookGroup): number {
    return group.chapters.reduce((sum, c) => sum + c.entries.length, 0);
  }

  function renderTestament(label: string, groups: BookGroup[]) {
    if (groups.length === 0) return null;
    return (
      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 pt-3 pb-1">
          {label}
        </h4>
        {groups.map((group) => {
          const isExpanded = expandedBooks.has(group.book);
          return (
            <div key={group.book}>
              <button
                onClick={() => toggleBook(group.book)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {group.book}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {entryCount(group)}
                </span>
              </button>
              {isExpanded && group.chapters.map((ch) => {
                const chKey = `${group.book}:${ch.chapter}`;
                const isChExpanded = expandedChapters.has(chKey);
                return (
                  <div key={ch.chapter} className="ml-4">
                    <button
                      onClick={() => toggleChapter(chKey)}
                      className="w-full flex items-center justify-between px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <svg
                          className={`w-2.5 h-2.5 text-gray-400 transition-transform ${isChExpanded ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        Chapter {ch.chapter}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">{ch.entries.length}</span>
                    </button>
                    {isChExpanded && ch.entries.map((entry) => {
                      const isSelected = selectedEntry?.filename === entry.filename;
                      return (
                        <button
                          key={entry.filename}
                          onClick={() => onSelect(entry)}
                          className={`w-full text-left pl-8 pr-3 py-1.5 border-b border-gray-50 dark:border-gray-800 transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <p className={`text-xs truncate ${
                            isSelected
                              ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {getPreviewLine(entry.body)}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {formatDate(entry.meta.date)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {renderTestament('Old Testament', otGroups)}
      {renderTestament('New Testament', ntGroups)}
    </div>
  );
}
