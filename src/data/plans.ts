import { HORNER_LISTS } from './hornerLists';
import { MCHEYNE_LISTS } from './mcheyneLists';
import type { ReadingPlan } from '../types';

export const PLANS: ReadingPlan[] = [
  {
    id: 'horner',
    name: "Horner's Bible Reading System",
    description: '10 independent lists that cycle at different lengths, creating unique combinations for years.',
    lists: HORNER_LISTS,
  },
  {
    id: 'mcheyne',
    name: "M'Cheyne's Reading Plan",
    description: '4 daily readings covering the entire Bible, adapted from Robert Murray M\'Cheyne\'s calendar.',
    lists: MCHEYNE_LISTS,
  },
];

export const DEFAULT_PLAN_ID = 'horner';

export function getPlanById(id: string): ReadingPlan | undefined {
  return PLANS.find((p) => p.id === id);
}
