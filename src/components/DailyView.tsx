import type { Reading, Translation } from '../types';
import { ReadingCard } from './ReadingCard';

interface DailyViewProps {
  readings: Reading[];
  translation: Translation;
  dayIndex: number;
  startDate: string;
  onDayChange: (delta: number) => void;
}

export function DailyView({
  readings,
  translation,
  dayIndex,
  startDate,
  onDayChange,
}: DailyViewProps) {
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
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onDayChange(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          &larr; Previous Day
        </button>
        <button
          type="button"
          onClick={() => onDayChange(1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next Day &rarr;
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
