import { useState } from 'react';
import type { JournalEntry } from '../../types/journal';
import type { FontFamily } from '../../types';
import { getFontCss } from '../../data/fonts';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onReply: (filename: string) => void;
  fontFamily: FontFamily;
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

/** Render markdown body as simple HTML (headings, bold, italic, lists, blockquotes). */
function renderMarkdown(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      // Headings
      const h = line.match(/^(#{1,6})\s+(.+)/);
      if (h) {
        const level = h[1].length;
        const sizes = ['text-lg font-bold', 'text-base font-bold', 'text-sm font-semibold', 'text-sm font-semibold', 'text-xs font-semibold', 'text-xs font-semibold'];
        return `<p class="${sizes[level - 1]} mt-2 mb-1">${escapeHtml(h[2])}</p>`;
      }
      // Blockquote
      if (line.match(/^>\s*/)) {
        const text = line.replace(/^>\s*/, '');
        return `<p class="border-l-2 border-gray-300 dark:border-gray-600 pl-3 italic text-gray-600 dark:text-gray-400">${inlineFormat(text)}</p>`;
      }
      // Unordered list
      if (line.match(/^[-*]\s+/)) {
        const text = line.replace(/^[-*]\s+/, '');
        return `<p class="pl-4">• ${inlineFormat(text)}</p>`;
      }
      // Ordered list
      const ol = line.match(/^(\d+)\.\s+(.+)/);
      if (ol) {
        return `<p class="pl-4">${ol[1]}. ${inlineFormat(ol[2])}</p>`;
      }
      // Horizontal rule
      if (line.match(/^---+$/)) {
        return '<hr class="my-2 border-gray-200 dark:border-gray-700" />';
      }
      // Empty line
      if (!line.trim()) return '<p class="h-2"></p>';
      // Normal paragraph
      return `<p>${inlineFormat(line)}</p>`;
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFormat(text: string): string {
  let s = escapeHtml(text);
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Strikethrough
  s = s.replace(/~~(.+?)~~/g, '<s>$1</s>');
  // Inline code
  s = s.replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>');
  return s;
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
          <button
            onClick={(e) => { e.stopPropagation(); onReply(entry.filename); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            Reply
          </button>
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
