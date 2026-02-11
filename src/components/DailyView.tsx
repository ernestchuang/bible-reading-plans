import type { Reading, Translation } from '../types';
import { ReadingCard } from './ReadingCard';

interface DailyViewProps {
  readings: Reading[];
  translation: Translation;
  dayIndex: number;
  startDate: string;
  currentDayIndex: number;
  onDayChange: (delta: number) => void;
  onGoToToday: () => void;
}

export function DailyView({
  readings,
  translation,
  dayIndex,
  startDate,
  currentDayIndex,
  onDayChange,
  onGoToToday,
}: DailyViewProps) {
  const isToday = dayIndex === currentDayIndex;
  const currentDate = new Date(startDate + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + dayIndex);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header with date and day number */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Day {dayIndex + 1}</h2>
        <p className="text-gray-600 mt-1">{formattedDate}</p>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onDayChange(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          &larr; Prev
        </button>
        {!isToday && (
          <button
            type="button"
            onClick={onGoToToday}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Today
          </button>
        )}
        <button
          type="button"
          onClick={() => onDayChange(1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {/* Reading cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {readings.map((reading) => (
          <ReadingCard
            key={reading.listId}
            reading={reading}
            translation={translation}
          />
        ))}
      </div>
    </div>
  );
}
