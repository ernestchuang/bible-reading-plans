/**
 * Bible book ordering utilities for file system organization.
 * Books are numbered 01-66 in biblical order for proper sorting.
 */

/** All 66 Bible books in biblical order */
export const BIBLE_BOOKS_ORDERED = [
  // Old Testament (01-39)
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  // New Testament (40-66)
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
];

/**
 * Get the biblical order number (1-66) for a book name.
 * Returns undefined if book not found.
 */
export function getBookNumber(bookName: string): number | undefined {
  const index = BIBLE_BOOKS_ORDERED.indexOf(bookName);
  return index === -1 ? undefined : index + 1;
}

/**
 * Format a book name with its biblical order number prefix.
 * Example: "Genesis" → "01-Genesis", "Revelation" → "66-Revelation"
 */
export function formatBookPrefix(bookName: string): string {
  const num = getBookNumber(bookName);
  if (num === undefined) {
    throw new Error(`Unknown book: ${bookName}`);
  }
  return `${num.toString().padStart(2, '0')}-${bookName}`;
}

/**
 * Format a chapter number with zero-padding.
 * Example: 1 → "001", 28 → "028", 150 → "150"
 */
export function formatChapter(chapter: number): string {
  return chapter.toString().padStart(3, '0');
}

/**
 * Generate a wikilink for a Bible chapter.
 * Example: ("Genesis", 1) → "[[01-Genesis/001]]"
 */
export function formatChapterWikilink(bookName: string, chapter: number): string {
  const bookPrefix = formatBookPrefix(bookName);
  const chapterPadded = formatChapter(chapter);
  return `[[${bookPrefix}/${chapterPadded}]]`;
}
