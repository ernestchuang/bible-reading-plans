import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalViewMode } from '../types/journal';
import {
  listEntryFiles,
  readEntryFile,
  writeEntryFile,
  listAllEntries,
} from '../utils/journalFs';
import { parseFrontmatter, serializeFrontmatter } from '../utils/frontmatter';

function makeTimestampFilename(): string {
  return (
    new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19) + '.md'
  );
}

async function loadEntriesForChapter(
  book: string,
  chapter: number
): Promise<JournalEntry[]> {
  const filenames = await listEntryFiles(book, chapter);
  const entries: JournalEntry[] = [];
  for (const filename of filenames) {
    const raw = await readEntryFile(book, chapter, filename);
    const { meta, body } = parseFrontmatter(raw);
    entries.push({
      filename,
      path: `${book}/${chapter}/${filename}`,
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
        for (const { book: b, chapter: c, filename } of all) {
          const raw = await readEntryFile(b, c, filename);
          const { meta, body } = parseFrontmatter(raw);
          loaded.push({
            filename,
            path: `${b}/${c}/${filename}`,
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
    async (markdown: string, linkedTo?: string) => {
      if (!book || chapter == null) return;
      const now = new Date();
      const meta = {
        date: now.toISOString().slice(0, 19),
        book,
        chapter,
        linkedTo,
      };
      const filename = makeTimestampFilename();
      const content = serializeFrontmatter(meta, markdown);
      await writeEntryFile(book, chapter, filename, content);

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
