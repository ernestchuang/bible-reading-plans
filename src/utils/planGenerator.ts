import { HORNER_LISTS } from '../data/hornerLists';
import type { Reading, DayPlan } from '../types';

// Given a 0-based position offset into a list's total chapters,
// determine which book and chapter it maps to
function getChapterAtPosition(
  listIndex: number,
  position: number
): { book: string; chapter: number } {
  const list = HORNER_LISTS[listIndex];
  const wrappedPos = position % list.totalChapters;
  let cumulative = 0;
  for (const book of list.books) {
    if (wrappedPos < cumulative + book.chapters) {
      return { book: book.name, chapter: wrappedPos - cumulative + 1 };
    }
    cumulative += book.chapters;
  }
  // fallback (shouldn't happen)
  const lastBook = list.books[list.books.length - 1];
  return { book: lastBook.name, chapter: lastBook.chapters };
}

// Get all 10 readings for a given day (0-indexed day number)
// listOffsets: array of 10 numbers, each being the starting offset for that list
export function getReadingsForDay(
  dayIndex: number,
  listOffsets: number[]
): Reading[] {
  return HORNER_LISTS.map((list, i) => {
    const position = (listOffsets[i] + dayIndex) % list.totalChapters;
    const { book, chapter } = getChapterAtPosition(i, position);
    return {
      listId: list.id,
      listName: list.name,
      listColor: list.color,
      book,
      chapter,
    };
  });
}

// Generate a full plan for N days starting from a date
export function generatePlan(
  startDate: Date,
  days: number,
  listOffsets: number[]
): DayPlan[] {
  const plans: DayPlan[] = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    plans.push({
      day: d + 1,
      date,
      readings: getReadingsForDay(d, listOffsets),
    });
  }
  return plans;
}

// Export plan to markdown
export function exportToMarkdown(plan: DayPlan[]): string {
  const lines: string[] = ['# Bible Reading Plan', ''];
  for (const day of plan) {
    const dateStr = day.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    lines.push(`## Day ${day.day} — ${dateStr}`);
    lines.push('| # | List | Reading |');
    lines.push('|---|------|---------|');
    for (const r of day.readings) {
      lines.push(`| ${r.listId} | ${r.listName} | ${r.book} ${r.chapter} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
