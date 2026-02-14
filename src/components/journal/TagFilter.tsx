import { useState, useRef, useEffect } from 'react';
import { TagBadge } from './TagBadge';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: Set<string>;
  onChange: (tags: Set<string>) => void;
}

export function TagFilter({ availableTags, selectedTags, onChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    onChange(newTags);
  };

  const clearAll = () => {
    onChange(new Set());
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected tags display */}
      {selectedTags.size > 0 && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Filtered by:</span>
          {Array.from(selectedTags).map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={() => toggleTag(tag)} />
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter by tag
        {selectedTags.size > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-indigo-600 text-white">
            {selectedTags.size}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Select tags (AND logic)
              </span>
              {selectedTags.size > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Clear
                </button>
              )}
            </div>
            {availableTags.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No tags available</p>
            ) : (
              <div className="space-y-1">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.has(tag)}
                      onChange={() => toggleTag(tag)}
                      className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
