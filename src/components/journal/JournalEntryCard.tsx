import { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import type { FontFamily } from '../../types';
import { getFontCss } from '../../data/fonts';
import { formatDate, getPreviewLine, renderMarkdown } from '../../utils/journalRender';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onReply?: (filename: string) => void;
  fontFamily: FontFamily;
}

export function JournalEntryCard({ entry, onReply, fontFamily }: JournalEntryCardProps) {
  const preview = getPreviewLine(entry.body);
  const [expanded, setExpanded] = useState(false);
  const fontCss = getFontCss(fontFamily);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="min-w-0 flex-1 mr-2">
          <p className="text-sm text-gray-900 dark:text-gray-100 truncate" style={{ fontFamily: fontCss }}>{preview}</p>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(entry.meta.date)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onReply && (
            <button
              onClick={(e) => { e.stopPropagation(); onReply(entry.filename); }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Reply
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {expanded && (
        <div
          className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 space-y-1"
          style={{ fontFamily: fontCss }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.body) }}
        />
      )}
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
