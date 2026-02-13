import { useState, useEffect } from 'react';
import type { Translation, DisplayMode, Theme, FontFamily, FontSize } from '../types';

const PREFS_KEY = 'bible-preferences-v1';
const PLAN_KEY = 'bible-reading-plan-v2';

interface StoredPreferences {
  translation: Translation;
  displayMode: DisplayMode;
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: FontSize;
}

export interface BiblePreferences {
  translation: Translation;
  setTranslation: (t: Translation) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  resetPreferences: () => void;
}

const DEFAULTS: StoredPreferences = {
  translation: 'NASB95',
  displayMode: 'verse',
  theme: 'system',
  fontFamily: 'system',
  fontSize: 16,
};

const PREF_FIELDS: (keyof StoredPreferences)[] = [
  'translation', 'displayMode', 'theme', 'fontFamily', 'fontSize',
];

/** Migrate preferences from the old plan storage key on first load. */
function migrateFromPlanKey(): StoredPreferences | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const prefs: StoredPreferences = { ...DEFAULTS };
    let found = false;

    for (const key of PREF_FIELDS) {
      if (key in parsed && parsed[key] != null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prefs as any)[key] = parsed[key];
        found = true;
      }
    }

    if (!found) return null;

    // Write preferences to their own key
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));

    // Remove preference fields from the plan key
    for (const key of PREF_FIELDS) {
      delete parsed[key];
    }
    localStorage.setItem(PLAN_KEY, JSON.stringify(parsed));

    return prefs;
  } catch {
    return null;
  }
}

function loadPreferences(): StoredPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
      return {
        translation: parsed.translation ?? DEFAULTS.translation,
        displayMode: parsed.displayMode ?? DEFAULTS.displayMode,
        theme: parsed.theme ?? DEFAULTS.theme,
        fontFamily: parsed.fontFamily ?? DEFAULTS.fontFamily,
        fontSize: parsed.fontSize ?? DEFAULTS.fontSize,
      };
    }
  } catch {
    // Ignore corrupt data
  }

  // Try migrating from the old plan key
  const migrated = migrateFromPlanKey();
  if (migrated) return migrated;

  return { ...DEFAULTS };
}

export function useBiblePreferences(): BiblePreferences {
  const [prefs, setPrefs] = useState<StoredPreferences>(() => loadPreferences());

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  return {
    translation: prefs.translation,
    setTranslation: (t) => setPrefs((p) => ({ ...p, translation: t })),
    displayMode: prefs.displayMode,
    setDisplayMode: (mode) => setPrefs((p) => ({ ...p, displayMode: mode })),
    theme: prefs.theme,
    setTheme: (t) => setPrefs((p) => ({ ...p, theme: t })),
    fontFamily: prefs.fontFamily,
    setFontFamily: (f) => setPrefs((p) => ({ ...p, fontFamily: f })),
    fontSize: prefs.fontSize,
    setFontSize: (s) => setPrefs((p) => ({ ...p, fontSize: s })),
    resetPreferences: () => setPrefs({ ...DEFAULTS }),
  };
}
