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

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
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
      case 'linkedTo':
        meta.linkedTo = value;
        break;
    }
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
  if (meta.linkedTo) {
    lines.push(`linkedTo: ${meta.linkedTo}`);
  }
  lines.push('---', '', body);
  return lines.join('\n');
}
