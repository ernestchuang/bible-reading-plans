import { NavLink } from 'react-router-dom';
import type { Translation, Theme } from '../types';
import { PLANS } from '../data/plans';

const TRANSLATIONS: Translation[] = ['NASB95', 'LSB', 'ESV', 'KJV'];
const THEME_CYCLE: Theme[] = ['light', 'paper', 'dark', 'warm-dark', 'system'];

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  paper: 'Paper',
  dark: 'Dark',
  'warm-dark': 'Warm Dark',
  system: 'System',
};

function getNextTheme(current: Theme): Theme {
  const idx = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
}

interface HeaderProps {
  translation: Translation;
  onTranslationChange: (t: Translation) => void;
  activePlanId: string;
  onPlanChange: (planId: string) => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

export function Header({
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
              title={`Theme: ${THEME_LABELS[theme]}`}
              aria-label={`Current theme: ${THEME_LABELS[theme]}. Click to switch.`}
            >
              {/* Sun — Light */}
              {theme === 'light' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {/* Open book — Paper */}
              {theme === 'paper' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
              {/* Moon — Dark */}
              {theme === 'dark' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {/* Moon + warm rays — Warm Dark */}
              {theme === 'warm-dark' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 3l1 2m4 0l-1 2m3 3h-2" stroke="rgb(251, 191, 36)" strokeWidth={1.5} />
                </svg>
              )}
              {/* Monitor — System */}
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
          {([
            { to: '/read', label: 'Read' },
            { to: '/plans', label: 'Today' },
            { to: '/plan', label: 'Full Plan' },
            { to: '/settings', label: 'Settings' },
          ] as const).map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
