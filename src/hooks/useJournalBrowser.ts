import { useState, useEffect } from 'react';
import type { JournalEntry } from '../types/journal';
import { listAllEntries, readEntryFile } from '../utils/journalFs';
import { parseFrontmatter } from '../utils/frontmatter';
import { BIBLE_TESTAMENTS } from '../data/bibleBooks';

export interface BookGroup {
  book: string;
  chapters: { chapter: number; entries: JournalEntry[] }[];
}

/** Flat canonical order of all Bible book names. */
const BOOK_ORDER = BIBLE_TESTAMENTS.flatMap((t) =>
  t.sections.flatMap((s) => s.books.map((b) => b.name))
);

function buildBookGroups(entries: JournalEntry[]): BookGroup[] {
  // Group entries by book → chapter
  const map = new Map<string, Map<number, JournalEntry[]>>();
  for (const entry of entries) {
    const { book, chapter } = entry.meta;
    if (!map.has(book)) map.set(book, new Map());
    const chapterMap = map.get(book)!;
    if (!chapterMap.has(chapter)) chapterMap.set(chapter, []);
    chapterMap.get(chapter)!.push(entry);
  }

  // Build array in canonical Bible order
  const groups: BookGroup[] = [];
  for (const bookName of BOOK_ORDER) {
    const chapterMap = map.get(bookName);
    if (!chapterMap) continue;
    const chapters = Array.from(chapterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([chapter, chapterEntries]) => ({ chapter, entries: chapterEntries }));
    groups.push({ book: bookName, chapters });
  }
  return groups;
}

export function useJournalBrowser() {
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [bookGroups, setBookGroups] = useState<BookGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

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
        if (!cancelled) {
          setAllEntries(loaded); // already sorted newest-first from listAllEntries
          setBookGroups(buildBookGroups(loaded));
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { allEntries, bookGroups, isLoading, error };
}
