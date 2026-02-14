import {
  readTextFile,
  writeTextFile,
  mkdir,
  readDir,
  exists,
  remove,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';

const JOURNAL_ROOT = 'journal';
const JOURNAL_DIR_KEY = 'journal-dir-v1';

/** Get the custom journal directory, or null for the default AppData location. */
export function getJournalDir(): string | null {
  return localStorage.getItem(JOURNAL_DIR_KEY);
}

/** Set a custom journal directory path. */
export function setJournalDir(dir: string): void {
  localStorage.setItem(JOURNAL_DIR_KEY, dir);
}

/** Clear the custom journal directory (revert to default AppData). */
export function clearJournalDir(): void {
  localStorage.removeItem(JOURNAL_DIR_KEY);
}

/**
 * Build FS options for a relative path under the journal root.
 * - If no custom dir is set, uses AppData base directory.
 * - If a custom dir is set, builds an absolute path (no baseDir).
 */
function resolvePath(relativePath: string): { path: string; options: { baseDir?: BaseDirectory } } {
  const customDir = getJournalDir();
  if (customDir) {
    return {
      path: `${customDir}/${relativePath}`,
      options: {},
    };
  }
  return {
    path: `${JOURNAL_ROOT}/${relativePath}`,
    options: { baseDir: BaseDirectory.AppData },
  };
}

/** Resolve just the journal root (no relative sub-path). */
function resolveRoot(): { path: string; options: { baseDir?: BaseDirectory } } {
  const customDir = getJournalDir();
  if (customDir) {
    return { path: customDir, options: {} };
  }
  return { path: JOURNAL_ROOT, options: { baseDir: BaseDirectory.AppData } };
}

export async function ensureJournalDir(
  book: string,
  chapter: number
): Promise<string> {
  const rel = `${book}/${chapter}`;
  const { path, options } = resolvePath(rel);
  const dirExists = await exists(path, options);
  if (!dirExists) {
    await mkdir(path, { ...options, recursive: true });
  }
  return path;
}

export async function listEntryFiles(
  book: string,
  chapter: number
): Promise<string[]> {
  const rel = `${book}/${chapter}`;
  const { path, options } = resolvePath(rel);
  const dirExists = await exists(path, options);
  if (!dirExists) return [];
  const entries = await readDir(path, options);
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
  const rel = `${book}/${chapter}/${filename}`;
  const { path, options } = resolvePath(rel);
  return readTextFile(path, options);
}

export async function writeEntryFile(
  book: string,
  chapter: number,
  filename: string,
  content: string
): Promise<void> {
  await ensureJournalDir(book, chapter);
  const rel = `${book}/${chapter}/${filename}`;
  const { path, options } = resolvePath(rel);
  await writeTextFile(path, content, options);
}

export async function listAllEntries(): Promise<
  { book: string; chapter: number; filename: string }[]
> {
  const { path: rootPath, options } = resolveRoot();
  const rootExists = await exists(rootPath, options);
  if (!rootExists) return [];

  const results: { book: string; chapter: number; filename: string }[] = [];
  const bookDirs = await readDir(rootPath, options);

  for (const bookDir of bookDirs) {
    if (!bookDir.isDirectory || !bookDir.name) continue;
    const book = bookDir.name;
    const { path: bookPath, options: bookOpts } = resolvePath(book);
    const chapterDirs = await readDir(bookPath, bookOpts);

    for (const chapterDir of chapterDirs) {
      if (!chapterDir.isDirectory || !chapterDir.name) continue;
      const chapter = parseInt(chapterDir.name, 10);
      if (isNaN(chapter)) continue;

      const { path: chPath, options: chOpts } = resolvePath(`${book}/${chapter}`);
      const files = await readDir(chPath, chOpts);

      for (const file of files) {
        if (file.isFile && file.name?.endsWith('.md')) {
          results.push({ book, chapter, filename: file.name });
        }
      }
    }
  }

  return results.sort((a, b) => b.filename.localeCompare(a.filename));
}

/**
 * Migrate all journal entries from the default AppData location to a target directory.
 * Returns the number of files moved.
 */
export async function migrateEntries(targetDir: string): Promise<number> {
  const defaultRoot = JOURNAL_ROOT;
  const defaultOptions = { baseDir: BaseDirectory.AppData };

  const rootExists = await exists(defaultRoot, defaultOptions);
  if (!rootExists) return 0;

  let count = 0;
  const bookDirs = await readDir(defaultRoot, defaultOptions);

  for (const bookDir of bookDirs) {
    if (!bookDir.isDirectory || !bookDir.name) continue;
    const book = bookDir.name;
    const chapterDirs = await readDir(`${defaultRoot}/${book}`, defaultOptions);

    for (const chapterDir of chapterDirs) {
      if (!chapterDir.isDirectory || !chapterDir.name) continue;
      const chapter = chapterDir.name;
      const files = await readDir(`${defaultRoot}/${book}/${chapter}`, defaultOptions);

      for (const file of files) {
        if (!file.isFile || !file.name?.endsWith('.md')) continue;

        // Read from default location
        const content = await readTextFile(
          `${defaultRoot}/${book}/${chapter}/${file.name}`,
          defaultOptions
        );

        // Write to target location
        const targetPath = `${targetDir}/${book}/${chapter}`;
        const targetExists = await exists(targetPath);
        if (!targetExists) {
          await mkdir(targetPath, { recursive: true });
        }
        await writeTextFile(`${targetPath}/${file.name}`, content);

        // Remove from default location
        await remove(`${defaultRoot}/${book}/${chapter}/${file.name}`, defaultOptions);
        count++;
      }
    }
  }

  return count;
}
