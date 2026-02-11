import type { Reading } from '../types';
import { ReadingCard } from './ReadingCard';

interface DailyViewProps {
  readings: Reading[];
  dayIndex: number;
  startDate: string;
  currentDayIndex: number;
  activeReading: Reading | null;
  onSelectReading: (reading: Reading) => void;
  onDayChange: (delta: number) => void;
  onGoToToday: () => void;
}

export function DailyView({
  readings,
  dayIndex,
  startDate,
  currentDayIndex,
  activeReading,
  onSelectReading,
  onDayChange,
  onGoToToday,
}: DailyViewProps) {
  const isToday = dayIndex === currentDayIndex;
  const currentDate = new Date(startDate + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + dayIndex);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-3">
      {/* Compact header row: nav + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDayChange(-1)}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            &larr;
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={onGoToToday}
              className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => onDayChange(1)}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            &rarr;
          </button>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">Day {dayIndex + 1}</span>
          <span className="text-sm text-gray-500 ml-2">{formattedDate}</span>
        </div>
      </div>

      {/* Reading cards - compact horizontal row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {readings.map((reading) => (
          <ReadingCard
            key={reading.listId}
            reading={reading}
            isActive={
              activeReading !== null &&
              activeReading.listId === reading.listId
            }
            onClick={() => onSelectReading(reading)}
          />
        ))}
      </div>
    </div>
  );
}
