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
  isCompleted: boolean;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

export function ReadingCard({ reading, isActive, isCompleted, onClick, onToggleComplete }: ReadingCardProps) {
  const accentColor = colorMap[reading.listColor] ?? '#6b7280';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative block w-full text-left rounded-lg shadow-md p-3 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-indigo-500 bg-indigo-50'
          : isCompleted
            ? 'bg-green-50 opacity-75'
            : 'bg-white'
      }`}
    >
      <div
        className="h-1 rounded-full -mt-0.5 mb-2"
        style={{ backgroundColor: isCompleted ? '#22c55e' : accentColor }}
      />
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
            {reading.listName}
          </p>
          <p className={`text-sm font-bold ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}`}>
            {reading.book} {reading.chapter}
          </p>
        </div>
        {/* Checkbox */}
        <span
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Mark ${reading.book} ${reading.chapter} as ${isCompleted ? 'incomplete' : 'complete'}`}
          onClick={onToggleComplete}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}
