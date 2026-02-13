import type { JournalEntry } from '../../types/journal';
import { JournalEntryCard } from './JournalEntryCard';

interface JournalDateViewProps {
  entries: JournalEntry[];
  isLoading: boolean;
  onReply: (filename: string, book: string, chapter: number) => void;
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

export function JournalDateView({ entries, isLoading, onReply }: JournalDateViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        Loading entries...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
        No journal entries yet.
      </div>
    );
  }

  const grouped = groupByMonth(entries);

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([monthKey, monthEntries]) => (
        <div key={monthKey}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
            {formatMonthHeader(monthKey)}
          </h3>
          <div className="space-y-2">
            {monthEntries.map((entry) => (
              <div key={entry.filename}>
                <div className="text-xs text-gray-400 px-1 mb-1">
                  {entry.meta.book} {entry.meta.chapter}
                </div>
                <JournalEntryCard
                  entry={entry}
                  onReply={(filename) =>
                    onReply(filename, entry.meta.book, entry.meta.chapter)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
