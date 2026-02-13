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
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="min-w-0 flex-1 mr-2">
          <p className="text-sm text-gray-900 truncate">{preview}</p>
          <span className="text-xs text-gray-400">
            {formatDate(entry.meta.date)}
          </span>
        </div>
        <button
          onClick={() => onReply(entry.filename)}
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
        >
          Reply
        </button>
      </div>
      {entry.meta.linkedTo && (
        <div className="px-3 py-1 text-xs text-amber-600 bg-amber-50 border-t border-amber-100 rounded-b-lg">
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
