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
