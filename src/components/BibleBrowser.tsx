import { useState, useRef, useEffect, useCallback } from 'react';
import { BIBLE_TESTAMENTS } from '../data/bibleBooks';

interface BibleBrowserProps {
  selectedBook?: string;
  selectedChapter?: number;
  onSelect: (book: string, chapter: number) => void;
}

export function BibleBrowser({ selectedBook, selectedChapter, onSelect }: BibleBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<{ name: string; chapters: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveBook(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveBook(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll panel to top when switching views
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [activeBook]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) setActiveBook(null);
      return !prev;
    });
  }, []);

  const handleBookClick = useCallback((book: { name: string; chapters: number }) => {
    if (book.chapters === 1) {
      // Single-chapter books go directly to selection
      onSelect(book.name, 1);
      setIsOpen(false);
      setActiveBook(null);
    } else {
      setActiveBook(book);
    }
  }, [onSelect]);

  const handleChapterClick = useCallback((chapter: number) => {
    if (!activeBook) return;
    onSelect(activeBook.name, chapter);
    setIsOpen(false);
    setActiveBook(null);
  }, [activeBook, onSelect]);

  const handleBack = useCallback(() => {
    setActiveBook(null);
  }, []);

  const triggerLabel =
    selectedBook && selectedChapter
      ? `${selectedBook} ${selectedChapter}`
      : 'Select a chapter';

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="truncate">{triggerLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-0 z-50 mt-1 w-72 max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          role="listbox"
        >
          {activeBook ? (
            /* Chapter grid view */
            <div>
              {/* Header with back button */}
              <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Back to book list"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {activeBook.name}
                </span>
              </div>

              {/* Chapter number grid */}
              <div className="grid grid-cols-6 gap-1.5 p-3">
                {Array.from({ length: activeBook.chapters }, (_, i) => i + 1).map((ch) => {
                  const isSelected = selectedBook === activeBook.name && selectedChapter === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleChapterClick(ch)}
                      className={`rounded-md py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Book list view */
            <div className="py-1">
              {BIBLE_TESTAMENTS.map((testament) => (
                <div key={testament.name}>
                  {/* Testament header */}
                  <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {testament.name}
                    </span>
                  </div>

                  {testament.sections.map((section) => (
                    <div key={section.name}>
                      {/* Section header */}
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {section.name}
                        </span>
                      </div>

                      {/* Books in this section */}
                      {section.books.map((book) => {
                        const isSelected = selectedBook === book.name;
                        return (
                          <button
                            key={book.name}
                            type="button"
                            onClick={() => handleBookClick(book)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <span>{book.name}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {book.chapters} {book.chapters === 1 ? 'ch' : 'chs'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
