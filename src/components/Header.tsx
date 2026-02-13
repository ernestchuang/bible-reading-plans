import type { Translation, Theme } from '../types';
import { PLANS } from '../data/plans';

const TRANSLATIONS: Translation[] = ['NASB95', 'LSB', 'ESV', 'KJV'];
const TABS = ['Today', 'Full Plan', 'Settings'] as const;
const THEME_CYCLE: Theme[] = ['light', 'dark', 'system'];

function getNextTheme(current: Theme): Theme {
  const idx = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  translation: Translation;
  onTranslationChange: (t: Translation) => void;
  activePlanId: string;
  onPlanChange: (planId: string) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

export function Header({
  activeTab,
  onTabChange,
  translation,
  onTranslationChange,
  activePlanId,
  onPlanChange,
  theme,
  onThemeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow dark:shadow-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 shrink-0">
            Bible Reading Plan
          </h1>

          {/* Plan & translation selectors + theme toggle */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Plan selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="header-plan" className="text-sm text-gray-500 dark:text-gray-400">
                Plan:
              </label>
              <select
                id="header-plan"
                value={activePlanId}
                onChange={(e) => onPlanChange(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Translation selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="header-translation" className="text-sm text-gray-500 dark:text-gray-400">
                Translation:
              </label>
              <select
                id="header-translation"
                value={translation}
                onChange={(e) =>
                  onTranslationChange(e.target.value as Translation)
                }
                className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => onThemeChange(getNextTheme(theme))}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={`Theme: ${theme}`}
              aria-label={`Current theme: ${theme}. Click to switch.`}
            >
              {theme === 'light' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {theme === 'dark' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {theme === 'system' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
