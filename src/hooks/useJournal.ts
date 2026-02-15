import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalViewMode } from '../types/journal';
import {
  listEntryFiles,
  readEntryFile,
  writeEntryFile,
  listAllEntries,
} from '../utils/journalFs';
import { parseFrontmatter, serializeFrontmatter } from '../utils/frontmatter';
import { formatChapterWikilink } from '../utils/bibleOrder';

function makeTimestampFilename(): string {
  return (
    new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19) + '.md'
  );
}

/** Strip HTML <br/> / <br> tags (Milkdown hard-break artifacts) */
function cleanMarkdown(markdown: string): string {
  return markdown.replace(/<br\s*\/?>/gi, '').trim();
}

async function loadEntriesForChapter(
  book: string,
  chapter: number
): Promise<JournalEntry[]> {
  const filenames = await listEntryFiles(book, chapter);
  const entries: JournalEntry[] = [];
  for (const filename of filenames) {
    const raw = await readEntryFile(filename);
    const { meta, body } = parseFrontmatter(raw);
    entries.push({
      filename,
      path: filename,
      meta,
      body,
    });
  }
  return entries;
}

export function useJournal(book: string | null, chapter: number | null) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<JournalViewMode>('chapter');

  // Load entries for current book/chapter
  useEffect(() => {
    if (!book || chapter == null) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadEntriesForChapter(book, chapter)
      .then((loaded) => {
        if (!cancelled) setEntries(loaded);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [book, chapter]);

  // Load all entries when switching to date view
  useEffect(() => {
    if (viewMode !== 'date') return;
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const all = await listAllEntries();
        const loaded: JournalEntry[] = [];
        for (const { filename } of all) {
          const raw = await readEntryFile(filename);
          const { meta, body } = parseFrontmatter(raw);
          loaded.push({
            filename,
            path: filename,
            meta,
            body,
          });
        }
        if (!cancelled) setAllEntries(loaded);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  const saveEntry = useCallback(
    async (markdown: string, replyTo?: string, tags?: string[]) => {
      if (!book || chapter == null) return;
      const now = new Date();
      const meta = {
        date: now.toISOString().slice(0, 19),
        book,
        chapter,
        tags: tags && tags.length > 0 ? tags : undefined,
      };

      // Clean markdown (strip <br> tags from Milkdown)
      const cleanedMarkdown = cleanMarkdown(markdown);

      // Generate chapter wikilink
      const chapterWikilink = formatChapterWikilink(book, chapter);

      // Build body: wikilink, reply link (if applicable), then content
      let body = `${chapterWikilink}\n\n`;
      if (replyTo) {
        body += `> In reply to [[${replyTo.replace(/\.md$/, '')}]]\n\n`;
      }
      body += cleanedMarkdown;

      const filename = makeTimestampFilename();
      const content = serializeFrontmatter(meta, body);
      await writeEntryFile(filename, content);

      // Reload entries for this chapter
      const loaded = await loadEntriesForChapter(book, chapter);
      setEntries(loaded);
    },
    [book, chapter]
  );

  return {
    entries,
    allEntries,
    isLoading,
    error,
    saveEntry,
    viewMode,
    setViewMode,
  };
}
