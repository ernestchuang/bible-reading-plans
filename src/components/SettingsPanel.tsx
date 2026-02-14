import { useMemo, useState } from 'react';
import type { ReadingList, Translation, FontFamily, FontSize, Theme } from '../types';
import { FONT_OPTIONS, FONT_SIZES, getFontCss } from '../data/fonts';
import { PLANS } from '../data/plans';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'paper', label: 'Paper' },
  { value: 'dark', label: 'Dark' },
  { value: 'warm-dark', label: 'Warm Dark' },
  { value: 'system', label: 'System' },
];

interface SettingsPanelProps {
  activePlanId: string;
  onPlanChange: (planId: string) => void;
  lists: ReadingList[];
  isCalendarPlan: boolean;
  currentDayIndex: number;
  startDate: string;
  setStartDate: (date: string) => void;
  listOffsets: number[];
  setListOffset: (listIndex: number, offset: number) => void;
  translation: Translation;
  setTranslation: (t: Translation) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  daysToGenerate: number;
  setDaysToGenerate: (n: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  resetPlan: () => void;
  resetPreferences: () => void;
  onClearCache: () => Promise<void>;
}

/** Convert a flat offset (0-based) into a { bookIndex, chapter } for a given list. */
function offsetToBookChapter(
  list: ReadingList,
  offset: number
): { bookIndex: number; chapter: number } {
  const wrapped = ((offset % list.totalChapters) + list.totalChapters) % list.totalChapters;
  let cumulative = 0;
  for (let i = 0; i < list.books.length; i++) {
    if (wrapped < cumulative + list.books[i].chapters) {
      return { bookIndex: i, chapter: wrapped - cumulative + 1 };
    }
    cumulative += list.books[i].chapters;
  }
  // Fallback
  return { bookIndex: list.books.length - 1, chapter: list.books[list.books.length - 1].chapters };
}

/** Convert a bookIndex + chapter (1-based) into a flat offset for a given list. */
function bookChapterToOffset(list: ReadingList, bookIndex: number, chapter: number): number {
  let offset = 0;
  for (let i = 0; i < bookIndex; i++) {
    offset += list.books[i].chapters;
  }
  return offset + (chapter - 1);
}

const TRANSLATIONS: Translation[] = ['NASB95', 'LSB', 'ESV', 'KJV'];

const inputClasses =
  'block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

const labelClasses = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export function SettingsPanel({
  activePlanId,
  onPlanChange,
  lists,
  isCalendarPlan,
  currentDayIndex,
  startDate,
  setStartDate,
  listOffsets,
  setListOffset,
  translation,
  setTranslation,
  theme,
  setTheme,
  daysToGenerate,
  setDaysToGenerate,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  resetPlan,
  resetPreferences,
  onClearCache,
}: SettingsPanelProps) {
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  async function handleClearCache() {
    setCacheClearing(true);
    setCacheCleared(false);
    try {
      await onClearCache();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {
      // Silently reset on failure
    } finally {
      setCacheClearing(false);
    }
  }
  // Pre-compute book/chapter for each list from offsets
  const listPositions = useMemo(
    () =>
      lists.map((list, i) => offsetToBookChapter(list, listOffsets[i])),
    [lists, listOffsets]
  );

  function handleBookChange(listIndex: number, bookIndex: number) {
    const offset = bookChapterToOffset(lists[listIndex], bookIndex, 1);
    setListOffset(listIndex, offset);
  }

  function handleChapterChange(listIndex: number, bookIndex: number, chapter: number) {
    const maxChapters = lists[listIndex].books[bookIndex].chapters;
    const clamped = Math.max(1, Math.min(chapter, maxChapters));
    const offset = bookChapterToOffset(lists[listIndex], bookIndex, clamped);
    setListOffset(listIndex, offset);
  }

  // Current M'Cheyne day (1-based)
  const currentDay = (currentDayIndex % 365) + 1;

  function handleCurrentDayChange(day: number) {
    const clamped = Math.max(1, Math.min(day, 365));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newStart = new Date(today);
    newStart.setDate(today.getDate() - (clamped - 1));
    const yyyy = newStart.getFullYear();
    const mm = String(newStart.getMonth() + 1).padStart(2, '0');
    const dd = String(newStart.getDate()).padStart(2, '0');
    setStartDate(`${yyyy}-${mm}-${dd}`);
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>

      {/* General settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Reading plan */}
        <div>
          <label htmlFor="reading-plan" className={labelClasses}>
            Reading Plan
          </label>
          <select
            id="reading-plan"
            value={activePlanId}
            onChange={(e) => onPlanChange(e.target.value)}
            className={inputClasses}
          >
            {PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current day — calendar plans only */}
        {isCalendarPlan && (
          <div>
            <label htmlFor="current-day" className={labelClasses}>
              Current Day
            </label>
            <input
              id="current-day"
              type="number"
              min={1}
              max={365}
              value={currentDay}
              onChange={(e) => handleCurrentDayChange(Number(e.target.value))}
              className={inputClasses}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              M'Cheyne day 1–365
            </p>
          </div>
        )}

        {/* Start date */}
        <div>
          <label htmlFor="start-date" className={labelClasses}>
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Translation */}
        <div>
          <label htmlFor="translation" className={labelClasses}>
            Translation
          </label>
          <select
            id="translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value as Translation)}
            className={inputClasses}
          >
            {TRANSLATIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Days to generate */}
        <div>
          <label htmlFor="days" className={labelClasses}>
            Days to Generate
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={365}
            value={daysToGenerate}
            onChange={(e) => setDaysToGenerate(Number(e.target.value))}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Reading appearance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Reading Appearance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Theme */}
          <div>
            <label htmlFor="theme" className={labelClasses}>
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className={inputClasses}
            >
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font family */}
          <div>
            <label htmlFor="font-family" className={labelClasses}>
              Font
            </label>
            <select
              id="font-family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as FontFamily)}
              className={inputClasses}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.category})
                </option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <div>
            <label htmlFor="font-size" className={labelClasses}>
              Font Size
            </label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value) as FontSize)}
              className={inputClasses}
            >
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value}px)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Preview</p>
          <p
            style={{
              fontFamily: getFontCss(fontFamily),
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize + 8}px`,
            }}
            className="text-gray-800 dark:text-gray-200"
          >
            In the beginning God created the heavens and the earth. The earth was
            formless and void, and darkness was over the surface of the deep.
          </p>
        </div>
      </div>

      {/* List position adjustments — only for cycling plans */}
      {!isCalendarPlan && lists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            List Starting Positions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Adjust where each list begins reading. Useful if you want to pick up
            where you left off.
          </p>

          <div className="space-y-4">
            {lists.map((list, listIndex) => {
              const pos = listPositions[listIndex];
              const currentBook = list.books[pos.bookIndex];

              return (
                <div
                  key={list.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {/* List name */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28 shrink-0">
                    {list.name}
                  </span>

                  {/* Book selector */}
                  <select
                    value={pos.bookIndex}
                    onChange={(e) =>
                      handleBookChange(listIndex, Number(e.target.value))
                    }
                    className={`${inputClasses} sm:w-48`}
                    aria-label={`Book for ${list.name}`}
                  >
                    {list.books.map((book, bookIdx) => (
                      <option key={book.name} value={bookIdx}>
                        {book.name}
                      </option>
                    ))}
                  </select>

                  {/* Chapter input */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`chapter-${list.id}`}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      Ch.
                    </label>
                    <input
                      id={`chapter-${list.id}`}
                      type="number"
                      min={1}
                      max={currentBook.chapters}
                      value={pos.chapter}
                      onChange={(e) =>
                        handleChapterChange(
                          listIndex,
                          pos.bookIndex,
                          Number(e.target.value)
                        )
                      }
                      className={`${inputClasses} w-20`}
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      / {currentBook.chapters}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data management */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearCache}
            disabled={cacheClearing}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {cacheClearing ? 'Clearing...' : cacheCleared ? 'Cache Cleared!' : 'Clear Offline Cache'}
          </button>
          <button
            type="button"
            onClick={() => { resetPlan(); resetPreferences(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Reset All to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
