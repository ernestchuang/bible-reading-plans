import { useState, useMemo } from 'react';
import { useReadingPlan } from './hooks/useReadingPlan';
import { getReadingsForDay, generatePlan } from './utils/planGenerator';
import type { Reading } from './types';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { BibleReader } from './components/BibleReader';
import { PlanView } from './components/PlanView';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const state = useReadingPlan();
  const [activeTab, setActiveTab] = useState('Today');
  const [viewDayOffset, setViewDayOffset] = useState(0);
  const [activeReading, setActiveReading] = useState<Reading | null>(null);

  const viewDayIndex = state.currentDayIndex + viewDayOffset;

  const dailyReadings = useMemo(
    () => getReadingsForDay(Math.max(0, viewDayIndex), state.listOffsets),
    [viewDayIndex, state.listOffsets]
  );

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
      if (state.currentDayIndex + next < 0) return prev;
      return next;
    });
    setActiveReading(null);
  }

  const showReader = activeTab === 'Today';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed top section */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'Today') setViewDayOffset(0);
        }}
        translation={state.translation}
        onTranslationChange={state.setTranslation}
      />

      {showReader ? (
        <>
          {/* Compact reading plan bar */}
          <div className="shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="max-w-[1600px] mx-auto">
              <DailyView
                readings={dailyReadings}
                dayIndex={viewDayIndex}
                startDate={state.startDate}
                currentDayIndex={state.currentDayIndex}
                activeReading={activeReading}
                onSelectReading={setActiveReading}
                onDayChange={handleDayChange}
                onGoToToday={() => setViewDayOffset(0)}
              />
            </div>
          </div>

          {/* Bible text reader - fills remaining space */}
          <div className="flex-1 min-h-0">
            <BibleReader
              reading={activeReading}
              translation={state.translation}
            />
          </div>
        </>
      ) : (
        /* Scrollable content for Full Plan and Settings */
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
