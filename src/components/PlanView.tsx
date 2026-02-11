import { useCallback } from 'react';
import type { DayPlan, Translation } from '../types';
import { getBibleReadingUrl } from '../utils/bibleLinks';
import { exportToMarkdown } from '../utils/planGenerator';

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

interface PlanViewProps {
  plan: DayPlan[];
  translation: Translation;
}

export function PlanView({ plan, translation }: PlanViewProps) {
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
        <h2 className="text-2xl font-bold text-gray-900">Full Reading Plan</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Day header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Day {day.day}{' '}
                  <span className="font-normal text-gray-500">
                    &mdash; {dateStr}
                  </span>
                </h3>
              </div>

              {/* Readings row */}
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {day.readings.map((reading) => {
                  const url = getBibleReadingUrl(
                    reading.book,
                    reading.chapter,
                    translation
                  );
                  const accent =
                    colorMap[reading.listColor] ?? '#6b7280';

                  return (
                    <a
                      key={reading.listId}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      {reading.book} {reading.chapter}
                    </a>
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
