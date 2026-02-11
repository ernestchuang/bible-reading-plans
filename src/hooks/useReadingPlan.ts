import { useState, useEffect, useMemo } from 'react';
import type { Translation } from '../types';

const STORAGE_KEY = 'bible-reading-plan';

interface StoredState {
  startDate: string;
  listOffsets: number[];
  translation: Translation;
  daysToGenerate: number;
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
  };
}

function loadFromStorage(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      return {
        startDate: parsed.startDate ?? getToday(),
        listOffsets: parsed.listOffsets ?? Array(10).fill(0),
        translation: parsed.translation ?? 'NASB95',
        daysToGenerate: parsed.daysToGenerate ?? 30,
      };
    }
  } catch {
    // Ignore corrupt data
  }
  return getDefaults();
}

export function useReadingPlan(): ReadingPlanState {
  const [startDate, setStartDate] = useState<string>(() => loadFromStorage().startDate);
  const [listOffsets, setListOffsets] = useState<number[]>(() => loadFromStorage().listOffsets);
  const [translation, setTranslation] = useState<Translation>(() => loadFromStorage().translation);
  const [daysToGenerate, setDaysToGenerate] = useState<number>(() => loadFromStorage().daysToGenerate);

  useEffect(() => {
    const state: StoredState = {
      startDate,
      listOffsets,
      translation,
      daysToGenerate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [startDate, listOffsets, translation, daysToGenerate]);

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

  function resetAll(): void {
    const defaults = getDefaults();
    setStartDate(defaults.startDate);
    setListOffsets(defaults.listOffsets);
    setTranslation(defaults.translation);
    setDaysToGenerate(defaults.daysToGenerate);
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
    resetAll,
  };
}
