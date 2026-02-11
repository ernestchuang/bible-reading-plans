import type { Reading } from '../types';

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
  isActive: boolean;
  onClick: () => void;
}

export function ReadingCard({ reading, isActive, onClick }: ReadingCardProps) {
  const accentColor = colorMap[reading.listColor] ?? '#6b7280';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full text-left rounded-lg shadow-md p-3 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-indigo-500 bg-indigo-50'
          : 'bg-white'
      }`}
    >
      <div
        className="h-1 rounded-full -mt-0.5 mb-2"
        style={{ backgroundColor: accentColor }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {reading.listName}
      </p>
      <p className="text-sm font-bold text-gray-900">
        {reading.book} {reading.chapter}
      </p>
    </button>
  );
}
