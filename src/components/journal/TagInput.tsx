import { useState, useRef, useEffect } from 'react';
import { normalizeTag } from '../../utils/tagUtils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
}

export function TagInput({ tags, onChange, availableTags }: TagInputProps) {
  const [input, setInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = availableTags.filter(
    (tag) =>
      !tags.includes(tag) &&
      tag.toLowerCase().includes(input.toLowerCase().trim())
  );

  const addTag = (tag: string) => {
    const normalized = normalizeTag(tag);
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized]);
    }
    setInput('');
    setShowAutocomplete(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  useEffect(() => {
    setShowAutocomplete(input.trim().length > 0 && suggestions.length > 0);
  }, [input, suggestions.length]);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 items-center">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
          Tags:
        </label>
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 min-w-[120px] px-2 py-0.5 text-xs bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {showAutocomplete && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
          {suggestions.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
