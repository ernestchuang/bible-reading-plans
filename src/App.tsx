import { useState, useMemo, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useReadingPlan } from './hooks/useReadingPlan';
import { useBiblePreferences } from './hooks/useBiblePreferences';
import { getReadingsForDay, generatePlan } from './utils/planGenerator';
import { getCalendarReadingsPerList, generateCalendarPlan } from './utils/calendarPlanGenerator';
import type { Theme } from './types';
import { isCalendarPlan, isCyclingPlan } from './types';
import { Header } from './components/Header';
import { ReadView } from './components/ReadView';
import { PlanView } from './components/PlanView';
import { SettingsPanel } from './components/SettingsPanel';
import { JournalView } from './components/journal/JournalView';
import { clearCache, checkCacheFreshness } from './utils/bibleCache';

const PLAN_BAR_KEY = 'plan-bar-v1';

function loadPlanBarOpen(): boolean {
  try {
    const raw = localStorage.getItem(PLAN_BAR_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch { /* ignore */ }
  return true;
}

function App() {
  const state = useReadingPlan();
  const prefs = useBiblePreferences();
  const [planBarOpen, setPlanBarOpen] = useState(loadPlanBarOpen);

  // Persist plan bar open/close preference
  useEffect(() => {
    localStorage.setItem(PLAN_BAR_KEY, JSON.stringify(planBarOpen));
  }, [planBarOpen]);

  const handleTogglePlanBar = useCallback(() => setPlanBarOpen((p) => !p), []);

  // Daily cache freshness check (runs once per app launch, max one API call per day)
  const [cacheStale, setCacheStale] = useState(false);
  useEffect(() => {
    checkCacheFreshness(prefs.translation).then((result) => {
      setCacheStale(result === 'stale');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    applyTheme(prefs.theme, mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      if (prefs.theme === 'system') {
        applyTheme('system', e.matches);
      }
    }
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [prefs.theme]);

  const plan = state.activePlan;

  // Today's readings — calendar plans use per-list effectiveDayIndices, cycling plans use offsets
  const todayReadings = useMemo(() => {
    if (isCalendarPlan(plan)) {
      return getCalendarReadingsPerList(plan, state.effectiveDayIndices);
    }
    return getReadingsForDay(0, state.listOffsets, plan.lists);
  }, [plan, state.effectiveDayIndices, state.listOffsets]);

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

  function handlePlanChange(planId: string) {
    state.setActivePlanId(planId);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden dark:bg-gray-900">
      <Header
        theme={prefs.theme}
        onThemeChange={prefs.setTheme}
        translation={prefs.translation}
        onTranslationChange={prefs.setTranslation}
        planBarOpen={planBarOpen}
        onTogglePlanBar={handleTogglePlanBar}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/read" replace />} />
        <Route path="/read" element={
          <ReadView prefs={prefs} planBarOpen={planBarOpen} planData={{
            readings: todayReadings,
            startDate: state.startDate,
            currentDayIndex: state.currentDayIndex,
            effectiveDayIndices: state.effectiveDayIndices,
            completedToday: state.completedToday,
            toggleReading: state.toggleReading,
            revertDay: state.revertDay,
            isCycling: isCyclingPlan(plan),
            isCalendarPlan: isCalendarPlan(plan),
            activePlanId: state.activePlanId,
            onPlanChange: handlePlanChange,
          }} />
        } />
        <Route path="/plans" element={<Navigate to="/read" replace />} />
        <Route path="/journal" element={
          <main className="flex-1 overflow-hidden">
            <JournalView fontFamily={prefs.fontFamily} />
          </main>
        } />
        <Route path="/plan" element={
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PlanView plan={fullPlan} />
            </div>
          </main>
        } />
        <Route path="/settings" element={
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <SettingsPanel
                activePlanId={state.activePlanId}
                onPlanChange={handlePlanChange}
                lists={isCyclingPlan(plan) ? plan.lists : []}
                isCalendarPlan={isCalendarPlan(plan)}
                effectiveDayIndices={state.effectiveDayIndices}
                setAllEffectiveDayIndices={state.setAllEffectiveDayIndices}
                startDate={state.startDate}
                setStartDate={state.setStartDate}
                listOffsets={state.listOffsets}
                setListOffset={state.setListOffset}
                translation={prefs.translation}
                setTranslation={prefs.setTranslation}
                theme={prefs.theme}
                setTheme={prefs.setTheme}
                daysToGenerate={state.daysToGenerate}
                setDaysToGenerate={state.setDaysToGenerate}
                fontFamily={prefs.fontFamily}
                setFontFamily={prefs.setFontFamily}
                fontSize={prefs.fontSize}
                setFontSize={prefs.setFontSize}
                resetPlan={state.resetPlan}
                resetPreferences={prefs.resetPreferences}
                onClearCache={clearCache}
                cacheStale={cacheStale}
              />
            </div>
          </main>
        } />
      </Routes>
    </div>
  );
}

export default App;
