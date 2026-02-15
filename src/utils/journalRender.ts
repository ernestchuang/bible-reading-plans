/** Shared helpers for rendering journal entries. */

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Strip HTML &lt;br/&gt; / &lt;br&gt; tags (Milkdown hard-break artifacts). */
function stripBr(s: string): string {
  return s.replace(/<br\s*\/?>/gi, '').trim();
}

/** Extract the first heading, or the first non-empty line if no heading exists. */
export function getPreviewLine(markdown: string): string {
  for (const line of markdown.split('\n')) {
    const trimmed = stripBr(line.trim());
    if (!trimmed) continue;
    const heading = trimmed.match(/^#{1,6}\s+(.+)/);
    if (heading) return heading[1];
    return trimmed;
  }
  return '(empty)';
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Parse and render wikilinks: [[target]], [[target|display]], [[Book Chapter#vVerse|display]] */
function renderWikilinks(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_match, content) => {
    const parts = content.split('|');
    const target = parts[0].trim();
    const display = parts[1]?.trim() || target;

    // Bible chapter link: "01-Genesis/001" (new format with book numbers)
    if (target.match(/^\d{2}-[A-Za-z0-9\s]+\/\d{3}$/)) {
      return `<span class="text-purple-600 dark:text-purple-400 font-medium">[[${escapeHtml(display)}]]</span>`;
    }

    // Bible passage link: "Romans 8#v28"
    if (target.match(/^[A-Z][a-zA-Z\s]+\d+#v\d+$/)) {
      return `<a href="#bible:${target}" class="text-indigo-600 dark:text-indigo-400 hover:underline">${escapeHtml(display)}</a>`;
    }

    // Journal entry link: timestamp filename without .md
    if (target.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/)) {
      return `<a href="#entry:${target}" class="text-indigo-600 dark:text-indigo-400 hover:underline">${escapeHtml(display)}</a>`;
    }

    // Unknown link — render as plain text with styling
    return `<span class="text-gray-500 dark:text-gray-400">[[${escapeHtml(display)}]]</span>`;
  });
}

function inlineFormat(text: string): string {
  // Render wikilinks first, before escaping HTML
  let s = renderWikilinks(text);
  // Now escape HTML entities (but preserve wikilinks which are already rendered as HTML)
  s = s.replace(/(?<!<[^>]*)&(?![^<]*>)/g, '&amp;');
  s = s.replace(/(?<!<[^>]*)<(?![^<]*>)/g, '&lt;');
  s = s.replace(/(?<!<[^>]*)>(?![^<]*>)/g, '&gt;');
  // Restore <br/> and <br> that were escaped (Milkdown serializes hard breaks as <br>)
  s = s.replace(/&lt;br\s*\/?&gt;/g, '<br/>');
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

/** Render markdown body as simple HTML (headings, bold, italic, lists, blockquotes). */
export function renderMarkdown(md: string): string {
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
        return `<p class="pl-4">\u2022 ${inlineFormat(text)}</p>`;
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
      // Empty line (including bare <br/> tags from Milkdown)
      if (!line.trim() || /^<br\s*\/?>$/i.test(line.trim())) return '<p class="h-2"></p>';
      // Normal paragraph
      return `<p>${inlineFormat(line)}</p>`;
    })
    .join('');
}
