import { useState, useEffect, useCallback } from 'react';
import type { BibleSelection } from '../types';

const STORAGE_KEY = 'bible-reader-v1';

interface StoredSelection {
  book: string;
  chapter: number;
}

function loadSelection(): BibleSelection | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSelection>;
    if (parsed.book && typeof parsed.chapter === 'number') {
      return { book: parsed.book, chapter: parsed.chapter };
    }
  } catch {
    // Ignore corrupt data
  }
  return null;
}

export interface BibleReaderState {
  selection: BibleSelection | null;
  setSelection: (book: string, chapter: number) => void;
}

export function useBibleReader(): BibleReaderState {
  const [selection, setSelectionState] = useState<BibleSelection | null>(() => loadSelection());

  useEffect(() => {
    if (selection) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ book: selection.book, chapter: selection.chapter }));
    }
  }, [selection]);

  const setSelection = useCallback((book: string, chapter: number) => {
    setSelectionState({ book, chapter });
  }, []);

  return { selection, setSelection };
}
