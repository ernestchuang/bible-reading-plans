import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Translation } from '../types';
import { HORNER_LISTS } from '../data/hornerLists';

const STORAGE_KEY = 'bible-reading-plan';

interface StoredState {
  startDate: string;
  listOffsets: number[];
  translation: Translation;
  daysToGenerate: number;
  completedToday: {
    date: string;
    lists: boolean[];
  };
}

export interface ReadingPlanState {
  startDate: string;
  setStartDate: (date: string) => void;
  listOffsets: number[];
  setListOffsets: (offsets: number[]) => void;
  setListOffset: (listIndex: number, offset: number) => void;
  translation: Translation;
  setTranslation: (t: Translation) => void;
  daysToGenerate: number;
  setDaysToGenerate: (n: number) => void;
  currentDayIndex: number;
  completedToday: boolean[];
  toggleReading: (listIndex: number) => void;
  resetAll: () => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaults(): StoredState {
  return {
    startDate: getToday(),
    listOffsets: Array(10).fill(0),
    translation: 'NASB95',
    daysToGenerate: 30,
    completedToday: {
      date: getToday(),
      lists: Array(10).fill(false),
    },
  };
}

function loadFromStorage(): StoredState {
  const defaults = getDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const today = getToday();

      // Reset completedToday if it's from a different day
      let completed = parsed.completedToday;
      if (!completed || completed.date !== today) {
        completed = { date: today, lists: Array(10).fill(false) };
      }

      return {
        startDate: parsed.startDate ?? defaults.startDate,
        listOffsets: parsed.listOffsets ?? defaults.listOffsets,
        translation: parsed.translation ?? defaults.translation,
        daysToGenerate: parsed.daysToGenerate ?? defaults.daysToGenerate,
        completedToday: completed,
      };
    }
  } catch {
    // Ignore corrupt data
  }
  return defaults;
}

export function useReadingPlan(): ReadingPlanState {
  const [startDate, setStartDate] = useState<string>(() => loadFromStorage().startDate);
  const [listOffsets, setListOffsets] = useState<number[]>(() => loadFromStorage().listOffsets);
  const [translation, setTranslation] = useState<Translation>(() => loadFromStorage().translation);
  const [daysToGenerate, setDaysToGenerate] = useState<number>(() => loadFromStorage().daysToGenerate);
  const [completedToday, setCompletedToday] = useState<{ date: string; lists: boolean[] }>(
    () => loadFromStorage().completedToday
  );

  // Reset completedToday if the date has changed (e.g. user left tab open overnight)
  useEffect(() => {
    const today = getToday();
    if (completedToday.date !== today) {
      setCompletedToday({ date: today, lists: Array(10).fill(false) });
    }
  }, [completedToday.date]);

  useEffect(() => {
    const state: StoredState = {
      startDate,
      listOffsets,
      translation,
      daysToGenerate,
      completedToday,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [startDate, listOffsets, translation, daysToGenerate, completedToday]);

  const currentDayIndex = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [startDate]);

  function setListOffset(listIndex: number, offset: number): void {
    setListOffsets((prev) => {
      const next = [...prev];
      next[listIndex] = offset;
      return next;
    });
  }

  // Toggle a reading: check advances the offset, uncheck reverts it
  const toggleReading = useCallback((listIndex: number) => {
    const wasCompleted = completedToday.lists[listIndex];
    const list = HORNER_LISTS[listIndex];

    if (wasCompleted) {
      // Unchecking: revert the offset (go back 1)
      setListOffsets((prev) => {
        const next = [...prev];
        next[listIndex] = ((next[listIndex] - 1) + list.totalChapters) % list.totalChapters;
        return next;
      });
    } else {
      // Checking: advance the offset (go forward 1)
      setListOffsets((prev) => {
        const next = [...prev];
        next[listIndex] = (next[listIndex] + 1) % list.totalChapters;
        return next;
      });
    }

    // Toggle the completed state
    setCompletedToday((prev) => {
      const lists = [...prev.lists];
      lists[listIndex] = !wasCompleted;
      return { ...prev, lists };
    });
  }, [completedToday.lists]);

  function resetAll(): void {
    const defaults = getDefaults();
    setStartDate(defaults.startDate);
    setListOffsets(defaults.listOffsets);
    setTranslation(defaults.translation);
    setDaysToGenerate(defaults.daysToGenerate);
    setCompletedToday(defaults.completedToday);
  }

  return {
    startDate,
    setStartDate,
    listOffsets,
    setListOffsets,
    setListOffset,
    translation,
    setTranslation,
    daysToGenerate,
    setDaysToGenerate,
    currentDayIndex,
    completedToday: completedToday.lists,
    toggleReading,
    resetAll,
  };
}
