import {
  readTextFile,
  writeTextFile,
  mkdir,
  readDir,
  exists,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';

const JOURNAL_ROOT = 'journal';

export async function ensureJournalDir(
  book: string,
  chapter: number
): Promise<string> {
  const dirPath = `${JOURNAL_ROOT}/${book}/${chapter}`;
  const dirExists = await exists(dirPath, {
    baseDir: BaseDirectory.AppData,
  });
  if (!dirExists) {
    await mkdir(dirPath, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
  return dirPath;
}

export async function listEntryFiles(
  book: string,
  chapter: number
): Promise<string[]> {
  const dirPath = `${JOURNAL_ROOT}/${book}/${chapter}`;
  const dirExists = await exists(dirPath, {
    baseDir: BaseDirectory.AppData,
  });
  if (!dirExists) return [];
  const entries = await readDir(dirPath, {
    baseDir: BaseDirectory.AppData,
  });
  return entries
    .filter((e) => e.isFile && e.name?.endsWith('.md'))
    .map((e) => e.name!)
    .sort()
    .reverse(); // newest first
}

export async function readEntryFile(
  book: string,
  chapter: number,
  filename: string
): Promise<string> {
  const filePath = `${JOURNAL_ROOT}/${book}/${chapter}/${filename}`;
  return readTextFile(filePath, { baseDir: BaseDirectory.AppData });
}

export async function writeEntryFile(
  book: string,
  chapter: number,
  filename: string,
  content: string
): Promise<void> {
  await ensureJournalDir(book, chapter);
  const filePath = `${JOURNAL_ROOT}/${book}/${chapter}/${filename}`;
  await writeTextFile(filePath, content, {
    baseDir: BaseDirectory.AppData,
  });
}

export async function listAllEntries(): Promise<
  { book: string; chapter: number; filename: string }[]
> {
  const rootExists = await exists(JOURNAL_ROOT, {
    baseDir: BaseDirectory.AppData,
  });
  if (!rootExists) return [];

  const results: { book: string; chapter: number; filename: string }[] = [];
  const bookDirs = await readDir(JOURNAL_ROOT, {
    baseDir: BaseDirectory.AppData,
  });

  for (const bookDir of bookDirs) {
    if (!bookDir.isDirectory || !bookDir.name) continue;
    const book = bookDir.name;
    const chapterDirs = await readDir(`${JOURNAL_ROOT}/${book}`, {
      baseDir: BaseDirectory.AppData,
    });

    for (const chapterDir of chapterDirs) {
      if (!chapterDir.isDirectory || !chapterDir.name) continue;
      const chapter = parseInt(chapterDir.name, 10);
      if (isNaN(chapter)) continue;

      const files = await readDir(
        `${JOURNAL_ROOT}/${book}/${chapter}`,
        { baseDir: BaseDirectory.AppData }
      );

      for (const file of files) {
        if (file.isFile && file.name?.endsWith('.md')) {
          results.push({ book, chapter, filename: file.name });
        }
      }
    }
  }

  return results.sort((a, b) => b.filename.localeCompare(a.filename));
}
