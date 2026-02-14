import type { Reading } from '../types';
import { ReadingCard } from './ReadingCard';
import { PLANS } from '../data/plans';

interface DailyViewProps {
  readings: Reading[];
  startDate: string;
  currentDayIndex: number;
  effectiveDayIndices: number[];
  isCalendarPlan: boolean;
  activeReading: Reading | null;
  completedToday: boolean[];
  onSelectReading: (reading: Reading) => void;
  onToggleComplete: (listIndex: number) => void;
  onRevertDay: (listIndex: number) => void;
  activePlanId?: string;
  onPlanChange?: (planId: string) => void;
}

const GRID_COLS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
};

export function DailyView({
  readings,
  startDate,
  currentDayIndex,
  effectiveDayIndices,
  isCalendarPlan,
  activeReading,
  completedToday,
  onSelectReading,
  onToggleComplete,
  onRevertDay,
  activePlanId,
  onPlanChange,
}: DailyViewProps) {
  // For header display, use minimum day index (the "earliest" list)
  const minDayIndex = Math.min(...effectiveDayIndices);

  const displayDate = new Date(startDate + 'T00:00:00');
  displayDate.setDate(displayDate.getDate() + minDayIndex);

  const formattedDate = displayDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const completedCount = completedToday.filter(Boolean).length;
  const total = readings.length;
  const colsClass = GRID_COLS[Math.min(total, 5)] ?? 'sm:grid-cols-5';

  // 1-based current calendar day for per-card badge comparison
  const calendarDay = isCalendarPlan ? (currentDayIndex % 365) + 1 : undefined;

  return (
    <div className="space-y-3">
      {/* Header row: plan selector + date + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {activePlanId && onPlanChange && (
            <select
              value={activePlanId}
              onChange={(e) => onPlanChange(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              aria-label="Reading plan"
            >
              {PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          )}
          <span className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-gray-100">Day {minDayIndex + 1}</span>
            <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className={completedCount === total ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
            {completedCount}/{total} complete
          </span>
        </div>
      </div>

      {/* Reading cards */}
      <div className={`grid grid-cols-2 ${colsClass} gap-2`}>
        {readings.map((reading, i) => (
          <ReadingCard
            key={reading.listId}
            reading={reading}
            isActive={
              activeReading !== null &&
              activeReading.listId === reading.listId
            }
            isCompleted={completedToday[i]}
            dayNumber={isCalendarPlan ? (effectiveDayIndices[i] % 365) + 1 : undefined}
            calendarDay={calendarDay}
            onClick={() => onSelectReading(reading)}
            onToggleComplete={(e) => {
              e.stopPropagation();
              onToggleComplete(i);
            }}
            onRevertDay={isCalendarPlan ? (e) => {
              e.stopPropagation();
              onRevertDay(i);
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
