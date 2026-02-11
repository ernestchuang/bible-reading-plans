import type { Reading, Translation } from '../types';
import { getBibleReadingUrl } from '../utils/bibleLinks';

interface BibleReaderProps {
  reading: Reading | null;
  translation: Translation;
}

export function BibleReader({ reading, translation }: BibleReaderProps) {
  if (!reading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
        <p className="text-lg">Select a reading above to begin</p>
      </div>
    );
  }

  const url = getBibleReadingUrl(reading.book, reading.chapter, translation);

  return (
    <div className="h-full flex flex-col">
      {/* Reader toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          {reading.book} {reading.chapter}
          <span className="text-gray-400 ml-2">({translation})</span>
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Open in new tab &rarr;
        </a>
      </div>

      {/* Iframe */}
      <iframe
        key={url}
        src={url}
        title={`${reading.book} ${reading.chapter} (${translation})`}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
