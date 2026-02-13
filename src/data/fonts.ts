import type { FontFamily, FontSize } from '../types';

export interface FontOption {
  id: FontFamily;
  label: string;
  category: 'sans-serif' | 'serif';
  cssFamily: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'system', label: 'System Sans', category: 'sans-serif', cssFamily: 'ui-sans-serif, system-ui, sans-serif' },
  { id: 'inter', label: 'Inter', category: 'sans-serif', cssFamily: "'Inter Variable', 'Inter', sans-serif" },
  { id: 'lexend', label: 'Lexend', category: 'sans-serif', cssFamily: "'Lexend Variable', 'Lexend', sans-serif" },
  { id: 'linguistics-pro', label: 'Linguistics Pro', category: 'serif', cssFamily: "'Linguistics Pro', serif" },
  { id: 'literata', label: 'Literata', category: 'serif', cssFamily: "'Literata Variable', 'Literata', serif" },
  { id: 'eb-garamond', label: 'EB Garamond', category: 'serif', cssFamily: "'EB Garamond Variable', 'EB Garamond', serif" },
];

export const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Default' },
  { value: 18, label: 'Large' },
  { value: 20, label: 'X-Large' },
  { value: 22, label: 'XX-Large' },
];

export const DEFAULT_FONT_FAMILY: FontFamily = 'system';
export const DEFAULT_FONT_SIZE: FontSize = 16;

export function getFontCss(fontFamily: FontFamily): string {
  const option = FONT_OPTIONS.find((f) => f.id === fontFamily);
  return option?.cssFamily ?? FONT_OPTIONS[0].cssFamily;
}
