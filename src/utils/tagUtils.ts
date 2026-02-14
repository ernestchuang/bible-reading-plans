import type { JournalEntry } from '../types/journal';

/** Normalize tag to lowercase-kebab-case */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Extract all unique tags from entry list */
export function extractAllTags(entries: JournalEntry[]): string[] {
  const tagSet = new Set<string>();
  entries.forEach((e) => e.meta.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/** Check if entry matches all selected tags (AND logic) */
export function matchesTags(
  entry: JournalEntry,
  selectedTags: Set<string>
): boolean {
  if (selectedTags.size === 0) return true;
  if (!entry.meta.tags || entry.meta.tags.length === 0) return false;
  return Array.from(selectedTags).every((tag) =>
    entry.meta.tags!.includes(tag)
  );
}
