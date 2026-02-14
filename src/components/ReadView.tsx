import { useState, useEffect, useCallback } from 'react';
import { useBibleReader } from '../hooks/useBibleReader';
import { BibleBrowser } from './BibleBrowser';
import { BibleReader } from './BibleReader';
import { JournalPane } from './journal/JournalPane';
import { DailyView } from './DailyView';
import type { BiblePreferences } from '../hooks/useBiblePreferences';
import type { Reading, BibleSelection } from '../types';

export interface PlanBarData {
  readings: Reading[];
  startDate: string;
  currentDayIndex: number;
  completedToday: boolean[];
  toggleReading: (listIndex: number) => void;
  isCycling: boolean;
  activePlanId: string;
  onPlanChange: (planId: string) => void;
}

interface ReadViewProps {
  prefs: BiblePreferences;
  planData: PlanBarData;
  planBarOpen: boolean;
}

export function ReadView({ prefs, planData, planBarOpen }: ReadViewProps) {
  const { selection: browserSelection, setSelection } = useBibleReader();
  const [journalOpen, setJournalOpen] = useState(false);
  const [planReading, setPlanReading] = useState<Reading | null>(null);

  // Clear stale planReading when readings change (e.g., plan switch)
  useEffect(() => {
    if (planReading && !planData.readings.some((r) => r.listId === planReading.listId)) {
      setPlanReading(null);
    }
  }, [planData.readings, planReading]);

  const effectiveSelection: BibleSelection | null = planReading ?? browserSelection;
  const [visibleChapter, setVisibleChapter] = useState<{ book: string; chapter: number } | null>(null);

  const handleVisibleChapterChange = useCallback((book: string, chapter: number) => {
    setVisibleChapter({ book, chapter });
  }, []);

  // displaySelection reflects the currently visible chapter (from scrolling) for BibleBrowser + JournalPane
  const displaySelection: BibleSelection | null = effectiveSelection
    ? (visibleChapter ? { book: visibleChapter.book, chapter: visibleChapter.chapter } : effectiveSelection)
    : null;

  const handleBrowserSelect = useCallback(
    (book: string, chapter: number) => {
      setSelection(book, chapter);
      setPlanReading(null);
      setVisibleChapter(null);
    },
    [setSelection],
  );

  const handleSelectReading = useCallback((reading: Reading) => {
    setPlanReading(reading);
    setVisibleChapter(null);
  }, []);

  const handleToggleComplete = useCallback(
    (listIndex: number) => {
      if (planData.isCycling && planReading && planReading.listId === planData.readings[listIndex]?.listId) {
        setPlanReading(null);
      }
      planData.toggleReading(listIndex);
    },
    [planData, planReading],
  );

  const hasReadings = planData.readings.length > 0;

  return (
    <>
      {/* BibleBrowser bar */}
      <div className="shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-[1600px] mx-auto">
          <BibleBrowser
            selectedBook={displaySelection?.book}
            selectedChapter={displaySelection?.chapter}
            onSelect={handleBrowserSelect}
          />
        </div>
      </div>

      {/* Collapsible plan bar */}
      {planBarOpen && hasReadings && (
        <div className="shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="max-w-[1600px] mx-auto">
            <DailyView
              readings={planData.readings}
              startDate={planData.startDate}
              currentDayIndex={planData.currentDayIndex}
              activeReading={planReading}
              completedToday={planData.completedToday}
              onSelectReading={handleSelectReading}
              onToggleComplete={handleToggleComplete}
              activePlanId={planData.activePlanId}
              onPlanChange={planData.onPlanChange}
            />
          </div>
        </div>
      )}

      {/* Bible text reader + journal */}
      <div className="flex-1 min-h-0 flex flex-row">
        <div className={journalOpen ? 'w-1/2 min-w-0 h-full' : 'w-full h-full'}>
          <BibleReader
            selection={effectiveSelection}
            translation={prefs.translation}
            displayMode={prefs.displayMode}
            onDisplayModeChange={prefs.setDisplayMode}
            fontFamily={prefs.fontFamily}
            fontSize={prefs.fontSize}
            onFontSizeChange={prefs.setFontSize}
            onToggleJournal={() => setJournalOpen((p) => !p)}
            journalOpen={journalOpen}
            onNavigate={handleBrowserSelect}
            onVisibleChapterChange={handleVisibleChapterChange}
          />
        </div>
        {journalOpen && (
          <div className="w-1/2 min-w-0 h-full border-l border-gray-200 dark:border-gray-700">
            <JournalPane
              selection={displaySelection}
              fontFamily={prefs.fontFamily}
              fontSize={prefs.fontSize}
            />
          </div>
        )}
      </div>
    </>
  );
}
