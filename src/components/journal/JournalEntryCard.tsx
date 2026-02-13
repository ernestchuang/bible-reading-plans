import { useRef, useEffect } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
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

function ReadOnlyMarkdown({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: content,
      features: {
        [CrepeFeature.CodeMirror]: false,
        [CrepeFeature.Table]: false,
        [CrepeFeature.ImageBlock]: false,
        [CrepeFeature.Latex]: false,
        [CrepeFeature.Toolbar]: false,
        [CrepeFeature.BlockEdit]: false,
        [CrepeFeature.Placeholder]: false,
      },
    });

    crepe.create().then(() => {
      crepe.setReadonly(true);
    });

    return () => {
      crepe.destroy();
    };
  }, [content]);

  return <div ref={containerRef} className="text-sm" />;
}

export function JournalEntryCard({ entry, onReply }: JournalEntryCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500">
          {formatDate(entry.meta.date)}
        </span>
        <button
          onClick={() => onReply(entry.filename)}
          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Reply
        </button>
      </div>
      {entry.meta.linkedTo && (
        <div className="px-3 py-1 text-xs text-amber-600 bg-amber-50 border-b border-amber-100">
          In reply to{' '}
          {formatDate(
            entry.meta.linkedTo
              .replace(/\.md$/, '')
              .replace(/-/g, (m, offset) => (offset > 9 ? ':' : m))
              .replace('T', ' ')
          )}
        </div>
      )}
      <div className="px-3 py-2">
        <ReadOnlyMarkdown content={entry.body} />
      </div>
    </div>
  );
}
