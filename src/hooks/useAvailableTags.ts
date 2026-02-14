import { useMemo } from 'react';
import type { JournalEntry } from '../types/journal';
import { extractAllTags } from '../utils/tagUtils';

export function useAvailableTags(entries: JournalEntry[]): string[] {
  return useMemo(() => extractAllTags(entries), [entries]);
}
