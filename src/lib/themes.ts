import type { ThemeId, ThemeMeta } from '../types';

export const THEMES: ThemeMeta[] = [
  { id: 'pixel', label: '像素', swatch: '#a8a29e' },
  { id: 'marble', label: '大理石', swatch: '#e5e7eb' },
];

export const THEME_IDS: ThemeId[] = THEMES.map(t => t.id);

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && (THEME_IDS as string[]).includes(v);
}

const THEME_KEY = 'dg_theme';

export function getStoredTheme(): ThemeId {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (isThemeId(v)) return v;
  } catch {
    /* ignore */
  }
  return 'pixel';
}

export function storeTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
  storeTheme(theme);
}
