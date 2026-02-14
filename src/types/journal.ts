export interface JournalEntryMeta {
  date: string;
  book: string;
  chapter: number;
  linkedTo?: string;
}

export interface JournalEntry {
  filename: string;
  path: string;
  meta: JournalEntryMeta;
  body: string;
}

export type JournalViewMode = 'chapter' | 'date';

export type JournalBrowseMode = 'date' | 'book';
