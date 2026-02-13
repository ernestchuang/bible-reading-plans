import { useState } from 'react';
import { useBibleReader } from '../hooks/useBibleReader';
import { BibleBrowser } from './BibleBrowser';
import { BibleReader } from './BibleReader';
import { JournalPane } from './journal/JournalPane';
import type { BiblePreferences } from '../hooks/useBiblePreferences';

interface ReadViewProps {
  prefs: BiblePreferences;
}

export function ReadView({ prefs }: ReadViewProps) {
  const { selection, setSelection } = useBibleReader();
  const [journalOpen, setJournalOpen] = useState(false);

  return (
    <>
      {/* BibleBrowser bar */}
      <div className="shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-[1600px] mx-auto">
          <BibleBrowser
            selectedBook={selection?.book}
            selectedChapter={selection?.chapter}
            onSelect={setSelection}
          />
        </div>
      </div>

      {/* Bible text reader + journal */}
      <div className="flex-1 min-h-0 flex flex-row">
        <div className={journalOpen ? 'w-1/2 min-w-0 h-full' : 'w-full h-full'}>
          <BibleReader
            selection={selection}
            translation={prefs.translation}
            displayMode={prefs.displayMode}
            onDisplayModeChange={prefs.setDisplayMode}
            fontFamily={prefs.fontFamily}
            fontSize={prefs.fontSize}
            onFontSizeChange={prefs.setFontSize}
            onToggleJournal={() => setJournalOpen((p) => !p)}
            journalOpen={journalOpen}
          />
        </div>
        {journalOpen && (
          <div className="w-1/2 min-w-0 h-full border-l border-gray-200 dark:border-gray-700">
            <JournalPane
              selection={selection}
              fontFamily={prefs.fontFamily}
              fontSize={prefs.fontSize}
            />
          </div>
        )}
      </div>
    </>
  );
}
