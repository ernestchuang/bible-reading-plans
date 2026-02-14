import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReadingPlan } from '../types';
import { isCalendarPlan, getListCount } from '../types';
import { PLANS, DEFAULT_PLAN_ID, getPlanById } from '../data/plans';

const STORAGE_KEY = 'bible-reading-plan-v2';
const LEGACY_STORAGE_KEY = 'bible-reading-plan';

interface PerPlanState {
  startDate: string;
  listOffsets: number[];
  completedToday: {
    date: string;
    lists: boolean[];
  };
  /** @deprecated Use effectiveDayIndices instead. Kept for migration. */
  effectiveDayIndex?: number;
  effectiveDayIndices?: number[];
}

interface StoredState {
  activePlanId: string;
  plans: Record<string, PerPlanState>;
  daysToGenerate: number;
}

export interface ReadingPlanState {
  activePlanId: string;
  setActivePlanId: (id: string) => void;
  activePlan: ReadingPlan;
  startDate: string;
  setStartDate: (date: string) => void;
  listOffsets: number[];
  setListOffsets: (offsets: number[]) => void;
  setListOffset: (listIndex: number, offset: number) => void;
  daysToGenerate: number;
  setDaysToGenerate: (n: number) => void;
  currentDayIndex: number;
  effectiveDayIndices: number[];
  setAllEffectiveDayIndices: (dayIndex: number) => void;
  completedToday: boolean[];
  toggleReading: (listIndex: number) => void;
  revertDay: (listIndex: number) => void;
  resetPlan: () => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultPlanState(plan: ReadingPlan): PerPlanState {
  const count = getListCount(plan);
  return {
    startDate: getToday(),
    listOffsets: Array(count).fill(0),
    completedToday: {
      date: getToday(),
      lists: Array(count).fill(false),
    },
  };
}

function getDefaults(): StoredState {
  const plans: Record<string, PerPlanState> = {};
  for (const plan of PLANS) {
    plans[plan.id] = getDefaultPlanState(plan);
  }
  return {
    activePlanId: DEFAULT_PLAN_ID,
    plans,
    daysToGenerate: 30,
  };
}

/** Migrate legacy single-plan state to the new multi-plan format. */
function migrateLegacy(): StoredState | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    const legacy = JSON.parse(raw) as {
      startDate?: string;
      listOffsets?: number[];
      daysToGenerate?: number;
      completedToday?: { date: string; lists: boolean[] };
    };

    const defaults = getDefaults();
    const today = getToday();

    let completed = legacy.completedToday;
    if (!completed || completed.date !== today) {
      const horner = getPlanById('horner')!;
      completed = { date: today, lists: Array(getListCount(horner)).fill(false) };
    }

    const migrated: StoredState = {
      activePlanId: 'horner',
      plans: {
        ...defaults.plans,
        horner: {
          startDate: legacy.startDate ?? defaults.plans.horner.startDate,
          listOffsets: legacy.listOffsets ?? defaults.plans.horner.listOffsets,
          completedToday: completed,
        },
      },
      daysToGenerate: legacy.daysToGenerate ?? defaults.daysToGenerate,
    };

    // Persist migrated state and remove legacy key
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    return migrated;
  } catch {
    return null;
  }
}

function loadFromStorage(): StoredState {
  const defaults = getDefaults();

  // Try new format first
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const today = getToday();

      // Rebuild plans, ensuring all registered plans have state
      const plans: Record<string, PerPlanState> = {};
      for (const plan of PLANS) {
        const saved = parsed.plans?.[plan.id];
        if (saved) {
          // Reset completedToday if it's from a different day — but only for cycling plans.
          // Calendar plans persist checkboxes until the day is fully completed.
          let completed = saved.completedToday;
          if (!completed || (!isCalendarPlan(plan) && completed.date !== today)) {
            completed = { date: today, lists: Array(getListCount(plan)).fill(false) };
          }
          // Migrate legacy single effectiveDayIndex → per-list array
          let dayIndices = saved.effectiveDayIndices;
          if (!dayIndices && saved.effectiveDayIndex != null) {
            dayIndices = Array(getListCount(plan)).fill(saved.effectiveDayIndex);
          }
          plans[plan.id] = {
            startDate: saved.startDate ?? defaults.plans[plan.id].startDate,
            listOffsets: saved.listOffsets ?? defaults.plans[plan.id].listOffsets,
            completedToday: completed,
            effectiveDayIndices: dayIndices,
          };
        } else {
          plans[plan.id] = defaults.plans[plan.id];
        }
      }

      return {
        activePlanId: parsed.activePlanId ?? defaults.activePlanId,
        plans,
        daysToGenerate: parsed.daysToGenerate ?? defaults.daysToGenerate,
      };
    }
  } catch {
    // Ignore corrupt data
  }

  // Try migrating legacy format
  const migrated = migrateLegacy();
  if (migrated) return migrated;

  return defaults;
}

export function useReadingPlan(): ReadingPlanState {
  const [stored, setStored] = useState<StoredState>(() => loadFromStorage());

  const activePlan = useMemo(
    () => getPlanById(stored.activePlanId) ?? getPlanById(DEFAULT_PLAN_ID)!,
    [stored.activePlanId]
  );

  const planState = stored.plans[activePlan.id] ?? getDefaultPlanState(activePlan);

  // Reset completedToday if the date has changed (e.g. user left tab open overnight)
  // Only for cycling plans — calendar plans persist checkboxes until the day is fully completed.
  const listCount = getListCount(activePlan);
  useEffect(() => {
    if (isCalendarPlan(activePlan)) return;
    const today = getToday();
    if (planState.completedToday.date !== today) {
      setStored((prev) => ({
        ...prev,
        plans: {
          ...prev.plans,
          [activePlan.id]: {
            ...prev.plans[activePlan.id],
            completedToday: {
              date: today,
              lists: Array(listCount).fill(false),
            },
          },
        },
      }));
    }
  }, [planState.completedToday.date, activePlan.id, activePlan, listCount]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [stored]);

  const currentDayIndex = useMemo(() => {
    const start = new Date(planState.startDate + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [planState.startDate]);

  // For calendar plans, each list tracks its own day index independently.
  // For cycling plans, all indices mirror currentDayIndex (offsets handle position).
  const effectiveDayIndices = useMemo(() => {
    if (isCalendarPlan(activePlan)) {
      return planState.effectiveDayIndices ?? Array(listCount).fill(currentDayIndex);
    }
    return Array(listCount).fill(currentDayIndex);
  }, [activePlan, planState.effectiveDayIndices, currentDayIndex, listCount]);

  function setActivePlanId(id: string) {
    if (getPlanById(id)) {
      setStored((prev) => ({ ...prev, activePlanId: id }));
    }
  }

  function setStartDate(date: string) {
    setStored((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [activePlan.id]: { ...prev.plans[activePlan.id], startDate: date },
      },
    }));
  }

  function setListOffsets(offsets: number[]) {
    setStored((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [activePlan.id]: { ...prev.plans[activePlan.id], listOffsets: offsets },
      },
    }));
  }

  function setListOffset(listIndex: number, offset: number) {
    setStored((prev) => {
      const next = [...prev.plans[activePlan.id].listOffsets];
      next[listIndex] = offset;
      return {
        ...prev,
        plans: {
          ...prev.plans,
          [activePlan.id]: { ...prev.plans[activePlan.id], listOffsets: next },
        },
      };
    });
  }

  function setDaysToGenerate(n: number) {
    setStored((prev) => ({ ...prev, daysToGenerate: n }));
  }

  function setAllEffectiveDayIndices(dayIndex: number) {
    setStored((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [activePlan.id]: {
          ...prev.plans[activePlan.id],
          effectiveDayIndices: Array(listCount).fill(dayIndex),
          completedToday: {
            date: prev.plans[activePlan.id].completedToday.date,
            lists: Array(listCount).fill(false),
          },
        },
      },
    }));
  }

  // Toggle a reading: for cycling plans, check advances the offset; for calendar plans, advance that list's day
  const toggleReading = useCallback(
    (listIndex: number) => {
      setStored((prev) => {
        const ps = prev.plans[activePlan.id];
        const wasCompleted = ps.completedToday.lists[listIndex];
        const nextLists = [...ps.completedToday.lists];
        nextLists[listIndex] = !wasCompleted;

        if (isCalendarPlan(activePlan)) {
          // Calendar plan: check advances this list's day by 1 and resets checkbox
          if (wasCompleted) return prev; // uncheck is a no-op (use revertDay instead)
          const count = getListCount(activePlan);
          const currentIndices = ps.effectiveDayIndices ?? Array(count).fill(currentDayIndex);
          const nextIndices = [...currentIndices];
          nextIndices[listIndex] += 1;
          nextLists[listIndex] = false; // reset checkbox so next reading shows fresh
          return {
            ...prev,
            plans: {
              ...prev.plans,
              [activePlan.id]: {
                ...ps,
                effectiveDayIndices: nextIndices,
                completedToday: { ...ps.completedToday, lists: nextLists },
              },
            },
          };
        }

        // Cycling plan: advance/revert offset
        const list = activePlan.lists[listIndex];
        const nextOffsets = [...ps.listOffsets];
        if (wasCompleted) {
          nextOffsets[listIndex] =
            ((nextOffsets[listIndex] - 1) + list.totalChapters) % list.totalChapters;
        } else {
          nextOffsets[listIndex] =
            (nextOffsets[listIndex] + 1) % list.totalChapters;
        }

        // Auto-reset when all lists are checked: allow another round
        const allComplete = !wasCompleted && nextLists.every(Boolean);
        const finalLists = allComplete ? Array(nextLists.length).fill(false) : nextLists;

        return {
          ...prev,
          plans: {
            ...prev.plans,
            [activePlan.id]: {
              ...ps,
              listOffsets: nextOffsets,
              completedToday: { ...ps.completedToday, lists: finalLists },
            },
          },
        };
      });
    },
    [activePlan, currentDayIndex]
  );

  // Revert a single calendar list's day by 1 (the minus button)
  const revertDay = useCallback(
    (listIndex: number) => {
      if (!isCalendarPlan(activePlan)) return;
      setStored((prev) => {
        const ps = prev.plans[activePlan.id];
        const count = getListCount(activePlan);
        const currentIndices = ps.effectiveDayIndices ?? Array(count).fill(currentDayIndex);
        const nextIndices = [...currentIndices];
        nextIndices[listIndex] -= 1;
        return {
          ...prev,
          plans: {
            ...prev.plans,
            [activePlan.id]: {
              ...ps,
              effectiveDayIndices: nextIndices,
            },
          },
        };
      });
    },
    [activePlan, currentDayIndex]
  );

  function resetPlan() {
    const defaults = getDefaults();
    setStored((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [activePlan.id]: {
          ...defaults.plans[activePlan.id],
          effectiveDayIndices: isCalendarPlan(activePlan)
            ? Array(listCount).fill(currentDayIndex)
            : undefined,
        },
      },
      daysToGenerate: defaults.daysToGenerate,
    }));
  }

  return {
    activePlanId: stored.activePlanId,
    setActivePlanId,
    activePlan,
    startDate: planState.startDate,
    setStartDate,
    listOffsets: planState.listOffsets,
    setListOffsets,
    setListOffset,
    daysToGenerate: stored.daysToGenerate,
    setDaysToGenerate,
    currentDayIndex,
    effectiveDayIndices,
    setAllEffectiveDayIndices,
    completedToday: planState.completedToday.lists,
    toggleReading,
    revertDay,
    resetPlan,
  };
}
