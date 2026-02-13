import type { Translation, Verse } from '../types';

const BOOK_NUMBERS: Record<string, number> = {
  Genesis: 1,
  Exodus: 2,
  Leviticus: 3,
  Numbers: 4,
  Deuteronomy: 5,
  Joshua: 6,
  Judges: 7,
  Ruth: 8,
  '1 Samuel': 9,
  '2 Samuel': 10,
  '1 Kings': 11,
  '2 Kings': 12,
  '1 Chronicles': 13,
  '2 Chronicles': 14,
  Ezra: 15,
  Nehemiah: 16,
  Esther: 17,
  Job: 18,
  Psalm: 19,
  Psalms: 19, // alias — plan data uses "Psalms"
  Proverbs: 20,
  Ecclesiastes: 21,
  'Song of Solomon': 22,
  Isaiah: 23,
  Jeremiah: 24,
  Lamentations: 25,
  Ezekiel: 26,
  Daniel: 27,
  Hosea: 28,
  Joel: 29,
  Amos: 30,
  Obadiah: 31,
  Jonah: 32,
  Micah: 33,
  Nahum: 34,
  Habakkuk: 35,
  Zephaniah: 36,
  Haggai: 37,
  Zechariah: 38,
  Malachi: 39,
  Matthew: 40,
  Mark: 41,
  Luke: 42,
  John: 43,
  Acts: 44,
  Romans: 45,
  '1 Corinthians': 46,
  '2 Corinthians': 47,
  Galatians: 48,
  Ephesians: 49,
  Philippians: 50,
  Colossians: 51,
  '1 Thessalonians': 52,
  '2 Thessalonians': 53,
  '1 Timothy': 54,
  '2 Timothy': 55,
  Titus: 56,
  Philemon: 57,
  Hebrews: 58,
  James: 59,
  '1 Peter': 60,
  '2 Peter': 61,
  '1 John': 62,
  '2 John': 63,
  '3 John': 64,
  Jude: 65,
  Revelation: 66,
};

const API_TRANSLATIONS: Record<Translation, string> = {
  NASB95: 'NASB',
  LSB: 'LSB',
  ESV: 'ESV',
  KJV: 'KJV',
};

export function getBookNumber(book: string): number {
  const num = BOOK_NUMBERS[book];
  if (num == null) throw new Error(`Unknown book: ${book}`);
  return num;
}

export function getApiTranslation(translation: Translation): string {
  return API_TRANSLATIONS[translation];
}

export async function fetchChapter(
  book: string,
  chapter: number,
  translation: Translation,
): Promise<Verse[]> {
  const bookNumber = getBookNumber(book);
  const apiTranslation = getApiTranslation(translation);
  const url = `https://bolls.life/get-text/${apiTranslation}/${bookNumber}/${chapter}/`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${book} ${chapter} (${translation}): ${res.status}`);
  }

  const data: Verse[] = await res.json();
  return data;
}

export function getBollsUrl(
  book: string,
  chapter: number,
  translation: Translation,
): string {
  const bookNumber = getBookNumber(book);
  const apiTranslation = getApiTranslation(translation);
  return `https://bolls.life/${apiTranslation}/${bookNumber}/${chapter}/`;
}
