import type { Reading, CalendarDayEntry } from '../types';
import { MCHEYNE_RAW } from './mcheyneCalendarRaw';

/** Metadata for the 4 M'Cheyne reading columns. */
export const MCHEYNE_LIST_META = [
  { id: 1, name: 'Family (1)', color: 'bg-amber-600' },
  { id: 2, name: 'Family (2)', color: 'bg-teal-500' },
  { id: 3, name: 'Secret (1)', color: 'bg-indigo-500' },
  { id: 4, name: 'Secret (2)', color: 'bg-red-500' },
] as const;

/** Normalize raw book names to the names used in BOOK_NUMBERS (bibleApi.ts). */
const BOOK_NAME_MAP: Record<string, string> = {
  '1Samuel': '1 Samuel',
  '2Samuel': '2 Samuel',
  '1Kings': '1 Kings',
  '2Kings': '2 Kings',
  '1Chronicles': '1 Chronicles',
  '2Chronicles': '2 Chronicles',
  '1Corinthians': '1 Corinthians',
  '2Corinthians': '2 Corinthians',
  '1Timothy': '1 Timothy',
  '2Timothy': '2 Timothy',
  '1Peter': '1 Peter',
  '2Peter': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  '1 Thes': '1 Thessalonians',
  '2 Thes': '2 Thessalonians',
  'SongOfSongs': 'Song of Solomon',
  'Psalm': 'Psalms',
};

function normalizeBookName(raw: string): string {
  return BOOK_NAME_MAP[raw] ?? raw;
}

/**
 * Parse a raw reading string into a Reading object.
 *
 * Formats handled:
 *   "Genesis 1"          → { book: "Genesis",  chapter: 1 }
 *   "Genesis 9-10"       → { book: "Genesis",  chapter: 9, endChapter: 10 }
 *   "Luke 1:1-38"        → { book: "Luke",     chapter: 1, startVerse: 1, endVerse: 38 }
 *   "Psalm 119:1-24"     → { book: "Psalms",   chapter: 119, startVerse: 1, endVerse: 24 }
 */
function parseReading(raw: string, listIndex: number): Reading {
  const meta = MCHEYNE_LIST_META[listIndex];

  // Match: BookName Chapter[:StartVerse-EndVerse | -EndChapter]?
  const m = raw.match(/^(.+?)\s+(\d+)(?::(\d+)-(\d+)|-(\d+))?$/);
  if (!m) {
    throw new Error(`Cannot parse M'Cheyne reading: "${raw}"`);
  }

  const book = normalizeBookName(m[1]);
  const chapter = Number(m[2]);
  const reading: Reading = {
    listId: meta.id,
    listName: meta.name,
    listColor: meta.color,
    book,
    chapter,
  };

  if (m[3] != null && m[4] != null) {
    // Verse range: "Luke 1:1-38"
    reading.startVerse = Number(m[3]);
    reading.endVerse = Number(m[4]);
  } else if (m[5] != null) {
    // Chapter range: "Genesis 9-10"
    reading.endChapter = Number(m[5]);
  }

  return reading;
}

/** Pre-parsed 365-day M'Cheyne calendar. */
export const MCHEYNE_CALENDAR: CalendarDayEntry[] = MCHEYNE_RAW.map(
  (dayStrings) => ({
    readings: dayStrings.map((s, i) => parseReading(s, i)),
  })
);
