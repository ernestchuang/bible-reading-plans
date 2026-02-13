export interface BibleBook {
  name: string;
  chapters: number;
}

export interface ReadingList {
  id: number;
  name: string;
  color: string; // tailwind color class like "bg-blue-500"
  books: BibleBook[];
  totalChapters: number;
}

export interface Reading {
  listId: number;
  listName: string;
  listColor: string;
  book: string;
  chapter: number;
  endChapter?: number;   // for multi-chapter ranges like "Genesis 9-10"
  startVerse?: number;   // for sub-chapter ranges like "Luke 1:1-38"
  endVerse?: number;     // for sub-chapter ranges like "Luke 1:1-38"
}

/** Format a Reading as human-readable text, e.g. "Genesis 9-10" or "Luke 1:1-38" */
export function formatReading(r: Reading): string {
  if (r.startVerse != null && r.endVerse != null) {
    return `${r.book} ${r.chapter}:${r.startVerse}-${r.endVerse}`;
  }
  if (r.endChapter != null && r.endChapter !== r.chapter) {
    return `${r.book} ${r.chapter}-${r.endChapter}`;
  }
  return `${r.book} ${r.chapter}`;
}

export interface DayPlan {
  day: number;
  date: Date;
  readings: Reading[];
}

export interface CalendarDayEntry {
  readings: Reading[];
}

export interface CyclingReadingPlan {
  id: string;
  name: string;
  description: string;
  kind: 'cycling';
  lists: ReadingList[];
}

export interface CalendarReadingPlan {
  id: string;
  name: string;
  description: string;
  kind: 'calendar';
  listNames: { id: number; name: string; color: string }[];
  calendar: CalendarDayEntry[];
}

export type ReadingPlan = CyclingReadingPlan | CalendarReadingPlan;

export function isCalendarPlan(plan: ReadingPlan): plan is CalendarReadingPlan {
  return plan.kind === 'calendar';
}

export function isCyclingPlan(plan: ReadingPlan): plan is CyclingReadingPlan {
  return plan.kind === 'cycling';
}

export function getListCount(plan: ReadingPlan): number {
  return isCalendarPlan(plan) ? plan.listNames.length : plan.lists.length;
}

export interface Verse {
  pk: number;
  verse: number;
  text: string;
}

export type Translation = 'NASB95' | 'LSB' | 'ESV' | 'KJV';

export type DisplayMode = 'verse' | 'paragraph' | 'reader';

export type Theme = 'light' | 'paper' | 'dark' | 'warm-dark' | 'system';

export type FontFamily = 'system' | 'inter' | 'lexend' | 'linguistics-pro' | 'literata' | 'eb-garamond';

export type FontSize = 14 | 16 | 18 | 20 | 22;
