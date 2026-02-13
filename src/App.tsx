import { useState, useMemo, useEffect } from 'react';
import { useReadingPlan } from './hooks/useReadingPlan';
import { getReadingsForDay, generatePlan } from './utils/planGenerator';
import { getCalendarReadingsForDay, generateCalendarPlan } from './utils/calendarPlanGenerator';
import type { Reading, Theme } from './types';
import { isCalendarPlan, isCyclingPlan } from './types';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { BibleReader } from './components/BibleReader';
import { PlanView } from './components/PlanView';
import { SettingsPanel } from './components/SettingsPanel';
import { JournalPane } from './components/journal/JournalPane';
import { clearCache } from './utils/bibleCache';

function App() {
  const state = useReadingPlan();
  const [activeTab, setActiveTab] = useState('Today');
  const [activeReading, setActiveReading] = useState<Reading | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);

  // Sync theme classes on <html>
  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(theme: Theme, prefersDark: boolean) {
      root.classList.remove('dark', 'paper', 'warm-dark');
      if (theme === 'dark' || (theme === 'system' && prefersDark)) {
        root.classList.add('dark');
      } else if (theme === 'warm-dark') {
        root.classList.add('dark', 'warm-dark');
      } else if (theme === 'paper') {
        root.classList.add('paper');
      }
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(state.theme, mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      if (state.theme === 'system') {
        applyTheme('system', e.matches);
      }
    }
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [state.theme]);

  const plan = state.activePlan;

  // Today's readings — calendar plans look up by day index, cycling plans use offsets
  const todayReadings = useMemo(() => {
    if (isCalendarPlan(plan)) {
      return getCalendarReadingsForDay(plan, state.currentDayIndex);
    }
    return getReadingsForDay(0, state.listOffsets, plan.lists);
  }, [plan, state.currentDayIndex, state.listOffsets]);

  // Full Plan projects forward from current day
  const fullPlan = useMemo(() => {
    if (isCalendarPlan(plan)) {
      return generateCalendarPlan(plan, state.currentDayIndex, state.daysToGenerate);
    }
    return generatePlan(
      new Date(new Date().toISOString().split('T')[0] + 'T00:00:00'),
      state.daysToGenerate,
      state.listOffsets,
      plan.lists
    );
  }, [plan, state.currentDayIndex, state.daysToGenerate, state.listOffsets]);

  function handleToggleComplete(listIndex: number) {
    // For cycling plans, clear the active reading since the offset is about to change
    if (isCyclingPlan(plan) && activeReading && activeReading.listId === todayReadings[listIndex].listId) {
      setActiveReading(null);
    }
    state.toggleReading(listIndex);
  }

  // Clear active reading when switching plans (readings change)
  function handlePlanChange(planId: string) {
    setActiveReading(null);
    state.setActivePlanId(planId);
  }

  const showReader = activeTab === 'Today';

  return (
    <div className="h-screen flex flex-col overflow-hidden dark:bg-gray-900">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        translation={state.translation}
        onTranslationChange={state.setTranslation}
        activePlanId={state.activePlanId}
        onPlanChange={handlePlanChange}
        theme={state.theme}
        onThemeChange={state.setTheme}
      />

      {showReader ? (
        <>
          {/* Compact reading plan bar */}
          <div className="shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="max-w-[1600px] mx-auto">
              <DailyView
                readings={todayReadings}
                startDate={state.startDate}
                currentDayIndex={state.currentDayIndex}
                activeReading={activeReading}
                completedToday={state.completedToday}
                onSelectReading={setActiveReading}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          </div>

          {/* Bible text reader + journal - fills remaining space */}
          <div className="flex-1 min-h-0 flex flex-row">
            <div className={journalOpen ? 'w-1/2 min-w-0 h-full' : 'w-full h-full'}>
              <BibleReader
                reading={activeReading}
                translation={state.translation}
                displayMode={state.displayMode}
                onDisplayModeChange={state.setDisplayMode}
                fontFamily={state.fontFamily}
                fontSize={state.fontSize}
                onFontSizeChange={state.setFontSize}
                onToggleJournal={() => setJournalOpen((p) => !p)}
                journalOpen={journalOpen}
              />
            </div>
            {journalOpen && (
              <div className="w-1/2 min-w-0 h-full border-l border-gray-200 dark:border-gray-700">
                <JournalPane
                  reading={activeReading}
                  fontFamily={state.fontFamily}
                  fontSize={state.fontSize}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'Full Plan' && (
              <PlanView plan={fullPlan} />
            )}
            {activeTab === 'Settings' && (
              <SettingsPanel
                lists={isCyclingPlan(plan) ? plan.lists : []}
                isCalendarPlan={isCalendarPlan(plan)}
                currentDayIndex={state.currentDayIndex}
                startDate={state.startDate}
                setStartDate={state.setStartDate}
                listOffsets={state.listOffsets}
                setListOffset={state.setListOffset}
                translation={state.translation}
                setTranslation={state.setTranslation}
                daysToGenerate={state.daysToGenerate}
                setDaysToGenerate={state.setDaysToGenerate}
                fontFamily={state.fontFamily}
                setFontFamily={state.setFontFamily}
                fontSize={state.fontSize}
                setFontSize={state.setFontSize}
                resetAll={state.resetAll}
                onClearCache={clearCache}
              />
            )}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
