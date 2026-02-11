import type { Reading } from '../types';
import { ReadingCard } from './ReadingCard';

interface DailyViewProps {
  readings: Reading[];
  startDate: string;
  currentDayIndex: number;
  activeReading: Reading | null;
  completedToday: boolean[];
  onSelectReading: (reading: Reading) => void;
  onToggleComplete: (listIndex: number) => void;
}

export function DailyView({
  readings,
  startDate,
  currentDayIndex,
  activeReading,
  completedToday,
  onSelectReading,
  onToggleComplete,
}: DailyViewProps) {
  const currentDate = new Date(startDate + 'T00:00:00');
  currentDate.setDate(currentDate.getDate() + currentDayIndex);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const completedCount = completedToday.filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Header row: date + progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-bold text-gray-900">Day {currentDayIndex + 1}</span>
          <span className="text-gray-500 ml-2">{formattedDate}</span>
        </div>
        <div className="text-sm text-gray-500">
          <span className={completedCount === 10 ? 'text-green-600 font-semibold' : ''}>
            {completedCount}/10 complete
          </span>
        </div>
      </div>

      {/* Reading cards - compact horizontal row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {readings.map((reading, i) => (
          <ReadingCard
            key={reading.listId}
            reading={reading}
            isActive={
              activeReading !== null &&
              activeReading.listId === reading.listId
            }
            isCompleted={completedToday[i]}
            onClick={() => onSelectReading(reading)}
            onToggleComplete={(e) => {
              e.stopPropagation();
              onToggleComplete(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
