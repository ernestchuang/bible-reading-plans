import type { ReadingList, BibleBook } from '../types';

function makeList(
  id: number,
  name: string,
  color: string,
  books: BibleBook[]
): ReadingList {
  const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);
  return { id, name, color, books, totalChapters };
}

export const HORNER_LISTS: ReadingList[] = [
  // List 1: Gospels
  makeList(1, 'Gospels', 'bg-red-500', [
    { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 },
  ]),

  // List 2: Pentateuch
  makeList(2, 'Pentateuch', 'bg-amber-600', [
    { name: 'Genesis', chapters: 50 },
    { name: 'Exodus', chapters: 40 },
    { name: 'Leviticus', chapters: 27 },
    { name: 'Numbers', chapters: 36 },
    { name: 'Deuteronomy', chapters: 34 },
  ]),

  // List 3: Epistles I
  makeList(3, 'Epistles I', 'bg-emerald-500', [
    { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 },
    { name: '2 Corinthians', chapters: 13 },
    { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 },
    { name: 'Colossians', chapters: 4 },
    { name: 'Hebrews', chapters: 13 },
  ]),

  // List 4: Epistles II
  makeList(4, 'Epistles II', 'bg-purple-500', [
    { name: '1 Thessalonians', chapters: 5 },
    { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 },
    { name: 'Titus', chapters: 3 },
    { name: 'Philemon', chapters: 1 },
    { name: 'James', chapters: 5 },
    { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 },
    { name: '1 John', chapters: 5 },
    { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 },
    { name: 'Jude', chapters: 1 },
    { name: 'Revelation', chapters: 22 },
  ]),

  // List 5: Wisdom
  makeList(5, 'Wisdom', 'bg-yellow-500', [
    { name: 'Job', chapters: 42 },
    { name: 'Ecclesiastes', chapters: 12 },
    { name: 'Song of Solomon', chapters: 8 },
  ]),

  // List 6: Psalms
  makeList(6, 'Psalms', 'bg-orange-500', [
    { name: 'Psalms', chapters: 150 },
  ]),

  // List 7: Proverbs
  makeList(7, 'Proverbs', 'bg-rose-500', [
    { name: 'Proverbs', chapters: 31 },
  ]),

  // List 8: History
  makeList(8, 'History', 'bg-teal-500', [
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
  ]),

  // List 9: Prophets
  makeList(9, 'Prophets', 'bg-indigo-500', [
    { name: 'Isaiah', chapters: 66 },
    { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 },
    { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 },
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
  ]),

  // List 10: Acts
  makeList(10, 'Acts', 'bg-sky-500', [
    { name: 'Acts', chapters: 28 },
  ]),
];
