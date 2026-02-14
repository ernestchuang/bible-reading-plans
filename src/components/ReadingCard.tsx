import { formatReading } from '../types';
import type { Reading } from '../types';

const colorMap: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-red-600': '#dc2626',
  'bg-blue-600': '#2563eb',
  'bg-amber-600': '#d97706',
  'bg-emerald-500': '#10b981',
  'bg-emerald-600': '#059669',
  'bg-purple-500': '#a855f7',
  'bg-purple-600': '#9333ea',
  'bg-yellow-500': '#eab308',
  'bg-orange-500': '#f97316',
  'bg-rose-500': '#f43f5e',
  'bg-teal-500': '#14b8a6',
  'bg-teal-600': '#0d9488',
  'bg-indigo-500': '#6366f1',
  'bg-indigo-600': '#4f46e5',
  'bg-sky-500': '#0ea5e9',
};

interface ReadingCardProps {
  reading: Reading;
  isActive: boolean;
  isCompleted: boolean;
  /** 1-based M'Cheyne day this card is showing (calendar plans only) */
  dayNumber?: number;
  /** 1-based current calendar day, for computing ahead/behind (calendar plans only) */
  calendarDay?: number;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  /** Go back one day (calendar plans only) */
  onRevertDay?: (e: React.MouseEvent) => void;
}

export function ReadingCard({ reading, isActive, isCompleted, dayNumber, calendarDay, onClick, onToggleComplete, onRevertDay }: ReadingCardProps) {
  const accentColor = colorMap[reading.listColor] ?? '#6b7280';

  // Compute ahead/behind for calendar plans
  const dayDiff = dayNumber != null && calendarDay != null ? dayNumber - calendarDay : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative block w-full text-left rounded-lg shadow-md p-3 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950'
          : isCompleted
            ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
            : 'bg-white dark:bg-gray-800'
      }`}
    >
      <div
        className="h-1 rounded-full -mt-0.5 mb-2"
        style={{ backgroundColor: accentColor, opacity: isCompleted ? 0.4 : 1 }}
      />
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {reading.listName}
            </p>
            {dayNumber != null && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Day {dayNumber}
              </span>
            )}
            {dayDiff !== 0 && (
              <span className={`text-[9px] font-medium px-1 py-px rounded-full ${
                dayDiff > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              }`}>
                {dayDiff > 0 ? '+' : ''}{dayDiff}
              </span>
            )}
          </div>
          <p className={`text-sm font-bold whitespace-nowrap ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
            {formatReading(reading)}
          </p>
        </div>
        {/* Minus (go back) + Checkbox */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {onRevertDay && (
            <span
              role="button"
              aria-label={`Go back one day for ${reading.listName}`}
              onClick={onRevertDay}
              className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors hover:border-amber-400 hover:text-amber-500 text-gray-400 dark:text-gray-500"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </span>
          )}
          <span
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={`Mark ${formatReading(reading)} as ${isCompleted ? 'incomplete' : 'complete'}`}
            onClick={onToggleComplete}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-gray-400 border-gray-400 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            {isCompleted && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
