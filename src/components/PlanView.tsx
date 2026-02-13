import { useCallback } from 'react';
import type { DayPlan } from '../types';
import { exportToMarkdown } from '../utils/planGenerator';

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

interface PlanViewProps {
  plan: DayPlan[];
}

export function PlanView({ plan }: PlanViewProps) {
  const handleDownload = useCallback(() => {
    const markdown = exportToMarkdown(plan);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bible-reading-plan.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [plan]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Full Reading Plan</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {/* Plan list */}
      <div className="space-y-6">
        {plan.map((day) => {
          const dateStr = day.date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={day.day}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Day header */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Day {day.day}{' '}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    &mdash; {dateStr}
                  </span>
                </h3>
              </div>

              {/* Readings row */}
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {day.readings.map((reading) => {
                  const accent =
                    colorMap[reading.listColor] ?? '#6b7280';

                  return (
                    <span
                      key={reading.listId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      {reading.book} {reading.chapter}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
