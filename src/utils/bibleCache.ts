import {
  readTextFile,
  writeTextFile,
  mkdir,
  remove,
  exists,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';
import type { Translation, Verse } from '../types';
import { fetchChapter, getBookNumber, getApiTranslation } from './bibleApi';
import { ALL_BIBLE_BOOKS } from '../data/bibleBooks';

const CACHE_ROOT = 'cache';

function getCachePath(
  apiTranslation: string,
  bookNumber: number,
  chapter: number,
): string {
  return `${CACHE_ROOT}/${apiTranslation}/${bookNumber}/${chapter}.json`;
}

async function ensureCacheDir(
  apiTranslation: string,
  bookNumber: number,
): Promise<void> {
  const dirPath = `${CACHE_ROOT}/${apiTranslation}/${bookNumber}`;
  const dirExists = await exists(dirPath, {
    baseDir: BaseDirectory.AppData,
  });
  if (!dirExists) {
    await mkdir(dirPath, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
}

async function readCachedChapter(
  apiTranslation: string,
  bookNumber: number,
  chapter: number,
): Promise<Verse[] | null> {
  try {
    const filePath = getCachePath(apiTranslation, bookNumber, chapter);
    const fileExists = await exists(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    if (!fileExists) return null;
    const raw = await readTextFile(filePath, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(raw) as Verse[];
  } catch {
    return null;
  }
}

async function writeCachedChapter(
  apiTranslation: string,
  bookNumber: number,
  chapter: number,
  verses: Verse[],
): Promise<void> {
  try {
    await ensureCacheDir(apiTranslation, bookNumber);
    const filePath = getCachePath(apiTranslation, bookNumber, chapter);
    await writeTextFile(filePath, JSON.stringify(verses), {
      baseDir: BaseDirectory.AppData,
    });
  } catch {
    // Cache write failure is non-fatal
  }
}

export async function fetchChapterCached(
  book: string,
  chapter: number,
  translation: Translation,
): Promise<Verse[]> {
  const bookNumber = getBookNumber(book);
  const apiTranslation = getApiTranslation(translation);

  // Try cache first
  const cached = await readCachedChapter(apiTranslation, bookNumber, chapter);
  if (cached !== null) {
    return cached;
  }

  // Cache miss — fetch from network
  const verses = await fetchChapter(book, chapter, translation);

  // Write to cache (fire-and-forget)
  writeCachedChapter(apiTranslation, bookNumber, chapter, verses);

  return verses;
}

export async function clearCache(): Promise<void> {
  const rootExists = await exists(CACHE_ROOT, {
    baseDir: BaseDirectory.AppData,
  });
  if (!rootExists) return;
  await remove(CACHE_ROOT, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });
}

/** Flat array of all 1,189 Bible chapters with book name, book number, and chapter. */
export function getAllChapters(): { book: string; bookNumber: number; chapter: number }[] {
  const chapters: { book: string; bookNumber: number; chapter: number }[] = [];
  for (const b of ALL_BIBLE_BOOKS) {
    const bookNumber = getBookNumber(b.name);
    for (let ch = 1; ch <= b.chapters; ch++) {
      chapters.push({ book: b.name, bookNumber, chapter: ch });
    }
  }
  return chapters;
}

export const TOTAL_CHAPTERS = 1189;

/** Count how many chapters are cached for a given translation. */
export async function countCachedChapters(translation: Translation): Promise<number> {
  const apiTranslation = getApiTranslation(translation);
  const chapters = getAllChapters();
  let count = 0;
  for (const { bookNumber, chapter } of chapters) {
    const filePath = getCachePath(apiTranslation, bookNumber, chapter);
    const fileExists = await exists(filePath, { baseDir: BaseDirectory.AppData });
    if (fileExists) count++;
  }
  return count;
}

/** Download the entire Bible for a translation, with concurrency control. */
export async function downloadEntireBible(
  translation: Translation,
  onProgress: (completed: number, total: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const chapters = getAllChapters();
  const total = chapters.length;
  let completed = 0;
  const CONCURRENCY = 5;

  // Process chapters in batches of CONCURRENCY
  for (let i = 0; i < total; i += CONCURRENCY) {
    if (signal?.aborted) return;
    const batch = chapters.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ book, chapter }) => {
        if (signal?.aborted) return;
        await fetchChapterCached(book, chapter, translation);
        completed++;
        onProgress(completed, total);
      }),
    );
  }

  // Record download metadata (per-translation)
  const existing = JSON.parse(localStorage.getItem('bible-download-v1') || '{}') as Record<string, number>;
  existing[translation] = Date.now();
  localStorage.setItem('bible-download-v1', JSON.stringify(existing));
}

const FRESHNESS_KEY = 'bible-freshness-v1';

/** Lightweight daily freshness check — compares cached Genesis 1 with API. */
export async function checkCacheFreshness(
  translation: Translation,
): Promise<'fresh' | 'stale'> {
  try {
    // Skip if checked recently (< 24 hours)
    const raw = localStorage.getItem(FRESHNESS_KEY);
    if (raw) {
      const { timestamp } = JSON.parse(raw) as { timestamp: number };
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return 'fresh';
    }

    // Fetch Genesis 1 directly (bypass cache)
    const freshVerses = await fetchChapter('Genesis', 1, translation);

    // Read cached version
    const apiTranslation = getApiTranslation(translation);
    const cached = await readCachedChapter(apiTranslation, 1, 1);
    if (cached === null) {
      // No cache yet — nothing to be stale about
      localStorage.setItem(FRESHNESS_KEY, JSON.stringify({ timestamp: Date.now() }));
      return 'fresh';
    }

    // Compare by serialized content
    const isSame = JSON.stringify(freshVerses) === JSON.stringify(cached);
    if (isSame) {
      localStorage.setItem(FRESHNESS_KEY, JSON.stringify({ timestamp: Date.now() }));
      return 'fresh';
    }
    return 'stale';
  } catch {
    // Network error — don't nag when offline
    return 'fresh';
  }
}
