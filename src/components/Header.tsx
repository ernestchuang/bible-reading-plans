import type { Translation } from '../types';
import { PLANS } from '../data/plans';

const TRANSLATIONS: Translation[] = ['NASB95', 'LSB', 'ESV', 'KJV'];
const TABS = ['Today', 'Full Plan', 'Settings'] as const;

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  translation: Translation;
  onTranslationChange: (t: Translation) => void;
  activePlanId: string;
  onPlanChange: (planId: string) => void;
}

export function Header({
  activeTab,
  onTabChange,
  translation,
  onTranslationChange,
  activePlanId,
  onPlanChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 shrink-0">
            Bible Reading Plan
          </h1>

          {/* Plan & translation selectors */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Plan selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="header-plan" className="text-sm text-gray-500">
                Plan:
              </label>
              <select
                id="header-plan"
                value={activePlanId}
                onChange={(e) => onPlanChange(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              <label htmlFor="header-translation" className="text-sm text-gray-500">
                Translation:
              </label>
              <select
                id="header-translation"
                value={translation}
                onChange={(e) =>
                  onTranslationChange(e.target.value as Translation)
                }
                className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
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
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
