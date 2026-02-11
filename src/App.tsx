import { useState, useMemo } from 'react';
import { useReadingPlan } from './hooks/useReadingPlan';
import { getReadingsForDay, generatePlan } from './utils/planGenerator';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { PlanView } from './components/PlanView';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const state = useReadingPlan();
  const [activeTab, setActiveTab] = useState('Today');
  const [viewDayOffset, setViewDayOffset] = useState(0);

  // The day currently being viewed (defaults to today's day index)
  const viewDayIndex = state.currentDayIndex + viewDayOffset;

  // Readings for the currently viewed day
  const dailyReadings = useMemo(
    () => getReadingsForDay(Math.max(0, viewDayIndex), state.listOffsets),
    [viewDayIndex, state.listOffsets]
  );

  // Full plan for the Plan view
  const fullPlan = useMemo(
    () =>
      generatePlan(
        new Date(state.startDate + 'T00:00:00'),
        state.daysToGenerate,
        state.listOffsets
      ),
    [state.startDate, state.daysToGenerate, state.listOffsets]
  );

  function handleDayChange(delta: number) {
    setViewDayOffset((prev) => {
      const next = prev + delta;
      // Don't go before day 0
      if (state.currentDayIndex + next < 0) return prev;
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'Today') setViewDayOffset(0);
        }}
        translation={state.translation}
        onTranslationChange={state.setTranslation}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'Today' && (
          <DailyView
            readings={dailyReadings}
            translation={state.translation}
            dayIndex={viewDayIndex}
            startDate={state.startDate}
            onDayChange={handleDayChange}
          />
        )}

        {activeTab === 'Full Plan' && (
          <PlanView plan={fullPlan} translation={state.translation} />
        )}

        {activeTab === 'Settings' && (
          <SettingsPanel
            startDate={state.startDate}
            setStartDate={state.setStartDate}
            listOffsets={state.listOffsets}
            setListOffset={state.setListOffset}
            translation={state.translation}
            setTranslation={state.setTranslation}
            daysToGenerate={state.daysToGenerate}
            setDaysToGenerate={state.setDaysToGenerate}
            resetAll={state.resetAll}
          />
        )}
      </main>
    </div>
  );
}

export default App;
