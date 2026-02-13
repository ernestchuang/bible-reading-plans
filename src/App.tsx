import { useState, useMemo } from 'react';
import { useReadingPlan } from './hooks/useReadingPlan';
import { getReadingsForDay, generatePlan } from './utils/planGenerator';
import type { Reading } from './types';
import { Header } from './components/Header';
import { DailyView } from './components/DailyView';
import { BibleReader } from './components/BibleReader';
import { PlanView } from './components/PlanView';
import { SettingsPanel } from './components/SettingsPanel';
import { JournalPane } from './components/journal/JournalPane';

function App() {
  const state = useReadingPlan();
  const [activeTab, setActiveTab] = useState('Today');
  const [activeReading, setActiveReading] = useState<Reading | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);

  // Today's readings are based on current listOffsets (position-based, not day-based).
  // Completed readings have already advanced the offset, so we need to show
  // the chapter BEFORE the offset for completed items, and AT the offset for incomplete.
  const todayReadings = useMemo(
    () => getReadingsForDay(0, state.listOffsets),
    [state.listOffsets]
  );

  // Full Plan projects forward from current positions
  const fullPlan = useMemo(
    () =>
      generatePlan(
        new Date(new Date().toISOString().split('T')[0] + 'T00:00:00'),
        state.daysToGenerate,
        state.listOffsets
      ),
    [state.daysToGenerate, state.listOffsets]
  );

  function handleToggleComplete(listIndex: number) {
    // If this reading is currently active in the reader, clear it
    // (the offset is about to change so the reading object will be stale)
    if (activeReading && activeReading.listId === todayReadings[listIndex].listId) {
      setActiveReading(null);
    }
    state.toggleReading(listIndex);
  }

  const showReader = activeTab === 'Today';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        translation={state.translation}
        onTranslationChange={state.setTranslation}
      />

      {showReader ? (
        <>
          {/* Compact reading plan bar */}
          <div className="shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-3">
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
                onToggleJournal={() => setJournalOpen((p) => !p)}
                journalOpen={journalOpen}
              />
            </div>
            {journalOpen && (
              <div className="w-1/2 min-w-0 h-full border-l border-gray-200">
                <JournalPane reading={activeReading} />
              </div>
            )}
          </div>
        </>
      ) : (
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
