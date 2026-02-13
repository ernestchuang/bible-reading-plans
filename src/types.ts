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
}

export interface DayPlan {
  day: number;
  date: Date;
  readings: Reading[];
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  lists: ReadingList[];
}

export type Translation = 'NASB95' | 'LSB' | 'ESV' | 'KJV';
