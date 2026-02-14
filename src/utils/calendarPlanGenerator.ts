import type { CalendarReadingPlan, Reading, DayPlan } from '../types';

/** Get readings for a given day index (0-based) in a calendar plan. Wraps at 365. */
export function getCalendarReadingsForDay(
  plan: CalendarReadingPlan,
  dayIndex: number
): Reading[] {
  const wrapped = ((dayIndex % 365) + 365) % 365; // handle negative indices
  return plan.calendar[wrapped].readings;
}

/** Get one reading per list, each at its own day index. Wraps at 365. */
export function getCalendarReadingsPerList(
  plan: CalendarReadingPlan,
  dayIndices: number[]
): Reading[] {
  return dayIndices.map((dayIndex, listIndex) => {
    const wrapped = ((dayIndex % 365) + 365) % 365;
    return plan.calendar[wrapped].readings[listIndex];
  });
}

/** Generate N days of a calendar plan starting from the given day index. */
export function generateCalendarPlan(
  plan: CalendarReadingPlan,
  startDayIndex: number,
  days: number
): DayPlan[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: DayPlan[] = [];
  for (let d = 0; d < days; d++) {
    const calIndex = ((startDayIndex + d) % 365 + 365) % 365;
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    result.push({
      day: calIndex + 1, // 1-based M'Cheyne day number
      date,
      readings: plan.calendar[calIndex].readings,
    });
  }
  return result;
}
