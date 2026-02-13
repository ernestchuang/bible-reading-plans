import { HORNER_LISTS } from './hornerLists';
import { MCHEYNE_CALENDAR, MCHEYNE_LIST_META } from './mcheyneCalendar';
import type { ReadingPlan } from '../types';

export const PLANS: ReadingPlan[] = [
  {
    id: 'horner',
    kind: 'cycling',
    name: "Horner's Bible Reading System",
    description: '10 independent lists that cycle at different lengths, creating unique combinations for years.',
    lists: HORNER_LISTS,
  },
  {
    id: 'mcheyne',
    kind: 'calendar',
    name: "M'Cheyne's Daily Bible",
    description: 'Robert Murray M\'Cheyne\'s original 365-day plan with 4 daily readings — Family and Secret.',
    listNames: [...MCHEYNE_LIST_META],
    calendar: MCHEYNE_CALENDAR,
  },
];

export const DEFAULT_PLAN_ID = 'horner';

export function getPlanById(id: string): ReadingPlan | undefined {
  return PLANS.find((p) => p.id === id);
}
