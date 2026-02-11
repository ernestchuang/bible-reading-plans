import type { Reading, Translation } from '../types';
import { getBibleReadingUrl } from '../utils/bibleLinks';

const colorMap: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-amber-600': '#d97706',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-yellow-500': '#eab308',
  'bg-orange-500': '#f97316',
  'bg-rose-500': '#f43f5e',
  'bg-teal-500': '#14b8a6',
  'bg-indigo-500': '#6366f1',
  'bg-sky-500': '#0ea5e9',
};

interface ReadingCardProps {
  reading: Reading;
  translation: Translation;
}

export function ReadingCard({ reading, translation }: ReadingCardProps) {
  const url = getBibleReadingUrl(reading.book, reading.chapter, translation);
  const accentColor = colorMap[reading.listColor] ?? '#6b7280';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg shadow-md bg-white p-4 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
    >
      <div
        className="h-1.5 rounded-full -mt-1 mb-3"
        style={{ backgroundColor: accentColor }}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
        {reading.listName}
      </p>
      <p className="text-lg font-bold text-gray-900">
        {reading.book} {reading.chapter}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Click to read &rarr;
      </p>
    </a>
  );
}
