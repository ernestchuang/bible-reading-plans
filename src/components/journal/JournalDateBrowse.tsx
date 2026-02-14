import type { JournalEntry } from '../../types/journal';
import { formatDate, getPreviewLine } from '../../utils/journalRender';

interface JournalDateBrowseProps {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  onSelect: (entry: JournalEntry) => void;
}

function groupByMonth(entries: JournalEntry[]): Map<string, JournalEntry[]> {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.meta.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = groups.get(key) || [];
    existing.push(entry);
    groups.set(key, existing);
  }
  return groups;
}

function formatMonthHeader(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
}

export function JournalDateBrowse({ entries, selectedEntry, onSelect }: JournalDateBrowseProps) {
  if (entries.length === 0) return null;

  const grouped = groupByMonth(entries);

  return (
    <div>
      {Array.from(grouped.entries()).map(([monthKey, monthEntries]) => (
        <div key={monthKey}>
          <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 pt-3 pb-1">
            {formatMonthHeader(monthKey)}
          </h3>
          {monthEntries.map((entry) => {
            const isSelected = selectedEntry?.filename === entry.filename;
            return (
              <button
                key={entry.filename}
                onClick={() => onSelect(entry)}
                className={`w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-800 transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <p className={`text-sm truncate ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {getPreviewLine(entry.body)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {entry.meta.book} {entry.meta.chapter} &middot; {formatDate(entry.meta.date)}
                </p>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
