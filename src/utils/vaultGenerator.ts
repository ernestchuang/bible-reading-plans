import { ALL_BIBLE_BOOKS, BIBLE_TESTAMENTS, getNextChapter, getPrevChapter } from '../data/bibleBooks';
import { fetchChapterCached } from './bibleCache';
import { mkdir, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import type { Translation, Verse, BibleBook } from '../types';

interface VaultGeneratorOptions {
  journalDir: string;           // Root journal directory
  translation: Translation;      // Which translation for verse text
  onProgress?: (current: number, total: number, message: string) => void;
}

export async function generateBibleVault(options: VaultGeneratorOptions): Promise<void> {
  const { journalDir, translation, onProgress } = options;
  // Generate vault in same location as journal entries (journal/ subdirectory)
  const bibleRoot = `${journalDir}/journal`;

  // 1. Create journal/ root directory if it doesn't exist
  const rootExists = await exists(bibleRoot);
  if (!rootExists) {
    await mkdir(bibleRoot, { recursive: true });
  }

  let currentChapter = 0;
  const totalChapters = 1189;

  // 2. Generate chapter stubs for each book
  for (const book of ALL_BIBLE_BOOKS) {
    const bookDir = `${bibleRoot}/${book.name}`;
    await mkdir(bookDir, { recursive: true });

    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      currentChapter++;
      onProgress?.(currentChapter, totalChapters, `${book.name} ${chapter}`);

      // Fetch or get cached verse data
      const verses = await fetchChapterCached(book.name, chapter, translation);

      // Generate chapter stub markdown
      const content = generateChapterStub({
        book: book.name,
        chapter,
        verses,
        testament: getTestament(book.name),
        section: getSection(book.name),
      });

      // Write chapter file
      await writeTextFile(`${bookDir}/${chapter}.md`, content);
    }

    // 3. Generate book index
    const indexContent = generateBookIndex(book);
    await writeTextFile(`${bookDir}/_index.md`, indexContent);
  }

  // 4. Generate master Bible index
  const masterIndex = generateMasterIndex();
  await writeTextFile(`${bibleRoot}/_Bible Index.md`, masterIndex);

  onProgress?.(totalChapters, totalChapters, 'Complete!');
}

function generateChapterStub(params: {
  book: string;
  chapter: number;
  verses: Verse[];
  testament: string;
  section: string;
}): string {
  const { book, chapter, verses, testament, section } = params;
  const verseCount = verses.length;

  const frontmatter = `---
title: ${book} ${chapter}
book: ${book}
chapter: ${chapter}
verses: ${verseCount}
testament: ${testament}
section: ${section}
---`;

  const verseList = verses.map(v => {
    const text = v.text.replace(/<br\s*\/?>/g, ' ').trim();
    const preview = text.length > 60 ? text.slice(0, 60) + '...' : text;
    return `${v.verse}. ${preview}`;
  }).join('\n');

  const prevChapter = getPrevChapter(book, chapter);
  const nextChapter = getNextChapter(book, chapter);

  const navigation = `## Navigation

- Previous: ${prevChapter ? `[[${prevChapter.book}/${prevChapter.chapter}]]` : '(none)'}
- Next: ${nextChapter ? `[[${nextChapter.book}/${nextChapter.chapter}]]` : '(none)'}
- Book Index: [[${book}/_index]]`;

  const dataviewQuery = `## Related Journal Entries

\`\`\`dataview
TABLE date, tags
FROM "journal"
WHERE book = "${book}" AND chapter = ${chapter}
SORT date DESC
\`\`\``;

  return `${frontmatter}

# ${book} ${chapter}

## Verse Reference

${verseList}

${navigation}

${dataviewQuery}
`;
}

function generateBookIndex(book: BibleBook): string {
  const testament = getTestament(book.name);
  const section = getSection(book.name);

  const frontmatter = `---
title: ${book.name}
testament: ${testament}
section: ${section}
chapters: ${book.chapters}
---`;

  const chapterLinks = Array.from({ length: book.chapters }, (_, i) => {
    const ch = i + 1;
    return `- [[${book.name}/${ch}|${book.name} ${ch}]]`;
  }).join('\n');

  const dataviewQuery = `## All Journal Entries for ${book.name}

\`\`\`dataview
TABLE chapter, date, tags
FROM "journal"
WHERE book = "${book.name}"
SORT chapter ASC, date DESC
\`\`\``;

  return `${frontmatter}

# ${book.name}

**Testament**: ${testament}
**Section**: ${section}
**Chapters**: ${book.chapters}

## Chapters

${chapterLinks}

${dataviewQuery}
`;
}

function generateMasterIndex(): string {
  let content = `---
title: Bible Index
---

# Bible Index

`;

  for (const testament of BIBLE_TESTAMENTS) {
    content += `\n## ${testament.name}\n\n`;
    for (const section of testament.sections) {
      content += `### ${section.name}\n`;
      for (const book of section.books) {
        content += `- [[${book.name}/_index|${book.name}]] (${book.chapters})\n`;
      }
      content += '\n';
    }
  }

  content += `## Queries

### Most Reflected-On Books

\`\`\`dataview
TABLE count(rows) as "Entries"
FROM "journal"
GROUP BY book
SORT count(rows) DESC
LIMIT 10
\`\`\`

### Recent Reflections

\`\`\`dataview
TABLE book, chapter, date, tags
FROM "journal"
SORT date DESC
LIMIT 20
\`\`\`

### By Tag

\`\`\`dataview
TABLE book, chapter, date
FROM "journal"
WHERE contains(tags, "prayer")
SORT date DESC
\`\`\`
`;

  return content;
}

// Helper to get testament name from book name
function getTestament(bookName: string): string {
  for (const testament of BIBLE_TESTAMENTS) {
    for (const section of testament.sections) {
      if (section.books.some(b => b.name === bookName)) {
        return testament.name;
      }
    }
  }
  return 'Unknown';
}

// Helper to get section name from book name
function getSection(bookName: string): string {
  for (const testament of BIBLE_TESTAMENTS) {
    for (const section of testament.sections) {
      if (section.books.some(b => b.name === bookName)) {
        return section.name;
      }
    }
  }
  return 'Unknown';
}
