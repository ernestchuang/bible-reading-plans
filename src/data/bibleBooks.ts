import type { BibleBook } from '../types';

export interface BibleSection {
  name: string;
  books: BibleBook[];
}

export interface BibleTestament {
  name: string;
  sections: BibleSection[];
}

export const BIBLE_TESTAMENTS: BibleTestament[] = [
  {
    name: 'Old Testament',
    sections: [
      {
        name: 'Pentateuch',
        books: [
          { name: 'Genesis', chapters: 50 },
          { name: 'Exodus', chapters: 40 },
          { name: 'Leviticus', chapters: 27 },
          { name: 'Numbers', chapters: 36 },
          { name: 'Deuteronomy', chapters: 34 },
        ],
      },
      {
        name: 'History',
        books: [
          { name: 'Joshua', chapters: 24 },
          { name: 'Judges', chapters: 21 },
          { name: 'Ruth', chapters: 4 },
          { name: '1 Samuel', chapters: 31 },
          { name: '2 Samuel', chapters: 24 },
          { name: '1 Kings', chapters: 22 },
          { name: '2 Kings', chapters: 25 },
          { name: '1 Chronicles', chapters: 29 },
          { name: '2 Chronicles', chapters: 36 },
          { name: 'Ezra', chapters: 10 },
          { name: 'Nehemiah', chapters: 13 },
          { name: 'Esther', chapters: 10 },
        ],
      },
      {
        name: 'Wisdom & Poetry',
        books: [
          { name: 'Job', chapters: 42 },
          { name: 'Psalms', chapters: 150 },
          { name: 'Proverbs', chapters: 31 },
          { name: 'Ecclesiastes', chapters: 12 },
          { name: 'Song of Solomon', chapters: 8 },
        ],
      },
      {
        name: 'Major Prophets',
        books: [
          { name: 'Isaiah', chapters: 66 },
          { name: 'Jeremiah', chapters: 52 },
          { name: 'Lamentations', chapters: 5 },
          { name: 'Ezekiel', chapters: 48 },
          { name: 'Daniel', chapters: 12 },
        ],
      },
      {
        name: 'Minor Prophets',
        books: [
          { name: 'Hosea', chapters: 14 },
          { name: 'Joel', chapters: 3 },
          { name: 'Amos', chapters: 9 },
          { name: 'Obadiah', chapters: 1 },
          { name: 'Jonah', chapters: 4 },
          { name: 'Micah', chapters: 7 },
          { name: 'Nahum', chapters: 3 },
          { name: 'Habakkuk', chapters: 3 },
          { name: 'Zephaniah', chapters: 3 },
          { name: 'Haggai', chapters: 2 },
          { name: 'Zechariah', chapters: 14 },
          { name: 'Malachi', chapters: 4 },
        ],
      },
    ],
  },
  {
    name: 'New Testament',
    sections: [
      {
        name: 'Gospels & Acts',
        books: [
          { name: 'Matthew', chapters: 28 },
          { name: 'Mark', chapters: 16 },
          { name: 'Luke', chapters: 24 },
          { name: 'John', chapters: 21 },
          { name: 'Acts', chapters: 28 },
        ],
      },
      {
        name: 'Pauline Epistles',
        books: [
          { name: 'Romans', chapters: 16 },
          { name: '1 Corinthians', chapters: 16 },
          { name: '2 Corinthians', chapters: 13 },
          { name: 'Galatians', chapters: 6 },
          { name: 'Ephesians', chapters: 6 },
          { name: 'Philippians', chapters: 4 },
          { name: 'Colossians', chapters: 4 },
          { name: '1 Thessalonians', chapters: 5 },
          { name: '2 Thessalonians', chapters: 3 },
          { name: '1 Timothy', chapters: 6 },
          { name: '2 Timothy', chapters: 4 },
          { name: 'Titus', chapters: 3 },
          { name: 'Philemon', chapters: 1 },
        ],
      },
      {
        name: 'General Epistles',
        books: [
          { name: 'Hebrews', chapters: 13 },
          { name: 'James', chapters: 5 },
          { name: '1 Peter', chapters: 5 },
          { name: '2 Peter', chapters: 3 },
          { name: '1 John', chapters: 5 },
          { name: '2 John', chapters: 1 },
          { name: '3 John', chapters: 1 },
          { name: 'Jude', chapters: 1 },
        ],
      },
      {
        name: 'Prophecy',
        books: [
          { name: 'Revelation', chapters: 22 },
        ],
      },
    ],
  },
];

/** Flat list of all 66 Bible books with chapter counts. */
export const ALL_BIBLE_BOOKS: BibleBook[] = BIBLE_TESTAMENTS.flatMap((t) =>
  t.sections.flatMap((s) => s.books)
);

/** Look up chapter count for a given book name. */
export function getChapterCount(bookName: string): number | undefined {
  return ALL_BIBLE_BOOKS.find((b) => b.name === bookName)?.chapters;
}

/** Get the next chapter reference (book + chapter), crossing book boundaries. Returns null at Revelation end. */
export function getNextChapter(book: string, chapter: number): { book: string; chapter: number } | null {
  const idx = ALL_BIBLE_BOOKS.findIndex((b) => b.name === book);
  if (idx === -1) return null;
  if (chapter < ALL_BIBLE_BOOKS[idx].chapters) {
    return { book, chapter: chapter + 1 };
  }
  if (idx < ALL_BIBLE_BOOKS.length - 1) {
    return { book: ALL_BIBLE_BOOKS[idx + 1].name, chapter: 1 };
  }
  return null;
}

/** Get the previous chapter reference (book + chapter), crossing book boundaries. Returns null at Genesis 1. */
export function getPrevChapter(book: string, chapter: number): { book: string; chapter: number } | null {
  if (chapter > 1) {
    return { book, chapter: chapter - 1 };
  }
  const idx = ALL_BIBLE_BOOKS.findIndex((b) => b.name === book);
  if (idx <= 0) return null;
  const prevBook = ALL_BIBLE_BOOKS[idx - 1];
  return { book: prevBook.name, chapter: prevBook.chapters };
}
