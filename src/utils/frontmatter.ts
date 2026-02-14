import type { JournalEntryMeta } from '../types/journal';

export function parseFrontmatter(raw: string): {
  meta: JournalEntryMeta;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }
  const [, yamlBlock, body] = match;
  const meta: Partial<JournalEntryMeta> = {};

  const lines = yamlBlock.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      i++;
      continue;
    }
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    switch (key) {
      case 'date':
        meta.date = value;
        break;
      case 'book':
        meta.book = value;
        break;
      case 'chapter':
        meta.chapter = parseInt(value, 10);
        break;
      case 'tags':
        // Handle both inline [tag1, tag2] and list format
        if (value.startsWith('[')) {
          // Inline format: tags: [tag1, tag2]
          meta.tags = value
            .replace(/[\[\]]/g, '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        } else if (value === '') {
          // List format: tags:\n  - tag1\n  - tag2
          const tagList: string[] = [];
          i++;
          while (i < lines.length && lines[i].trim().startsWith('-')) {
            const tag = lines[i].trim().slice(1).trim();
            if (tag) tagList.push(tag);
            i++;
          }
          i--; // Back up one line since the outer loop will increment
          if (tagList.length > 0) meta.tags = tagList;
        }
        break;
    }
    i++;
  }

  return {
    meta: meta as JournalEntryMeta,
    body: body.trim(),
  };
}

export function serializeFrontmatter(
  meta: JournalEntryMeta,
  body: string
): string {
  const lines = [
    '---',
    `date: ${meta.date}`,
    `book: ${meta.book}`,
    `chapter: ${meta.chapter}`,
  ];

  if (meta.tags && meta.tags.length > 0) {
    lines.push(`tags: [${meta.tags.join(', ')}]`);
  }

  lines.push('---', '', body);
  return lines.join('\n');
}
