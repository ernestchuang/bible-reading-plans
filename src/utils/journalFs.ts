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
 * - Always uses 'journal/' subdirectory to separate from Bible vault.
 */
function resolvePath(relativePath: string): { path: string; options: { baseDir?: BaseDirectory } } {
  const customDir = getJournalDir();
  if (customDir) {
    return {
      path: `${customDir}/${JOURNAL_ROOT}/${relativePath}`,
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
    return { path: `${customDir}/${JOURNAL_ROOT}`, options: {} };
  }
  return { path: JOURNAL_ROOT, options: { baseDir: BaseDirectory.AppData } };
}

/** Ensure the journal root directory exists. */
export async function ensureJournalDir(): Promise<string> {
  const { path, options } = resolveRoot();
  const dirExists = await exists(path, options);
  if (!dirExists) {
    await mkdir(path, { ...options, recursive: true });
  }
  return path;
}

/**
 * List all journal entry filenames for a specific book/chapter.
 * Reads all entries and filters by frontmatter.
 */
export async function listEntryFiles(
  book: string,
  chapter: number
): Promise<string[]> {
  const { path: rootPath, options } = resolveRoot();
  const rootExists = await exists(rootPath, options);
  if (!rootExists) return [];

  const entries = await readDir(rootPath, options);
  const matchingFiles: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile || !entry.name?.endsWith('.md')) continue;
    // Skip chapter note files (they have book prefix format)
    if (entry.name.match(/^\d{2}-/)) continue;

    // Read frontmatter to check book/chapter
    try {
      const content = await readTextFile(`${rootPath}/${entry.name}`, options);
      const metaMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (metaMatch) {
        const yaml = metaMatch[1];
        const bookMatch = yaml.match(/^book:\s*(.+)$/m);
        const chapterMatch = yaml.match(/^chapter:\s*(\d+)$/m);
        if (bookMatch && chapterMatch) {
          const entryBook = bookMatch[1].trim();
          const entryChapter = parseInt(chapterMatch[1], 10);
          if (entryBook === book && entryChapter === chapter) {
            matchingFiles.push(entry.name);
          }
        }
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return matchingFiles.sort().reverse(); // newest first
}

export async function readEntryFile(
  filename: string
): Promise<string> {
  const { path, options } = resolvePath(filename);
  return readTextFile(path, options);
}

export async function writeEntryFile(
  filename: string,
  content: string
): Promise<void> {
  await ensureJournalDir();
  const { path, options } = resolvePath(filename);
  await writeTextFile(path, content, options);
}

/**
 * List all journal entries in the flat directory structure.
 * Parses frontmatter to extract book and chapter.
 */
export async function listAllEntries(): Promise<
  { book: string; chapter: number; filename: string }[]
> {
  const { path: rootPath, options } = resolveRoot();
  const rootExists = await exists(rootPath, options);
  if (!rootExists) return [];

  const results: { book: string; chapter: number; filename: string }[] = [];
  const entries = await readDir(rootPath, options);

  for (const entry of entries) {
    if (!entry.isFile || !entry.name?.endsWith('.md')) continue;
    // Skip chapter note files (they have book prefix format)
    if (entry.name.match(/^\d{2}-/)) continue;

    // Read frontmatter to extract book/chapter
    try {
      const content = await readTextFile(`${rootPath}/${entry.name}`, options);
      const metaMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (metaMatch) {
        const yaml = metaMatch[1];
        const bookMatch = yaml.match(/^book:\s*(.+)$/m);
        const chapterMatch = yaml.match(/^chapter:\s*(\d+)$/m);
        if (bookMatch && chapterMatch) {
          const book = bookMatch[1].trim();
          const chapter = parseInt(chapterMatch[1], 10);
          results.push({ book, chapter, filename: entry.name });
        }
      }
    } catch {
      // Skip files that can't be read or parsed
      continue;
    }
  }

  return results.sort((a, b) => b.filename.localeCompare(a.filename));
}

/**
 * Migrate all journal entries from the default AppData location to a target directory.
 * Handles both old nested structure and flat structure.
 * Returns the number of files moved.
 */
export async function migrateEntries(targetDir: string): Promise<number> {
  const defaultRoot = JOURNAL_ROOT;
  const defaultOptions = { baseDir: BaseDirectory.AppData };

  const rootExists = await exists(defaultRoot, defaultOptions);
  if (!rootExists) return 0;

  let count = 0;
  const entries = await readDir(defaultRoot, defaultOptions);

  for (const entry of entries) {
    // Handle nested directory structure (old format)
    if (entry.isDirectory && entry.name) {
      const bookDirName = entry.name;
      const chapterDirs = await readDir(`${defaultRoot}/${bookDirName}`, defaultOptions);

      for (const chapterDir of chapterDirs) {
        if (!chapterDir.isDirectory || !chapterDir.name) continue;
        const files = await readDir(`${defaultRoot}/${bookDirName}/${chapterDir.name}`, defaultOptions);

        for (const file of files) {
          if (!file.isFile || !file.name?.endsWith('.md')) continue;

          // Read from nested location
          const content = await readTextFile(
            `${defaultRoot}/${bookDirName}/${chapterDir.name}/${file.name}`,
            defaultOptions
          );

          // Write to target flat structure
          const targetPath = `${targetDir}/${JOURNAL_ROOT}`;
          const targetExists = await exists(targetPath);
          if (!targetExists) {
            await mkdir(targetPath, { recursive: true });
          }
          await writeTextFile(`${targetPath}/${file.name}`, content);

          // Remove from default location
          await remove(`${defaultRoot}/${bookDirName}/${chapterDir.name}/${file.name}`, defaultOptions);
          count++;
        }
      }
    }
    // Handle flat files (already in new format)
    else if (entry.isFile && entry.name?.endsWith('.md')) {
      // Skip chapter note files
      if (entry.name.match(/^\d{2}-/)) continue;

      // Read from flat location
      const content = await readTextFile(`${defaultRoot}/${entry.name}`, defaultOptions);

      // Write to target flat structure
      const targetPath = `${targetDir}/${JOURNAL_ROOT}`;
      const targetExists = await exists(targetPath);
      if (!targetExists) {
        await mkdir(targetPath, { recursive: true });
      }
      await writeTextFile(`${targetPath}/${entry.name}`, content);

      // Remove from default location
      await remove(`${defaultRoot}/${entry.name}`, defaultOptions);
      count++;
    }
  }

  return count;
}
