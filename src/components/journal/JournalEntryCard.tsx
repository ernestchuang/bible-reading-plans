import type { JournalEntry } from '../../types/journal';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onReply: (filename: string) => void;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Extract the first heading, or the first non-empty line if no heading exists. */
function getPreviewLine(markdown: string): string {
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Strip leading markdown heading markers
    const heading = trimmed.match(/^#{1,6}\s+(.+)/);
    if (heading) return heading[1];
    return trimmed;
  }
  return '(empty)';
}

export function JournalEntryCard({ entry, onReply }: JournalEntryCardProps) {
  const preview = getPreviewLine(entry.body);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="min-w-0 flex-1 mr-2">
          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{preview}</p>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(entry.meta.date)}
          </span>
        </div>
        <button
          onClick={() => onReply(entry.filename)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors shrink-0"
        >
          Reply
        </button>
      </div>
      {entry.meta.linkedTo && (
        <div className="px-3 py-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-t border-amber-100 dark:border-amber-800 rounded-b-lg">
          In reply to{' '}
          {formatDate(
            entry.meta.linkedTo
              .replace(/\.md$/, '')
              .replace(/-/g, (m, _p1, offset) => (offset > 9 ? ':' : m))
              .replace('T', ' ')
          )}
        </div>
      )}
    </div>
  );
}
